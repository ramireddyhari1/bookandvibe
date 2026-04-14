"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Share2,
  Shield,
  Sparkles,
  Ticket,
  Users,
  Zap,
  Heart,
  ChevronRight,
  Info,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentState = "IDLE" | "PROCESSING" | "SUCCESS";

type EventData = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  images: string;
  availableSlots: number;
  vibeTags?: string[];
  highlights?: string[];
};

function parseImages(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

const FALLBACK_EVENTS: EventData[] = [
  {
    id: "e-1",
    title: "Dil Se - DSP Special Telugu Jamming",
    description: "A specially curated live set focusing on the vibrant sounds of Devi Sri Prasad. A high-energy live performance featuring the EIRA band. Enjoy the best Telugu hits in an electrifying atmosphere.",
    category: "Live Music",
    location: "Hyderabad",
    venue: "Throwback, Kavuri Hills",
    date: "2026-04-19",
    time: "7:00 PM - 9:00 PM",
    price: 349,
    images: JSON.stringify(["https://d3pmsbscv4kwdi.cloudfront.net/events/1775570542079-384f5959f4eefd59.jpg"]),
    availableSlots: 150,
  },
  {
    id: "e-2",
    title: "Diljit Dosanjh - Dil-Luminati Tour",
    description: "The historic Dil-Luminati tour brings the biggest Punjabi pop sensation to Hyderabad. Prepare for an unforgettable, high-energy night!",
    category: "Music",
    location: "Hyderabad",
    venue: "GMR Arena, Hyderabad",
    date: "2026-11-15",
    time: "7:00 PM onwards",
    price: 3999,
    images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg/640px-Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg"]),
    availableSlots: 5000,
  },
  {
    id: "e-3",
    title: "Zomato Feeding India ft. Dua Lipa",
    description: "Zomato District presents Dua Lipa live in Mumbai for the Feeding India Concert. An electrifying night of international pop hits for a great cause.",
    category: "Music",
    location: "Mumbai",
    venue: "MMRDA Grounds, BKC",
    date: "2026-11-30",
    time: "6:00 PM onwards",
    price: 4500,
    images: JSON.stringify(["https://i.scdn.co/image/ab6761610000e5ebd42a27db3286b58553da8858"]),
    availableSlots: 10000,
  },
  {
    id: "e-4",
    title: "Coldplay: Music Of The Spheres World Tour",
    description: "The record-breaking stadium tour arrives in India. Experience Coldplay's breathtaking audiovisual spectacle featuring all your favorite anthems.",
    category: "Music",
    location: "Mumbai",
    venue: "DY Patil Stadium, Navi Mumbai",
    date: "2026-01-18",
    time: "6:00 PM onwards",
    price: 8000,
    images: JSON.stringify(["https://i.scdn.co/image/ab6761610000e5eb989ed05e1f0570cc4726c2d3"]),
    availableSlots: 20000,
  },
  {
    id: "e-5",
    title: "Karan Aujla - It Was All A Dream",
    description: "The breakout Punjabi hip-hop star brings his massive arena tour to Bengaluru. Get ready for unmatched swagger and chart-topping hits.",
    category: "Music",
    location: "Bangalore",
    venue: "Bhartiya City, Bengaluru",
    date: "2026-12-07",
    time: "7:00 PM onwards",
    price: 2999,
    images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Karan_Aujla_2021.jpg/640px-Karan_Aujla_2021.jpg"]),
    availableSlots: 8000,
  },
  {
    id: "e-6",
    title: "Sunburn Arena ft. Alan Walker",
    description: "The global EDM sensation Alan Walker brings his WalkerWorld tour to Kochi for a mind-blowing electronic music experience.",
    category: "Music",
    location: "Kochi",
    venue: "Kochi International Marina",
    date: "2026-10-04",
    time: "5:00 PM onwards",
    price: 2000,
    images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Alan_Walker_%2842416801991%29.jpg/640px-Alan_Walker_%2842416801991%29.jpg"]),
    availableSlots: 3000,
  }
];

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = String(params.id || "");

  const [event, setEvent] = useState<EventData | null>(null);
  const [suggestedEvents, setSuggestedEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentState, setPaymentState] = useState<PaymentState>("IDLE");
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Event',
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const { isAuthenticated, user } = useAuth();

  // Clean Minimalist Scroll Transforms
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const heroY = useTransform(smoothScrollY, [0, 500], [0, 100]);
  const heroScale = useTransform(smoothScrollY, [0, 500], [1, 1.1]);
  
  const headerBg = useTransform(smoothScrollY, [0, 100], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.98)"]);
  const headerBlurVal = useTransform(smoothScrollY, [0, 100], ["blur(0px)", "blur(12px)"]);
  const headerShadow = useTransform(smoothScrollY, [0, 100], ["none", "0 4px 20px rgba(0, 0, 0, 0.05)"]);
  const headerIconBg = useTransform(smoothScrollY, [0, 100], ["rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.05)"]);
  const headerIconColor = useTransform(smoothScrollY, [0, 100], ["#FFFFFF", "#000000"]);
  const headerTitleOpacity = useTransform(smoothScrollY, [100, 150], [0, 1]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [eventPayload, allEventsPayload]: any = await Promise.all([
          fetchApi(`/events/${eventId}`, { requiresAuth: false }),
          fetchApi("/events", { requiresAuth: false })
        ]);

        if (eventPayload?.data) {
          const apiEvent = eventPayload.data;
          setEvent({
            ...apiEvent,
            id: String(apiEvent.id),
            price: Number(apiEvent.price),
            vibeTags: ["Live", "Trending", "Elite Access"],
            highlights: apiEvent.highlights?.length ? apiEvent.highlights : [
              "Hassle-free digital entry via QR",
              "Access to Premium Lounges",
              "Exclusive 15% VIP Discount",
              "24/7 Concierge Support",
            ]
          });
        } else {
          const found = FALLBACK_EVENTS.find(e => e.id === eventId);
          if (found) {
            setEvent({
              ...found,
              vibeTags: ["Live", "Trending", "Elite Access"],
              highlights: [
                "Hassle-free digital entry via QR",
                "Access to Premium Lounges",
                "Exclusive 15% VIP Discount",
                "24/7 Concierge Support",
              ]
            });
          }
        }

        if (allEventsPayload?.data) {
          setSuggestedEvents(allEventsPayload.data.filter((e: any) => String(e.id) !== eventId).slice(0, 4));
        } else {
          setSuggestedEvents(FALLBACK_EVENTS.filter(e => e.id !== eventId).slice(0, 4));
        }
      } catch {
        const found = FALLBACK_EVENTS.find(e => e.id === eventId);
        if (found) {
          setEvent({
            ...found,
            vibeTags: ["Live", "Trending", "Elite Access"],
            highlights: [
               "Hassle-free digital entry via QR",
               "Access to Premium Lounges",
               "Exclusive 15% VIP Discount",
               "24/7 Concierge Support",
            ]
          });
          setSuggestedEvents(FALLBACK_EVENTS.filter(e => e.id !== eventId).slice(0, 4));
        } else {
          setError("Session expired or invalid event.");
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [eventId]);

  const imageList = useMemo(() => {
    if (!event) return [];
    const parsed = parseImages(event.images);
    return parsed.length ? parsed : ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200"];
  }, [event]);

  const formattedDate = useMemo(() => {
    if (!event) return "";
    return new Date(event.date).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "short", year: "numeric",
    });
  }, [event]);

  const totalAmount = useMemo(() => (event?.price || 0) * quantity + 49, [event, quantity]);

  const handleCheckout = useCallback(async () => {
    if (!event) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setPaymentState("PROCESSING");

    try {
      // 1. Create Razorpay order on backend
      const orderRes: any = await fetchApi("/payments/initiate", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          amount: totalAmount,
          eventId: event.id,
          currency: "INR",
        }),
      });

      const { orderId, keyId, amount: orderAmount, currency } = orderRes.data;

      // 2. Open Razorpay checkout popup
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: "Book & Vibe",
        description: event.title,
        order_id: orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#e11d48" },
        handler: async (response: any) => {
          try {
            // 3. Verify payment & create booking on backend
            await fetchApi("/payments/confirm-booking", {
              method: "POST",
              requiresAuth: true,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: event.id,
                quantity,
                totalAmount,
              }),
            });
            setPaymentState("SUCCESS");
            setTimeout(() => router.push("/profile/bookings"), 1800);
          } catch {
            setPaymentState("IDLE");
            alert("Payment verified but booking failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentState("IDLE");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setPaymentState("IDLE");
        alert("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch {
      setPaymentState("IDLE");
      alert("Could not initiate payment. Please try again.");
    }
  }, [event, isAuthenticated, quantity, totalAmount, router, user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-rose-500 font-bold tracking-widest uppercase text-xs">Preparing Experience</p>
      </motion.div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <AlertCircle size={48} className="text-rose-400 mb-4" />
      <h2 className="text-2xl font-black text-gray-900 mb-2">Event Not Found</h2>
      <button onClick={() => router.back()} className="text-rose-500 font-bold flex items-center gap-2">
        <ArrowLeft size={20} /> Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* ═══ CLEAN MINIMAL HEADER (Mobile) ═══ */}
      <motion.nav 
        style={{ backgroundColor: headerBg, backdropFilter: headerBlurVal, boxShadow: headerShadow }}
        className="md:hidden fixed top-0 left-0 right-0 z-[100] px-5 py-[max(env(safe-area-inset-top),16px)] flex items-center justify-between transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <motion.button 
            onClick={() => router.back()} 
            style={{ backgroundColor: headerIconBg, color: headerIconColor }}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <motion.div style={{ opacity: headerTitleOpacity }} className="flex flex-col">
             <span className="font-bold text-[14px] leading-tight text-gray-900 truncate max-w-[140px]">{event.title}</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
           <motion.button 
             onClick={() => setIsFavorite(!isFavorite)}
             whileTap={{ scale: 0.9 }}
             style={{ backgroundColor: headerIconBg, color: headerIconColor }}
             className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
           >
             <Heart size={20} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
           </motion.button>
           <motion.button 
             onClick={handleShare}
             whileTap={{ scale: 0.9 }}
             style={{ backgroundColor: headerIconBg, color: headerIconColor }}
             className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
           >
             <Share2 size={20} />
           </motion.button>
        </div>
      </motion.nav>



      {/* ═══ APP-NATIVE HERO IMAGE (Mobile) ═══ */}
      <div className="md:hidden relative h-[45vh] w-full overflow-hidden bg-gray-100">
        <motion.div 
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          <img src={imageList[0]} className="w-full h-full object-cover" alt="" />
          {/* Subtle fade to white at the very bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </motion.div>
      </div>

      {/* ═══ MASSIVE POSTER BANNER (Desktop) ═══ */}
      <div className="hidden md:block relative w-full pt-[120px] lg:pt-[132px] max-w-[1400px] mx-auto px-4 lg:px-6 mb-8">
        <div className="relative w-full overflow-hidden rounded-[32px] shadow-2xl bg-gray-100" style={{ aspectRatio: '21/9', maxHeight: '600px' }}>
          <img src={imageList[0]} className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      {/* ═══ CRISP CONTENT LAYOUT ═══ */}
      <div className="relative z-20 bg-white -mt-10 md:mt-0 rounded-t-[32px] md:rounded-none md:pt-4 px-6 pt-8 pb-32 max-w-[1000px] mx-auto min-h-screen">
        
        {/* Title Area */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
             <span className="text-rose-600 text-[11px] font-black tracking-widest uppercase bg-rose-50 px-2.5 py-1 rounded-md">{event.category}</span>
             <motion.button 
               onClick={() => setIsFavorite(!isFavorite)}
               whileTap={{ scale: 0.85 }}
               className="text-gray-400 hover:text-rose-500 transition-colors p-1 -mr-1"
             >
               <Heart size={22} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
             </motion.button>
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-2">{event.title}</h1>
          <p className="text-gray-500 text-[14px] font-medium flex items-center gap-1.5"><MapPin size={14}/> {event.venue}</p>
          
          <div className="flex flex-col gap-4 mt-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-50 p-1.5">
                <img src="/icons/calendar_3d.png" alt="Date" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <p className="text-[15px] text-gray-900 font-bold">{formattedDate}</p>
                <p className="text-[13px] text-gray-500">12:00 AM - 11:30 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-50 p-1.5">
                <img src="/icons/location_3d.png" alt="Location" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <p className="text-[15px] text-gray-900 font-bold max-w-[200px] truncate">{event.venue}</p>
                <p className="text-[13px] text-rose-600 font-medium">View on maps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Host (Premium Redesign) */}
        <section className="mb-10">
           <h2 className="text-[18px] font-bold text-gray-900 mb-4 tracking-tight">Hosted By</h2>
           <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between group">
              {/* Decorative gradient blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none" />
              
              <div className="relative flex items-center gap-4">
                 <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-orange-400 shrink-0 shadow-md">
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center">
                       <span className="text-rose-600 font-extrabold text-xl tracking-tight">JP</span>
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 line-clamp-1">
                       <span className="text-gray-900 font-bold text-[17px] tracking-tight">Jaswanth P</span>
                       <img src="/icons/verified_3d.png" alt="Verified" className="w-4 h-4 object-contain drop-shadow-sm mix-blend-multiply" />
                    </div>
                    <span className="text-gray-500 text-[13px] font-medium mt-0.5">Premium Organizer</span>
                 </div>
              </div>

              <div className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 transition-transform active:scale-95 border border-gray-100 shadow-sm">
                 <ChevronRight size={18} className="text-gray-400" />
              </div>
           </div>
        </section>

        {/* The Vibe */}
        <section className="mb-10">
           <h2 className="text-[18px] font-bold text-gray-900 mb-3 tracking-tight">The Vibe</h2>
           <p className="text-gray-600 leading-relaxed text-[15px]">
             {event.description}
           </p>
           <div className="mt-5 flex flex-wrap gap-2">
              {event.vibeTags?.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-[12px] font-medium border border-gray-100">
                   #{tag}
                </span>
              ))}
           </div>
        </section>

        {/* Terms and conditions */}
        <section className="mb-12">
           <h2 className="text-[18px] font-bold text-gray-900 mb-4 tracking-tight">Terms & Conditions</h2>
           <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100">
              <div className="space-y-6 text-[14px]">
                 
                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Ticket Purchase & Refunds
                    </h3>
                    <ul className="pl-4 space-y-1.5 text-gray-600 font-medium">
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">All sales are final. No refunds/exchanges.</li>
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">Tickets valid only for the specified date/time.</li>
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">Carry valid ID proof for entry.</li>
                    </ul>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Walk-In Policy
                    </h3>
                    <p className="text-gray-600 font-medium pl-3.5">(Subject to Availability)</p>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Event Access & Re-entry
                    </h3>
                    <p className="text-gray-600 font-medium pl-3.5">No re-entry once you exit. Keep belongings with you.</p>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Event Modifications
                    </h3>
                    <p className="text-gray-600 font-medium pl-3.5">Event timing, menu, or activities may change. Major updates will be communicated.</p>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Health & Safety
                    </h3>
                    <ul className="pl-4 space-y-1.5 text-gray-600 font-medium">
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">Follow all safety & COVID-19 protocols.</li>
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">No hazardous items (weapons, knives, fireworks, drugs, etc.) allowed. Confiscated if found.</li>
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">Organizers not liable for injuries, accidents, or item loss.</li>
                    </ul>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Photography & Media
                    </h3>
                    <ul className="pl-4 space-y-1.5 text-gray-600 font-medium">
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">Entry implies consent to photos/videos for promo.</li>
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">Don't wish to appear? Inform staff onsite.</li>
                    </ul>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Food Policy
                    </h3>
                    <p className="text-gray-600 font-medium pl-3.5">No outside food/beverage allowed.</p>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Venue Liability
                    </h3>
                    <p className="text-gray-600 font-medium pl-3.5">Organizers not liable for personal loss/damage.</p>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Contact
                    </h3>
                    <ul className="pl-4 space-y-1.5 text-gray-600 font-medium">
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">WhatsApp: +91 8955578847</li>
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full">Email: cs@indulgeout.com</li>
                       <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-300 before:rounded-full"><a href="https://www.instagram.com/indulgeout/" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline">Instagram: https://www.instagram.com/indulgeout/</a></li>
                    </ul>
                 </div>

                 {/* Item */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                       Agreement
                    </h3>
                    <p className="text-gray-600 font-medium pl-3.5">By purchasing a ticket, you agree to all the above terms.</p>
                 </div>

              </div>
           </div>
        </section>

        {/* Gallery Section */}
        {imageList && imageList.length > 0 && (
          <section className="mb-12">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Gallery</h2>
             </div>
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {imageList.map((src, idx) => (
                  <div 
                    key={idx} 
                    className="relative shrink-0 w-[260px] md:w-[320px] aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 snap-start shadow-sm border border-gray-100"
                  >
                    <img 
                      src={src} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out" 
                      alt="Gallery image" 
                    />
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Suggestions */}
        {suggestedEvents.length > 0 && (
          <div className="pt-8 border-t border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">You might also like</h2>
             </div>
             
             <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {suggestedEvents.map((e, i) => (
                   <motion.div 
                     key={e.id}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => router.push(`/events/${e.id}`)}
                     className="shrink-0 w-[200px] snap-start"
                   >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 mb-2">
                         <img src={parseImages(e.images)[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <h3 className="text-gray-900 text-[14px] font-bold leading-snug line-clamp-1">{e.title}</h3>
                      <p className="text-[12px] text-gray-500">{e.venue.split(',')[0]} • ₹{e.price}</p>
                   </motion.div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* ═══ SLEEK ACTION PILL ═══ */}
      <div className="fixed bottom-6 left-0 right-0 z-[110] px-4 md:px-0 pointer-events-none flex justify-center">
         <motion.div 
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="w-full max-w-sm bg-gray-900 rounded-[100px] p-2 pr-4 shadow-[0_12px_30px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 pointer-events-auto border border-gray-800"
         >
            <div className="flex flex-col pl-4 text-white">
               <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-bold tracking-tight">₹{event.price}</span>
                  <span className="text-[10px] text-gray-400 font-medium">/person</span>
               </div>
            </div>
            <button 
              onClick={() => setShowCheckout(true)}
              className="bg-rose-600 active:scale-95 transition-transform text-white py-3.5 px-6 rounded-full font-bold text-[14px] flex items-center justify-center gap-2 tracking-wide"
            >
              Get Tickets
            </button>
         </motion.div>
      </div>

      {/* ═══ CLEAN CHECKOUT SHEET ═══ */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-end justify-center"
          >
             {/* Click background to close */}
             <div className="absolute inset-0" onClick={() => setShowCheckout(false)} />

             <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden px-6 pt-4 pb-10 shadow-2xl relative z-10"
             >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                
                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Confirm Booking</h2>

                {paymentState === "IDLE" ? (
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                           <img src={imageList[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="space-y-1">
                           <h3 className="font-bold text-[16px] tracking-tight text-gray-900 line-clamp-1">{event.title}</h3>
                           <p className="text-[12px] font-medium text-gray-500">{event.venue}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="font-bold text-[16px] text-gray-900">Tickets</span>
                        <div className="flex items-center gap-5 bg-gray-50 p-1.5 rounded-full border border-gray-100">
                           <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold text-xl shadow-sm border border-gray-100 active:scale-95">-</button>
                           <span className="w-4 text-center font-bold text-[16px] text-gray-900">{quantity}</span>
                           <button onClick={() => setQuantity(q => q+1)} className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold text-xl shadow-sm border border-gray-100 active:scale-95">+</button>
                        </div>
                     </div>

                     <div className="space-y-3 pt-2">
                        <div className="flex justify-between text-[14px] font-medium text-gray-500">
                           <span>Tickets ({quantity}x)</span>
                           <span>₹{event.price * quantity}</span>
                        </div>
                        <div className="flex justify-between text-[14px] font-medium text-gray-500">
                           <span>Platform Fee</span>
                           <span>₹49</span>
                        </div>
                        <div className="flex justify-between text-[18px] font-bold pt-4 border-t border-gray-100 text-gray-900">
                           <span>Total</span>
                           <span>₹{totalAmount}</span>
                        </div>
                     </div>

                     <button 
                       onClick={handleCheckout}
                       className="w-full bg-rose-600 text-white py-4 rounded-full font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform mt-6 shadow-md shadow-rose-600/30"
                     >
                       Pay ₹{totalAmount}
                     </button>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center gap-6 text-center h-[380px] justify-center">
                     {paymentState === "PROCESSING" ? (
                        <>
                          <Loader2 size={48} className="animate-spin text-rose-500" />
                          <div className="space-y-1">
                             <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Processing Payment</h3>
                             <p className="text-gray-500 text-[14px]">Please don't close this screen</p>
                          </div>
                        </>
                     ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", damping: 20 }}
                          className="flex flex-col items-center gap-6"
                        >
                           <div className="relative">
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-xl shadow-green-200 relative z-10"
                              >
                                 <CheckCircle size={48} strokeWidth={2.5} />
                              </motion.div>
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-green-400 rounded-full blur-xl -z-10"
                              />
                           </div>
                           
                           <div className="space-y-2">
                              <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">Booking Confirmed</span>
                              <h3 className="text-[28px] font-black text-gray-900 tracking-tight leading-none pt-2">Payment Successful!</h3>
                              <p className="text-gray-500 text-[15px] font-medium">Your tickets have been secured and sent to your email.</p>
                           </div>

                           <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-2 flex items-center gap-4 transition-all hover:bg-white hover:shadow-md">
                              <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden">
                                <img src={imageList[0]} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-[14px] font-bold text-gray-900 line-clamp-1">{event.title}</p>
                                <p className="text-[12px] text-gray-500 font-medium">{quantity} {quantity > 1 ? 'Tickets' : 'Ticket'} • ₹{totalAmount}</p>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </div>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
