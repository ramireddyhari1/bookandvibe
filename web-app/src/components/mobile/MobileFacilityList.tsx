"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Filter, ChevronRight, Activity, Calendar, Trophy, Target } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useLocation } from "@/context/LocationContext";
import { motion } from "framer-motion";
import PremiumLoader from "@/components/ui/PremiumLoader";

interface Facility {
  id: string;
  name: string;
  location: string;
  venue: string;
  pricePerHour: number | string;
  image: string;
  type: string;
  rating?: number;
  openHours?: string;
  slotTemplate?: any;
}

export default function MobileFacilityList() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedLocation } = useLocation();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  useEffect(() => {
    fetchApi("/gamehub/facilities")
      .then(d => {
        const facs = Array.isArray(d) ? d : (d.data && Array.isArray(d.data)) ? d.data : [];
        setFacilities(facs);
      })
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredFacilities = facilities.filter(f => 
    !selectedLocation?.city || f.location?.toLowerCase().includes(selectedLocation.city.toLowerCase())
  );

  // Generate next 7 days for the date picker
  const days = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      arr.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        full: d.toISOString().split('T')[0],
        fullDay: d.toLocaleDateString('en-US', { weekday: 'long' })
      });
    }
    return arr;
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10 overflow-x-hidden font-sans">
      {/* ——— PREMIUM DARK GREEN HEADER ——— */}
      <div className="bg-[#00A63E] pt-[max(env(safe-area-inset-top),16px)] pb-10 px-6 rounded-b-[40px] shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between mb-8">
           <Link href="/" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform">
             <ArrowLeft size={20} strokeWidth={2.5} />
           </Link>
           <h1 className="text-white text-[28px] font-bold tracking-tight">
             {selectedDateIndex === 0 ? "Today" : days[selectedDateIndex].fullDay}
           </h1>
           <div className="w-10 h-10 flex items-center justify-end">
             <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                <Search size={20} strokeWidth={2.5} />
             </div>
           </div>
        </div>

        {/* Horizontal Date Picker */}
        <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {days.map((d, i) => (
             <motion.button
               key={i}
               whileTap={{ scale: 0.95 }}
               onClick={() => setSelectedDateIndex(i)}
               className={`flex flex-col items-center justify-center min-w-[44px] h-[64px] rounded-2xl transition-all ${
                 selectedDateIndex === i 
                 ? "bg-white text-[#00A63E] shadow-xl shadow-black/20 scale-105" 
                 : "bg-white/10 text-white/50"
               }`}
             >
               <span className="text-[10px] font-bold uppercase mb-1">{d.day}</span>
               <span className="text-[16px] font-bold">{d.date}</span>
             </motion.button>
           ))}
        </div>
      </div>

      {/* ——— TIMELINE CONTENT ——— */}
      <div className="px-6 -mt-4 relative z-10">
         <div className="bg-white rounded-[32px] p-6 shadow-2xl shadow-black/[0.03] min-h-[500px]">
            
            {loading ? (
               <div className="py-24 flex justify-center">
                  <PremiumLoader size="md" color="#00A63E" text="Locating Venues" />
               </div>
            ) : (
               <div className="space-y-10 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[3px] top-6 bottom-0 w-[1px] bg-gray-100" />

                  {filteredFacilities.length > 0 ? filteredFacilities.map((f, i) => {
                     // Get real time from operational hours or slot template
                     const operationalTime = f.openHours?.split("-")[0]?.trim() || "09:00 AM";
                     const dotColor = ["#F59E0B", "#00A63E", "#8B5CF6", "#EF4444", "#3B82F6"][i % 5];

                     return (
                        <div key={f.id} className="relative flex gap-6 group">
                           {/* Time Indicator */}
                           <div className="relative pt-1 flex flex-col items-center">
                              <div 
                                className="w-[7px] h-[7px] rounded-full border-2 border-white shadow-md z-10" 
                                style={{ backgroundColor: dotColor }}
                              />
                           </div>

                           {/* Content Card */}
                           <Link href={`/gamehub/${f.id}`} className="flex-1">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{operationalTime}</span>
                                 <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                       <h3 className="text-gray-900 text-[17px] font-bold leading-tight group-active:text-[#00A63E] transition-colors">{f.name}</h3>
                                       <p className="text-gray-500 text-[13px] font-medium line-clamp-1">{f.venue || f.location}</p>
                                       <div className="flex items-center gap-1.5 mt-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                          <span className="text-[#00A63E] text-[12px] font-bold">₹{f.pricePerHour}/hr</span>
                                       </div>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0 border border-gray-100">
                                       <img src={f.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                 </div>
                              </div>
                           </Link>
                        </div>
                     );
                  }) : (
                     <div className="py-20 text-center">
                        <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-gray-900 font-bold mb-1">No Venues Nearby</h3>
                        <p className="text-gray-400 text-[13px]">Try switching your city or clearing filters.</p>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
