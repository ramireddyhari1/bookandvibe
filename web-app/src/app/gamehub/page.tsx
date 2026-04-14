"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronRight,
  Frown,
  MapPin,
  Search,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
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

const MOCK_FACILITIES: Facility[] = [
  {
    id: "mock-1",
    name: "Our Zone Sports Arena",
    type: "Cricket & Football",
    location: "Mumbai",
    venue: "D.No: 12-468/E/4, Near Highway",
    distance: "0.16 Kms",
    rating: 4.20,
    reviewsCount: 99,
    pricePerHour: 1200,
    unit: "hr",
    image: "https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-2",
    name: "Sai Sandeep Badminton Club",
    type: "Badminton",
    location: "Mumbai",
    venue: "Pappula Mill Rd, Yanam",
    distance: "6.62 Kms",
    rating: 4.44,
    reviewsCount: 16,
    pricePerHour: 350,
    unit: "hr",
    image: "https://images.unsplash.com/photo-1626225967045-944080928956?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-3",
    name: "Decathlon Sports Hub",
    type: "Multi-sport",
    location: "Mumbai",
    venue: "No. 11-85 & 183/1, Eluru Rd",
    distance: "9.72 Kms",
    rating: 5.00,
    reviewsCount: 2,
    pricePerHour: 800,
    unit: "hr",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-4",
    name: "The Turf Mumbai",
    type: "Football",
    location: "Mumbai",
    venue: "Western Express Highway, Goregaon",
    distance: "2.40 Kms",
    rating: 4.8,
    reviewsCount: 156,
    pricePerHour: 1500,
    unit: "hr",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-5",
    name: "Royal Cricket Grounds",
    type: "Cricket",
    location: "Mumbai",
    venue: "Marine Drive, Churchgate",
    distance: "12.1 Kms",
    rating: 4.6,
    reviewsCount: 230,
    pricePerHour: 2500,
    unit: "hr",
    image: "https://images.unsplash.com/photo-1531415074941-03f6ad88949d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-6",
    name: "Smashers Shuttle Court",
    type: "Badminton",
    location: "Mumbai",
    venue: "Versova Link Road, Andheri",
    distance: "4.5 Kms",
    rating: 4.3,
    reviewsCount: 45,
    pricePerHour: 400,
    unit: "hr",
    image: "https://images.unsplash.com/photo-1626225967045-944080928956?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-7",
    name: "Infinity Swimming Club",
    type: "Swimming",
    location: "Mumbai",
    venue: "Carter Road, Bandra West",
    distance: "3.2 Kms",
    rating: 4.9,
    reviewsCount: 88,
    pricePerHour: 600,
    unit: "sess",
    image: "https://images.unsplash.com/photo-1519733473412-409951117be8?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mock-8",
    name: "Elite Football Arena",
    type: "Football",
    location: "Mumbai",
    venue: "Link Road, Malad West",
    distance: "0.8 Kms",
    rating: 4.1,
    reviewsCount: 12,
    pricePerHour: 1100,
    unit: "hr",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800"
  }
];

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

        const payload: any = await fetchApi(`/gamehub/facilities?${params.toString()}`, { requiresAuth: false });

        // Merge API data with Mock data for a better UX during development
        const apiData = Array.isArray(payload?.data) ? payload.data : [];
        const mergedData = [...apiData, ...MOCK_FACILITIES];

        // Remove duplicates if any (based on name)
        const uniqueData = mergedData.filter((item, index, self) =>
          index === self.findIndex((t) => t.name === item.name)
        );

        setFacilities(uniqueData);
        setTotal(uniqueData.length);
      } catch (err) {
        // Fallback to purely mock data on error/empty API
        setFacilities(MOCK_FACILITIES);
        setTotal(MOCK_FACILITIES.length);
        console.error("API error, falling back to mock data:", err);
      } finally {
        // Add a slight delay to show off the cool skeletons
        setTimeout(() => setLoading(false), 800);
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
      <div className="hidden md:block min-h-screen bg-[#F8F9FA] text-[#1c222b] pb-24 font-sans pt-20">
        <SubNav activeTab={activeSubTab} setActiveTab={setActiveSubTab} />

      {/* ===== TAB: PLAY NOW ===== */}
      {activeSubTab === "play" && (
        <PlayNowSection city={selectedLocation.city} />
      )}

      {/* ===== TAB: RESERVE SLOT (Default) ===== */}
      {activeSubTab === "reserve" && (
        <>
          {/* Header / Search Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-[1200px] mx-auto px-6 py-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#1c222b] whitespace-nowrap">
                  Sports Venues in <span className="text-[#42B460]">{selectedLocation.city}</span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by venue name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#42B460] focus:border-transparent outline-none transition-all text-[15px] shadow-sm"
                    />
                  </div>

                  <div className="relative min-w-[180px]" ref={sportDropdownRef}>
                    <div 
                      onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Activity size={18} className="text-[#42B460]" />
                      <span className="text-[15px] font-medium text-gray-700 whitespace-nowrap">{selectedSport}</span>
                      <ChevronDown size={16} className={`absolute right-4 text-gray-400 transition-transform ${isSportDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {isSportDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                        {["All Sports", "Cricket", "Football", "Badminton", "Swimming", "Multi-sport"].map((sport) => (
                          <div
                            key={sport}
                            onClick={() => {
                              setSelectedSport(sport);
                              setIsSportDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                              selectedSport === sport
                                ? "bg-[#42B460]/10 text-[#42B460] font-bold border-l-2 border-[#42B460]"
                                : "text-gray-700 hover:bg-gray-50 font-medium border-l-2 border-transparent"
                            }`}
                          >
                            {sport}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Book Venues Featured Slider */}
          <div className="bg-white pt-12 pb-16 border-t border-gray-50">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#1c222b]">Book Venues</h2>
                  <p className="text-[14px] text-gray-400 font-medium">Top picked venues for you in {selectedLocation.city}</p>
                </div>
                <Link
                  href="#all-venues"
                  className="text-[#42B460] font-bold text-[14px] flex items-center gap-1 hover:underline tracking-tight"
                >
                  SEE ALL VENUES <ChevronRight size={18} strokeWidth={2.5} />
                </Link>
              </div>

              {filteredFacilities.length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {filteredFacilities.slice(0, 6).map((fac) => (
                    <Link
                      href={`/gamehub/${fac.id}`}
                      key={`featured-${fac.id}`}
                      className="flex-shrink-0 w-[300px] md:w-[340px] group snap-start"
                    >
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300">
                        <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                          <img
                            src={fac.image}
                            alt={fac.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-md tracking-widest uppercase">
                            FEATURED
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1.5">
                            <h3 className="text-[16px] font-bold text-[#1c222b] group-hover:text-[#42B460] transition-colors line-clamp-1">
                              {fac.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-[#42B460]/10 px-2 py-0.5 rounded-md shrink-0">
                              <span className="text-[13px] font-bold text-[#42B460]">{fac.rating}</span>
                              <span className="text-[11px] text-[#42B460]/70 font-bold">({fac.reviewsCount})</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-[13px] text-gray-500 font-medium line-clamp-1">{fac.venue}</p>
                              <p className="text-[12px] text-gray-400 font-bold">~{fac.distance}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                              <div className="flex -space-x-1">
                                {getSportIcons(fac.type).slice(0, 2)}
                              </div>
                              {fac.type.includes("&") && (
                                <span className="text-[10px] text-gray-400 font-bold">+1 more</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                  <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">No venues found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories Section */}
          <div className="bg-white pb-16 pt-4">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#1c222b]">Explore by Sport</h2>
                  <p className="text-[14px] text-gray-400 font-medium">Find facilities for your favorite games</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: "Cricket", count: "12 venues", image: "/sports/cricket.png", border: "hover:border-green-400 hover:shadow-green-100" },
                  { name: "Football", count: "8 venues", image: "/sports/football.png", border: "hover:border-blue-400 hover:shadow-blue-100" },
                  { name: "Badminton", count: "15 venues", image: "/sports/badminton.png", border: "hover:border-orange-400 hover:shadow-orange-100" },
                  { name: "Swimming", count: "5 venues", image: "/sports/swimming.png", border: "hover:border-cyan-400 hover:shadow-cyan-100" },
                  { name: "Tennis", count: "4 venues", image: "/sports/tennis.png", border: "hover:border-purple-400 hover:shadow-purple-100" },
                  { name: "Basketball", count: "6 venues", image: "/sports/basketball.png", border: "hover:border-amber-400 hover:shadow-amber-100" },
                ].map((cat) => (
                  <div key={cat.name} className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-lg cursor-pointer bg-white group ${cat.border}`}>
                    <div className="w-16 h-16 mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                      <img src={cat.image} className="w-full h-full object-cover mix-blend-multiply rounded-full shadow-sm" alt={cat.name} />
                    </div>
                    <span className="text-[14px] font-bold text-[#1c222b] group-hover:text-[#42B460] transition-colors">{cat.name}</span>
                    <span className="text-[11px] font-bold text-gray-400 mt-1">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Promo Banner Section */}
          <div className="max-w-[1200px] mx-auto px-6 mb-16">
            <div className="relative group cursor-pointer overflow-hidden rounded-3xl shadow-lg border border-gray-100 h-[180px] md:h-[240px]">
              <img
                src="/gamehub_promo_banner.png"
                alt="Promo Banner"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent opacity-70 md:opacity-60 transition-opacity duration-500" />
              <div className="absolute inset-y-0 left-0 p-6 md:p-10 flex flex-col justify-center max-w-2xl bg-gradient-to-r from-black/50 via-transparent to-transparent md:bg-none">
                <div className="inline-flex items-center gap-2 bg-[#42B460] text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest uppercase mb-3 w-fit shadow-lg shadow-[#42B460]/20">
                  Limited Offer
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-xl tracking-tighter leading-tight">
                  UNLEASH THE CHAMPION WITHIN
                </h2>
                <p className="text-white/80 text-[12px] md:text-[15px] font-medium mb-5 drop-shadow-md max-w-md leading-relaxed hidden sm:block">
                  Book the finest arenas and venues in your city. Elevate your game today.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-white text-[#1c222b] hover:bg-[#42B460] hover:text-white px-5 py-2 rounded-xl text-sm font-black transition-all shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5 group/btn">
                    Book Venues <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== TAB: FIND GROUNDS ===== */}
      {activeSubTab === "find" && (
        <FindGroundsSection facilities={facilities} city={selectedLocation.city} />
      )}

      </div>
    </>
  );
}
