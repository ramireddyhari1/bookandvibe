"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Play, Frown, Music, Zap, ArrowRight, Ticket } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { fetchApi } from "@/lib/api";
import MobileHome from "@/components/mobile/MobileHome";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [websiteConfig, setWebsiteConfig] = useState<any>(null);
  const { selectedLocation } = useLocation();

  const filteredEvents = events.filter((e) => {
    if (!e.location && !e.venue) return false;
    const locString = `${e.location} ${e.venue}`.toLowerCase();
    return locString.includes(selectedLocation.city.toLowerCase());
  });

  useEffect(() => {
    fetchApi("/events")
      .then(data => {
        const backendEvents = data.data && Array.isArray(data.data) ? data.data : [];
        setEvents(backendEvents);
      })
      .catch(err => {
        console.error(err);
        setEvents([]);
      })
      .finally(() => setLoading(false));

    fetchApi("/config/website")
      .then(res => {
        if (res.data) setWebsiteConfig(res.data);
      })
      .catch(console.error);
  }, []);

  const eventBanner = websiteConfig?.banners?.find((b: any) => b.id === "event-banner") || {
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074",
    title: "THE VIBE.",
    subtitle: "Discover concerts, events & experiences near you",
    buttonText: "Explore Events",
    buttonLink: "/events"
  };

  const gamehubBanner = websiteConfig?.banners?.find((b: any) => b.id === "gamehub-banner") || {
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000",
    title: "THE GAME.",
    subtitle: "Book turfs, play matches & compete locally",
    buttonText: "Explore GameHub",
    buttonLink: "/gamehub"
  };

  return (
    <>
      {/* Mobile View - Matches native mobile app design */}
      <div className="md:hidden">
        <MobileHome />
      </div>

      {/* Desktop View - Structured Corporate/Premium Design */}
      <div className="hidden md:block h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">

        {/* Crisp Split Hero Section */}
        <div className="relative w-full h-full pt-[80px] flex">
          
          {/* Left Pane - The Vibe (Events) */}
          <div className="relative flex-1 h-full overflow-hidden group/pane border-r border-white/5 bg-[#0a0a0a]">
            {/* Elegant Background Image */}
            <img
              src="/events.png"
              alt="Concerts"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/pane:scale-[1.02] group-hover/pane:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
            />
            {/* Bottom Gradient Overlay for Button Visibility */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end items-center p-16 lg:p-24 z-10 transition-transform duration-700 ease-out group-hover/pane:-translate-y-2">
              
              {/* Typography Block */}
              <div className="absolute top-[40%] md:top-[45%] -translate-y-1/2 right-6 md:right-32 xl:right-40 flex flex-col items-end pointer-events-none">
                <div className="flex items-center gap-2 text-[#ff4b4b] font-bold tracking-[0.2em] text-[11px] md:text-[14px] uppercase mb-[-12px] md:mb-[-15px] z-10">
                  <Music size={18} strokeWidth={2.5} /> LIVE EVENTS & CONCERTS
                </div>
                <h2 className="text-[50px] md:text-[75px] xl:text-[95px] font-black text-white/[0.12] uppercase tracking-tighter leading-none whitespace-nowrap select-none transition-transform duration-700 group-hover/pane:scale-[1.03] origin-right">
                  THE VIBE.
                </h2>
              </div>

              <Link href={eventBanner.buttonLink || "/events"} className="absolute bottom-10 left-8 md:bottom-16 md:left-16 z-20 group/btn inline-flex items-center gap-4 bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 text-white pl-8 pr-2 py-2 rounded-full font-bold text-[13px] md:text-[15px] tracking-widest uppercase transition-all duration-500 hover:bg-orange-500/90 hover:border-orange-400 shadow-2xl hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                {eventBanner.buttonText}
                <div className="bg-white text-black rounded-full p-3 md:p-4 group-hover/btn:bg-white group-hover/btn:scale-105 transition-all duration-300">
                  <ArrowRight size={20} strokeWidth={2.5} className="group-hover/btn:-rotate-45 transition-transform duration-500" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Pane - The Game (GameHub) */}
          <div className="relative flex-1 h-full overflow-hidden group/pane bg-[#0a0a0a]">
            {/* Elegant Background Image */}
            <img
              src="/gamehub.png"
              alt="Sports"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/pane:scale-[1.02] group-hover/pane:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
            />
            {/* Bottom Gradient Overlay for Button Visibility */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end items-center p-16 lg:p-24 z-10 transition-transform duration-700 ease-out group-hover/pane:-translate-y-2">
              
              {/* Typography Block */}
              <div className="absolute top-[40%] md:top-[45%] -translate-y-1/2 left-6 md:left-32 xl:left-40 flex flex-col items-start pointer-events-none">
                <div className="flex items-center gap-2 text-[#42B460] font-bold tracking-[0.2em] text-[11px] md:text-[14px] uppercase mb-[-12px] md:mb-[-15px] z-10">
                  PREMIUM COURTS <Zap size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-[50px] md:text-[75px] xl:text-[95px] font-black text-white/[0.12] uppercase tracking-tighter leading-none whitespace-nowrap select-none transition-transform duration-700 group-hover/pane:scale-[1.03] origin-left">
                  THE GAME.
                </h2>
              </div>

              <Link href={gamehubBanner.buttonLink || "/gamehub"} className="absolute bottom-10 right-8 md:bottom-16 md:right-16 z-20 group/btn inline-flex items-center gap-4 bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 text-white pl-8 pr-2 py-2 rounded-full font-bold text-[13px] md:text-[15px] tracking-widest uppercase transition-all duration-500 hover:bg-[#42B460]/90 hover:border-[#42B460] shadow-2xl hover:shadow-[0_0_40px_rgba(66,180,96,0.4)]">
                {gamehubBanner.buttonText}
                <div className="bg-white text-black rounded-full p-3 md:p-4 group-hover/btn:bg-white group-hover/btn:scale-105 transition-all duration-300">
                  <ArrowRight size={20} strokeWidth={2.5} className="group-hover/btn:-rotate-45 transition-transform duration-500" />
                </div>
              </Link>
            </div>
          </div>

          {/* Floating Central Elements */}
          <div className="absolute top-[calc(50%+40px)] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center">
            
            <div className="relative flex items-center justify-center w-[200px] h-[140px] md:w-[240px] md:h-[168px] drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              {/* Vintage Plaque SVG Background */}
              <svg 
                className="absolute inset-0 w-full h-full z-0 overflow-visible" 
                viewBox="0 0 200 140" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                   <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#42B460" />
                     <stop offset="100%" stopColor="#f97316" />
                   </linearGradient>
                </defs>
                {/* Black semi-transparent base */}
                <path d="M 14 4 L 186 4 Q 196 4 196 14 L 196 50 A 20 20 0 0 0 196 90 L 196 126 Q 196 136 186 136 L 14 136 Q 4 136 4 126 L 4 90 A 20 20 0 0 0 4 50 L 4 14 Q 4 4 14 4 Z" 
                      fill="#0a0a0a" fillOpacity="0.8" />
                {/* Colored Gradient overlay for contrast */}
                <path d="M 14 4 L 186 4 Q 196 4 196 14 L 196 50 A 20 20 0 0 0 196 90 L 196 126 Q 196 136 186 136 L 14 136 Q 4 136 4 126 L 4 90 A 20 20 0 0 0 4 50 L 4 14 Q 4 4 14 4 Z" 
                      fill="url(#badgeGradient)" fillOpacity="0.5" style={{ mixBlendMode: 'overlay' }} />
                {/* Solid white border */}
                <path d="M 14 4 L 186 4 Q 196 4 196 14 L 196 50 A 20 20 0 0 0 196 90 L 196 126 Q 196 136 186 136 L 14 136 Q 4 136 4 126 L 4 90 A 20 20 0 0 0 4 50 L 4 14 Q 4 4 14 4 Z" 
                      stroke="white" strokeWidth="4" />
                
                {/* Perforated Split Line inside the ticket */}
                <line x1="100" y1="6" x2="100" y2="134" stroke="white" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" strokeLinecap="round" />
              </svg>
              
              <img src="/bv-white.png" alt="BV Logo" className="relative z-10 w-[45%] md:w-[50%] h-auto object-contain drop-shadow-2xl" />
            </div>

            {/* Trust & Vibe Block */}
            <div className="absolute top-[100%] pt-8 w-[320px] md:w-[450px] flex flex-col items-center pointer-events-auto">
              {/* Stars for instant visual trust */}
              <div className="flex items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-orange-500 drop-shadow-[0_2px_5px_rgba(249,115,22,0.6)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Emotional/Editorial Tagline */}
              <h3 className="text-white/95 font-black text-xl md:text-[26px] tracking-tight mb-2 drop-shadow-2xl text-center">
                Where Passion Meets Play.
              </h3>
              
              <p className="text-white/70 text-[11px] md:text-[13px] font-bold tracking-[0.25em] leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] text-center uppercase">
                The Elite Destination For <br className="hidden md:block" /> Live Entertainment &amp; Premium Sports
              </p>

              {/* Trust Badge / Divider */}
              <div className="mt-6 flex items-center justify-center gap-4 w-full opacity-80 hover:opacity-100 transition-opacity duration-300">
                <div className="h-[1px] w-12 md:w-16 bg-gradient-to-r from-transparent to-white/30"></div>
                <span className="text-[10px] md:text-[11px] text-white/50 tracking-[0.3em] font-bold uppercase drop-shadow-md whitespace-nowrap">
                  LIVE LOUD <span className="mx-1 opacity-50">•</span> PLAY HARD
                </span>
                <div className="h-[1px] w-12 md:w-16 bg-gradient-to-l from-transparent to-white/30"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
