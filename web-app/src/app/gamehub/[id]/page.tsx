"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Gamepad2,
  Heart,
  Info,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import PremiumSelect from "@/components/ui/PremiumSelect";
import PriceChartModal from "@/components/ui/PriceChartModal";
import PremiumDatePicker from "@/components/ui/PremiumDatePicker";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

type PricingRule = {
  type: string;
  time?: string;
  day?: string;
  price: number;
};

type Review = {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
};

type Facility = {
  id: string;
  name: string;
  type: string;
  location: string;
  venue: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  pricePerHour: number;
  unit: string;
  image: string;
  description: string;
  phone: string;
  openHours: string;
  amenities: string[];
  gallery: string[];
  slotTemplate: Array<{ label: string; isBooked: boolean }>;
  pricingRules?: PricingRule[];
  availableSports?: string[];
  terms?: string;
  mapLink?: string;
  reviews?: Review[];
};

type AvailabilitySlot = {
  label: string;
  status: "AVAILABLE" | "LOCKED" | "BOOKED" | "BLOCKED";
  lockedByCurrentUser: boolean;
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  const facilityId = String(params.id || "");

  const [facility, setFacility] = useState<Facility | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState(0);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [bookingDate, setBookingDate] = useState(todayDateString());
  const [payAdvanceOnly, setPayAdvanceOnly] = useState(true);
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [duration, setDuration] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [showPriceChart, setShowPriceChart] = useState(false);
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [activeChartSport, setActiveChartSport] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

  const sportsList = useMemo(() => {
    if (!facility) return [];
    if (Array.isArray(facility.availableSports) && facility.availableSports.length > 0) {
      return facility.availableSports;
    }
    if (facility.type === "Multiple Sports" || facility.type.includes("&")) {
      return ["Badminton", "Football", "Table Tennis", "Box Cricket"];
    }
    return [facility.type];
  }, [facility]);

  useEffect(() => {
     if (sportsList.length > 0 && !selectedSport) {
        setSelectedSport(sportsList[0]);
     }
  }, [sportsList, selectedSport]);

  const courtsList = useMemo(() => {
    if (!facility) return [];
    const base = facility.pricePerHour || 500;
    return [
      { name: "Wooden Court 1", price: base },
      { name: "Synthetic Court 2", price: base + 100 },
      { name: "Premium Court 3", price: base + 250 }
    ];
  }, [facility]);

  const currentCourt = useMemo(() => 
    courtsList.find(c => c.name === selectedCourt) || (courtsList.length > 0 ? courtsList[0] : null)
  , [selectedCourt, courtsList]);

  const currentPrice = currentCourt?.price ?? (facility?.pricePerHour ?? 0);
  const totalAmount = currentPrice * duration;
  const advancePercent = (facility as any)?.advancePercentage ?? 20;
  const advanceAmount = Math.round((totalAmount * advancePercent) / 100);
  const balanceAmount = Math.max(0, totalAmount - advanceAmount);

  useEffect(() => {
     if (!selectedCourt && courtsList.length > 0) {
        setSelectedCourt(courtsList[0].name);
     }
  }, [selectedCourt, courtsList]);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      setError("");
      try {
        const [facilityPayload, listPayload, availabilityPayload] = await Promise.all([
          fetchApi(`/gamehub/facilities/${facilityId}`, { requiresAuth: false }) as Promise<{ data: Facility }>,
          fetchApi("/gamehub/facilities", { requiresAuth: false }) as Promise<{ data: Facility[] }>,
          fetchApi(`/gamehub/facilities/${facilityId}/availability?date=${bookingDate}${user?.id ? `&userId=${user.id}` : ""}`, { requiresAuth: false }) as Promise<{ data: { slots: AvailabilitySlot[] } }>,
        ]);

        if (facilityPayload?.data) {
          setFacility(facilityPayload.data);
          setReviews(Array.isArray(facilityPayload?.data?.reviews) ? facilityPayload.data.reviews : []);
        } else {
          throw new Error("Facility not found");
        }

        setAllFacilities(Array.isArray(listPayload?.data) ? listPayload.data : []);
        setAvailabilitySlots(Array.isArray(availabilityPayload?.data?.slots) ? availabilityPayload.data.slots : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load facility");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [facilityId, bookingDate, user?.id]);

  const similarFacilities = useMemo(() => {
    return allFacilities.filter((f) => f.id !== facilityId).slice(0, 3);
  }, [allFacilities, facilityId]);

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedSlot) return;
    if (!isAuthenticated) {
      setBookingError("Please login first to book this slot.");
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      // 1. Lock the slot first
      await fetchApi("/gamehub/bookings/lock", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({ facilityId, slotLabel: selectedSlot, date: bookingDate }),
      });

      // 2. Create Razorpay order
      const orderRes = await fetchApi("/payments/initiate", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          facilityId,
          currency: "INR",
          totalAmount,
          payAdvanceOnly,
        }),
      });

      const { orderId, keyId, amount: orderAmount, currency } = orderRes.data as { orderId: string, keyId: string, amount: number, currency: string };

      // 3. Open Razorpay checkout popup
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: "Book & Vibe",
        description: `${facility?.name || "GameHub"} — ${selectedSlot}`,
        order_id: orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#42B460" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // 4. Verify payment & create gamehub booking on backend
            await fetchApi("/payments/confirm-gamehub", {
              method: "POST",
              requiresAuth: true,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                facilityId,
                slotLabel: selectedSlot,
                date: bookingDate,
                totalAmount,
                payAdvanceOnly,
                meta: { court: selectedCourt, pricePerHour: currentPrice },
              }),
            });

            setBookingSuccess(`Booking confirmed for ${selectedSlot}!`);
            setSelectedSlot(null);

            // Refresh availability
            const refreshPayload = await fetchApi(`/gamehub/facilities/${facilityId}/availability?date=${bookingDate}`, { requiresAuth: false }) as { data?: { slots: AvailabilitySlot[] } };
            setAvailabilitySlots(refreshPayload.data?.slots || []);
          } catch (err) {
            setBookingError(err instanceof Error ? err.message : "Booking failed after payment");
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false);
            setBookingError("Payment was cancelled.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", () => {
        setBookingLoading(false);
        setBookingError("Payment failed. Please try again.");
      });
      razorpayInstance.open();
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
      setBookingLoading(false);
    }
  }, [selectedSlot, isAuthenticated, facilityId, bookingDate, totalAmount, payAdvanceOnly, facility, user, selectedCourt, currentPrice]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PremiumLoader size="lg" color="#42B460" text="Securing your vibe..." />
    </div>
  );
  if (error || !facility) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Venue not found</h2>
      <button onClick={() => router.push("/gamehub")} className="px-6 py-3 bg-[#42B460] text-white rounded-xl font-bold">Return to GameHub</button>
    </div>
  );

  return (
    <div className="pb-24 pt-[112px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Sticky Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between md:hidden">
        <button onClick={() => router.back()} className="text-gray-900"><ArrowLeft size={24} /></button>
        <span className="font-bold text-[15px] truncate max-w-[200px]">{facility.name}</span>
        <button className="text-gray-900"><Share2 size={20} /></button>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-[13px] text-gray-400 pt-6 pb-2">
          <Link href="/gamehub" className="hover:text-[#42B460] transition-colors">GameHub</Link>
          <ChevronRight size={14} />
          <span className="text-gray-500 font-medium">{facility.name}</span>
        </div>

        {/* Pro Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4 mt-4 lg:mt-0">
           <div>
              <h1 className="text-3xl md:text-[42px] font-bold text-gray-900 tracking-tight leading-none mb-5">
                 {facility.name}
              </h1>
              <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-gray-600 flex-wrap">
                 <span className="flex items-center gap-1.5"><Star size={18} className="text-[#42B460] fill-[#42B460]" /> <span className="font-bold text-gray-900">{facility.rating}</span> <span className="underline cursor-pointer">{facility.reviewsCount} reviews</span></span>
                 <span className="flex items-center gap-1.5"><MapPin size={18} className="text-gray-400" /> <span className="underline cursor-pointer">{facility.venue}</span></span>
                 <span className="flex items-center gap-1.5"><Clock size={18} className="text-gray-400" /> <span>{facility.openHours}</span></span>
              </div>
           </div>
           <div className="hidden md:flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700">
                <Share2 size={16} /> Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700">
                <Heart size={16} /> Save
              </button>
           </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gallery Section - Embedded inside Left Column */}
            <div className="relative h-[300px] md:h-[500px] rounded-[32px] overflow-hidden shadow-sm group">
               <img 
                 src={facility.gallery[activeGalleryImg] || facility.image} 
                 alt="Venue" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
               />
               {/* Overlay thumbnails if multiple images exist */}
               {facility.gallery.length > 1 && (
                 <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 overflow-x-auto pb-2 z-10">
                   {facility.gallery.map((img, i) => (
                     <button 
                       key={i} 
                       onClick={() => setActiveGalleryImg(i)}
                       className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeGalleryImg === i ? 'border-[#42B460] scale-105 shadow-lg' : 'border-white/40 opacity-80 hover:opacity-100 hover:border-white'}`}
                     >
                       <img src={img} alt="" className="w-full h-full object-cover" />
                     </button>
                   ))}
                 </div>
               )}
            </div>



            {/* Trust Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#42B460] p-6 rounded-[24px] shadow-lg">
               <div className="flex items-center gap-3 text-white w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                     <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold">Instant Booking</h4>
                    <p className="text-[11px] text-white/70 font-medium">Real-time confirmation</p>
                  </div>
               </div>
               <div className="hidden sm:block w-px h-10 bg-white/20"></div>
               <div className="flex items-center gap-3 text-white w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                     <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold">Verified Venue</h4>
                    <p className="text-[11px] text-white/70 font-medium">100% Secure & Safe</p>
                  </div>
               </div>
               <div className="hidden sm:block w-px h-10 bg-white/20"></div>
               <div className="flex items-center gap-3 text-white w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                     <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold">Flexible Timing</h4>
                    <p className="text-[11px] text-white/70 font-medium">Open {facility.openHours}</p>
                  </div>
               </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* About Venue (Spans full width) */}
               <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm md:col-span-2 group hover:shadow-md transition-all">
                  <h2 className="text-[18px] font-bold mb-4 text-gray-900 tracking-tight">About {facility.name}</h2>
                  <p className="text-[14px] text-gray-500 leading-relaxed font-medium whitespace-pre-line">
                    {facility.description || `Experience top-tier sports infrastructure at ${facility.name}. Whether you are looking for a casual game with friends or a competitive match, our facility offers premium playing surfaces, excellent lighting, and a vibrant sports community. Book your slot now to secure your game!`}
                  </p>
               </div>

               {/* Amenities & Rules — combined full-width */}
               <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm md:col-span-2 group hover:shadow-md transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Amenities Side */}
                     <div>
                        <h2 className="text-[18px] font-bold text-gray-900 tracking-tight mb-5">Amenities</h2>
                        <div className="flex flex-wrap gap-3">
                           {facility.amenities.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#42B460]/5 border border-[#42B460]/15 hover:bg-[#42B460]/10 transition-colors">
                                <ShieldCheck size={15} className="text-[#42B460] shrink-0" />
                                <span className="text-[13px] font-bold text-gray-700">{item}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     
                     {/* Rules Side */}
                     <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                        <div className="flex items-center justify-between mb-5">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Rules</h2>
                           <button 
                             onClick={() => setShowTermsModal(true)}
                             className="text-[#42B460] text-[11px] font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                           >
                              View All <ChevronRight size={14} />
                           </button>
                        </div>
                        <ul className="space-y-3">
                           <li className="flex items-start gap-3 text-[13px] text-gray-500 font-medium">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#42B460] shrink-0" /> Non-marking shoes are mandatory.
                           </li>
                           <li className="flex items-start gap-3 text-[13px] text-gray-500 font-medium">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#42B460] shrink-0" /> Arrive 10 min before your slot.
                           </li>
                           <li className="flex items-start gap-3 text-[13px] text-gray-500 font-medium">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#42B460] shrink-0" /> Not responsible for lost items.
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Location & Venue Info (Spans 2 cols) */}
               <div className="md:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row">
                     {/* Left: Info */}
                     <div className="flex-1 p-8">
                        <div className="flex items-center justify-between mb-6">
                           <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Location & Contact</h2>
                        </div>
                        <p className="text-[13px] text-gray-500 font-medium mb-5 flex items-center gap-2">
                           <MapPin size={14} className="text-[#42B460] shrink-0" /> {facility.venue}
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                           <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-100">
                              <Clock size={16} className="text-[#42B460] mx-auto mb-1.5" />
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Hours</p>
                              <p className="text-[12px] font-bold text-gray-900">{facility.openHours}</p>
                           </div>
                           <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-100">
                              <Star size={16} className="text-[#42B460] mx-auto mb-1.5 fill-[#42B460]" />
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Rating</p>
                              <p className="text-[12px] font-bold text-gray-900">{facility.rating} / 5.0</p>
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                           <button 
                             onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.venue)}`, '_blank')}
                             className="w-full bg-[#42B460] hover:bg-[#38A354] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] shadow-lg shadow-[#42B460]/20"
                           >
                              <MapPin size={16} /> Get Directions
                           </button>
                           <div className="flex gap-3">
                              <a href={`tel:${facility.phone}`} className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors text-[13px]">
                                 <Phone size={14} className="text-[#42B460]" /> Call
                              </a>
                              <button className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors text-[13px]">
                                 <Share2 size={14} className="text-[#42B460]" /> Share
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Right: Google Map */}
                     <div className="w-full md:w-[45%] min-h-[300px] md:min-h-0 relative">
                        <iframe
                          src={facility.mapLink && facility.mapLink.includes('google.com/maps') 
                            ? (facility.mapLink.includes('output=embed') ? facility.mapLink : `https://maps.google.com/maps?q=${encodeURIComponent(facility.mapLink)}&output=embed`)
                            : `https://maps.google.com/maps?q=${encodeURIComponent(facility.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                          }
                          className="absolute inset-0 w-full h-full border-0"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Venue Location"
                          style={{ filter: 'saturate(1.1) contrast(1.05)' }}
                        />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card — Desktop only */}
          <div className="hidden lg:block lg:col-span-4" id="booking-card">
             <div className="space-y-4">
                 <div className="bg-white text-gray-900 p-6 sm:px-8 sm:py-8 rounded-[32px] shadow-lg relative border border-gray-100">
                    
                    <div className="flex items-center gap-2 text-[#42B460] bg-[#42B460]/10 px-3 py-1.5 rounded-lg w-fit mb-6 text-[11px] font-bold uppercase tracking-wider">
                       <div className="w-1.5 h-1.5 bg-[#42B460] rounded-full animate-pulse" />
                       12 people are viewing this venue
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sport</label>
                         <button onClick={() => { setActiveChartSport(selectedSport); setShowPriceChart(true); }} className="text-[#42B460] text-[10px] font-bold uppercase tracking-wider hover:underline">View Prices</button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden">
                        {sportsList.map(sport => (
                          <button 
                            key={sport}
                            onClick={() => {
                              setSelectedSport(sport);
                              setActiveChartSport(sport);
                            }}
                            className={`whitespace-nowrap px-4 py-2.5 rounded-[14px] text-[12px] font-bold transition-all border flex-shrink-0 flex items-center gap-2 ${selectedSport === sport ? 'bg-[#42B460] border-[#42B460] text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'}`}
                          >
                            {sport}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6 space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-[13px] text-gray-500 font-medium">Total Price</span>
                         <span className="text-[15px] text-gray-900 font-bold">₹{totalAmount} / {facility.unit}</span>
                       </div>
                       
                       <label className="flex items-center justify-between cursor-pointer group pt-4 border-t border-gray-200">
                         <div className="flex flex-col">
                           <span className="text-[14px] text-gray-900 font-bold group-hover:text-[#42B460] transition-colors flex items-center gap-2">
                             Pay Advance to Reserve
                             <span className="bg-[#42B460]/10 text-[#42B460] text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">{advancePercent}%</span>
                           </span>
                           <span className="text-[11px] text-gray-400 mt-1">Pay remaining ₹{balanceAmount} at venue</span>
                         </div>
                         <div className="relative">
                           <input type="checkbox" className="sr-only" checked={payAdvanceOnly} onChange={(e) => setPayAdvanceOnly(e.target.checked)} />
                           <div className={`block w-10 h-6 rounded-full transition-colors ${payAdvanceOnly ? 'bg-[#42B460]' : 'bg-gray-300'}`}></div>
                           <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${payAdvanceOnly ? 'translate-x-4' : ''}`}></div>
                         </div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between mb-5">
                       <div>
                          <p className="text-[10px] font-bold text-[#42B460] uppercase tracking-wider mb-1">Amount to Pay Now</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-3xl font-bold text-gray-900">₹{payAdvanceOnly ? advanceAmount : totalAmount}</span>
                          </div>
                       </div>
                       <div className="bg-[#42B460]/10 p-2 rounded-xl">
                          <Activity size={20} className="text-[#42B460]" />
                       </div>
                    </div>

                    <div className="space-y-6">
                       {/* Date Strip */}
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">Select Date</label>
                         <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden">
                           {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                             const d = new Date();
                             d.setDate(d.getDate() + offset);
                             // bookingDate is a string "YYYY-MM-DD"
                             const isSelected = new Date(bookingDate).toDateString() === d.toDateString();
                             return (
                               <button 
                                 key={offset}
                                 onClick={() => {
                                    const localDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
                                    setBookingDate(localDateStr);
                                 }}
                                 className={`flex flex-col items-center justify-center min-w-[56px] py-2 rounded-2xl border transition-all flex-shrink-0 ${isSelected ? 'bg-[#42B460] border-[#42B460] text-white shadow-lg shadow-[#42B460]/20' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'}`}
                               >
                                 <span className="text-[10px] uppercase font-bold tracking-wider mb-0.5">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                 <span className="text-[16px] font-bold">{d.getDate()}</span>
                               </button>
                             );
                           })}
                         </div>
                       </div>

                       {/* Court Selection Pills */}
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">Select Court</label>
                         <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden">
                           {courtsList.map(court => (
                             <button 
                               key={court.name}
                               onClick={() => setSelectedCourt(court.name)}
                               className={`whitespace-nowrap px-4 py-2.5 rounded-[14px] text-[12px] font-bold transition-all border flex-shrink-0 flex items-center gap-2 ${selectedCourt === court.name ? 'bg-[#42B460] border-[#42B460] text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'}`}
                             >
                               <span>{court.name}</span>
                               <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${selectedCourt === court.name ? 'bg-white/20' : 'bg-gray-100'}`}>₹{court.price}</span>
                             </button>
                           ))}
                         </div>
                       </div>

                       {/* Time Slot Grid */}
                       <div>
                         <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Slots</label>
                            {/* Duration Stepper inside header for space efficiency */}
                            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                               <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 text-gray-500 transition-colors">-</button>
                               <span className="text-[10px] font-bold text-gray-900 px-2">{duration} Hr</span>
                               <button onClick={() => setDuration(Math.min(4, duration + 1))} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 text-gray-500 transition-colors">+</button>
                            </div>
                         </div>
                         <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                           {(availabilitySlots.length ? availabilitySlots : facility.slotTemplate.map(s => ({label: s.label, status: s.isBooked ? "BOOKED" : "AVAILABLE"}))).map((slot, idx) => {
                             const isBooked = slot.status !== "AVAILABLE";
                             const isSelected = selectedSlot === slot.label;
                             return (
                               <button
                                 key={idx}
                                 disabled={isBooked}
                                 onClick={() => setSelectedSlot(slot.label)}
                                 className={`py-2.5 rounded-[12px] text-[11px] font-bold transition-all border flex items-center justify-center tracking-wide ${
                                    isBooked 
                                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                                      : isSelected 
                                        ? 'bg-[#42B460] border-[#42B460] text-white shadow-lg shadow-[#42B460]/20' 
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                                  }`}
                               >
                                 {slot.label}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                       
                       <div className="pt-2">
                          <button
                            disabled={!selectedSlot || bookingLoading}
                            onClick={handleConfirmBooking}
                            className="w-full bg-[#42B460] hover:bg-[#38A354] disabled:bg-gray-100 disabled:border disabled:border-gray-200 disabled:text-gray-400 text-white py-4 rounded-[20px] font-bold text-[15px] transition-all active:scale-[0.98] shadow-xl shadow-[#42B460]/20 flex items-center justify-center gap-3 uppercase tracking-wider relative overflow-hidden group"
                          >
                            {bookingLoading ? (
                               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                               <>Confirm & Add <ChevronRight size={20} /></>
                            )}
                          </button>
                       </div>

                       {bookingError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-[12px] font-bold flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             {bookingError}
                          </div>
                       )}
                       {bookingSuccess && (
                          <div className="bg-[#42B460]/10 border border-[#42B460]/20 text-[#42B460] p-4 rounded-2xl text-[12px] font-bold">
                             {bookingSuccess}
                          </div>
                       )}
                    </div>
                 </div>

             </div>
          </div>

          {/* ═══ MOBILE: Sticky Book Now Button ═══ */}
          <div className="fixed bottom-0 left-0 right-0 z-[200] lg:hidden">
            <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Starting from</p>
                <p className="text-[22px] font-bold text-gray-900 leading-tight">₹{facility.pricePerHour}<span className="text-[12px] text-gray-400 font-bold">/{facility.unit}</span></p>
              </div>
              <button
                onClick={() => setShowBookingSheet(true)}
                className="bg-[#42B460] text-white px-8 py-3.5 rounded-2xl font-bold text-[15px] shadow-xl shadow-[#42B460]/30 active:scale-95 transition-transform uppercase tracking-wider flex items-center gap-2"
              >
                Book Now <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* ═══ MOBILE: Booking Bottom Sheet ═══ */}
          {showBookingSheet && (
            <div className="fixed inset-0 z-[300] lg:hidden">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBookingSheet(false)} />
              {/* Sheet */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#1c222b] rounded-t-[32px] max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
                {/* Handle */}
                <div className="sticky top-0 bg-[#1c222b] rounded-t-[32px] pt-3 pb-2 px-6 flex items-center justify-between z-10">
                  <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
                  <button onClick={() => setShowBookingSheet(false)} className="absolute right-5 top-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <X size={16} className="text-white" />
                  </button>
                </div>
                <div className="px-6 pb-8 text-white">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="text-[13px] text-gray-400 font-medium">Total Price</span>
                       <span className="text-[15px] text-white font-bold">₹{totalAmount}</span>
                     </div>
                     
                     <label className="flex items-center justify-between cursor-pointer group pt-4 border-t border-white/10">
                       <div className="flex flex-col">
                         <span className="text-[14px] text-white font-bold group-hover:text-[#42B460] transition-colors flex items-center gap-2">
                           Pay Advance
                           <span className="bg-[#42B460]/20 text-[#42B460] text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">{advancePercent}%</span>
                         </span>
                         <span className="text-[11px] text-gray-400 mt-1">Pay remaining ₹{balanceAmount} at venue</span>
                       </div>
                       <div className="relative">
                         <input type="checkbox" className="sr-only" checked={payAdvanceOnly} onChange={(e) => setPayAdvanceOnly(e.target.checked)} />
                         <div className={`block w-10 h-6 rounded-full transition-colors ${payAdvanceOnly ? 'bg-[#42B460]' : 'bg-gray-600'}`}></div>
                         <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${payAdvanceOnly ? 'translate-x-4' : ''}`}></div>
                       </div>
                     </label>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-[#42B460] uppercase tracking-wider mb-1">Amount to Pay Now</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">₹{payAdvanceOnly ? advanceAmount : totalAmount}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <Activity size={20} className="text-[#42B460]" />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <PremiumSelect 
                      label="Sport"
                      value={selectedSport}
                      onChange={setSelectedSport}
                      options={sportsList.map(sport => ({
                        value: sport,
                        label: sport,
                        icon: sport.includes("Badminton") ? <Activity size={18} /> :
                              sport.includes("Football") ? <Target size={18} /> :
                              sport.includes("Table Tennis") ? <Trophy size={18} /> :
                              (sport.includes("Box") || sport.includes("Cricket")) ? <Award size={18} /> :
                              <Zap size={18} />
                      }))}
                    />

                    <PremiumDatePicker 
                      label="Date"
                      value={bookingDate}
                      onChange={setBookingDate}
                    />

                    <PremiumSelect 
                      label="Select Court"
                      value={selectedCourt}
                      onChange={setSelectedCourt}
                      options={courtsList.map(court => ({
                        value: court.name,
                        label: court.name,
                        price: court.price,
                        unit: facility?.unit || 'hr',
                        icon: <Zap size={18} />
                      }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <PremiumSelect 
                        label="Start Time"
                        value={selectedSlot || ""}
                        placeholder="Select"
                        onChange={setSelectedSlot}
                        icon={<Clock size={16} />}
                        options={(availabilitySlots.length ? availabilitySlots : facility.slotTemplate.map(s => ({label: s.label, status: s.isBooked ? "BOOKED" : "AVAILABLE", lockedByCurrentUser: false}))).map((slot) => ({
                          value: slot.label,
                          label: slot.label,
                          disabled: slot.status !== "AVAILABLE",
                          icon: <Clock size={16} />
                        }))}
                      />
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block mb-2">Duration</label>
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full">
                          <button 
                            onClick={() => setDuration(Math.max(1, duration - 1))}
                            className="w-10 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-r border-white/5 text-xl font-light"
                          >-</button>
                          <span className="flex-1 text-center font-bold text-sm">{duration} Hr</span>
                          <button 
                            onClick={() => setDuration(Math.min(4, duration + 1))}
                            className="w-10 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-l border-white/5 text-xl font-light"
                          >+</button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        disabled={!selectedSlot || bookingLoading}
                        onClick={handleConfirmBooking}
                        className="w-full bg-[#42B460] hover:bg-[#38A354] disabled:bg-gray-800 disabled:text-gray-600 text-white py-4 rounded-2xl font-bold text-[15px] transition-all shadow-xl shadow-[#42B460]/30 flex items-center justify-center gap-3 uppercase tracking-wider"
                      >
                        {bookingLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Confirm & Add <ChevronRight size={20} /></>
                        )}
                      </button>
                    </div>

                    {bookingError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-100 p-4 rounded-2xl text-[12px] font-bold flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {bookingError}
                      </div>
                    )}
                    {bookingSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 border border-gray-100 p-6 rounded-[24px] text-center space-y-4"
                      >
                         <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto">
                            <CheckCircle2 size={32} strokeWidth={3} />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[18px] font-bold text-gray-900 leading-none">Booking Confirmed!</h4>
                            <p className="text-[13px] text-gray-600 font-bold">{bookingSuccess}</p>
                         </div>
                         <div className="pt-2">
                            <button 
                              onClick={() => router.push("/profile/bookings")}
                              className="text-[11px] font-bold uppercase tracking-wider text-[#42B460] hover:underline transition-colors"
                            >
                              View My Bookings
                            </button>
                         </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Similar Venues Section */}
        {similarFacilities.length > 0 && (
          <div className="mt-20">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Similar Venues</h2>
                <Link href="/gamehub" className="text-[#42B460] font-bold text-sm hover:underline flex items-center gap-1">
                   Show all <ChevronRight size={16} />
                </Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarFacilities.map((item) => (
                  <Link key={item.id} href={`/gamehub/${item.id}`} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                         <Star size={12} className="text-[#42B460] fill-[#42B460]" />
                         <span className="text-[11px] font-bold text-gray-900">{item.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[11px] font-bold text-[#42B460] uppercase tracking-wider mb-1">{item.type}</p>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#42B460] transition-colors">{item.name}</h3>
                      <p className="text-xs text-gray-400 font-bold mb-4 line-clamp-1">{item.venue}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                         <p className="text-[15px] font-bold text-gray-900">₹{item.pricePerHour}<span className="text-[11px] text-gray-400 font-bold uppercase ml-1">/{item.unit}</span></p>
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#42B460]/10 group-hover:text-[#42B460] transition-colors">
                            <ChevronRight size={18} />
                         </div>
                      </div>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        )}
      </div>

      <PriceChartModal 
        isOpen={showPriceChart}
        onClose={() => setShowPriceChart(false)}
        sport={activeChartSport}
        basePrice={facility.pricePerHour}
        unit={facility.unit}
         pricingRules={facility.pricingRules || []}
       />
 
       {/* ═══ TERMS MODAL ═══ */}
       <AnimatePresence>
         {showTermsModal && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-end justify-center p-0 md:p-6"
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
                    {facility.terms ? (
                      <div className="space-y-6">
                        <div className="p-6 bg-[#42B460]/5 rounded-2xl border border-[#42B460]/10">
                          <h3 className="font-bold text-[#42B460] mb-3 flex items-center gap-2 uppercase tracking-wide text-[12px]">
                            <ShieldCheck size={16} /> Venue Specific Rules
                          </h3>
                          <p className="text-gray-700 leading-relaxed font-semibold whitespace-pre-line text-[14px]">
                            {facility.terms}
                          </p>
                        </div>
                        <p className="text-[12px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-wider text-center justify-center pt-4">
                          <Info size={14} /> By booking, you agree to these venue terms.
                        </p>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-400 font-medium">
                        Standard facility terms apply to this venue.
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
