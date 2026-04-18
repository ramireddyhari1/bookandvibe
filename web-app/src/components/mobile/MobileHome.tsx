"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bell, MapPin, Search, ChevronDown, Zap, Play, Bookmark, Tag,
  SlidersHorizontal, Music, ArrowRight, Star, Sparkles, Heart,
  Wallet, Clock, MessageSquare, CalendarDays, Trophy, User,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Constants ─────────────────────────────────────────────
const FACILITY_CATEGORIES = [
  { id: "cricket", title: "Cricket", imgSrc: "/icons/gamehub/cricket.png", color: "#FF7A00" },
  { id: "badminton", title: "Badminton", imgSrc: "/icons/gamehub/badminton.png", color: "#FF007F" },
  { id: "football", title: "Football", imgSrc: "/icons/gamehub/football.png", color: "#4ADE80" },
  { id: "more", title: "See All", imgSrc: "/icons/gamehub/see-all.png", color: "#00A8FF" },
];

const PROMO_BANNERS = [
  {
    id: "promo-1",
    gradient: "linear-gradient(135deg, #FF7A00, #FFB800, #FACC15)",
    title: "DON'T JUST PLAY!",
    subTitle: "DOMINATE!",
    meta: "Best Gear | Fast Delivery | Wide Variety",
    ctaText: "Shop Now - Min 40% Off",
    bgImg: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800",
  },
  {
    id: "promo-2",
    gradient: "linear-gradient(135deg, #1E1B4B, #312E81, #4F46E5)",
    title: "PLAY FEARLESS!",
    subTitle: "ROCKET GEAR",
    meta: "Protect Your Game Daily",
    ctaText: "Explore Collection",
    bgImg: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800",
  },
];

