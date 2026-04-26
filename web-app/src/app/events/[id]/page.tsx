"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  BadgeCheck,
  Check,
  CheckCircle2,
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
  FileText,
  X,
  Languages,
  Baby,
  Dog,
  Accessibility,
  Navigation as NavigationIcon,
} from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
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
  duration?: string;
  distance?: string;
  price: number;
  images: string;
  availableSlots: number;
  taxPercent?: number;
  platformFeeType?: string;
  platformFeeValue?: number;
  vibeTags?: string[];
  highlights?: string[];
  partner?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  terms?: string;
  language?: string;
  ageLimit?: string;
  ticketAgeLimit?: string;
  layout?: string;
  seating?: string;
  kidsAllowed?: boolean;
  petsAllowed?: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "O";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 1][0] ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase();
}

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
    images: JSON.stringify(["https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=800"]),
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
    images: JSON.stringify(["https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800"]),
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
  const [isExpanded, setIsExpanded] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountAmount: number} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        const [eventPayload, allEventsPayload] = await Promise.all([
          fetchApi(`/events/${eventId}`, { requiresAuth: false }) as Promise<{ data: EventData }>,
          fetchApi("/events", { requiresAuth: false }) as Promise<{ data: EventData[] }>
        ]);

        if (eventPayload?.data) {
          const apiEvent = eventPayload.data;
          setEvent({
            ...apiEvent,
            id: String(apiEvent.id),
            price: Number(apiEvent.price),
            vibeTags: ["Live Performance", "Curated Space", "Premium Venue"],
            partner: apiEvent.partner,
            highlights: apiEvent.highlights?.length ? apiEvent.highlights : [
              "Secure digital ticketing",
              "Premium lounge access",
              "Exclusive event benefits",
              "On-site support available",
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
          setSuggestedEvents(allEventsPayload.data.filter((e) => String(e.id) !== eventId).slice(0, 4));
        } else {
          setSuggestedEvents(FALLBACK_EVENTS.filter(e => e.id !== eventId).slice(0, 4));
        }
      } catch {
        const found = FALLBACK_EVENTS.find(e => e.id === eventId);
        if (found) {
          setEvent({
            ...found,
            vibeTags: ["Live Performance", "Curated Space", "Premium Venue"],
            highlights: [
              "Secure digital ticketing",
              "Premium lounge access",
              "Exclusive event benefits",
              "On-site support available",
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

  const heroImage = useMemo(() => {
    if (!imageList.length) return "";
    return imageList[1] || imageList[0];
  }, [imageList]);

  const ticketSubtotal = useMemo(() => (event?.price || 0) * quantity, [event, quantity]);
  const isFreeEvent = (event?.price || 0) <= 0;
  const taxAmount = useMemo(() => {
    const taxPercent = Number(event?.taxPercent || 0);
    if (!ticketSubtotal || taxPercent <= 0) return 0;
    return Math.round((ticketSubtotal * taxPercent) / 100);
  }, [event, ticketSubtotal]);

  const platformFeeAmount = useMemo(() => {
    if (!ticketSubtotal || isFreeEvent) return 0;
    const feeValue = Number(event?.platformFeeValue);
    if (!Number.isFinite(feeValue) || feeValue <= 0) return 0;
    const feeType = String(event?.platformFeeType || "PERCENT").toUpperCase();
    return feeType === "FIXED" ? feeValue : Math.round((ticketSubtotal * feeValue) / 100);
  }, [event, ticketSubtotal, isFreeEvent]);

  const totalAmount = useMemo(() => ticketSubtotal + taxAmount + platformFeeAmount, [ticketSubtotal, taxAmount, platformFeeAmount]);
  const finalTotalAmount = Math.max(0, totalAmount - (appliedCoupon?.discountAmount || 0));

  const validateCoupon = async () => {
    if (!couponInput) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }
    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await fetchApi("/coupons/validate", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          code: couponInput,
          orderAmount: totalAmount,
          applicableTo: "EVENTS"
        })
      });
      setAppliedCoupon({ code: res.data.code, discountAmount: res.data.discountAmount });
      setCouponSuccess(`Promo code applied! You saved ₹${res.data.discountAmount}`);
      setShowCouponInput(false);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Invalid promo code");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess("");
    setCouponError("");
  };

  const formattedDate = useMemo(() => {
    if (!event || !isMounted) return "";
    return new Date(event.date).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "short", year: "numeric",
    });
  }, [event, isMounted]);

  const handleCheckout = useCallback(async () => {
    if (!event) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    setPaymentState("PROCESSING");

    if (isFreeEvent || finalTotalAmount <= 0) {
      try {
        await fetchApi("/payments/confirm-booking", {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify({
            eventId: event.id,
            quantity,
            totalAmount: 0,
            couponCode: appliedCoupon?.code,
            items: [],
          }),
        });
        setPaymentState("SUCCESS");
        setTimeout(() => router.push("/profile/bookings"), 1800);
      } catch {
        setPaymentState("IDLE");
        alert("Free booking failed. Please try again.");
      }
      return;
    }

    try {
      // 1. Create Razorpay order on backend
      const orderRes = await fetchApi("/payments/initiate", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          currency: "INR",
          couponCode: appliedCoupon?.code,
        }),
      }) as { data: { orderId: string, keyId: string, amount: number, currency: string } };

      const { orderId, keyId, amount: orderAmount, currency } = orderRes.data as { orderId: string, keyId: string, amount: number, currency: string };

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
        theme: { color: "#D53F17" },
        handler: async (response: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) => {
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
                couponCode: appliedCoupon?.code,
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
  }, [event, isAuthenticated, quantity, finalTotalAmount, router, user, appliedCoupon]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PremiumLoader size="lg" color="#D53F17" text="Preparing Experience" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <AlertCircle size={48} className="text-[#D53F17] mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
      <button onClick={() => router.back()} className="text-[#D53F17] font-bold flex items-center gap-2">
        <ArrowLeft size={20} /> Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Navigation (Mobile) */}
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
             <span className="font-bold text-[14px] leading-tight text-gray-900 truncate max-w-[180px] pr-2">{event.title}</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
           <motion.button 
             onClick={() => setIsFavorite(!isFavorite)}
             whileTap={{ scale: 0.9 }}
             style={{ backgroundColor: headerIconBg, color: headerIconColor }}
             className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
           >
             <Heart size={20} className={isFavorite ? "fill-[#D53F17] text-[#D53F17]" : ""} />
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



      {/* Hero Media (Mobile) */}
      <div className="md:hidden relative h-[38vh] w-full overflow-hidden bg-gray-100">
        <motion.div 
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          <img src={heroImage} className="w-full h-full object-cover" alt="" />
          {/* Subtle fade to white at the very bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </motion.div>
      </div>

      {/* Hero Media (Desktop) */}
      <div className="hidden md:block relative w-full pt-[120px] lg:pt-[132px] max-w-[1400px] mx-auto px-4 lg:px-6 mb-8">
        <div className="relative w-full overflow-hidden rounded-[32px] shadow-2xl bg-gray-100" style={{ aspectRatio: '21/9', maxHeight: '600px' }}>
          <img src={heroImage} className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      {/* Layout Grid */}
      <div className="relative z-20 bg-white -mt-10 md:mt-0 rounded-t-[32px] md:rounded-none md:pt-4 px-6 pt-8 pb-40 max-w-[1240px] mx-auto min-h-screen">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Main Column */}
          <div className="lg:col-span-7">
            {/* Title Area */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[#D53F17] text-[11px] font-bold tracking-widest uppercase bg-orange-50 px-2.5 py-1 rounded-md">{event.category}</span>
                 <motion.button 
                   onClick={() => setIsFavorite(!isFavorite)}
                   whileTap={{ scale: 0.85 }}
                   className="text-gray-400 hover:text-[#D53F17] transition-colors p-1 -mr-1"
                 >
                   <Heart size={22} className={isFavorite ? "fill-[#D53F17] text-[#D53F17]" : ""} />
                 </motion.button>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 leading-[1.05] tracking-tight mb-2">{event.title}</h1>
              <p className="text-gray-500 text-[14px] font-medium flex items-center gap-1.5"><MapPin size={14}/> {event.venue}</p>
              
              <div className="lg:hidden flex flex-wrap gap-4 mt-8 pb-8 border-b border-gray-100">
                {/* Date & Time (Mobile Only) */}
                <div className="flex-1 min-w-[240px] flex items-center gap-4 p-4 rounded-2xl border border-gray-200/60 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-[#D53F17]">
                    <CalendarDays size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Date & Time</span>
                    <span className="text-[15px] font-bold text-gray-900 leading-tight">{formattedDate}</span>
                    <span className="text-[13px] font-semibold text-gray-500">{event.time}</span>
                  </div>
                </div>

                {/* Duration (Mobile Only) */}
                {event.duration && (
                <div className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl border border-gray-200/60 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-[#D53F17]">
                    <Clock size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Duration</span>
                    <span className="text-[15px] font-bold text-gray-900">{event.duration}</span>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* About (Formerly The Vibe) */}
             <section className="mb-10">
                <h2 className="text-[20px] font-bold text-gray-900 mb-3 tracking-tight">About</h2>
                <div className="relative">
                  <p className={`text-gray-600 leading-relaxed text-[14px] font-medium whitespace-pre-line ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    {event.description}
                  </p>
                  {!isExpanded && event.description.length > 150 && (
                    <button 
                      onClick={() => setIsExpanded(true)}
                      className="text-[#D53F17] font-bold text-[13px] mt-2 flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      Read More <ChevronRight size={14} className="rotate-90" />
                    </button>
                  )}
                  {isExpanded && (
                    <button 
                      onClick={() => setIsExpanded(false)}
                      className="text-[#D53F17] font-bold text-[13px] mt-2 flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      Show Less <ChevronRight size={14} className="-rotate-90" />
                    </button>
                  )}
                </div>

               <div className="mt-5 flex flex-wrap gap-2 pb-8 border-b border-gray-100">
                  {event.vibeTags?.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-[12px] font-medium border border-gray-100">
                       #{tag}
                    </span>
                  ))}
               </div>
            </section>
            <section className="mb-14">
               <h2 className="text-[18px] font-bold text-gray-900 mb-4 tracking-tight">Hosted By</h2>
               <div className="relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between group">
                  
                  <div className="relative flex items-center gap-4">
                     <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#D53F17] to-[#D53F17] shrink-0 shadow-md">
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center">
                           {event.partner?.avatar ? (
                             <img src={event.partner.avatar} className="w-full h-full object-cover" alt="" />
                           ) : (
                             <span className="text-[#D53F17] font-bold text-xl tracking-tight">
                               {getInitials(event.partner?.name || "Organizer")}
                             </span>
                           )}
                        </div>
                     </div>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 line-clamp-1">
                           <span className="text-gray-900 font-bold text-[17px] tracking-tight">
                             {event.partner?.name || "Premium Organizer"}
                           </span>
                           <BadgeCheck className="w-5 h-5 text-[#D53F17] fill-orange-50" />
                        </div>
                        <span className="text-gray-500 text-[13px] font-medium mt-0.5">Premium Organizer</span>
                     </div>
                  </div>

                  <div className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 transition-transform active:scale-95 border border-gray-100 shadow-sm">
                     <ChevronRight size={18} className="text-gray-400" />
                  </div>
               </div>
            </section>

            {/* Location & Venue (Mobile Only) */}
            <section className="mb-14 lg:hidden">
              <h2 className="text-[18px] font-bold text-gray-900 mb-4 tracking-tight">Venue & Location</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-32 bg-gray-100 relative group">
                  {/* Static Map Mockup with high-end style */}
                  <img 
                    src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop`} 
                    className="w-full h-full object-cover opacity-80" 
                    alt="Map" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 bg-[#D53F17] rounded-full flex items-center justify-center shadow-xl ring-4 ring-[#D53F17]/20">
                      <MapPin size={20} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-[17px] text-gray-900 leading-tight">{event.venue}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-gray-500 text-[13px] font-medium">{event.location}</span>
                       {event.distance && (
                         <>
                           <span className="w-1 h-1 rounded-full bg-gray-300" />
                           <span className="text-[#D53F17] text-[13px] font-bold">{event.distance} away</span>
                         </>
                       )}
                    </div>
                  </div>
                  <button className="flex flex-col items-center gap-1 group active:scale-95 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-orange-50 transition-colors">
                       <NavigationIcon size={18} className="text-gray-400 group-hover:text-[#D53F17]" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Directions</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Essential Information */}
            <section className="mb-8 mt-12 relative">
               <div className="relative z-10 flex flex-col items-start px-2 md:px-0 gap-2">
                  <h2 className="text-[24px] font-bold tracking-tight text-gray-900">
                     Know Before You Go
                  </h2>
                  <p className="text-gray-500 font-medium text-[13px]">
                     Important information for your event experience.
                  </p>
               </div>

               {/* Details Grid */}
               <div className="mt-6">
                  <div className="grid grid-cols-2 gap-3">
                     {[
                        { label: "Language", value: event.language || "English / Multi", icon: <Languages size={20} /> },
                        { label: "Duration", value: event.duration || "2+ Hours", icon: <Clock size={20} /> },
                        { label: "Passholders", value: event.ticketAgeLimit || "All Ages Welcome", icon: <Ticket size={20} className="-rotate-45" /> },
                        { label: "Entry Policy", value: event.ageLimit || "Standard Entry", icon: <BadgeCheck size={20} /> },
                        { label: "Venue Style", value: event.layout || "Contemporary Indoor", icon: <Accessibility size={20} /> },
                        { label: "Seating", value: event.seating || "Open Access", icon: <Users size={20} /> },
                        { label: "Family Policy", value: event.kidsAllowed ? "Family Friendly" : "Adults Exclusive", icon: <Baby size={20} /> },
                        { label: "Pet Access", value: event.petsAllowed ? "Pets Allowed" : "No Pets Permitted", icon: <Dog size={20} /> }
                     ].map((tile, i) => (
                        <div 
                          key={i}
                          className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-3"
                        >
                           <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 shadow-sm">
                              {tile.icon}
                           </div>

                               <div className="space-y-0.5">
                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{tile.label}</p>
                                  <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
                                     {tile.value}
                                  </h3>
                               </div>
                        </div>
                      ))}
                   </div>
                </div>

            </section>

            {/* More Section */}
            <section className="mb-14">
                <h2 className="text-[22px] font-bold text-gray-900 mb-6 tracking-tight">More</h2>
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="w-full bg-white border border-gray-100 rounded-[20px] p-5 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-gray-200 shadow-sm"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                         <FileText size={20} />
                      </div>
                      <span className="text-[16px] font-bold text-gray-800 tracking-tight">Terms and Conditions</span>
                   </div>
                   <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-all" />
                </button>
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
                          <p className="text-[12px] text-gray-500">{e.venue.split(',')[0]} â€¢ â‚¹{e.price}</p>
                       </motion.div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                
                {/* Location Row */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-900 shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-[15px] text-gray-900 leading-tight">
                      {event.venue}
                    </h3>
                    {event.distance && <span className="text-[12px] font-bold text-gray-400 mt-1">{event.distance} away</span>}
                  </div>
                  <ChevronRight size={18} className="text-gray-300 mt-1" />
                </div>

                {/* Time Row */}
                <div className="mt-2 flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-900 shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarDays size={20} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-[15px] text-gray-900">Starts at {event.time}</h3>
                    <span className="text-[12px] font-bold text-[#D53F17] mt-1">View full schedule & timeline</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>

                {/* Booking Row */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">{isMounted ? "₹" : ""}{event.price}</span>
                      <span className="text-[12px] font-bold text-gray-400">onwards</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="bg-gray-900 hover:bg-black active:scale-95 transition-all text-white py-4 px-10 rounded-[18px] font-bold text-[15px] shadow-lg shadow-black/10"
                  >
                    Book Tickets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Pill (Mobile) */}
      <div className="fixed bottom-6 left-0 right-0 z-[110] px-4 md:px-0 pointer-events-none flex justify-center lg:hidden">
         <motion.div 
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="w-full max-w-sm bg-gray-900 rounded-[100px] p-2 pr-4 shadow-[0_12px_30px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4 pointer-events-auto border border-gray-800"
         >
            <div className="flex flex-col pl-4 text-white">
               <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-bold tracking-tight">{isMounted ? "₹" : ""}{event.price}</span>
                  <span className="text-[10px] text-gray-400 font-medium">/person</span>
               </div>
            </div>
            <button 
              onClick={() => setShowCheckout(true)}
              className="bg-[#D53F17] active:scale-95 transition-transform text-white py-3.5 px-6 rounded-full font-bold text-[14px] flex items-center justify-center gap-2 tracking-wide"
            >
              Get Tickets
            </button>
         </motion.div>
      </div>

      {/* Checkout Sheet */}
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
                           <img src={heroImage} className="w-full h-full object-cover" alt="" />
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
                        <span>{isMounted ? "₹" : ""}{ticketSubtotal}</span>
                        </div>
                      {taxAmount > 0 && (
                        <div className="flex justify-between text-[14px] font-medium text-gray-500">
                          <span>Tax</span>
                          <span>{isMounted ? "₹" : ""}{taxAmount}</span>
                        </div>
                      )}
                      
                      {platformFeeAmount > 0 && (
                        <div className="flex justify-between text-[14px] font-medium text-gray-500 pb-4 border-b border-gray-100">
                           <span>Platform Fee</span>
                           <span>{isMounted ? "₹" : ""}{platformFeeAmount}</span>
                        </div>
                      )}

                      {/* Coupon Section */}
                      <div className="pt-2">
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Ticket size={16} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-700">{appliedCoupon.code}</span>
                                <span className="text-[11px] font-bold text-emerald-600/70">Discount applied</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-600">-{isMounted ? "₹" : ""}{appliedCoupon.discountAmount}</span>
                              <button onClick={removeCoupon} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Remove">
                                <AlertCircle size={16} className="rotate-45" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {!showCouponInput ? (
                              <button 
                                onClick={() => setShowCouponInput(true)}
                                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-100 rounded-xl transition-all group"
                              >
                                <div className="flex items-center gap-2.5 text-gray-600 group-hover:text-[#D53F17] font-bold text-[14px]">
                                  <Ticket size={18} />
                                  <span>Have a promo code?</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#D53F17]" />
                              </button>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    value={couponInput}
                                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D53F17]/20 focus:border-[#D53F17] uppercase transition-all"
                                  />
                                  <button 
                                    onClick={validateCoupon}
                                    disabled={!couponInput || validatingCoupon}
                                    className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap min-w-[80px]"
                                  >
                                    {validatingCoupon ? (
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                    ) : (
                                      "Apply"
                                    )}
                                  </button>
                                </div>
                                {couponError && <p className="text-[12px] font-bold text-red-500 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {couponError}</p>}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                        <div className="flex justify-between items-end pt-4 mt-2 border-t border-gray-100">
                           <span className="text-[14px] font-bold text-gray-500 mb-1">Total to pay</span>
                           <span className="text-[24px] font-bold tracking-tight text-gray-900">{isMounted ? "₹" : ""}{finalTotalAmount}</span>
                        </div>
                     </div>

                     <button 
                       onClick={handleCheckout}
                       className="w-full bg-[#D53F17] text-white py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform mt-6 shadow-md shadow-[#D53F17]/30"
                     >
                      {isFreeEvent || finalTotalAmount <= 0 ? "Book Free" : (isMounted ? `Pay ₹${finalTotalAmount}` : "Pay...")}
                     </button>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center gap-6 text-center h-[380px] justify-center">
                     {paymentState === "PROCESSING" ? (
                        <>
                           <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                           <div className="space-y-1">
                              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Processing Payment</h3>
                              <p className="text-gray-500 text-[14px]">Please don&apos;t close this screen</p>
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
                                 <CheckCircle2 size={48} strokeWidth={2.5} />
                              </motion.div>
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-green-400 rounded-full blur-xl -z-10"
                              />
                           </div>
                           
                           <div className="space-y-2">
                              <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">Booking Confirmed</span>
                              <h3 className="text-[28px] font-bold text-gray-900 tracking-tight leading-none pt-2">Payment Successful!</h3>
                              <p className="text-gray-500 text-[15px] font-medium">Your tickets have been secured and sent to your email.</p>
                           </div>

                           <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 mt-2 flex items-center gap-4 transition-all hover:bg-white hover:shadow-md">
                              <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden">
                                <img src={heroImage} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-[14px] font-bold text-gray-900 line-clamp-1">{event.title}</p>
                                <p className="text-[12px] text-gray-500 font-medium">{quantity} {quantity > 1 ? 'Tickets' : 'Ticket'}{totalAmount > 0 ? (isMounted ? ` • ₹${totalAmount}` : "") : " • Free"}</p>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </div>
                )}
             </motion.div>
          </motion.div>
        )}
        {/* Terms Modal */}
         {showTermsModal && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex items-end justify-center p-0 md:p-6"
           >
              <div className="absolute inset-0" onClick={() => setShowTermsModal(false)} />
 
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-lg bg-white rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
              >
                 <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 shrink-0 md:hidden" />
                 
                 <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Terms & Conditions</h2>
                    <button 
                      onClick={() => setShowTermsModal(false)}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                       <X size={18} />
                    </button>
                 </div>
 
                 <div className="flex-1 overflow-y-auto px-6 py-8">
                    {event.terms ? (
                      <div className="space-y-6">
                        <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                          <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2 uppercase tracking-wide text-[12px]">
                            <Shield size={16} className="text-[#D53F17]" /> Event Specific Policy
                          </h3>
                          <p className="text-gray-700 leading-relaxed font-semibold whitespace-pre-line text-[14px]">
                            {event.terms}
                          </p>
                        </div>
                        <p className="text-[12px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-wider text-center justify-center pt-4">
                          <Info size={14} /> By booking, you agree to these event terms.
                        </p>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-400 font-medium">
                        Standard platform terms apply to this event.
                      </div>
                    )}
                 </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
