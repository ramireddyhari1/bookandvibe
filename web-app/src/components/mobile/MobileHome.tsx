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
    color: "#F97316",
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

function HeroPosterCard({ event }: { event: Event }) {
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
              backgroundColor: i === activeIndex ? "#F97316" : "#D1D5DB"
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

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Link href={`/gamehub/${facility.id}`} className="block shrink-0 w-[60vw] max-w-[220px] snap-start group">
      <div className="w-full">
        <div className="relative w-full aspect-[4/5] max-h-[280px] rounded-[24px] overflow-hidden bg-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)] group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all duration-300">
          <img src={facility.image} alt={facility.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60" />
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 flex items-baseline gap-[2px] shadow-sm">
            <span className="text-white text-[11px] font-extrabold tracking-tight">₹</span>
            <span className="text-white text-[14px] font-black tracking-tight">{facility.pricePerHour}</span>
            <span className="text-white/80 text-[10px] font-bold">/hr</span>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
             <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1">
               <Star size={10} className="text-yellow-400 fill-yellow-400" />
               <span className="text-white text-[11px] font-bold">{facility.rating}</span>
             </div>
             <span className="bg-[#00A63E] px-2 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-wider">{facility.type}</span>
          </div>
        </div>
        <div className="mt-3 px-1">
          <h4 className="text-gray-900 text-[17px] font-black tracking-tight truncate">{facility.name}</h4>
          <div className="flex items-center gap-1.5 mt-1 text-gray-500">
            <MapPin size={12} />
            <p className="text-[13px] font-medium truncate">{facility.location}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LogoLoader({ isGameHub }: { isGameHub: boolean }) {
  const finalLogo = isGameHub ? "/bv-green.png" : "/bv-orange.png";
  const personImage = isGameHub ? "/game_virat_green.png" : "/vibe_artist_orange.png";
  const primaryColor = isGameHub ? "#00A63E" : "#F97316"; 
  const bgColor = isGameHub ? "radial-gradient(circle at center, #F0FDF4 0%, #FFFFFF 100%)" : "radial-gradient(circle at center, #fff7ed 0%, #ffffff 100%)";

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden" style={{ background: bgColor }}>
      
      {/* Ambient Glow */}
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{ backgroundColor: primaryColor, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The Loader Container - Perfect Circle Avatar Style */}
      <div 
        className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl z-10 flex items-center justify-center"
        style={{ border: `4px solid ${primaryColor}40`, backgroundColor: "#f8fafc" }}
      >
        
        {/* Layer 1: Contextual Image */}
        <motion.div 
          className="absolute inset-0"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        >
          <img src={personImage} alt="Context" className="w-full h-full object-cover" />
        </motion.div>

        {/* Layer 2: The Burst Wipe (White Canvas) */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-white z-10"
          animate={{
            scale: [0, 0, 18, 18, 0, 0]
          }}
          transition={{
            duration: 2.2,
            ease: "easeInOut",
            repeat: Infinity,
            times: [0, 0.3, 0.45, 0.8, 0.95, 1]
          }}
        />

        {/* Layer 3: Final Brand Logo Pop */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center p-5"
          animate={{
            opacity: [0, 0, 1, 1, 0, 0],
            scale: [0, 0, 1.1, 1, 0, 0]
          }}
          transition={{
            duration: 2.2,
            ease: "backOut", // Bouncy spring pop
            repeat: Infinity,
            times: [0, 0.35, 0.45, 0.8, 0.9, 1]
          }}
        >
          <img src={finalLogo} alt="Logo" className="w-full h-full object-contain" />
        </motion.div>

      </div>
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
      <div className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-1">
        {isGameHub ? (
          /* GameHub Header - Refined Premium */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Image 
                src="/bv-green.png" 
                alt="Book & Vibe" 
                width={240} 
                height={96} 
                className="h-24 w-auto object-contain"
                priority
              />
              <div className="h-8 w-[1.5px] bg-emerald-200/50 rounded-full" />
              <div 
                className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                onClick={() => setIsLocationOpen(true)}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#00A63E]/60 uppercase tracking-widest leading-none mb-0.5">CITY</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900 text-[15px] font-black tracking-tight">{selectedLocation.city}</span>
                    <ChevronDown size={14} className="text-[#00A63E]" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 relative">
                <Bell size={20} className="text-[#00A63E]" strokeWidth={2.5} />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#00A63E] border-2 border-white" />
              </div>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-[#00A63E] flex items-center justify-center border-2 border-emerald-200 shadow-sm">
                <span className="text-white text-[16px] font-black uppercase">{user?.name?.charAt(0) || "U"}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Events Header - Refined Premium */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Image 
                src="/bv-orange.png" 
                alt="Book & Vibe" 
                width={240} 
                height={96} 
                className="h-24 w-auto object-contain"
                priority
              />
              <div className="h-8 w-[1.5px] bg-orange-200/50 rounded-full" />
              <div 
                className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                onClick={() => setIsLocationOpen(true)}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-orange-500/60 uppercase tracking-widest leading-none mb-0.5">CITY</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900 text-[15px] font-black tracking-tight">{selectedLocation.city}</span>
                    <ChevronDown size={14} className="text-orange-300" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 relative">
                <Bell size={20} className="text-orange-600" strokeWidth={2.5} />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white" />
              </div>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center border-2 border-orange-200 shadow-sm">
                <span className="text-white text-[16px] font-black uppercase">{user?.name?.charAt(0) || "U"}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ═══ SEARCH BAR ═══ */}
      <div className="px-5 mb-3">
        <div className="rounded-[16px] p-[1px] shadow-sm border border-gray-100" style={{
          background: isGameHub ? "rgba(0,166,62,0.12)" : "rgba(249, 115, 22, 0.12)"
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
                : "linear-gradient(90deg, #00A63E, #059669)",
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
                <Link href="/events" className="text-[#00A63E] text-[14px] font-bold">See all</Link>
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
                <button 
                  key={label} 
                  onClick={() => {
                    if (label === "Filters") setIsFilterOpen(true);
                    else if (label === "Date") setIsDateFilterOpen(true);
                    else if (label === "Today" || label === "Tomorrow") {
                      setActiveFilter(activeFilter === label ? "All" : label);
                      setSelectedDate(null); // Reset specific date if Today/Tomorrow is clicked
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all shrink-0 shadow-sm ${
                    activeFilter === label || (label === "Filters" && selectedCategory !== "All") || (label === "Date" && selectedDate)
                      ? 'bg-orange-600 border-orange-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {i === 0 && <SlidersHorizontal size={14} className={activeFilter === label || selectedCategory !== "All" ? "text-white" : "text-gray-500"} />}
                  <span className={`text-[13px] font-bold ${activeFilter === label || (label === "Filters" && selectedCategory !== "All") || (label === "Date" && selectedDate) ? "text-white" : "text-gray-700"}`}>
                    {label === "Filters" && selectedCategory !== "All" ? selectedCategory : label === "Date" && selectedDate ? selectedDate : label}
                  </span>
                  {i <= 1 && <ChevronDown size={14} className={activeFilter === label || (label === "Filters" && selectedCategory !== "All") || (label === "Date" && selectedDate) ? "text-white/70" : "text-gray-400"} />}
                </button>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-3.5">
              {filteredEvents.map(ev => (
                <GridEventCard key={ev.id} event={ev} />
              ))}
            </div>
            {filteredEvents.length === 0 && (
              <div className="py-20 text-center">
                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-bold">No events found</p>
                <button 
                  onClick={() => { setActiveFilter("All"); setQuery(""); }}
                  className="mt-2 text-orange-600 font-bold text-sm"
                >
                  Clear all filters
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
                    <h3 className="text-white text-[14px] font-black uppercase tracking-widest leading-none mb-1 opacity-90">{banner.title}</h3>
                    <h4 className="text-white text-[28px] font-black italic leading-[1.1] tracking-tight mb-2">{banner.subTitle}</h4>
                    <p className="text-gray-300 text-[11px] font-medium tracking-wide mb-4">{banner.meta}</p>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full active:scale-95 transition-transform">
                      <span className="text-white text-[11px] font-black uppercase tracking-wider">{banner.ctaText}</span>
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
                        ? 'border-[3px] border-[#00A63E] ring-4 ring-[#00A63E]/10 shadow-lg' 
                        : 'border border-white/80'
                      }`}
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.65))",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: !isMore && selectedSportCategory?.toLowerCase() === cat.title.toLowerCase() 
                          ? `0 12px 30px -4px ${cat.color}40` 
                          : `0 8px 24px -6px ${cat.color}25, inset 0 2px 4px rgba(255,255,255,0.7)`
                      }}
                    >
                      {/* Subtle glow behind the icon */}
                      <div 
                        className="absolute inset-0 opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-40"
                        style={{ background: cat.color }}
                      />
                      
                      {/* Render the inline SVG icon */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-sm text-gray-800">
                        {cat.icon("w-7 h-7")}
                      </div>
                    </motion.div>
                    <span className="text-gray-900 text-[11px] font-black tracking-tight text-center">{cat.title}</span>
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
                  <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">LIVE</div>
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

          {/* Host a Match Banner */}
          <div className="mx-5 mb-8 rounded-[28px] overflow-hidden shadow-xl">
            <div className="bg-gray-900 p-6 relative overflow-hidden flex items-center">
              {/* Decorative Mesh Background */}
              <div className="absolute top-[-50%] right-[-20%] w-[150%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00A63E]/30 via-gray-900/0 to-transparent blur-2xl" />
              <div className="absolute bottom-[-50%] left-[-20%] w-[100%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-gray-900/0 to-transparent blur-2xl" />
              
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A63E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A63E]"></span>
                  </span>
                  <span className="text-[#00A63E] text-[10px] font-black tracking-widest uppercase">Community</span>
                </div>
                <h3 className="text-white text-[22px] font-black leading-tight tracking-tight mb-1">Can&apos;t find a game?</h3>
                <p className="text-gray-400 text-[13px] font-medium mb-5 max-w-[80%]">Host a match and invite players nearby to join the action.</p>
                <button className="bg-[#00A63E] text-white px-5 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-transform shadow-[0_4px_20px_rgba(0,166,62,0.4)]">
                  <span className="text-[13px] font-black tracking-wide">HOST A MATCH</span>
                  <ArrowRight size={14} strokeWidth={3} />
                </button>
              </div>
              <Trophy size={80} className="absolute right-[-10px] bottom-[-10px] text-white/5 rotate-12" strokeWidth={1.5} />
            </div>
          </div>

          {/* Featured Facility Banner */}
          {filteredFacilities.length > 0 && (
            <Link href="/gamehub" className="block mx-5 mb-8 group">
              <div className="relative h-[200px] rounded-[28px] overflow-hidden shadow-lg">
                <img src={filteredFacilities[0].image} alt={filteredFacilities[0].name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={12} className="text-yellow-400" />
                    <span className="text-white text-[10px] font-black tracking-widest uppercase">Featured Venue</span>
                  </div>
                </div>

                <div className="absolute left-4 right-4 bottom-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-[20px]">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-white text-[20px] font-black tracking-tight leading-tight">{filteredFacilities[0].name}</h3>
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
                  <h3 className="text-[20px] font-black text-gray-900 tracking-tight">Change Location</h3>
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
                    <p className="text-[15px] font-black text-orange-600 uppercase tracking-wide">
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
                <h3 className="text-[20px] font-black text-gray-900 tracking-tight">Filters</h3>
                <button onClick={() => { setSelectedCategory("All"); setIsFilterOpen(false); }} className="text-orange-600 text-[14px] font-bold">Reset</button>
              </div>
              <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["All", "Music", "Comedy", "Workshops", "Arts", "Sports", "Festivals"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                    className={`px-4 py-2 rounded-xl border text-[14px] font-bold transition-all ${
                      selectedCategory === cat ? 'bg-orange-600 border-orange-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsFilterOpen(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-[16px]">Apply Filters</button>
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
                <h3 className="text-[20px] font-black text-gray-900 tracking-tight">Select Date</h3>
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
              <button onClick={() => setIsDateFilterOpen(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-[16px]">Done</button>
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
                  <h3 className="text-[20px] font-black text-gray-900 tracking-tight">All Sports</h3>
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
                      <span className="text-gray-900 text-[13px] font-black tracking-tight text-center">{sport.title}</span>
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
