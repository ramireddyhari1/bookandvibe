"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocation, LOCATIONS } from "@/context/LocationContext";
import { 
  Bell, MapPin, Search, ChevronDown, Zap, Play, Bookmark, Tag,
  SlidersHorizontal, Music, ArrowRight, Star, Sparkles, Heart,
  Wallet, Clock, MessageSquare, CalendarDays, Trophy, User,
  Navigation, Check, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import Image from "next/image";
import { useSocket } from "@/context/SocketContext";
import LiveMatchCard from "./LiveMatchCard";
import PremiumLoader from "@/components/ui/PremiumLoader";

interface Event {
  id: string;
  title: string;
  venue: string;
  category: string;
  date: string;
  price: number;
  images: string;
  featured?: boolean;
  description?: string;
  tags?: string;
}

interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  pricePerHour: number;
  image: string;
}

// ─── Constants ─────────────────────────────────────────────
const FACILITY_CATEGORIES = [
  { 
    id: "cricket", 
    title: "Cricket", 
    color: "#FF7A00",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 14l6.5-6.5a2.12 2.12 0 113 3L9 17l-3 3-3-3 3-3z" />
        <path d="M14.5 4.5L16 6l1.5-1.5L16 3l-1.5 1.5z" />
        <path d="M15.5 7.5L19 11" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    )
  },
  { 
    id: "badminton", 
    title: "Badminton", 
    color: "#FF007F",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 21a3 3 0 003-3c0-1.66-3-6-3-6s-3 4.34-3 6a3 3 0 003 3z" />
        <path d="M12 12l4-9" />
        <path d="M12 12l-4-9" />
        <path d="M12 12V3" />
        <path d="M10 5h4" />
        <path d="M10.5 8h3" />
      </svg>
    )
  },
  { 
    id: "football", 
    title: "Football", 
    color: "#00A63E",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7l-3.5 2.5 1.5 4h4l1.5-4L12 7z" />
        <path d="M12 7V2" />
        <path d="M8.5 9.5L4 8" />
        <path d="M10.5 13.5L8 18" />
        <path d="M13.5 13.5L16 18" />
        <path d="M15.5 9.5L20 8" />
      </svg>
    )
  },
  { 
    id: "more", 
    title: "See All", 
    color: "#6366F1",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  },
];

const ALL_SPORTS = [
  { id: "cricket", title: "Cricket", color: "#FF7A00", icon: FACILITY_CATEGORIES[0].icon },
  { id: "badminton", title: "Badminton", color: "#FF007F", icon: FACILITY_CATEGORIES[1].icon },
  { id: "football", title: "Football", color: "#00A63E", icon: FACILITY_CATEGORIES[2].icon },
  { 
    id: "swimming", 
    title: "Swimming", 
    color: "#0EA5E9",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 6 7 6s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1" />
      </svg>
    )
  },
  { 
    id: "basketball", 
    title: "Basketball", 
    color: "#D53F17",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 000 20" />
        <path d="M12 2a14.5 14.5 0 010 20" />
        <path d="M2 12h20" />
      </svg>
    )
  },
  { 
    id: "tennis", 
    title: "Tennis", 
    color: "#A3E635",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2.2 12c4.4 0 8 3.6 8 8" />
        <path d="M21.8 12c-4.4 0-8-3.6-8-8" />
      </svg>
    )
  },
  { 
    id: "volleyball", 
    title: "Volleyball", 
    color: "#FACC15",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 12L4 7.5" />
        <path d="M12 12l8-4.5" />
        <path d="M12 12v9" />
        <path d="M12 12L4 16.5" />
        <path d="M12 12l8 4.5" />
      </svg>
    )
  },
  { 
    id: "gym", 
    title: "Gym", 
    color: "#64748B",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6.5 6.5h11" />
        <path d="M6.5 17.5h11" />
        <path d="M3 10h1" />
        <path d="M3 14h1" />
        <path d="M20 10h1" />
        <path d="M20 14h1" />
        <rect x="4" y="6" width="2" height="12" rx="1" />
        <rect x="18" y="6" width="2" height="12" rx="1" />
      </svg>
    )
  },
  { 
    id: "table-tennis", 
    title: "Table Tennis", 
    color: "#EF4444",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="15.5" cy="15.5" r="2.5" />
        <path d="M15.5 13a7 7 0 10-7 7" />
        <path d="M5.5 15.5L2 19" />
      </svg>
    )
  }
];

