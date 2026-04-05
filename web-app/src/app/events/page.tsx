"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Flame,
  Music,
  Palette,
  PartyPopper,
  Mic2,
  Trophy,
  TentTree,
  Heart,
  Filter,
  ChevronRight,
  Frown,
  Users,
  Zap,
  Ticket,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";

// Real event data is fetched from the API via useEffect below.

// ─── CATEGORY DEFINITIONS ──────────────────────────────────
const CATEGORIES = [
  { label: "All", icon: <Sparkles size={16} /> },
  { label: "CONCERT", icon: <Music size={16} />, display: "Concerts" },
  { label: "WORKSHOP", icon: <Palette size={16} />, display: "Workshops" },
  { label: "NIGHTLIFE", icon: <PartyPopper size={16} />, display: "Nightlife" },
  { label: "COMEDY", icon: <Mic2 size={16} />, display: "Comedy" },
  { label: "SPORTS", icon: <Trophy size={16} />, display: "Sports" },
  { label: "FESTIVAL", icon: <TentTree size={16} />, display: "Festivals" },
];

// ─── PRICE RANGE OPTIONS ───────────────────────────────────
const PRICE_RANGES = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1500", min: 500, max: 1500 },
  { label: "₹1500 - ₹3000", min: 1500, max: 3000 },
  { label: "₹3000+", min: 3000, max: Infinity },
];