const FALLBACK_FACILITIES = [
  { id: "f-1", name: "Neon Turf Arena", type: "Football", location: "Gachibowli, Hyd", rating: 4.8, pricePerHour: 1400, image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200" },
  { id: "f-2", name: "Cricket Royale Nets", type: "Cricket", location: "Benz Circle, VJA", rating: 4.7, pricePerHour: 600, image: "https://images.unsplash.com/photo-1540324155970-14e422f01f2f?q=80&w=1200" },
  { id: "f-3", name: "Sky Smash Badminton", type: "Badminton", location: "Indiranagar, BLR", rating: 4.9, pricePerHour: 450, image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200" },
  { id: "f-4", name: "Grand Slam Cricket Nets", type: "Cricket", location: "Ameerpet, Hyderabad", rating: 4.6, pricePerHour: 450, image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200" },
  { id: "f-5", name: "Power Play Turf", type: "Football", location: "Madhapur, Hyderabad", rating: 4.8, pricePerHour: 1500, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200" },
];

const FALLBACK_EVENTS = [
  {
    id: "e-1",
    title: "Dil Se - DSP Special Telugu Jamming",
    venue: "Throwback, Kavuri Hills",
    category: "Live Music",
    date: "2026-04-19",
    price: 349,
    images: JSON.stringify(["https://d3pmsbscv4kwdi.cloudfront.net/events/1775570542079-384f5959f4eefd59.jpg"]),
  },
  {
    id: "e-2",
    title: "Diljit Dosanjh - Dil-Luminati Tour",
    venue: "GMR Arena, Hyderabad",
    category: "Punjabi Pop",
    date: "2026-11-15",
    price: 3999,
    images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg/640px-Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg"]),
  },
  {
    id: "e-3",
    title: "Zomato Feeding India ft. Dua Lipa",
    venue: "MMRDA Grounds, BKC",
    category: "Rock / Pop",
    date: "2026-11-30",
    price: 4500,
    images: JSON.stringify(["https://i.scdn.co/image/ab6761610000e5ebd42a27db3286b58553da8858"]),
  },
  {
    id: "e-4",
    title: "Coldplay: Music Of The Spheres World Tour",
    venue: "DY Patil Stadium, Navi Mumbai",
    category: "Rock / Pop",
    date: "2026-01-18",
    price: 8000,
    images: JSON.stringify(["https://i.scdn.co/image/ab6761610000e5eb989ed05e1f0570cc4726c2d3"]),
  },
  {
    id: "e-5",
    title: "Karan Aujla - It Was All A Dream",
    venue: "Bhartiya City, Bengaluru",
    category: "Punjabi Hip-Hop",
    date: "2026-12-07",
    price: 2999,
    images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Karan_Aujla_2021.jpg/640px-Karan_Aujla_2021.jpg"]),
  },
  {
    id: "e-6",
    title: "Sunburn Arena ft. Alan Walker",
    venue: "Kochi International Marina",
    category: "EDM",
    date: "2026-10-04",
    price: 2000,
    images: JSON.stringify(["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Alan_Walker_%2842416801991%29.jpg/640px-Alan_Walker_%2842416801991%29.jpg"]),
  }
];

// ─── Sub-components ────────────────────────────────────────

function HeroPosterCard({ event }: { event: any }) {
  const statusLine = "Tickets selling fast!";
  return (
    <Link href={`/events/${event.id}`} className="block shrink-0 w-[85vw] sm:w-[320px] snap-center">
      <div className="relative w-full aspect-[3.5/4.5] rounded-[36px] overflow-hidden group shadow-2xl shadow-orange-900/20">
        <motion.img 
          src={getEventImage(event.images)} 
          alt={event.title} 
          className="absolute inset-0 w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F] via-[#0F0A1F]/30 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
            <span className="text-white text-[10px] font-black tracking-[0.1em] uppercase">FEATURED</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="absolute bottom-0 left-0 right-0 p-7">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#FFD700] text-[11px] font-black tracking-widest uppercase flex items-center gap-1.5 bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/20">
                <Sparkles size={10} fill="#FFD700" /> {statusLine}
              </span>
            </div>
            
            <h3 className="text-[26px] font-bold text-white leading-tight tracking-tight drop-shadow-md italic">
              {event.title}
            </h3>
            
            <div className="flex items-center gap-3 text-white/70 text-[13px] font-medium">
              <div className="flex items-center gap-1">
                <CalendarDays size={14} className="text-orange-400" />
                <span>{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-orange-400" />
                <span className="max-w-[120px] truncate">{event.venue}</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </Link>
  );
}

function PosterBannerCarousel({ events }: { events: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const firstChild = scrollRef.current.children[0] as HTMLElement;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : scrollRef.current.offsetWidth * 0.85 + 16;
    const index = Math.round(scrollRef.current.scrollLeft / cardWidth);
    if (index !== activeIndex && index >= 0 && index < events.length) setActiveIndex(index);
  };

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const firstChild = scrollRef.current.children[0] as HTMLElement;
      if (!firstChild) return;
      
      const cardWidth = firstChild.offsetWidth + 16;
      const maxIndex = Math.min(events.length, 5);
      let nextIndex = activeIndex + 1;
      
      if (nextIndex >= maxIndex) {
        nextIndex = 0;
      }
      
      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: 'smooth'
      });
    }, 4000); // Slides every 4 seconds

    return () => clearInterval(interval);
  }, [activeIndex, events]);

  return (
    <div className="relative">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto px-5 pt-2 pb-6 scroll-px-5 snap-x snap-mandatory scrollbar-hide"
      >
        {events.map((ev) => (
          <HeroPosterCard key={ev.id} event={ev} />
        ))}
      </div>
      
      {/* Premium Indicators */}
      <div className="flex justify-center items-center gap-2 -mt-2">
        {events.slice(0, 5).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              width: i === activeIndex ? 24 : 6,
              opacity: i === activeIndex ? 1 : 0.3,
              backgroundColor: i === activeIndex ? "#F97316" : "#D1D5DB"
            }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function SectionEventCard({ event }: { event: any }) {
  const formatCurrency = (v: number) => `₹${new Intl.NumberFormat("en-IN").format(v || 0)}`;
  return (
    <Link href={`/events/${event.id}`} className="block shrink-0 w-[65vw] max-w-[240px] snap-start">
      <div className="relative w-full aspect-[3/4] rounded-[28px] overflow-hidden bg-white shadow-md border border-gray-100">
        <img src={getEventImage(event.images)} alt={event.title} className="absolute inset-0 w-full h-[60%] object-cover" />
        <div className="absolute top-[60%] bottom-0 left-0 right-0 p-4 bg-white flex flex-col justify-end">
          <p className="text-orange-500 text-[12px] font-bold tracking-wider mb-1.5">
            {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase()}
          </p>
          <h4 className="text-gray-900 text-[16px] font-bold line-clamp-2 mb-1.5 leading-snug">{event.title}</h4>
          <div className="flex items-center justify-between mt-auto">
             <div className="flex items-center gap-1.5 max-w-[60%]">
               <MapPin size={12} className="text-gray-400 shrink-0" />
               <span className="text-gray-500 text-[12px] truncate">{event.venue}</span>
             </div>
             <span className="text-gray-900 text-[14px] font-black">{formatCurrency(event.price)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function GridEventCard({ event }: { event: any }) {
  const tags = useMemo(() => {
    try {
      const parsed = JSON.parse(event.tags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [event.tags]);

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="w-full">
        <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden bg-gray-100 border border-gray-200/50">
          <img src={getEventImage(event.images)} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
            <Bookmark size={16} className="text-gray-600" />
          </div>
        </div>
        <div className="mt-2.5">
          <h4 className="text-gray-900 text-[15px] font-bold leading-5 line-clamp-2">{event.title}</h4>
          <p className="text-gray-500 text-[12px] mt-1">
            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, 12:00 AM onwards
          </p>
          <p className="text-gray-500 text-[12px] mt-0.5 truncate">{event.venue}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {tags.map((tag: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1">
                  <Tag size={12} className="text-orange-500" />
                  <span className="text-orange-500 text-[12px] font-bold">{tag.length > 25 ? tag.substring(0, 22) + "..." : tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function FacilityCard({ facility }: { facility: any }) {
  return (
    <Link href={`/gamehub/${facility.id}`} className="block shrink-0 w-[60vw] max-w-[220px] snap-start">
      <div className="w-full">
        <div className="relative w-full aspect-[4/5] max-h-[280px] rounded-[24px] overflow-hidden bg-white/90 border border-pink-500/20 shadow-lg">
          <img src={facility.image} alt={facility.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F]/85 to-transparent" />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-white/50 flex items-baseline gap-[2px]">
            <span className="text-[#10B981] text-[11px] font-extrabold tracking-tight">₹</span>
            <span className="text-gray-900 text-[14px] font-black tracking-tight">{facility.pricePerHour}</span>
            <span className="text-gray-500 text-[10px] font-bold">/hr</span>
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-[#065F46] text-[18px] font-bold truncate">{facility.name}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="bg-emerald-600/10 px-1.5 py-0.5 rounded text-emerald-600 text-[10px] font-bold">{facility.type.toUpperCase()}</span>
            <span className="text-black/50 text-[10px]">★ {facility.rating}</span>
          </div>
          <p className="text-[#065F46]/60 text-[14px] mt-1 truncate">{facility.location}</p>
        </div>
      </div>
    </Link>
  );
}

function getEventImage(imagesStr: string) {
  try {
    const images = JSON.parse(imagesStr);
    return Array.isArray(images) ? images[0] : images;
  } catch {
    return imagesStr || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200";
  }
}

// ─── Main Component ────────────────────────────────────────

export default function MobileHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab") as "events" | "gamehub" | null;

  const [activeTab, setActiveTab] = useState<"events" | "gamehub">(urlTab || "events");
  
  // Update state if URL changes (e.g. on back navigation)
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

  const handleTabChange = (tab: "events" | "gamehub") => {
    setActiveTab(tab);
    // Update the URL without adding to history stack unnecessarily
    router.replace(`/?tab=${tab}`, { scroll: false });
  };

  const [events, setEvents] = useState<any[]>(FALLBACK_EVENTS);
  const [facilities, setFacilities] = useState<any[]>(FALLBACK_FACILITIES);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { selectedLocation } = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isGameHub = activeTab === "gamehub";

  useEffect(() => {
    Promise.all([
      fetchApi("/events").then(d => d.data && Array.isArray(d.data) ? d.data : []).catch(() => []),
      fetchApi("/gamehub/facilities").then(d => Array.isArray(d) ? d : d.data && Array.isArray(d.data) ? d.data : []).catch(() => []),
    ]).then(([evts, facs]) => {
      setEvents(evts.length ? evts : FALLBACK_EVENTS);
      setFacilities(facs.length ? facs : FALLBACK_FACILITIES);
    }).finally(() => setLoading(false));
  }, []);

  const filteredFacilities = useMemo(() =>
    facilities.filter(f => f.location?.toLowerCase().includes(selectedLocation.city.toLowerCase())),
    [facilities, selectedLocation]
  );

  const musicEvents = useMemo(() => events.filter(e => e.category === "Music" || e.category === "CONCERT"), [events]);
  const posterEvent = events[0] ?? null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isGameHub ? "#F0FDF4" : "#fff7ed" }}>
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 overflow-x-hidden" style={{ background: isGameHub ? "linear-gradient(180deg, #F0FDF4, #FFFFFF, #F8FAFC)" : "linear-gradient(180deg, #fff7ed, #ffffff, #fafafa)" }}>

      {/* ═══ HEADER ═══ */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),12px)] pb-5">
        {isGameHub ? (
          /* GameHub Header - Light */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/profile" className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-[20px] font-bold text-gray-500">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
              </Link>
              <div>
                <p className="text-[16px] text-gray-900 font-bold tracking-tight">Hey {user?.name?.split(" ")[0] || "there"}!</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="text-[13px] text-gray-500">{selectedLocation.city}</span>
                  <ChevronDown size={14} className="text-gray-900/50" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MessageSquare size={24} className="text-gray-900" strokeWidth={1.8} />
              <Bell size={24} className="text-gray-900" strokeWidth={1.8} />
              <CalendarDays size={24} className="text-gray-900" strokeWidth={1.8} />
            </div>
          </div>
        ) : (
          /* Events Header - Light */
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">CURRENT LOCATION</p>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-orange-500" />
                <span className="text-gray-900 text-[18px] font-bold">{selectedLocation.city}</span>
                <ChevronDown size={14} className="text-gray-500 -ml-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                <Bell size={20} className="text-orange-600" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-orange-500 border-[1.5px] border-white" />
              </div>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center border-2 border-orange-200">
                <span className="text-white text-[18px] font-bold">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ═══ SEARCH BAR ═══ */}
      <div className="px-5 mb-6">
        <div className="rounded-[16px] p-[1px] shadow-sm border border-gray-100" style={{
          background: isGameHub ? "rgba(16,185,129,0.12)" : "rgba(249, 115, 22, 0.12)"
        }}>
          <div className="flex items-center gap-3 rounded-[15px] px-4 h-12" style={{
            background: isGameHub ? "linear-gradient(90deg, #FFFFFF, #F0FDF4)" : "linear-gradient(90deg, #FFFFFF, #fff7ed)"
          }}>
            <Search size={20} className={isGameHub ? "text-gray-400" : "text-orange-300"} />
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-[16px] font-medium text-gray-900 placeholder:text-gray-400`}
            />
          </div>
        </div>
      </div>

      {/* ═══ TAB SWITCHER ═══ */}
      <div className="mx-5 mb-4 rounded-[22px] overflow-hidden shadow-sm" style={{
        background: "#F8FAFC",
        border: "1px solid rgba(0,0,0,0.05)"
      }}>
        <div className="relative flex h-[56px] p-[2px] items-center">
          {/* Active tab indicator */}
          <div
            className="absolute h-[calc(100%-4px)] top-[2px] rounded-[20px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden shadow-sm"
            style={{
              width: "calc(50% - 2px)",
              left: activeTab === "events" ? "2px" : "calc(50%)",
              background: activeTab === "events"
                ? "linear-gradient(90deg, #fb923c, #f97316)"
                : "linear-gradient(90deg, #34D399, #10B981)",
            }}
          />

          {/* Events Button */}
          <button
            onClick={() => handleTabChange("events")}
            className="relative z-10 flex-1 h-full flex items-center justify-center gap-1.5 transition-all duration-300"
          >
            <span className="text-[15px] font-extrabold" style={{ color: activeTab === "events" ? "#FFFFFF" : "#64748B" }}>✦</span>
            <span className="text-[15px] font-extrabold" style={{ color: activeTab === "events" ? "#FFFFFF" : "#64748B" }}>Events</span>
          </button>

          {/* GameHub Button */}
          <button
            onClick={() => handleTabChange("gamehub")}
            className="relative z-10 flex-1 h-full flex items-center justify-center gap-1.5 transition-all duration-300"
          >
            <span className="text-[15px] font-extrabold" style={{ color: activeTab === "gamehub" ? "#FFFFFF" : "#64748B" }}>✦</span>
            <span className="text-[15px] font-extrabold uppercase tracking-wide" style={{ color: activeTab === "gamehub" ? "#FFFFFF" : "#64748B" }}>GameHub</span>
          </button>
        </div>
      </div>

      {/* ═══ EVENTS TAB CONTENT ═══ */}
      {activeTab === "events" ? (
        <>
          {/* For You Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between px-5 mb-5 mt-2">
              <div className="flex flex-col">
                <span className="text-orange-500 text-[11px] font-black tracking-[0.2em] uppercase mb-1">CURATED FOR YOU</span>
                <h2 className="text-gray-900 text-[26px] font-black tracking-tight leading-none">Top Picks</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 px-3 py-1.5 rounded-2xl border border-orange-100 flex items-center gap-2 group active:scale-95 transition-transform shadow-sm">
                  <span className="text-orange-600 text-[12px] font-bold">Top</span>
                  <Zap size={14} className="text-orange-500 fill-orange-500" />
                </div>
              </div>
            </div>
            
            <PosterBannerCarousel events={events.slice(0, 5)} />
          </div>

          {/* Trending Section */}
          {musicEvents.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between px-5 mb-4">
                <h2 className="text-white text-[20px] font-bold tracking-tight">Trending in Events</h2>
                <Link href="/events" className="text-[#10B981] text-[14px] font-bold">See all</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto px-5 scroll-px-5 snap-x scrollbar-hide">
                {events.slice(0, 6).map(ev => (
                  <SectionEventCard key={ev.id} event={ev} />
                ))}
              </div>

              {/* Spotlight Banner */}
              {posterEvent && (
                <Link href={`/events/${posterEvent.id}`} className="block mx-5 mt-5">
                  <div className="relative h-[160px] rounded-[18px] overflow-hidden border border-orange-500/20">
                    <img src={getEventImage(posterEvent.images)} alt={posterEvent.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/72 to-transparent" />
                    <div className="absolute left-4 right-4 bottom-3.5">
                      <span className="inline-block px-2 py-1 rounded-full bg-orange-600/95 text-white text-[10px] font-bold tracking-wide mb-1.5">SPOTLIGHT</span>
                      <h3 className="text-white text-[19px] font-bold truncate">{posterEvent.title}</h3>
                      <p className="text-white/80 text-[13px] mt-1 truncate">{posterEvent.venue}</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* All Events Grid */}
          <div className="py-4 mb-20">
            <div className="flex items-center justify-between px-5 mb-4">
              <h2 className="text-gray-900 text-[20px] font-bold tracking-tight">All Events</h2>
            </div>
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto px-5 scroll-px-5 mb-4 scrollbar-hide">
              {["Filters", "Date", "Today", "Tomorrow"].map((label, i) => (
                <button key={label} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white shrink-0 shadow-sm">
                  {i === 0 && <SlidersHorizontal size={14} className="text-gray-500" />}
                  <span className="text-gray-700 text-[13px] font-bold">{label}</span>
                  {i <= 1 && <ChevronDown size={14} className="text-gray-400" />}
                </button>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-3.5">
              {events.map(ev => (
                <GridEventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ═══ GAMEHUB TAB CONTENT ═══ */
        <>
          {/* Promo Banners */}
          <div className="mt-2 mb-6">
            <div className="flex gap-4 overflow-x-auto px-5 scroll-px-5 snap-x snap-mandatory scrollbar-hide">
              {PROMO_BANNERS.map(banner => (
                <div
                  key={banner.id}
                  className="relative shrink-0 w-[85vw] h-[170px] rounded-[20px] overflow-hidden shadow-lg snap-center"
                  style={{ background: banner.gradient }}
                >
                  <img src={banner.bgImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[3px]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                  <div className="relative z-10 flex flex-col justify-center items-start h-full p-5">
                    <h3 className="text-white text-[22px] font-bold leading-[26px] drop-shadow-md">{banner.title}</h3>
                    <h4 className="text-white text-[26px] font-bold italic leading-[30px] tracking-wide drop-shadow-lg">{banner.subTitle}</h4>
                    <p className="text-white/95 text-[10px] tracking-wide mt-1.5 mb-4">{banner.meta}</p>
                    <div className="bg-[#0F172A] px-4 py-2 rounded-xl shadow-md">
                      <span className="text-white text-[11px] font-bold">{banner.ctaText}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sport Categories */}
          <div className="mb-8">
            <div className="mx-4 sm:mx-5 bg-[#10B981] rounded-[24px] p-3 sm:p-4 shadow-lg flex justify-between items-start gap-1">
              {FACILITY_CATEGORIES.map(cat => (
                <Link
                  key={cat.id}
                  href="/gamehub"
                  className="flex flex-col items-center flex-1 gap-1.5 min-w-0"
                >
                  <div className="w-[85%] max-w-[72px] aspect-square rounded-[22px] bg-white flex items-center justify-center shadow-md p-2">
                    <img src={cat.imgSrc} alt={cat.title} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white text-[9px] sm:text-[10px] font-bold tracking-wide text-center truncate w-[95%]">{cat.title.toUpperCase()}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Facilities */}
          <div className="mb-8">
            <div className="flex items-center justify-between px-5 mb-4">
              <h2 className="text-[#065F46] text-[20px] font-bold tracking-tight">
                Popular Facilities
              </h2>
              <Link href="/gamehub" className="text-[#10B981] text-[14px] font-bold">See all</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto px-5 scroll-px-5 snap-x scrollbar-hide">
              {(filteredFacilities.length ? filteredFacilities : facilities).map(f => (
                <FacilityCard key={f.id} facility={f} />
              ))}
            </div>
          </div>

          {/* Host a Match Banner */}
          <div className="mx-5 mb-8 rounded-[28px] overflow-hidden">
            <div className="bg-gradient-to-br from-[#10B981] to-[#059669] p-6 relative">
              <h3 className="text-white text-[18px] font-bold">Can&apos;t find a game?</h3>
              <p className="text-white/70 text-[13px] mt-1 mb-4">Host a match and invite players nearby!</p>
              <button className="bg-white px-4 py-2.5 rounded-xl">
                <span className="text-[#059669] text-[12px] font-bold">HOST A MATCH</span>
              </button>
              <Trophy size={60} className="absolute right-[-10px] bottom-[-10px] text-white/15" strokeWidth={1} />
            </div>
          </div>

          {/* Facility Banner */}
          {filteredFacilities.length > 0 && (
            <Link href="/gamehub" className="block mx-5 mb-8">
              <div className="relative h-[160px] rounded-[18px] overflow-hidden">
                <img src={filteredFacilities[0].image} alt={filteredFacilities[0].name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F]/80 to-transparent" />
                <div className="absolute left-4 right-4 bottom-3.5">
                  <span className="inline-block px-2 py-1 rounded-full bg-[#FF7A00] text-white text-[10px] font-bold tracking-wide mb-1.5">BOOK NOW</span>
                  <h3 className="text-white text-[19px] font-bold">{filteredFacilities[0].name}</h3>
                  <p className="text-white/80 text-[13px] mt-1">{filteredFacilities[0].location}</p>
                </div>
              </div>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
