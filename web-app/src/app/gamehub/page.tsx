"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Frown,
  MapPin,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";
import { useLocation } from "@/context/LocationContext";
import SubNav from "@/components/gamehub/SubNav";
import PlayNowSection from "@/components/gamehub/PlayNowSection";
import FindGroundsSection from "@/components/gamehub/FindGroundsSection";
import { fetchApi } from "@/lib/api";
import MobileFacilityList from "@/components/mobile/MobileFacilityList";

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

export default function GamezonePage() {
  const { selectedLocation } = useLocation();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("reserve");
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(0);
  
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  const sportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sportDropdownRef.current && !sportDropdownRef.current.contains(event.target as Node)) {
        setIsSportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadFacilities() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (selectedLocation.city) params.set("city", selectedLocation.city);
        params.set("sortBy", "distance");
        params.set("sortOrder", "asc");
        params.set("limit", "50");

        const payload = await fetchApi(`/gamehub/facilities?${params.toString()}`, { requiresAuth: false }) as { data?: Facility[] };

        let apiData = Array.isArray(payload?.data) ? payload.data : [];

        if (selectedLocation.city && apiData.length === 0) {
          const fallbackParams = new URLSearchParams(params);
          fallbackParams.delete("city");
          const fallbackPayload = await fetchApi(`/gamehub/facilities?${fallbackParams.toString()}`, { requiresAuth: false }) as { data?: Facility[] };
          apiData = Array.isArray(fallbackPayload?.data) ? fallbackPayload.data : [];

          if (apiData.length > 0) {
            setError(`No venues found in ${selectedLocation.city}. Showing available venues from other cities.`);
          }
        } else {
          setError("");
        }

        const mergedData = apiData;

        // Remove duplicates if any (based on name)
        const uniqueData = mergedData.filter((item, index, self) =>
          index === self.findIndex((t) => t.name === item.name)
        );

        setFacilities(uniqueData);
        setTotal(uniqueData.length);
      } catch (err) {
        setFacilities([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : "Failed to load facilities");
      } finally {
        setLoading(false);
      }
    }

    loadFacilities();
  }, [selectedLocation.city]);

  const filteredFacilities = useMemo(() => {
    let result = facilities.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedSport !== "All Sports") {
      result = result.filter(f =>
        f.type.toLowerCase().includes(selectedSport.toLowerCase())
      );
    }
    return result;
  }, [facilities, searchQuery, selectedSport]);

  // Extract unique sports for a secondary filter (simulating the "All Sports" dropdown in Playo)
  const availableSports = useMemo(() => {
    return Array.from(new Set(facilities.map(f => f.type))).sort();
  }, [facilities]);

  const getSportIcons = (type: string) => {
    const sports = type.split("&").map(s => s.trim().toLowerCase());
    const icons = [];

    if (sports.includes("cricket")) icons.push(<Activity size={14} className="text-[#42B460]" key="cricket" />);
    if (sports.includes("football")) icons.push(<Target size={14} className="text-[#42B460]" key="football" />);
    if (sports.includes("badminton")) icons.push(<Target size={14} className="text-[#42B460]" key="badminton" />);
    if (sports.includes("swimming")) icons.push(<Activity size={14} className="text-[#42B460]" key="swimming" />);
    if (sports.includes("multi-sport")) icons.push(<Trophy size={14} className="text-[#42B460]" key="multi" />);

    // Fallback if no specific icon found
    if (icons.length === 0) icons.push(<Activity size={14} className="text-gray-400" key="fallback" />);

    return icons;
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <MobileFacilityList />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen text-[#1c222b] pb-24 font-sans pt-[112px]">
        <SubNav activeTab={activeSubTab} setActiveTab={setActiveSubTab} />

      {/* Tab Content */}
      <div className="max-w-[1200px] mx-auto px-6">
        {activeSubTab === "play" && (
          <PlayNowSection city={selectedLocation.city} />
        )}

        {activeSubTab === "reserve" && (
          <div className="space-y-24 pb-24">
            {/* Header & Search */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="py-16 px-12 flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-3">
                  <h1 className="text-5xl font-bold tracking-tight text-[#1c222b]">
                    Venues in <span className="text-[#42B460]">{selectedLocation.city}</span>
                  </h1>
                  <p className="text-lg text-gray-500 font-medium max-w-lg">
                    Discover and book premium sports facilities curated for champions.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#42B460] transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or sport..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#42B460]/30 focus:ring-4 focus:ring-[#42B460]/5 outline-none transition-all text-[16px] font-medium"
                    />
                    
                    {searchQuery.trim().length > 0 && (
                      <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        {filteredFacilities.length > 0 ? (
                          filteredFacilities.slice(0, 5).map(f => (
                            <Link 
                              href={`/gamehub/${f.id}`} 
                              key={f.id} 
                              onClick={() => setSearchQuery("")}
                              className="flex items-center gap-5 p-4 hover:bg-gray-50 rounded-2xl transition-all group/item"
                            >
                              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[15px] font-bold text-gray-900 truncate group-hover/item:text-[#42B460] transition-colors">{f.name}</h4>
                                <p className="text-[13px] text-gray-500 truncate font-medium">{f.venue || f.location}</p>
                              </div>
                              <div className="bg-gray-100 p-2 rounded-lg group-hover/item:bg-[#42B460]/10 group-hover/item:text-[#42B460] transition-all">
                                <ChevronRight size={18} />
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="py-12 text-center">
                            <Search size={40} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold">No facilities match your search</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative min-w-[200px]" ref={sportDropdownRef}>
                    <div 
                      onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)}
                      className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all font-medium text-gray-700"
                    >
                      <Activity size={20} className="text-[#42B460]" />
                      <span className="text-[16px] whitespace-nowrap">{selectedSport}</span>
                      <ChevronDown size={18} className={`absolute right-5 text-gray-400 transition-transform duration-300 ${isSportDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {isSportDropdownOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                        {["All Sports", "Cricket", "Football", "Badminton", "Swimming", "Multi-sport"].map((sport) => (
                          <div
                            key={sport}
                            onClick={() => {
                              setSelectedSport(sport);
                              setIsSportDropdownOpen(false);
                            }}
                            className={`px-5 py-3 text-[15px] cursor-pointer transition-all flex items-center justify-between ${
                              selectedSport === sport
                                ? "bg-[#42B460] text-white font-bold"
                                : "text-gray-700 hover:bg-gray-50 font-medium"
                            }`}
                          >
                            {sport}
                            {selectedSport === sport && <Check size={16} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Section */}
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-[#1c222b] tracking-tight">Featured Venues</h2>
                  <p className="text-lg text-gray-500 font-medium">Top-rated facilities for your perfect game.</p>
                </div>
                <Link
                  href="#all-venues"
                  className="group bg-white border border-gray-200 text-[#1c222b] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:border-[#42B460] hover:text-[#42B460] transition-all shadow-sm"
                >
                  View All <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[40px] border border-gray-100 shadow-sm">
                  <PremiumLoader size="lg" color="#42B460" text="Refreshing Facilities" />
                </div>
              ) : filteredFacilities.length > 0 ? (
                <div className={searchQuery || selectedSport !== "All Sports" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x"}>
                  {filteredFacilities.slice(0, searchQuery || selectedSport !== "All Sports" ? undefined : 6).map((fac) => (
                    <Link
                      href={`/gamehub/${fac.id}`}
                      key={`fac-${fac.id}`}
                      className={`group ${searchQuery || selectedSport !== "All Sports" ? "w-full" : "flex-shrink-0 w-[320px] md:w-[380px] snap-start"}`}
                    >
                      <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#42B460]/10 transition-all duration-500">
                        <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                          <img
                            src={fac.image}
                            alt={fac.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#42B460] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 tracking-wider uppercase">
                            <Sparkles size={12} /> Featured
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                             <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                                <Star size={14} fill="#FFB800" className="text-[#FFB800]" />
                                <span className="text-white text-[14px] font-bold">{fac.rating}</span>
                             </div>
                             <div className="bg-white px-3 py-1.5 rounded-xl shadow-lg">
                                <span className="text-[#1c222b] text-[16px] font-bold">₹{fac.pricePerHour || "499"}</span>
                                <span className="text-gray-400 text-[11px] font-bold ml-1">/hr</span>
                             </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-[20px] font-bold text-[#1c222b] group-hover:text-[#42B460] transition-colors line-clamp-1 mb-2">
                            {fac.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-gray-400 font-medium text-[14px] mb-6">
                            <MapPin size={16} className="shrink-0" />
                            <span className="truncate">{fac.venue}</span>
                            <span className="shrink-0 text-gray-300">•</span>
                            <span className="shrink-0">{fac.distance}</span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-2">
                                {getSportIcons(fac.type).slice(0, 3).map((icon, i) => (
                                  <div key={i} className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-gray-600 shadow-sm">
                                    {icon}
                                  </div>
                                ))}
                              </div>
                              <span className="text-[12px] text-gray-500 font-bold uppercase tracking-tight">{fac.type.split(" & ")[0]}</span>
                            </div>
                            <div className="bg-[#42B460]/5 text-[#42B460] px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider group-hover:bg-[#42B460] group-hover:text-white transition-all">
                              Book Now
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border border-gray-100 border-dashed">
                  <Frown size={48} className="text-gray-300 mb-4" />
                  <p className="text-xl font-bold text-gray-400">No facilities found in this area</p>
                  <button onClick={() => {setSelectedSport("All Sports"); setSearchQuery("");}} className="mt-6 text-[#42B460] font-bold hover:underline">Clear all filters</button>
                </div>
              )}
            </div>

            {/* Explore by Sport */}
            {!(searchQuery || selectedSport !== "All Sports") && (
              <React.Fragment>
                <div className="space-y-12">
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-[#1c222b] tracking-tight">Explore by Sport</h2>
                    <p className="text-lg text-gray-500 font-medium">Find specialized facilities curated for your discipline.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {[
                      { name: "Cricket", count: "12 venues", image: "/sports/cricket.png", color: "from-emerald-50 to-white" },
                      { name: "Football", count: "8 venues", image: "/sports/football.png", color: "from-blue-50 to-white" },
                      { name: "Badminton", count: "15 venues", image: "/sports/badminton.png", color: "from-orange-50 to-white" },
                      { name: "Swimming", count: "5 venues", image: "/sports/swimming.png", color: "from-cyan-50 to-white" },
                      { name: "Tennis", count: "4 venues", image: "/sports/tennis.png", color: "from-lime-50 to-white" },
                      { name: "Basketball", count: "6 venues", image: "/sports/basketball.png", color: "from-purple-50 to-white" },
                    ].map((cat) => (
                      <div key={cat.name} className={`flex flex-col items-center justify-center p-10 rounded-[32px] border border-gray-100 bg-gradient-to-b ${cat.color} transition-all duration-500 hover:border-[#42B460] hover:shadow-2xl hover:shadow-[#42B460]/10 hover:-translate-y-2 cursor-pointer group`}>
                        <div className="w-16 h-16 mb-6 group-hover:rotate-12 transition-transform duration-500 drop-shadow-xl">
                          <img src={cat.image} className="w-full h-full object-cover mix-blend-multiply" alt={cat.name} />
                        </div>
                        <span className="text-[16px] font-bold text-[#1c222b] mb-1">{cat.name}</span>
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Banner */}
                <div className="relative group cursor-pointer overflow-hidden rounded-[50px] h-[320px] shadow-2xl">
                  <img
                    src="/gamehub_promo_banner.png"
                    alt="Promo Banner"
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-y-0 left-0 p-16 flex flex-col justify-center max-w-2xl">
                    <div className="flex items-center gap-2 mb-6">
                       <span className="bg-[#42B460] text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-[#42B460]/20">
                        Limited Access
                       </span>
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
                      Unlock the Best <span className="text-[#42B460]">Arenas</span> in the City
                    </h2>
                    <p className="text-white/80 text-lg font-medium mb-10 leading-relaxed">
                      Book elite facilities with professional equipment and instant digital scheduling.
                    </p>
                    <button className="group/btn bg-[#42B460] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#38A354] transition-all w-fit shadow-2xl flex items-center gap-3">
                      Start Booking
                      <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        )}
      </div>

      {/* ===== TAB: FIND GROUNDS ===== */}
      {activeSubTab === "find" && (
        <FindGroundsSection facilities={facilities} city={selectedLocation.city} />
      )}

      </div>
    </>
  );
}