// ─── DATE FILTER OPTIONS ───────────────────────────────────
const DATE_FILTERS = [
  { label: "Any Date", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Weekend", value: "weekend" },
  { label: "This Week", value: "week" },
];

export default function EventsPage() {
  const { selectedLocation } = useLocation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (selectedLocation.city) params.append("city", selectedLocation.city);
        if (activeCategory !== "All") params.append("category", activeCategory);
        if (searchQuery) params.append("search", searchQuery);
        
        const priceRange = PRICE_RANGES[selectedPriceRange];
        if (priceRange.min > 0) params.append("minPrice", priceRange.min.toString());
        if (priceRange.max !== Infinity) params.append("maxPrice", priceRange.max.toString());

        const response = await fetch(`http://localhost:5000/api/events?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch events");
        const json = await response.json();
        setEvents(json.data || []);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message || "Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEvents();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [selectedLocation, activeCategory, searchQuery, selectedPriceRange, selectedDateFilter]);

  const featuredEvent = useMemo(() => events.find((e) => e.featured), [events]);
  const trendingEvents = useMemo(() => events.filter((e) => e.featured || e.price > 1000), [events]);

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const activeFilterCount =
    (activeCategory !== "All" ? 1 : 0) +
    (selectedPriceRange !== 0 ? 1 : 0) +
    (selectedDateFilter !== "all" ? 1 : 0);

  const getEventImage = (imagesStr: string) => {
    try {
      const images = JSON.parse(imagesStr);
      return Array.isArray(images) ? images[0] : images;
    } catch {
      return imagesStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] pb-24 font-sans leading-normal">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <div className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-center">
        {/* Floating tag */}
        <div className="inline-flex items-center gap-2 bg-rose-200 text-rose-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6 shadow-sm border border-rose-300/50">
          <Flame size={16} className="text-rose-600" />
          {events.length} live events in {selectedLocation.city}
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold mb-6 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Discover{" "}
          <span className="relative text-rose-600">
            Experiences
            <svg
              className="absolute w-full h-4 -bottom-2 right-0 text-rose-300 -z-10"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 15 100 5 L 100 10 L 0 10 Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <br />
          Worth Living For
        </h1>

        <p className="text-lg md:text-xl text-[#1c222b]/70 mb-10 max-w-2xl mx-auto font-medium leading-relaxed font-sans">
          Concerts, workshops, comedy nights, festivals & more — handpicked
          experiences happening near you in{" "}
          <strong className="text-rose-600 font-sans">{selectedLocation.city}</strong>.
        </p>

        {/* ── Search Bar ────────────────────────── */}
        <div className="max-w-2xl mx-auto relative">
          <div className="flex items-center bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow px-5 py-3.5 gap-3">
            <Search
              size={22}
              className="text-rose-400 shrink-0"
              strokeWidth={2.5}
            />
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-[#1c222b] placeholder-gray-400 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all font-sans ${
                showFilters || activeFilterCount > 0
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-rose-600 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center font-sans">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Filter Panel ───────────────────── */}
          {showFilters && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-gray-100 shadow-xl p-6 z-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-left font-sans">
                    Price Range
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPriceRange(idx)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all font-sans ${
                          selectedPriceRange === idx
                            ? "bg-rose-500 text-white shadow-md"
                            : "bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border border-gray-100"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-left font-sans">
                    When
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {DATE_FILTERS.map((df) => (
                      <button
                        key={df.value}
                        onClick={() => setSelectedDateFilter(df.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all font-sans ${
                          selectedDateFilter === df.value
                            ? "bg-rose-500 text-white shadow-md"
                            : "bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border border-gray-100"
                        }`}
                      >
                        {df.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedPriceRange(0);
                    setSelectedDateFilter("all");
                    setActiveCategory("All");
                  }}
                  className="mt-4 text-sm text-rose-500 font-bold hover:text-rose-600 transition flex items-center gap-1 font-sans"
                >
                  <X size={14} /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mt-4">
        {/* ── Category Tabs ────────────────────── */}
        <div className="flex gap-3 overflow-x-auto w-full pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[15px] font-bold whitespace-nowrap transition-all shadow-sm font-sans ${
                activeCategory === cat.label
                  ? "bg-rose-600 text-white shadow-md transform -translate-y-0.5"
                  : "bg-white text-[#1c222b]/70 hover:bg-rose-50 hover:text-rose-600 border border-gray-200"
              }`}
            >
              {cat.icon}
              {cat.display || cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-rose-500 font-bold font-sans">Discovering experiences...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-rose-100 rounded-3xl p-12 text-center shadow-sm mb-12">
            <Frown className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">Oops! Something went wrong</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto font-medium font-sans">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-rose-600 transition font-sans"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Featured Section */}
            {featuredEvent && activeCategory === "All" && !searchQuery && (
              <div className="mb-12">
                <Link href={`/events/${featuredEvent.id}`} className="block group">
                  <div className="relative w-full h-[280px] md:h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                    <img
                      src={getEventImage(featuredEvent.images)}
                      alt={featuredEvent.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out font-sans"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1c222b]/90 via-[#1c222b]/50 to-transparent" />
                    
                    <div className="absolute inset-y-0 left-0 p-8 md:p-12 flex flex-col justify-center max-w-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-rose-500 text-white text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-extrabold shadow-lg font-sans">
                          ⭐ Featured
                        </span>
                        <span className="bg-white/15 backdrop-blur-md text-white text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-extrabold border border-white/20 font-sans">
                          {featuredEvent.category}
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-lg font-sans">
                        {featuredEvent.title}
                      </h2>
                      <p className="text-white/80 text-sm md:text-base font-medium mb-5 line-clamp-2 font-sans">
                        {featuredEvent.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm font-medium mb-6 font-sans">
                        <span className="flex items-center gap-1.5 font-sans">
                          <Calendar size={15} className="text-rose-400" />
                          {formatEventDate(featuredEvent.date)}, {featuredEvent.time}
                        </span>
                        <span className="flex items-center gap-1.5 font-sans">
                          <MapPin size={15} className="text-rose-400" />
                          {featuredEvent.venue}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 font-sans">
                        <span className="bg-white text-[#1c222b] px-6 py-3 rounded-2xl font-extrabold text-[15px] group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-lg font-sans">
                          ₹{featuredEvent.price} · Get Tickets
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Trending Section */}
            {trendingEvents.length > 0 && activeCategory === "All" && !searchQuery && (
              <div className="mb-12">
                <div className="flex justify-between items-end border-b border-gray-200 pb-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-2.5 rounded-xl shadow-md font-sans">
                      <Flame size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
                        Trending Now
                      </h2>
                      <p className="text-sm text-gray-500 font-medium font-sans">
                        Most popular events people are booking
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {trendingEvents.slice(0, 3).map((event: any, idx: number) => (
                    <Link href={`/events/${event.id}`} key={event.id} className="block group">
                      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 h-full flex group-hover:-translate-y-2 relative">
                        <div className="absolute top-4 left-4 z-20 bg-gradient-to-br from-amber-400 to-orange-500 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-lg font-sans">
                          #{idx + 1}
                        </div>
                        <div className="w-[140px] md:w-[180px] shrink-0 relative overflow-hidden">
                          <img
                            src={getEventImage(event.images)}
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-sans"
                          />
                        </div>
                        <div className="flex-1 p-5 flex flex-col">
                          <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-wider mb-1.5 font-sans">
                            {event.category}
                          </span>
                          <h3 className="text-[16px] font-extrabold text-[#1c222b] leading-snug mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors font-sans">
                            {event.title}
                          </h3>
                          <div className="space-y-1 text-xs text-gray-500 font-semibold mb-3 flex-1 font-sans">
                            <p className="flex items-center gap-1.5 font-sans">
                              <Calendar size={13} className="text-rose-400 font-sans" />
                              {formatEventDate(event.date)}, {event.time}
                            </p>
                            <p className="flex items-center gap-1.5 font-sans">
                              <MapPin size={13} className="text-rose-400 font-sans" />
                              {event.venue}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 font-sans">
                            <span className="text-lg font-black text-[#1c222b] font-sans">
                              ₹{event.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Events */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-4 mb-8 font-sans">
              <div className="flex items-center gap-3 font-sans">
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-2.5 rounded-xl shadow-md font-sans">
                  <Ticket size={20} />
                </div>
                <div className="font-sans">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
                    {activeCategory === "All"
                      ? "All Events"
                      : CATEGORIES.find((c) => c.label === activeCategory)?.display || activeCategory}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium font-sans">
                    {events.length} event{events.length !== 1 ? "s" : ""} in {selectedLocation.city}
                  </p>
                </div>
              </div>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 font-sans">
                {events.map((event: any) => (
                  <Link href={`/events/${event.id}`} key={event.id} className="block group">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-2 relative font-sans">
                      <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 font-sans">
                        <img
                          src={getEventImage(event.images)}
                          alt={event.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out font-sans"
                        />
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 font-sans">
                          <span className="bg-white/90 backdrop-blur-md text-[#1c222b] text-[11px] tracking-wider uppercase px-2.5 py-1.5 rounded-xl font-extrabold shadow-sm border border-white/50 font-sans">
                            {event.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(event.id);
                            }}
                            className={`p-2 rounded-xl backdrop-blur-md border border-white/30 transition-all font-sans ${
                              favorites.has(event.id) ? "bg-rose-500 text-white" : "bg-white/20 text-white hover:bg-white/40 font-sans"
                            }`}
                          >
                            <Heart size={16} className={favorites.has(event.id) ? "fill-white" : ""} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 z-10 font-sans">
                          <div className="bg-white rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px] font-sans">
                            <p className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider leading-none font-sans">
                              {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                            </p>
                            <p className="text-xl font-black text-[#1c222b] leading-none mt-0.5 font-sans">
                              {new Date(event.date).getDate()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col bg-white font-sans">
                        <p className="text-rose-500 text-[13px] font-bold mb-1.5 flex items-center gap-1.5 font-sans">
                          <Clock size={13} />
                          {formatEventDate(event.date)}, {event.time}
                        </p>
                        <h3 className="text-[17px] font-extrabold text-[#1c222b] leading-snug line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors font-sans">
                          {event.title}
                        </h3>
                        <p className="text-gray-500 text-[13px] font-semibold flex items-center gap-1.5 mb-4 mt-auto font-sans">
                          <MapPin size={13} className="text-rose-400 shrink-0 font-sans" />
                          {event.venue}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 font-sans">
                           <span className="text-xl font-black text-[#1c222b] font-sans">₹{event.price}</span>
                           <span className="text-[11px] text-gray-400 font-bold font-sans">Available</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white/50 border border-dashed border-gray-200 rounded-3xl font-sans">
                <Frown className="text-rose-300 mx-auto mb-4 font-sans" size={64} strokeWidth={1} />
                <h3 className="text-2xl font-black text-[#1c222b] mb-2 font-sans">No events found</h3>
                <p className="text-gray-500 max-w-md mx-auto font-medium mb-6 font-sans">
                  There are currently no events matching your criteria in <strong className="text-rose-500 font-sans">{selectedLocation.city}</strong>.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                    setSelectedPriceRange(0);
                    setSelectedDateFilter("all");
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full font-bold transition shadow-md font-sans"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Newsletter Section */}
        <div className="mt-20 bg-gradient-to-r from-rose-600 to-rose-500 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden shadow-xl font-sans">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full font-sans" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 font-sans">
            <div className="text-center md:text-left font-sans">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 font-sans">Never Miss a Beat 🎶</h2>
              <p className="text-white/80 text-lg font-medium max-w-lg font-sans">
                Get early access to event drops, exclusive presale codes, and curated recommendations straight to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 font-sans">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-5 py-3.5 text-white placeholder-white/60 font-medium text-sm outline-none w-full sm:w-[260px] font-sans"
              />
              <button className="bg-white text-rose-600 px-8 py-3.5 rounded-xl font-extrabold text-sm hover:bg-white/90 transition shadow-lg whitespace-nowrap font-sans">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