const PROMO_BANNERS = [
  {
    id: "promo-1",
    gradient: "linear-gradient(135deg, #00A63E, #059669)",
    title: "PREMIUM TURFS",
    subTitle: "BOOK LOCALLY",
    meta: "Instant Confirmation • Top Ratings",
    ctaText: "Find a Turf",
    bgImg: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800",
  },
  {
    id: "promo-2",
    gradient: "linear-gradient(135deg, #1E293B, #0F172A)",
    title: "TEAM EVENTS",
    subTitle: "CORPORATE PLAY",
    meta: "Book bulk hours & tournaments",
    ctaText: "Enquire Now",
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
    date: "2026-05-19",
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
    images: JSON.stringify(["https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=800"]),
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
    date: "2026-06-18",
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
    images: JSON.stringify(["https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200"]),
  }
];

// ─── Sub-components ────────────────────────────────────────

function HeroPosterCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`} className="block shrink-0 w-[82vw] sm:w-[320px] snap-center">
      <div className="relative w-full aspect-[4/5.5] rounded-[32px] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <motion.img 
          src={getEventImage(event.images)} 
          alt={event.title} 
          className="absolute inset-0 w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        
        {/* Dramatic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-40" />
        
        {/* Category Badge - Glassmorphism */}
        <div className="absolute top-5 left-5 z-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-white text-[10px] font-extrabold uppercase tracking-[0.1em]">
              {event.category || "Featured"}
            </span>
          </div>
        </div>

        {/* Favorite/Bookmark - Premium Style */}
        <div className="absolute top-5 right-5 z-20">
          <button className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform">
            <Bookmark size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-[26px] font-black text-white leading-[1.05] tracking-tight mb-4 drop-shadow-2xl">
              {event.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <CalendarDays size={14} className="text-orange-400" />
                <span className="text-white text-[12px] font-bold uppercase tracking-wider">
                  {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <MapPin size={14} className="text-orange-400" />
                <span className="text-white text-[12px] font-bold uppercase tracking-wider max-w-[120px] truncate">
                  {event.venue}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Link>
  );
}

function PosterBannerCarousel({ events }: { events: Event[] }) {
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
              backgroundColor: i === activeIndex ? "#D53F17" : "#D1D5DB"
            }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function SectionEventCard({ event }: { event: Event }) {
  const formatCurrency = (v: number) => `₹${new Intl.NumberFormat("en-IN").format(v || 0)}`;
  return (
    <Link href={`/events/${event.id}`} className="block shrink-0 w-[70vw] max-w-[280px] snap-start">
      <div className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden bg-white shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-gray-100/50 group">
        <img src={getEventImage(event.images)} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        
        {/* Elegant Date Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl shadow-lg border border-white/50 text-center min-w-[50px]">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-tighter leading-none mb-0.5">
              {new Date(event.date).toLocaleDateString("en-IN", { month: "short" })}
            </p>
            <p className="text-[18px] font-black text-gray-900 leading-none">
              {new Date(event.date).getDate()}
            </p>
          </div>
        </div>

        {/* Bottom Info - Glass Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <h4 className="text-white text-[17px] font-black line-clamp-1 mb-2 tracking-tight">{event.title}</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/70">
              <MapPin size={13} className="text-orange-500" />
              <span className="text-[12px] font-bold truncate max-w-[100px] uppercase tracking-wide">{event.venue}</span>
            </div>
            <div className="bg-orange-600 px-3 py-1 rounded-full shadow-lg border border-orange-400/50">
              <span className="text-white text-[13px] font-black tracking-tight">{formatCurrency(event.price)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function GridEventCard({ event }: { event: Event }) {
  const tags = useMemo(() => {
    try {
      const parsed = JSON.parse(event.tags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [event.tags]);

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="w-full">
        <div className="relative w-full aspect-[1/1.2] rounded-[32px] overflow-hidden bg-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] group-active:scale-[0.98] transition-all duration-300">
          <img src={getEventImage(event.images)} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
          
          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
             <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-white/50">
               <span className="text-[13px] font-black text-gray-900 tracking-tight">₹{event.price}</span>
             </div>
          </div>

          <div className="absolute top-3 right-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-sm">
              <Bookmark size={16} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="mt-3.5 px-2">
          <div className="flex items-center gap-1.5 mb-1">
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.1em]">{event.category}</span>
          </div>
          <h4 className="text-gray-900 text-[16px] font-black leading-[1.2] line-clamp-2 tracking-tight group-hover:text-orange-600 transition-colors">{event.title}</h4>
          
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <CalendarDays size={13} className="shrink-0" />
              <span className="text-[12px] font-bold uppercase tracking-wider">{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <MapPin size={13} className="shrink-0" />
              <span className="text-[12px] font-bold truncate uppercase tracking-wider">{event.venue}</span>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {tags.slice(0, 2).map((tag: string, idx: number) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Tag size={10} className="text-gray-400" />
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link href={`/gamehub/${facility.id}`} className="block shrink-0 w-[65vw] max-w-[260px] snap-start group">
      <div className="w-full">
        <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden bg-gray-100 shadow-[0_15px_35px_rgba(0,0,0,0.08)] group-active:scale-[0.98] transition-all duration-300">
          <img src={facility.image} alt={facility.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          
          {/* Price Badge - Premium Glass */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/30 flex items-baseline gap-[2px] shadow-lg">
              <span className="text-white text-[11px] font-black tracking-tight">₹</span>
              <span className="text-white text-[16px] font-black tracking-tight">{facility.pricePerHour}</span>
              <span className="text-white/80 text-[10px] font-bold">/hr</span>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
             <div className="bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
               <Star size={12} className="text-yellow-400 fill-yellow-400" />
               <span className="text-white text-[13px] font-black">{facility.rating}</span>
             </div>
             <div className="bg-[#00A63E] px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg border border-emerald-400/50">
               {facility.type}
             </div>
          </div>
        </div>
        <div className="mt-4 px-2">
          <h4 className="text-gray-900 text-[18px] font-black tracking-tight truncate group-hover:text-[#00A63E] transition-colors">{facility.name}</h4>
          <div className="flex items-center gap-1.5 mt-1.5 text-gray-400">
            <MapPin size={13} className="text-emerald-500" />
            <p className="text-[13px] font-bold uppercase tracking-wider truncate">{facility.location}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LogoLoader({ isGameHub }: { isGameHub: boolean }) {
  const accentColor = isGameHub ? "#00A63E" : "#D53F17";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <PremiumLoader size="lg" color={accentColor} text="Book & Vibe" />
    </div>
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
      Promise.resolve().then(() => setActiveTab(urlTab));
    }
  }, [urlTab, activeTab]);

  const handleTabChange = (tab: "events" | "gamehub") => {
    setActiveTab(tab);
    // Update the URL without adding to history stack unnecessarily
    router.replace(`/?tab=${tab}`, { scroll: false });
  };

  const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
  const [facilities, setFacilities] = useState<Facility[]>(FALLBACK_FACILITIES);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { selectedLocation, setSelectedLocation, detectLocation, isDetecting } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [selectedSportCategory, setSelectedSportCategory] = useState<string | null>(null);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const { socket } = useSocket();

  const filteredEvents = useMemo(() => {
    let list = events;
    
    // Hide past events (safety check)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    list = list.filter(e => new Date(e.date) >= today);
    
    // Filter by Search Query
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }

    // Filter by Chip (Today/Tomorrow)
    if (activeFilter === "Today") {
      const today = new Date().toISOString().split('T')[0];
      list = list.filter(e => e.date.startsWith(today));
    } else if (activeFilter === "Tomorrow") {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      list = list.filter(e => e.date.startsWith(tomorrow));
    }

    // Filter by Category
    if (selectedCategory !== "All") {
      list = list.filter(e => e.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    // Filter by Specific Date
    if (selectedDate) {
      list = list.filter(e => e.date.startsWith(selectedDate));
    }
    
    return list;
  }, [events, activeFilter, query, selectedCategory, selectedDate]);

  const isGameHub = activeTab === "gamehub";

  useEffect(() => {
    Promise.all([
      fetchApi("/events").then(d => d.data && Array.isArray(d.data) ? d.data : []).catch(() => []),
      fetchApi("/gamehub/facilities").then(d => Array.isArray(d) ? d : d.data && Array.isArray(d.data) ? d.data : []).catch(() => []),
    ]).then(([evts, facs]) => {
      setEvents(evts.length ? evts : FALLBACK_EVENTS);
      setFacilities(facs.length ? facs : FALLBACK_FACILITIES);
      
      // Fetch live matches for all facilities in view
      const facilityIds = facs.map((f: any) => f.id);
      if (facilityIds.length > 0) {
        Promise.all(facilityIds.map((id: string) => fetchApi(`/live-match/facility/${id}`)))
          .then(results => {
            const allLive = results.flat();
            setLiveMatches(allLive);
            
            // Join socket rooms for these facilities
            facilityIds.forEach((id: string) => socket?.emit('live-match:join', id));
          });
      }
    }).finally(() => setLoading(false));

    return () => {
      // Cleanup socket rooms
      facilities.forEach(f => socket?.emit('live-match:leave', f.id));
    };
  }, [socket]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (update: any) => {
      setLiveMatches(prev => prev.map(m => 
        m.id === update.matchId 
          ? { ...m, scoreData: update.scoreData, status: update.status } 
          : m
      ).filter(m => m.status === 'LIVE'));
    };

    socket.on('live-match:update', handleUpdate);
    return () => {
      socket.off('live-match:update', handleUpdate);
    };
  }, [socket]);

  const filteredFacilities = useMemo(() => {
    let list = facilities.filter(f => f.location?.toLowerCase().includes(selectedLocation.city.toLowerCase()));
    if (selectedSportCategory) {
      list = list.filter(f => f.type.toLowerCase() === selectedSportCategory.toLowerCase());
    }
    return list;
  }, [facilities, selectedLocation, selectedSportCategory]);

  const musicEvents = useMemo(() => events.filter(e => e.category === "Music" || e.category === "CONCERT"), [events]);
  const posterEvent = events[0] ?? null;

  if (loading) {
    return <LogoLoader isGameHub={activeTab === "gamehub"} />;
  }

  return (
    <div className="min-h-screen pb-6 overflow-x-hidden" style={{ background: isGameHub ? "linear-gradient(180deg, #F0FDF4, #FFFFFF, #F8FAFC)" : "linear-gradient(180deg, #fff7ed, #ffffff, #fafafa)" }}>

      {/* ═══ HEADER ═══ */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),10px)] pb-1">
        {isGameHub ? (
          /* GameHub Header - Refined Premium */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 -ml-5">
              <Image 
                src="/bv-green.png" 
                alt="Book & Vibe" 
                width={240} 
                height={96} 
                className="h-24 w-auto object-contain scale-[1.4] origin-left -my-4 -ml-6"
                priority
              />
              <div className="h-8 w-[1.5px] bg-emerald-200/50 rounded-full" />
              <div 
                className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                onClick={() => setIsLocationOpen(true)}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#00A63E]/60 uppercase tracking-wider leading-none mb-0.5">CITY</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900 text-[15px] font-bold tracking-tight">{selectedLocation.city}</span>
                    <ChevronDown size={14} className="text-[#00A63E]" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Link href="/profile/notifications" className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 relative">
                <Bell size={20} className="text-[#00A63E]" strokeWidth={2.5} />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#00A63E] border-2 border-white" />
              </Link>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-[#00A63E] flex items-center justify-center border-2 border-emerald-200 shadow-sm">
                <span className="text-white text-[16px] font-bold uppercase">{user?.name?.charAt(0) || "U"}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Events Header - Refined Premium */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 -ml-5">
              <Image 
                src="/bv-orange.png" 
                alt="Book & Vibe" 
                width={240} 
                height={96} 
                className="h-24 w-auto object-contain scale-[1.4] origin-left -my-4 -ml-6"
                priority
              />
              <div className="h-8 w-[1.5px] bg-orange-200/50 rounded-full" />
              <div 
                className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                onClick={() => setIsLocationOpen(true)}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-wider leading-none mb-0.5">CITY</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900 text-[15px] font-bold tracking-tight">{selectedLocation.city}</span>
                    <ChevronDown size={14} className="text-orange-300" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Link href="/profile/notifications" className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 relative">
                <Bell size={20} className="text-orange-600" strokeWidth={2.5} />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white" />
              </Link>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center border-2 border-orange-200 shadow-sm">
                <span className="text-white text-[16px] font-bold uppercase">{user?.name?.charAt(0) || "U"}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ═══ SEARCH BAR ═══ */}
      <div className="px-5 mb-3 relative z-50">
        <div className="rounded-[16px] p-[1px] shadow-sm border border-gray-100 relative" style={{
          background: isGameHub ? "rgba(0,166,62,0.12)" : "rgba(249, 115, 22, 0.12)"
        }}>
          <div className="flex items-center gap-3 rounded-[15px] px-4 h-12" style={{
            background: isGameHub ? "linear-gradient(90deg, #FFFFFF, #F0FDF4)" : "linear-gradient(90deg, #FFFFFF, #fff7ed)"
          }}>
            <Search size={20} className={isGameHub ? "text-gray-400" : "text-orange-300"} />
            <input
              type="text"
              placeholder={isGameHub ? "Search turfs, courts, arenas..." : "Search events, artists, venues..."}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-[16px] font-medium text-gray-900 placeholder:text-gray-400`}
            />
            {query.length > 0 && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* SEARCH POPUP OVERLAY */}
          <AnimatePresence>
            {query.trim().length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-[110%] left-0 right-0 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] flex flex-col max-h-[60vh]"
              >
                <div className="overflow-y-auto p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-50 mb-1">
                    <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                      {isGameHub ? "Facility Results" : "Event Results"}
                    </span>
                  </div>

                  {isGameHub ? (
                    facilities.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.type.toLowerCase().includes(query.toLowerCase())).length > 0 ? (
                      facilities.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.type.toLowerCase().includes(query.toLowerCase())).map(f => (
                        <Link href={`/gamehub/${f.id}`} key={f.id} onClick={() => setQuery("")} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                          <img src={f.image} alt={f.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-[14px] font-bold text-gray-900 truncate">{f.name}</h4>
                            <p className="text-[12px] text-gray-500 truncate flex items-center gap-1"><MapPin size={10}/>{f.location}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm font-medium">No venues found for "{query}"</div>
                    )
                  ) : (
                    filteredEvents.length > 0 ? (
                      filteredEvents.map(e => (
                        <Link href={`/events/${e.id}`} key={e.id} onClick={() => setQuery("")} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                          <img src={getEventImage(e.images)} alt={e.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-[14px] font-bold text-gray-900 truncate">{e.title}</h4>
                            <p className="text-[12px] text-gray-500 truncate flex items-center gap-1"><CalendarDays size={10}/>{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • {e.venue}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-sm font-medium">No events found for "{query}"</div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ TAB SWITCHER ═══ */}
      <div className="mx-5 mb-6 relative z-40">
        <div className="bg-white/40 backdrop-blur-2xl rounded-[28px] p-1.5 flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/50">
          {/* Active tab indicator */}
          <motion.div
            layoutId="activeTab"
            className="absolute rounded-[22px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] overflow-hidden"
            style={{
              width: "calc(50% - 10px)",
              height: "calc(100% - 12px)",
              background: activeTab === "events"
                ? "linear-gradient(135deg, #fb923c, #D53F17)"
                : "linear-gradient(135deg, #00A63E, #059669)",
            }}
            animate={{ x: activeTab === "events" ? 0 : "100%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />

          <button
            onClick={() => handleTabChange("events")}
            className="relative z-10 flex-1 h-[48px] flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Music size={16} className={activeTab === "events" ? "text-white" : "text-gray-400"} />
            <span className="text-[14px] font-black uppercase tracking-[0.1em]" style={{ color: activeTab === "events" ? "#FFFFFF" : "#64748B" }}>Events</span>
          </button>

          <button
            onClick={() => handleTabChange("gamehub")}
            className="relative z-10 flex-1 h-[48px] flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Trophy size={16} className={activeTab === "gamehub" ? "text-white" : "text-gray-400"} />
            <span className="text-[14px] font-black uppercase tracking-[0.1em]" style={{ color: activeTab === "gamehub" ? "#FFFFFF" : "#64748B" }}>GameHub</span>
          </button>
        </div>
      </div>

      {/* ═══ EVENTS TAB CONTENT ═══ */}
      {activeTab === "events" ? (
        <>
          {/* For You Section */}
          <div className="mb-10">
            <div className="flex items-end justify-between px-5 mb-5 mt-2">
              <div className="flex flex-col">
                <h2 className="text-gray-900 text-[24px] font-bold tracking-tight leading-tight mb-0.5">Top Events</h2>
                <p className="text-gray-500 text-[13px] font-medium">The best experiences in your city</p>
              </div>
              <Link href="/events" className="text-orange-600 text-[14px] font-bold pb-1 hover:text-orange-700 transition-colors">See all</Link>
            </div>
            
            <PosterBannerCarousel events={events.slice(0, 5)} />
          </div>

          {/* Trending Section */}
          {musicEvents.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between px-6 mb-4 mt-2">
                <h2 className="text-gray-900 text-[22px] font-black tracking-tight uppercase">Trending Now</h2>
                <Link href="/events" className="text-orange-600 text-[13px] font-black uppercase tracking-widest hover:text-orange-700 transition-colors">See all</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto px-6 scroll-px-6 snap-x scrollbar-hide pb-2">
                {events.slice(0, 6).map(ev => (
                  <SectionEventCard key={ev.id} event={ev} />
                ))}
              </div>

              {/* Spotlight Banner - Cinematic Style */}
              {posterEvent && (
                <Link href={`/events/${posterEvent.id}`} className="block mx-6 mt-8 group">
                  <div className="relative h-[240px] rounded-[36px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-white/20">
                    <img src={getEventImage(posterEvent.images)} alt={posterEvent.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2.5s]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/10 to-transparent opacity-90" />
                    
                    <div className="absolute top-5 left-5">
                      <div className="bg-orange-600/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-white/20">
                        <Zap size={12} className="text-white fill-white animate-pulse" />
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Spotlight</span>
                      </div>
                    </div>

                    <div className="absolute left-6 right-6 bottom-6">
                      <h3 className="text-white text-[26px] font-black leading-[1.1] tracking-tight mb-2 drop-shadow-2xl">{posterEvent.title}</h3>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 text-white/80 font-bold text-[12px] uppercase tracking-widest">
                           <MapPin size={14} className="text-orange-500" />
                           {posterEvent.venue}
                         </div>
                         <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                         <span className="text-white/80 font-bold text-[12px] uppercase tracking-widest italic">Fast Filling</span>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6">
                       <div className="w-12 h-12 rounded-[20px] bg-white flex items-center justify-center shadow-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 active:scale-90">
                          <ArrowRight size={22} strokeWidth={3} />
                       </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* All Events Section */}
          <div className="py-10 mb-20 bg-white/60 backdrop-blur-md rounded-t-[48px] shadow-[0_-20px_60px_rgba(0,0,0,0.05)] border-t border-gray-100">
            <div className="flex items-center justify-between px-8 mb-8">
              <h2 className="text-gray-900 text-[28px] font-black tracking-tight">Explore More</h2>
              <div className="bg-orange-600 px-3.5 py-1.5 rounded-2xl shadow-lg shadow-orange-200">
                <span className="text-white text-[11px] font-black uppercase tracking-wider">{filteredEvents.length} Events</span>
              </div>
            </div>
            
            {/* Filter Pills - Premium Glass Style */}
            <div className="flex gap-3 overflow-x-auto px-8 scroll-px-8 mb-8 scrollbar-hide">
              {["Filters", "Date", "Today", "Tomorrow"].map((label, i) => (
                <button 
                  key={label} 
                  onClick={() => {
                    if (label === "Filters") setIsFilterOpen(true);
                    else if (label === "Date") setIsDateFilterOpen(true);
                    else if (label === "Today" || label === "Tomorrow") {
                      setActiveFilter(activeFilter === label ? "All" : label);
                      setSelectedDate(null);
                    }
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all shrink-0 shadow-sm ${
                    activeFilter === label || (label === "Filters" && selectedCategory !== "All") || (label === "Date" && selectedDate)
                      ? 'bg-orange-600 border-orange-500 text-white shadow-orange-300/50 shadow-xl scale-105' 
                      : 'bg-white border-gray-100 text-gray-700 hover:border-orange-200'
                  }`}
                >
                  {i === 0 && <SlidersHorizontal size={16} className={activeFilter === label || selectedCategory !== "All" ? "text-white" : "text-gray-400"} />}
                  <span className={`text-[13px] font-black ${activeFilter === label || (label === "Filters" && selectedCategory !== "All") || (label === "Date" && selectedDate) ? "text-white" : "text-gray-700"}`}>
                    {label === "Filters" && selectedCategory !== "All" ? selectedCategory : label === "Date" && selectedDate ? selectedDate : label}
                  </span>
                  {i <= 1 && <ChevronDown size={14} className={activeFilter === label || (label === "Filters" && selectedCategory !== "All") || (label === "Date" && selectedDate) ? "text-white/70" : "text-gray-300"} />}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 px-8 pb-12">
              {filteredEvents.map(ev => (
                <GridEventCard key={ev.id} event={ev} />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-[40px] bg-orange-50 flex items-center justify-center mb-6 border border-orange-100 shadow-inner">
                   <Search size={40} className="text-orange-200" />
                </div>
                <p className="text-gray-900 text-[20px] font-black tracking-tight">No events found</p>
                <p className="text-gray-500 text-[14px] font-medium mt-2 max-w-[200px] mx-auto">Try adjusting your filters or location</p>
                <button 
                  onClick={() => { setActiveFilter("All"); setQuery(""); setSelectedCategory("All"); }}
                  className="mt-8 bg-orange-100 text-orange-600 px-8 py-3 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-orange-200 transition-all shadow-md active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            )}
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
                  <img src={banner.bgImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  <div className="relative z-10 flex flex-col justify-center items-start h-full p-5 w-[85%]">
                    <h3 className="text-white text-[14px] font-bold uppercase tracking-wider leading-none mb-1 opacity-90">{banner.title}</h3>
                    <h4 className="text-white text-[28px] font-bold italic leading-[1.1] tracking-tight mb-2">{banner.subTitle}</h4>
                    <p className="text-gray-300 text-[11px] font-medium tracking-wide mb-4">{banner.meta}</p>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full active:scale-95 transition-transform">
                      <span className="text-white text-[11px] font-bold uppercase tracking-wider">{banner.ctaText}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sport Categories */}
          <div className="mb-8 px-5">
            <div className="grid grid-cols-4 gap-3">
              {FACILITY_CATEGORIES.map(cat => {
                const isMore = cat.id === "more";
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (isMore) {
                        setIsCategoryDrawerOpen(true);
                      } else {
                        // Toggle logic
                        if (selectedSportCategory?.toLowerCase() === cat.title.toLowerCase()) {
                          setSelectedSportCategory(null);
                        } else {
                          setSelectedSportCategory(cat.title);
                        }
                      }
                    }}
                    className={`group flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      !isMore && selectedSportCategory?.toLowerCase() === cat.title.toLowerCase() ? 'scale-105' : ''
                    }`}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-full aspect-square rounded-[22px] overflow-hidden flex items-center justify-center p-2.5 transition-all duration-300 ${
                        !isMore && selectedSportCategory?.toLowerCase() === cat.title.toLowerCase() 
                        ? 'border-2 border-[#00A63E] bg-emerald-50 shadow-sm' 
                        : 'bg-white border border-gray-100 shadow-sm hover:border-gray-300'
                      }`}
                    >
                      {/* Subtle glow behind the icon */}
                      <div 
                        className="absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20 rounded-[22px]"
                        style={{ background: cat.color }}
                      />
                      
                      {/* Render the inline SVG icon */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-sm text-gray-800">
                        {cat.icon("w-7 h-7")}
                      </div>
                    </motion.div>
                    <span className="text-gray-900 text-[11px] font-bold tracking-tight text-center">{cat.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Live Matches Section */}
          {liveMatches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between px-5 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-[#00A63E] text-[20px] font-bold tracking-tight">Live Matches</h2>
                  <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">LIVE</div>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto px-5 scroll-px-5 snap-x scrollbar-hide pb-2">
                {liveMatches.map(match => (
                  <LiveMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}
          {/* Popular Facilities */}
          <div className="mb-8">
            <div className="flex items-center justify-between px-5 mb-4">
              <h2 className="text-[#00A63E] text-[20px] font-bold tracking-tight">
                {selectedSportCategory ? `${selectedSportCategory} Facilities` : "Popular Facilities"}
              </h2>
              <Link href="/gamehub" className="text-[#00A63E] text-[14px] font-bold">See all</Link>
            </div>
            {filteredFacilities.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto px-5 scroll-px-5 snap-x scrollbar-hide">
                {filteredFacilities.map(f => (
                  <FacilityCard key={f.id} facility={f} />
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center bg-emerald-50/50 mx-5 rounded-[24px] border border-dashed border-emerald-200">
                <Search size={32} className="mx-auto text-emerald-200 mb-2" />
                <p className="text-emerald-800 font-bold text-sm">No {selectedSportCategory} facilities found nearby</p>
                <button 
                  onClick={() => setSelectedSportCategory(null)}
                  className="mt-2 text-[#00A63E] font-bold text-xs uppercase tracking-wider underline underline-offset-4"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>

          {/* Host a Match Banner - Pro Design */}
          <div className="mx-6 mb-10 group cursor-pointer">
            <div className="relative rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-emerald-100 bg-[#0a0a0a]">
              {/* Abstract decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 p-8 flex flex-col items-start">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                  <span className="text-emerald-500 text-[11px] font-black tracking-[0.2em] uppercase">Community Match</span>
                </div>
                
                <h3 className="text-white text-[24px] font-black leading-tight tracking-tight mb-2">Short on Players?</h3>
                <p className="text-gray-400 text-[14px] font-medium mb-8 max-w-[240px] leading-relaxed">Host a match and invite the local community to join your game instantly.</p>
                
                <div className="flex items-center gap-4 w-full">
                  <button className="flex-1 bg-emerald-600 text-white h-14 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-500 shadow-xl shadow-emerald-900/20">
                    <span className="text-[15px] font-black uppercase tracking-widest">Host Match</span>
                    <ArrowRight size={20} strokeWidth={3} />
                  </button>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                     <MessageSquare size={22} />
                  </div>
                </div>
              </div>

              {/* Subtle mesh background detail */}
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Trophy size={120} className="text-white rotate-12" />
              </div>
            </div>
          </div>

          {/* Featured Facility Banner */}
          {filteredFacilities.length > 0 && (
            <Link href="/gamehub" className="block mx-5 mb-8 group">
              <div className="relative h-[200px] rounded-[28px] overflow-hidden shadow-lg">
                <img src={filteredFacilities[0].image} alt={filteredFacilities[0].name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span className="text-white text-[10px] font-bold tracking-wider uppercase">Featured Venue</span>
                  </div>
                </div>

                <div className="absolute left-4 right-4 bottom-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-[20px]">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-white text-[20px] font-bold tracking-tight leading-tight">{filteredFacilities[0].name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin size={12} className="text-gray-300" />
                          <p className="text-gray-300 text-[13px] font-medium">{filteredFacilities[0].location}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                        <ArrowRight size={18} className="text-[#00A63E]" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </>
      )}
      {/* ═══ LOCATION DRAWER ═══ */}
      <AnimatePresence>
        {isLocationOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocationOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[1001] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">Change Location</h3>
                  <p className="text-[13px] text-gray-500 font-medium mt-0.5">Select a city to see events near you</p>
                </div>
                <button 
                  onClick={() => setIsLocationOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 focus:border-orange-500 rounded-2xl pl-12 pr-4 py-3.5 text-[15px] font-medium outline-none transition-all"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex-1 overflow-y-auto px-4 pb-10">
                {/* Detect My Location */}
                <button
                  onClick={async () => {
                    await detectLocation();
                    setIsLocationOpen(false);
                  }}
                  disabled={isDetecting}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-orange-50 active:bg-orange-100 transition-colors group mb-2 disabled:opacity-70"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
                    {isDetecting ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Navigation size={22} fill="currentColor" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-orange-600 uppercase tracking-wide">
                      {isDetecting ? "Detecting..." : "Detect my location"}
                    </p>
                    <p className="text-[12px] text-gray-500 font-medium">Using GPS Device</p>
                  </div>
                </button>

                <div className="h-px bg-gray-100 my-4 mx-2" />

                {/* City List */}
                <div className="space-y-1">
                  {LOCATIONS.filter(loc => loc.city.toLowerCase().includes(locationSearch.toLowerCase())).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationOpen(false);
                        setLocationSearch("");
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        selectedLocation.id === loc.id ? 'bg-orange-50' : 'active:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedLocation.id === loc.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <MapPin size={20} />
                        </div>
                        <div className="text-left">
                          <p className={`text-[15px] font-bold ${
                            selectedLocation.id === loc.id ? 'text-orange-900' : 'text-gray-900'
                          }`}>{loc.city}</p>
                          <p className="text-[12px] text-gray-500 font-medium">{loc.detail}</p>
                        </div>
                      </div>
                      {selectedLocation.id === loc.id && (
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                  
                  {LOCATIONS.filter(loc => loc.city.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                    <div className="py-10 text-center">
                      <Search size={40} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-500 font-bold">No cities found matching &quot;{locationSearch}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ FILTERS DRAWER ═══ */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[1001] p-6 pb-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">Filters</h3>
                <button onClick={() => { setSelectedCategory("All"); setIsFilterOpen(false); }} className="text-orange-600 text-[14px] font-bold">Reset</button>
              </div>
              <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["All", "Music", "Comedy", "Workshops", "Arts", "Sports", "Festivals"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                    className={`px-4 py-2 rounded-xl border text-[14px] font-bold transition-all ${
                      selectedCategory === cat ? 'bg-[#D53F17] border-orange-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
                <button onClick={() => setIsFilterOpen(false)} className={`w-full ${isGameHub ? 'bg-emerald-600' : 'bg-[#D53F17]'} text-white py-4 rounded-2xl font-bold text-[16px]`}>Apply Filters</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ DATE DRAWER ═══ */}
      <AnimatePresence>
        {isDateFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDateFilterOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[1001] p-6 pb-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">Select Date</h3>
                <button onClick={() => { setSelectedDate(null); setIsDateFilterOpen(false); }} className="text-orange-600 text-[14px] font-bold">Reset</button>
              </div>
              <div className="space-y-2 mb-8">
                {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                  const d = new Date(Date.now() + offset * 86400000);
                  const dateStr = d.toISOString().split('T')[0];
                  const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <button
                      key={dateStr}
                      onClick={() => { setSelectedDate(dateStr); setActiveFilter("All"); setIsDateFilterOpen(false); }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border font-bold text-[15px] transition-all ${
                        selectedDate === dateStr ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-gray-50 border-gray-50 text-gray-900'
                      }`}
                    >
                      <span>{label}</span>
                      {selectedDate === dateStr && <Check size={18} className="text-orange-600" />}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setIsDateFilterOpen(false)} className={`w-full ${isGameHub ? 'bg-emerald-600' : 'bg-[#D53F17]'} text-white py-4 rounded-2xl font-bold text-[16px]`}>Done</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* ═══ ALL SPORTS CATEGORIES DRAWER ═══ */}
      <AnimatePresence>
        {isCategoryDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[1001] max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">All Sports</h3>
                  <p className="text-[13px] text-gray-500 font-medium mt-0.5">Explore activities in your area</p>
                </div>
                <button 
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-6">
                  {ALL_SPORTS.map(sport => (
                    <button
                      key={sport.id}
                      onClick={() => {
                        setIsCategoryDrawerOpen(false);
                        if (selectedSportCategory?.toLowerCase() === sport.title.toLowerCase()) {
                          setSelectedSportCategory(null);
                        } else {
                          setSelectedSportCategory(sport.title);
                        }
                      }}
                      className={`flex flex-col items-center gap-3 group transition-all ${
                        selectedSportCategory?.toLowerCase() === sport.title.toLowerCase() ? 'scale-105' : ''
                      }`}
                    >
                      <div 
                        className={`w-full aspect-square rounded-3xl flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-105 ${
                          selectedSportCategory?.toLowerCase() === sport.title.toLowerCase() 
                          ? 'border-[3px]' 
                          : 'border-[1.5px]'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${sport.color}10, ${sport.color}20)`,
                          borderColor: selectedSportCategory?.toLowerCase() === sport.title.toLowerCase() 
                            ? sport.color 
                            : `${sport.color}30`
                        }}
                      >
                        <div className="relative z-10 text-gray-800 transition-transform duration-300 group-hover:scale-110">
                          {sport.icon("w-8 h-8")}
                        </div>
                      </div>
                      <span className="text-gray-900 text-[13px] font-bold tracking-tight text-center">{sport.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6 pt-2 bg-gradient-to-t from-white via-white to-transparent">
                <button 
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-[16px] shadow-lg active:scale-[0.98] transition-transform"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
