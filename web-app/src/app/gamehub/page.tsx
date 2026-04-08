"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import SubNav from "@/components/gamehub/SubNav";
import { API_URL } from "@/lib/api";

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

const API_BASE = API_URL;

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

        const response = await fetch(`${API_BASE}/gamehub/facilities?${params.toString()}`);
        const payload = await response.json();
        
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
    return facilities.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [facilities, searchQuery]);

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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1c222b] pb-24 font-sans pt-20">
      <SubNav activeTab={activeSubTab} setActiveTab={setActiveSubTab} />

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

              <div className="relative min-w-[180px]">
                <div className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                  <Activity size={18} className="text-[#42B460]" />
                  <span className="text-[15px] font-medium text-gray-700">All Sports</span>
                  <ChevronDown size={16} className="absolute right-4 text-gray-400" />
                </div>
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

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {facilities.slice(0, 6).map((fac) => (
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


    </div>
  );
}
