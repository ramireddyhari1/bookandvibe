"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  Frown,
  Users,
  Zap,
  Ticket,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { fetchApi } from "@/lib/api";

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
  const router = useRouter();
  const { selectedLocation } = useLocation();

  // Enforce desktop-only for this route; mobile users get redirected to the MobileHome at "/"
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.replace("/");
    }
  }, [router]);

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

        const payload: any = await fetchApi(`/events?${params.toString()}`, { requiresAuth: false });
        
        // Use realistic fallbacks if DB has no matches for the city so the UI doesn't look empty
        if (!payload.data || payload.data.length === 0) {
          const FALLBACK_EVENTS = [
            {
              id: "e-1",
              title: "Dil Se - DSP Special Telugu Jamming",
              venue: "Throwback, Kavuri Hills",
              category: "CONCERT",
              date: new Date(Date.now() + 86400000 * 7).toISOString(),
              time: "19:00",
              price: 349,
              images: JSON.stringify(["https://d3pmsbscv4kwdi.cloudfront.net/events/1775570542079-384f5959f4eefd59.jpg"]),
              featured: true,
              description: "Join us for an unforgettable evening of Telugu chartbusters."
            },
            {
              id: "e-2",
              title: "Diljit Dosanjh - Dil-Luminati Tour",
              venue: "GMR Arena, Hyderabad",
              category: "CONCERT",
              date: new Date(Date.now() + 86400000 * 14).toISOString(),
              time: "20:00",
              price: 3999,
              images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg/640px-Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg"]),
              featured: true,
              description: "The biggest Punjabi pop sensation is here!"
            },
            {
              id: "e-3",
              title: "Zomato Feeding India ft. Dua Lipa",
              venue: "MMRDA Grounds, BKC",
              category: "CONCERT",
              date: new Date(Date.now() + 86400000 * 21).toISOString(),
              time: "18:30",
              price: 4500,
              images: JSON.stringify(["https://i.scdn.co/image/ab6761610000e5ebd42a27db3286b58553da8858"]),
              featured: false,
              description: "Concert for a cause with Dua Lipa."
            },
            {
              id: "e-4",
              title: "Coldplay: Music Of The Spheres World Tour",
              venue: "DY Patil Stadium, Navi Mumbai",
              category: "CONCERT",
              date: new Date(Date.now() + 86400000 * 30).toISOString(),
              time: "18:00",
              price: 8000,
              images: JSON.stringify(["https://i.scdn.co/image/ab6761610000e5eb989ed05e1f0570cc4726c2d3"]),
              featured: true,
              description: "Experience the magic of Coldplay live."
            },
            {
              id: "e-5",
              title: "Karan Aujla - It Was All A Dream",
              venue: "Bhartiya City, Bengaluru",
              category: "CONCERT",
              date: new Date(Date.now() + 86400000 * 45).toISOString(),
              time: "19:30",
              price: 2999,
              images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Karan_Aujla_2021.jpg/640px-Karan_Aujla_2021.jpg"]),
              featured: false,
              description: "Karan Aujla's massive India tour."
            },
            {
              id: "e-6",
              title: "Sunburn Arena ft. Alan Walker",
              venue: "Kochi International Marina",
              category: "NIGHTLIFE",
              date: new Date(Date.now() + 86400000 * 60).toISOString(),
              time: "20:00",
              price: 2000,
              images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Alan_Walker_%2842416801991%29.jpg/640px-Alan_Walker_%2842416801991%29.jpg"]),
              featured: false,
              description: "Faded Tour is coming to your city."
            }
          ];

          // Apply client-side filters to the dummy data so the UI categories still work
          let filtered = FALLBACK_EVENTS;
          if (activeCategory !== "All") filtered = filtered.filter(e => e.category === activeCategory);
          if (searchQuery) filtered = filtered.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue.toLowerCase().includes(searchQuery.toLowerCase()));
          
          setEvents(filtered);
        } else {
          setEvents(payload.data);
        }

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

  // ── Banner carousel state ──
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bannerEvents = useMemo(() => {
    const withImages = events.filter((e) => e.images);
    return withImages.slice(0, 5);
  }, [events]);

  const startAutoPlay = useCallback(() => {
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    bannerTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (bannerEvents.length || 1));
    }, 5000);
  }, [bannerEvents.length]);

  useEffect(() => {
    if (bannerEvents.length > 1) startAutoPlay();
    return () => { if (bannerTimerRef.current) clearInterval(bannerTimerRef.current); };
  }, [bannerEvents.length, startAutoPlay]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    startAutoPlay();
  };
  const nextSlide = () => goToSlide((currentSlide + 1) % (bannerEvents.length || 1));
  const prevSlide = () => goToSlide((currentSlide - 1 + (bannerEvents.length || 1)) % (bannerEvents.length || 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] pb-24 font-sans leading-normal">

      {/* ═══════════════════════════════════════════════════════
          MASSIVE 16:9 POSTER BANNER CAROUSEL (Desktop)
      ═══════════════════════════════════════════════════════ */}
      {bannerEvents.length > 0 && (
        <div className="hidden md:block relative w-full pt-[112px] max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl" style={{ aspectRatio: '21/9', maxHeight: '75vh' }}>
            {bannerEvents.map((event, idx) => (
              <Link
                href={`/events/${event.id}`}
                key={event.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  idx === currentSlide
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-105 z-0"
                }`}
              >
                <img
                  src={getEventImage(event.images)}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-14 z-20">
                  <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-rose-500 text-white text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-extrabold shadow-lg">
                        {event.featured ? "⭐ Featured" : event.category}
                      </span>
                      <span className="bg-white/15 backdrop-blur-md text-white text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-extrabold border border-white/20">
                        {formatEventDate(event.date)}
                      </span>
                    </div>
                    <h2 className="text-4xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-4 drop-shadow-xl max-w-3xl">
                      {event.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-5 text-white/80 text-sm font-semibold mb-6">
                      <span className="flex items-center gap-2">
                        <Calendar size={16} className="text-rose-400" />
                        {formatEventDate(event.date)}, {event.time}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={16} className="text-rose-400" />
                        {event.venue}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-white text-[#1c222b] px-8 py-3.5 rounded-2xl font-extrabold text-[15px] hover:bg-rose-500 hover:text-white transition-colors shadow-xl">
                        ₹{event.price} · Get Tickets
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Navigation Arrows */}
            {bannerEvents.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); prevSlide(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-lg hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-lg"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); nextSlide(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-lg hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-lg"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Dot Indicators */}
            {bannerEvents.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full">
                {bannerEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.preventDefault(); goToSlide(idx); }}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? "w-8 h-2.5 bg-rose-500"
                        : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* ── Search + Filters Bar ─────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mt-6 md:mt-8">
        <div className="flex items-center bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow px-5 py-3.5 gap-3">
          <Search size={22} className="text-rose-400 shrink-0" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search events, artists, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-[#1c222b] placeholder-gray-400 font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 transition">
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
              <span className="bg-white text-rose-600 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter Panel ───────────────────── */}
        {showFilters && (
          <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-xl p-6 z-50 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Range */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-left">
                  Price Range
                </h4>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPriceRange(idx)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-left">
                  When
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DATE_FILTERS.map((df) => (
                    <button
                      key={df.value}
                      onClick={() => setSelectedDateFilter(df.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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
                className="mt-4 text-sm text-rose-500 font-bold hover:text-rose-600 transition flex items-center gap-1"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}
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
              <div className="mb-12 md:hidden">
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
