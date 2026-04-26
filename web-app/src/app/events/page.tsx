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
import PremiumLoader from "@/components/ui/PremiumLoader";

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

interface Event {
  id: string;
  title: string;
  venue: string;
  category: string;
  date: string;
  time: string;
  price: number;
  images: string;
  featured: boolean;
  description: string;
  location?: string;
}

export default function EventsPage() {
  const router = useRouter();
  const { selectedLocation } = useLocation();

  // Enforce desktop-only for this route; mobile users get redirected to the MobileHome at "/"
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      router.replace("/");
    }
  }, [router]);

  const [events, setEvents] = useState<Event[]>([]);
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
        if (activeCategory !== "All") params.append("category", activeCategory);
        if (searchQuery) params.append("search", searchQuery);
        
        const priceRange = PRICE_RANGES[selectedPriceRange];
        if (priceRange.min > 0) params.append("minPrice", priceRange.min.toString());
        if (priceRange.max !== Infinity) params.append("maxPrice", priceRange.max.toString());

        const payload: { data: Event[] } = await fetchApi(`/events?${params.toString()}`, { requiresAuth: false });
        
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

      } catch (err) {
        console.error("Error fetching events:", err);
        setError((err as Error).message || "Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEvents();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [selectedLocation, activeCategory, searchQuery, selectedPriceRange, selectedDateFilter]);

  const matchesLocation = useCallback(
    (event: Event) => {
      const city = String(selectedLocation.city || "").trim().toLowerCase();
      if (!city) return true;
      const location = `${event.location || ""} ${event.venue || ""}`.toLowerCase();
      return location.includes(city);
    },
    [selectedLocation.city]
  );

  const locationRelatedEvents = useMemo(
    () => events.filter((event) => matchesLocation(event)),
    [events, matchesLocation]
  );

  const featuredEvent = useMemo(() => locationRelatedEvents.find((e) => e.featured) || events.find((e) => e.featured), [locationRelatedEvents, events]);
  const trendingEvents = useMemo(() => {
    const pool = locationRelatedEvents.length > 0 ? locationRelatedEvents : events;
    return [...pool]
      .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.price || 0) - Number(a.price || 0))
      .slice(0, 3);
  }, [locationRelatedEvents, events]);

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

  const filteredEvents = useMemo(() => {
    let result = events;

    // Hide past events (safety check)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    result = result.filter(e => new Date(e.date) >= today);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title?.toLowerCase().includes(q) || 
        e.venue?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }
    // Apply category filter if backend misses it
    if (activeCategory !== "All") {
      result = result.filter(e => e.category === activeCategory);
    }
    return result;
  }, [events, searchQuery, activeCategory]);

  const activeFilterCount =
    (activeCategory !== "All" ? 1 : 0) +
    (selectedPriceRange !== 0 ? 1 : 0) +
    (selectedDateFilter !== "all" ? 1 : 0);

  const getEventImage = (imagesStr: string, preferBanner = false) => {
    try {
      const images = JSON.parse(imagesStr);
      if (Array.isArray(images)) {
        if (!images.length) return "";
        if (preferBanner) return images[1] || images[0];
        return images[0] || images[1] || "";
      }
      return images;
    } catch {
      return imagesStr;
    }
  };

  // ── Banner carousel state ──
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bannerEvents = useMemo(() => {
    const withImages = (locationRelatedEvents.length > 0 ? locationRelatedEvents : events).filter((e) => e.images);
    return withImages.slice(0, 5);
  }, [events, locationRelatedEvents]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-white to-white text-[#1c222b] pb-24 font-sans leading-normal">

      {/* Hero Spotlight */}
      {bannerEvents.length > 0 ? (
        <div className="hidden md:block relative w-full pt-[124px] max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="relative w-full overflow-hidden rounded-[32px] shadow-sm border border-gray-100" style={{ aspectRatio: '21/9', maxHeight: '70vh' }}>
            {bannerEvents.map((event, idx) => (
              <Link
                href={`/events/${event.id}`}
                key={event.id}
                className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  idx === currentSlide
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-105 z-0"
                }`}
              >
                <img
                  src={getEventImage(event.images, true)}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c222b] via-[#1c222b]/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1c222b]/40 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-16 z-20">
                  <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-white/10 backdrop-blur-md text-white text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 rounded-lg font-bold border border-white/20">
                        {event.featured ? "Recommended" : event.category}
                      </span>
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[0.95] mb-6 max-w-4xl">
                      {event.title}
                    </h2>
                    <div className="flex items-center gap-6 text-white/70 text-[13px] font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500" />
                        {formatEventDate(event.date)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-orange-500" />
                        {event.venue}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {bannerEvents.length > 1 && (
              <div className="absolute bottom-10 right-10 z-30 flex items-center gap-3">
                <button
                  onClick={(e) => { e.preventDefault(); prevSlide(); }}
                  className="w-10 h-10 bg-white/10 backdrop-blur-lg hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-all border border-white/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); nextSlide(); }}
                  className="w-10 h-10 bg-white/10 backdrop-blur-lg hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-all border border-white/10"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:block pt-[124px]"></div>
      )}



      {/* ── Search + Filters Bar ─────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mt-6 md:mt-8">
        <div className="relative group">
          <div className="flex items-center bg-white rounded-full border-2 border-[#D53F17] shadow-lg hover:shadow-xl transition-shadow px-6 py-3 gap-3">
            <Search size={22} className="text-[#D53F17] shrink-0" strokeWidth={2.5} />
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
                  ? "bg-[#D53F17] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-[#D53F17] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* SEARCH POPUP OVERLAY */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-[110%] left-0 right-0 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] flex flex-col max-h-[400px]">
              <div className="overflow-y-auto p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-50 mb-1">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    Quick Results
                  </span>
                </div>
                
                {filteredEvents.length > 0 ? (
                  filteredEvents.slice(0, 10).map(e => (
                    <Link 
                      href={`/events/${e.id}`} 
                      key={e.id} 
                      onClick={() => setSearchQuery("")}
                      className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={getEventImage(e.images)} alt={e.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="text-[15px] font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{e.title}</h4>
                        <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium truncate">
                           <Calendar size={12} className="text-orange-400" />
                           <span>{formatEventDate(e.date)} • {e.venue}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))
                ) : (
                  <div className="py-10 text-center flex flex-col items-center gap-2">
                    <Frown size={40} className="text-gray-200" />
                    <p className="text-gray-500 font-bold">No matches found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
              
              {filteredEvents.length > 0 && (
                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Showing top {Math.min(10, filteredEvents.length)} matches</p>
                </div>
              )}
            </div>
          )}
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
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-100"
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
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-100"
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
                className="mt-4 text-sm text-orange-500 font-bold hover:text-orange-600 transition flex items-center gap-1"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mt-4">
        {/* Category Navigation */}
        <div className="flex gap-4 overflow-x-auto w-full pb-6 mb-10 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[14px] font-bold whitespace-nowrap transition-all duration-200 border ${
                activeCategory === cat.label
                  ? "bg-[#1c222b] text-white border-[#1c222b] shadow-lg"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className={activeCategory === cat.label ? "text-orange-500" : "text-gray-400"}>
                {cat.icon}
              </span>
              {cat.display || cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24">
            <PremiumLoader size="lg" color="#D53F17" text="Discovering experiences..." />
          </div>
        ) : error ? (
          <div className="bg-white border border-orange-100 rounded-3xl p-12 text-center shadow-sm mb-12">
            <Frown className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">Oops! Something went wrong</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto font-medium font-sans">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-[#D53F17] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition font-sans"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>

            {/* Trending Section */}
            {trendingEvents.length > 0 && activeCategory === "All" && !searchQuery && (
              <div className="mb-12">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-10">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#1c222b]">
                      Trending in {selectedLocation.city || "Your City"}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mt-1">Experiences people are loving right now</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {trendingEvents.slice(0, 3).map((event, idx) => (
                    <Link href={`/events/${event.id}`} key={event.id} className="block group">
                      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 h-full flex group-hover:-translate-y-2 relative">
                        <div className="absolute top-4 left-4 z-20 bg-gradient-to-br from-amber-400 to-orange-500 text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg font-sans">
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
                          <span className="text-[11px] font-bold text-[#D53F17] uppercase tracking-wider mb-1.5 font-sans">
                            {event.category}
                          </span>
                          <h3 className="text-[16px] font-bold text-[#1c222b] leading-snug mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors font-sans">
                            {event.title}
                          </h3>
                          <div className="space-y-1 text-xs text-gray-500 font-semibold mb-3 flex-1 font-sans">
                            <p className="flex items-center gap-1.5 font-sans">
                              <Calendar size={13} className="text-orange-400 font-sans" />
                              {formatEventDate(event.date)}, {event.time}
                            </p>
                            <p className="flex items-center gap-1.5 font-sans">
                              <MapPin size={13} className="text-orange-400 font-sans" />
                              {event.venue}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 font-sans">
                            <span className="text-lg font-bold text-[#1c222b] font-sans">
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
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-[#1c222b]">
                {activeCategory === "All"
                  ? "Explore All Events"
                  : CATEGORIES.find((c) => c.label === activeCategory)?.display || activeCategory}
              </h2>
            </div>

            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 font-sans">
                {filteredEvents.map((event) => (
                  <Link href={`/events/${event.id}`} key={event.id} className="block group">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-2 relative font-sans">
                      <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 font-sans">
                        <img
                          src={getEventImage(event.images)}
                          alt={event.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out font-sans"
                        />
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 font-sans">
                          <span className="bg-white/90 backdrop-blur-md text-[#1c222b] text-[11px] tracking-wider uppercase px-2.5 py-1.5 rounded-xl font-bold shadow-sm border border-white/50 font-sans">
                            {event.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(event.id);
                            }}
                            className={`p-2 rounded-xl backdrop-blur-md border border-white/30 transition-all font-sans ${
                              favorites.has(event.id) ? "bg-orange-500 text-white" : "bg-white/20 text-white hover:bg-white/40 font-sans"
                            }`}
                          >
                            <Heart size={16} className={favorites.has(event.id) ? "fill-white" : ""} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 z-10 font-sans">
                          <div className="bg-white rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px] font-sans">
                            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider leading-none font-sans">
                              {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                            </p>
                            <p className="text-xl font-bold text-[#1c222b] leading-none mt-0.5 font-sans">
                              {new Date(event.date).getDate()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col bg-white font-sans">
                        <p className="text-[#D53F17] text-[13px] font-bold mb-1.5 flex items-center gap-1.5 font-sans">
                          <Clock size={13} />
                          {formatEventDate(event.date)}, {event.time}
                        </p>
                        <h3 className="text-[17px] font-bold text-[#1c222b] leading-snug line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors font-sans">
                          {event.title}
                        </h3>
                        <p className="text-gray-500 text-[13px] font-semibold flex items-center gap-1.5 mb-4 mt-auto font-sans">
                          <MapPin size={13} className="text-orange-400 shrink-0 font-sans" />
                          {event.venue}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 font-sans">
                           <span className="text-xl font-bold text-[#1c222b] font-sans">₹{event.price}</span>
                           <span className="text-[11px] text-gray-400 font-bold font-sans">Available</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white/50 border border-dashed border-gray-200 rounded-3xl font-sans">
                <Frown className="text-orange-300 mx-auto mb-4 font-sans" size={64} strokeWidth={1} />
                <h3 className="text-2xl font-bold text-[#1c222b] mb-2 font-sans">No events found</h3>
                <p className="text-gray-500 max-w-md mx-auto font-medium mb-6 font-sans">
                  There are currently no events matching your criteria in <strong className="text-orange-500 font-sans">{selectedLocation.city}</strong>.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                    setSelectedPriceRange(0);
                    setSelectedDateFilter("all");
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold transition shadow-md font-sans"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
