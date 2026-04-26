"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Star,
  ChevronRight,
  SlidersHorizontal,
  Activity,
  Target,
  Trophy,
  Navigation,
  DollarSign,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

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

interface FindGroundsSectionProps {
  facilities: Facility[];
  city: string;
}

const SPORT_FILTERS = ["All Sports", "Cricket", "Football", "Badminton", "Swimming", "Multi-sport"];
const SORT_OPTIONS = [
  { label: "Nearest", value: "distance" },
  { label: "Top Rated", value: "rating" },
  { label: "Lowest Price", value: "price" },
];

export default function FindGroundsSection({ facilities, city }: FindGroundsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [sortBy, setSortBy] = useState("distance");

  const filteredFacilities = useMemo(() => {
    let result = facilities.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.venue.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedSport !== "All Sports") {
      result = result.filter(f =>
        f.type.toLowerCase().includes(selectedSport.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      result.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else {
      result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    return result;
  }, [facilities, searchQuery, selectedSport, sortBy]);

  const getSportIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("cricket")) return <Activity size={14} className="text-[#42B460]" />;
    if (t.includes("football")) return <Target size={14} className="text-[#42B460]" />;
    if (t.includes("badminton")) return <Target size={14} className="text-blue-500" />;
    if (t.includes("swimming")) return <Activity size={14} className="text-cyan-500" />;
    if (t.includes("multi")) return <Trophy size={14} className="text-amber-500" />;
    return <Activity size={14} className="text-gray-400" />;
  };

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <div className="py-16">
        <div className="relative overflow-hidden rounded-[40px] h-[400px]">
          <img
            src="/sports/ground_poster.png"
            alt="Find Grounds Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          <div className="absolute inset-y-0 left-0 p-12 flex flex-col justify-center max-w-xl">
            <span className="inline-flex items-center gap-2 bg-[#D53F17] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
              Explore Venues
            </span>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Discover <span className="text-[#42B460]">grounds</span> near you
            </h1>
            <p className="text-white/70 font-medium mb-8 leading-relaxed">
              Compare prices, read ratings, and find the perfect venue for your next game in {city}.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white text-gray-900 rounded-xl outline-none shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="mb-12">
        <div className="bg-gray-50 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 border border-gray-100">
          <div className="flex gap-2 flex-wrap flex-1">
            {SPORT_FILTERS.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                  selectedSport === sport
                    ? "bg-[#42B460] text-white shadow-md shadow-[#42B460]/20"
                    : "bg-white text-gray-500 border border-gray-100 hover:border-[#42B460] hover:text-[#42B460]"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400 font-bold">
            <span className="text-[#1c222b]">{filteredFacilities.length}</span> grounds found in {city}
          </p>
        </div>

        <div className="space-y-4">
          {filteredFacilities.map((fac, index) => (
            <motion.div
              key={fac.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Link href={`/gamehub/${fac.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-[280px] aspect-[16/10] md:aspect-auto relative overflow-hidden shrink-0">
                    <img
                      src={fac.image}
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded-md tracking-wider uppercase text-[#1c222b]">
                      {fac.type}
                    </div>
                  </div>

                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-[18px] font-bold text-[#1c222b] group-hover:text-[#42B460] transition-colors">
                          {fac.name}
                        </h3>
                        <div className="flex items-center gap-1.5 bg-[#42B460]/10 px-3 py-1 rounded-lg shrink-0 ml-4">
                          <Star size={13} fill="#42B460" className="text-[#42B460]" />
                          <span className="text-[14px] font-bold text-[#42B460]">{fac.rating.toFixed(1)}</span>
                          <span className="text-[11px] text-[#42B460]/60 font-bold">({fac.reviewsCount})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium mb-1">
                        <MapPin size={13} />
                        {fac.venue}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[12px] font-medium">
                        <Navigation size={12} />
                        {fac.distance} away
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-[#42B460]" />
                          <span className="text-[18px] font-bold text-[#1c222b]">₹{fac.pricePerHour}</span>
                          <span className="text-[12px] text-gray-400 font-bold">/{fac.unit}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                          {getSportIcon(fac.type)}
                          <span className="text-[11px] font-bold text-gray-500">{fac.type}</span>
                        </div>
                      </div>

                      <button className="bg-[#42B460] hover:bg-[#38A354] text-white px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:shadow-lg hover:shadow-[#42B460]/20 flex items-center gap-1.5 group/btn">
                        VIEW
                        <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredFacilities.length === 0 && (
          <div className="text-center py-20">
            <Filter size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No grounds found</h3>
            <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
