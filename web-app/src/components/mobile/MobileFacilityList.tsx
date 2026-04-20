"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Filter } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useLocation } from "@/context/LocationContext";

interface Facility {
  id: string;
  name: string;
  location: string;
  pricePerHour: number | string;
  image: string;
  type: string;
}

export default function MobileFacilityList() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedLocation } = useLocation();

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

  return (
    <div className="min-h-screen bg-white pb-6 overflow-x-hidden font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 pt-[max(env(safe-area-inset-top),16px)] pb-4 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
          <ArrowLeft size={20} className="text-gray-900" strokeWidth={2.5} />
        </Link>
        <h1 className="text-gray-900 text-[18px] font-bold">All Facilities</h1>
        <div className="w-10 h-10 flex items-center justify-end">
          <Filter size={20} className="text-gray-900" />
        </div>
      </div>

      <div className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 bg-gray-50 rounded-[14px] px-4 py-3 mb-6 border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search venue or sport..." 
            className="bg-transparent border-none outline-none flex-1 text-[15px] font-medium text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            filteredFacilities.length > 0 ? filteredFacilities.map((f) => (
              <Link href={`/gamehub/${f.id}`} key={f.id} className="block">
                <div className="w-full relative h-[200px] rounded-[24px] overflow-hidden bg-gray-100 shadow-sm border border-gray-100 mb-3">
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-white/50 flex items-baseline gap-[2px]">
                    <span className="text-[#10B981] text-[11px] font-extrabold tracking-tight">₹</span>
                    <span className="text-gray-900 text-[14px] font-black tracking-tight">{f.pricePerHour}</span>
                    <span className="text-gray-500 text-[10px] font-bold">/hr</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-[20px] font-bold leading-tight mb-1">{f.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#34D399]" />
                        <span className="text-gray-200 text-[12px] font-medium">{f.location}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">{f.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
               <div className="py-20 text-center text-gray-500 font-medium">No venues found nearby.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
