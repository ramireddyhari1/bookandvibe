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
  ChevronRight,
  Clock,
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
  FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import PremiumSelect from "@/components/ui/PremiumSelect";
import PriceChartModal from "@/components/ui/PriceChartModal";
import PremiumDatePicker from "@/components/ui/PremiumDatePicker";

declare global {
  interface Window {
    Razorpay: any;
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
        const [facilityPayload, listPayload, availabilityPayload]: any[] = await Promise.all([
          fetchApi(`/gamehub/facilities/${facilityId}`, { requiresAuth: false }),
          fetchApi("/gamehub/facilities", { requiresAuth: false }),
          fetchApi(`/gamehub/facilities/${facilityId}/availability?date=${bookingDate}${user?.id ? `&userId=${user.id}` : ""}`, { requiresAuth: false }),
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
      const orderRes: any = await fetchApi("/payments/initiate", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          facilityId,
          currency: "INR",
        }),
      });

      const { orderId, keyId, amount: orderAmount, currency } = orderRes.data;

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
        handler: async (response: any) => {
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
                meta: { court: selectedCourt, pricePerHour: currentPrice },
              }),
            });

            setBookingSuccess(`Booking confirmed for ${selectedSlot}!`);
            setSelectedSlot(null);

            // Refresh availability
            const refreshPayload: any = await fetchApi(`/gamehub/facilities/${facilityId}/availability?date=${bookingDate}`, { requiresAuth: false });
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
  }, [selectedSlot, isAuthenticated, facilityId, bookingDate, totalAmount, facility, user, selectedCourt, currentPrice]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-[#42B460] border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !facility) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Venue not found</h2>
      <button onClick={() => router.push("/gamehub")} className="px-6 py-3 bg-[#42B460] text-white rounded-xl font-bold">Return to GameHub</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 pt-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Sticky Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between md:hidden">
        <button onClick={() => router.back()} className="text-gray-900"><ArrowLeft size={24} /></button>
        <span className="font-bold text-[15px] truncate max-w-[200px]">{facility.name}</span>
        <button className="text-gray-900"><Share2 size={20} /></button>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-[13px] text-gray-400 py-6 mb-2">
          <Link href="/gamehub" className="hover:text-[#42B460] transition-colors">GameHub</Link>
          <ChevronRight size={14} />
          <span className="text-gray-500 font-medium">{facility.name}</span>
        </div>

        {/* Gallery Section - Premium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[300px] md:h-[500px] mb-8 rounded-3xl overflow-hidden shadow-sm group">
          <div className="md:col-span-8 relative overflow-hidden">
            <img 
              src={facility.gallery[activeGalleryImg] || facility.image} 
              alt="Venue" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
          <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-4">
             {facility.gallery.slice(1, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden cursor-pointer" onClick={() => setActiveGalleryImg(i + 1)}>
                  <img src={img} alt="Gallery" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                </div>
             ))}
             {facility.gallery.length > 3 && (
               <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/80 transition-colors">
                  View all {facility.gallery.length} photos
               </div>
             )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Info */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-[#42B460]" />
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block bg-[#42B460]/10 text-[#42B460] px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest mb-3">
                      {facility.type}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                      {facility.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
                       <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#42B460]" /> {facility.venue}</span>
                       <span className="flex items-center gap-1.5"><Clock size={16} className="text-[#42B460]" /> {facility.openHours}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                     <div className="flex items-center gap-1.5 bg-[#42B460] text-white px-3 py-1.5 rounded-xl">
                        <Star size={18} fill="currentColor" />
                        <span className="text-lg font-black">{facility.rating}</span>
                     </div>
                     <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{facility.reviewsCount} REVIEWS</span>
                  </div>
               </div>
               
               <div className="flex flex-col gap-6 pt-6 border-t border-gray-50 mt-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Sports Available</h3>
                       <span className="text-[11px] text-gray-400 font-medium">(Click on sports to view price chart)</span>
                    </div>
                     <div className="flex flex-wrap gap-3">
                       {sportsList.map((sport) => (
                         <div 
                           key={sport} 
                           onClick={() => {
                             setSelectedSport(sport);
                             setActiveChartSport(sport);
                             setShowPriceChart(true);
                           }}
                           className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer min-w-[100px] group ${
                             selectedSport === sport 
                               ? 'border-[#42B460] bg-[#42B460]/5 shadow-md' 
                               : 'border-gray-100 bg-white shadow-sm hover:border-[#42B460] hover:shadow-md'
                           }`}
                         >
                            <div className={`w-10 h-10 flex items-center justify-center transition-colors mb-2 ${
                              selectedSport === sport ? 'text-[#42B460]' : 'text-gray-600 group-hover:text-[#42B460]'
                            }`}>
                               {sport.includes("Badminton") && <Activity size={24} />}
                               {sport.includes("Football") && <Target size={24} />}
                               {sport.includes("Table Tennis") && <Trophy size={24} />}
                               {(sport.includes("Cricket") || sport.includes("Box")) && <Award size={24} />}
                               {/* Fallback icon for other sports */}
                               {!["Badminton", "Football", "Table Tennis", "Box", "Cricket"].some(s => sport.includes(s)) && <Zap size={24} />}
                            </div>
                            <span className={`text-[12px] font-black tracking-tight ${
                              selectedSport === sport ? 'text-[#42B460]' : 'text-gray-700'
                            }`}>{sport}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 md:flex-none border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                      <Share2 size={18} /> Share
                    </button>
                    <button className="flex-1 md:flex-none border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                      <Heart size={18} /> Favorite
                    </button>
                  </div>
               </div>
            </div>

            {/* About Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-wide">
                 <Info size={20} className="text-[#42B460]" /> About this Venue
               </h2>
               <p className="text-gray-600 leading-relaxed text-[15px] font-medium whitespace-pre-line">
                 {facility.description}
               </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-wide">
                 <Zap size={20} className="text-[#42B460]" /> Amenities
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {facility.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#42B460] border border-gray-100">
                          <ShieldCheck size={20} />
                       </div>
                       <span className="text-[14px] font-bold text-gray-700">{item}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* More Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <h2 className="text-[22px] font-black mb-6 tracking-tight">More</h2>
               <button 
                 onClick={() => setShowTermsModal(true)}
                 className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-gray-200 shadow-sm"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#42B460] transition-colors">
                        <FileText size={20} />
                     </div>
                     <span className="text-[16px] font-black text-gray-800 tracking-tight">Terms and Conditions</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-all" />
               </button>
            </div>

            {/* Location / Contact */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-wide">
                 <MapPin size={20} className="text-[#42B460]" /> Location & Contact
               </h2>
               <div className="relative w-full h-[250px] bg-gray-100 rounded-2xl mb-6 overflow-hidden border border-gray-200">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                       <MapPin size={40} className="text-[#42B460] mx-auto mb-2 opacity-50" />
                       <span className="text-[12px] font-bold text-gray-400">Interactive Map View Placeholder</span>
                    </div>
                 </div>
               </div>
               <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#42B460] shadow-sm">
                        <Phone size={20} />
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Contact Venue</p>
                        <p className="text-lg font-black text-gray-900">{facility.phone}</p>
                     </div>
                  </div>
                  <button className="w-full md:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl shadow-sm hover:shadow-md transition-all">
                    Get Directions
                  </button>
               </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card — Desktop only */}
          <div className="hidden lg:block lg:col-span-4" id="booking-card">
             <div className="sticky top-24 space-y-6">
                 <div className="bg-[#1c222b] text-white p-6 sm:px-8 sm:pt-8 sm:pb-12 rounded-[32px] shadow-2xl relative border border-white/5">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#42B460]/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <p className="text-[10px] font-black text-[#42B460] uppercase tracking-widest mb-1">Total Amount</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-3xl font-black text-white">₹{totalAmount}</span>
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">all inclusive</span>
                          </div>
                       </div>
                       <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                          <Activity size={20} className="text-[#42B460]" />
                       </div>
                    </div>

                    <div className="space-y-5">
                       {/* Sport Selection */}
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

                         {/* Date Picker */}
                         <PremiumDatePicker 
                           label="Date"
                           value={bookingDate}
                           onChange={setBookingDate}
                         />

                        {/* Court Selection */}
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
                          {/* Start Time Selection */}
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

                          {/* Duration Stepper */}
                          <div>
                             <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Duration</label>
                             <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full">
                                <button 
                                  onClick={() => setDuration(Math.max(1, duration - 1))}
                                  className="w-10 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-r border-white/5 text-xl font-light"
                                >
                                  -
                                </button>
                                <span className="flex-1 text-center font-black text-sm">{duration} Hr</span>
                                <button 
                                  onClick={() => setDuration(Math.min(4, duration + 1))}
                                  className="w-10 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-l border-white/5 text-xl font-light"
                                >
                                  +
                                </button>
                             </div>
                          </div>
                       </div>

                       <div className="pt-4">
                          <button
                            disabled={!selectedSlot || bookingLoading}
                            onClick={handleConfirmBooking}
                            className="w-full bg-[#42B460] hover:bg-[#38A354] disabled:bg-gray-800 disabled:text-gray-600 text-white py-4 rounded-2xl font-black text-[15px] transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-xl shadow-[#42B460]/30 flex items-center justify-center gap-3 uppercase tracking-wider"
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
                          <div className="bg-[#42B460]/10 border border-[#42B460]/20 text-[#42B460] p-4 rounded-2xl text-[12px] font-bold">
                             {bookingSuccess}
                          </div>
                       )}
                    </div>
                 </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#42B460]">
                        <Users size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Players currently active at this venue</span>
                   </div>
                   <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-[#42B460]/10 text-[#42B460] text-[10px] font-black flex items-center justify-center">
                        +12
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* ═══ MOBILE: Sticky Book Now Button ═══ */}
          <div className="fixed bottom-0 left-0 right-0 z-[200] lg:hidden">
            <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Starting from</p>
                <p className="text-[22px] font-black text-gray-900 leading-tight">₹{facility.pricePerHour}<span className="text-[12px] text-gray-400 font-bold">/{facility.unit}</span></p>
              </div>
              <button
                onClick={() => setShowBookingSheet(true)}
                className="bg-[#42B460] text-white px-8 py-3.5 rounded-2xl font-black text-[15px] shadow-xl shadow-[#42B460]/30 active:scale-95 transition-transform uppercase tracking-wider flex items-center gap-2"
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-[#42B460] uppercase tracking-widest mb-1">Total Amount</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">₹{totalAmount}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">all inclusive</span>
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
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Duration</label>
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full">
                          <button 
                            onClick={() => setDuration(Math.max(1, duration - 1))}
                            className="w-10 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-r border-white/5 text-xl font-light"
                          >-</button>
                          <span className="flex-1 text-center font-black text-sm">{duration} Hr</span>
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
                        className="w-full bg-[#42B460] hover:bg-[#38A354] disabled:bg-gray-800 disabled:text-gray-600 text-white py-4 rounded-2xl font-black text-[15px] transition-all shadow-xl shadow-[#42B460]/30 flex items-center justify-center gap-3 uppercase tracking-wider"
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
                        className="bg-gradient-to-br from-emerald-50 to-green-50 border border-green-100 p-6 rounded-[24px] text-center space-y-4 shadow-xl shadow-green-900/5"
                      >
                         <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-green-500/20">
                            <CheckCircle size={32} strokeWidth={3} />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[18px] font-black text-gray-900 leading-none">Booking Vibe Confirmed!</h4>
                            <p className="text-[13px] text-green-700 font-bold">{bookingSuccess}</p>
                         </div>
                         <div className="pt-2">
                            <button 
                              onClick={() => router.push("/profile/bookings")}
                              className="text-[11px] font-black uppercase tracking-widest text-green-700 hover:text-green-800 underline transition-colors"
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
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">VIBE WITH SIMILAR VENUES</h2>
                <Link href="/gamehub" className="text-[#42B460] font-black text-sm hover:underline flex items-center gap-1">
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
                         <span className="text-[11px] font-black text-gray-900">{item.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[11px] font-black text-[#42B460] uppercase tracking-widest mb-1">{item.type}</p>
                      <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-[#42B460] transition-colors">{item.name}</h3>
                      <p className="text-xs text-gray-400 font-bold mb-4 line-clamp-1">{item.venue}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                         <p className="text-[15px] font-black text-gray-900">₹{item.pricePerHour}<span className="text-[11px] text-gray-400 font-bold uppercase ml-1">/{item.unit}</span></p>
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
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Terms & Conditions</h2>
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
                          <h3 className="font-extrabold text-[#42B460] mb-3 flex items-center gap-2 uppercase tracking-wide text-[12px]">
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
