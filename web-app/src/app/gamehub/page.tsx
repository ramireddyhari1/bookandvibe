"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Frown, MapPin, Star } from "lucide-react";
import { useLocation } from "@/context/LocationContext";

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
};

const API_BASE = "http://localhost:5000/api";

export default function GamezonePage() {
  const { selectedLocation } = useLocation();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function loadFacilities() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/gamehub/facilities`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Failed to fetch facilities");
        setFacilities(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch facilities";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadFacilities();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(facilities.map((f) => f.type))).sort();
    return ["All", ...unique];
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    let result = facilities.filter((f) => {
      const area = `${f.location} ${f.venue}`.toLowerCase();
      return area.includes(selectedLocation.city.toLowerCase());
    });

    if (activeCategory !== "All") {
      result = result.filter((f) => f.type === activeCategory);
    }

    return result;
  }, [facilities, selectedLocation.city, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] pb-24 font-sans">
      <div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-center relative">
        <div className="inline-block bg-rose-200 text-rose-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6 shadow-sm border border-rose-300/50">
          Live facilities near you
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold mb-6 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Book Your Next
          <br />
          <span className="relative text-rose-600">Game Zone Slot</span>
        </h1>

        <p className="text-lg md:text-xl text-[#1c222b]/70 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          Instantly reserve premium cricket nets, football turf, laser tag, and bowling facilities.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mt-4">
        <div className="flex gap-3 overflow-x-auto w-full pb-6 scrollbar-hide mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-[15px] font-bold whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat
                  ? "bg-rose-600 text-white shadow-md transform -translate-y-0.5"
                  : "bg-white text-[#1c222b]/70 hover:bg-rose-50 hover:text-rose-600 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 font-medium">Loading facilities...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 font-medium">{error}</div>
        ) : filteredFacilities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFacilities.map((fac) => (
              <Link href={`/gamehub/${fac.id}`} key={fac.id} className="block group">
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-2 relative">
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    <img
                      src={fac.image}
                      alt={fac.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-900/60 to-transparent" />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#1c222b] text-[12px] px-2.5 py-1.5 rounded-xl font-bold shadow-sm flex items-center gap-1">
                      <Star className="fill-yellow-400 text-yellow-400" size={14} />
                      <span>{fac.rating} <span className="text-gray-400 font-medium">({fac.reviewsCount})</span></span>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="bg-rose-500 text-white text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-extrabold shadow-sm">
                        {fac.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <h3 className="text-[18px] font-black mb-2 text-[#1c222b] leading-snug group-hover:text-rose-600 transition-colors line-clamp-2">
                      {fac.name}
                    </h3>

                    <div className="space-y-1.5 mb-6 text-[#1c222b]/60 text-[13px] font-semibold flex-1">
                      <p className="flex items-center gap-2"><MapPin size={16} className="text-rose-500" /> {fac.venue}</p>
                      <p className="flex items-center gap-2"><Activity size={16} className="text-rose-500" /> {fac.distance}</p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-[#1c222b]">INR {fac.pricePerHour}</span>
                        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold leading-none mt-1">per {fac.unit}</span>
                      </div>
                      <span className="bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white px-5 py-2.5 rounded-[12px] text-[14px] font-extrabold transition-colors">
                        Book Slot
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 border border-dashed border-gray-200 rounded-3xl mt-6">
            <Frown className="text-rose-300 mx-auto mb-4" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-black text-[#1c222b] mb-2">No facilities found</h3>
            <p className="text-gray-500 max-w-md mx-auto font-medium">
              There are currently no gamezone facilities listed in <strong className="text-rose-500">{selectedLocation.city}</strong> matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
