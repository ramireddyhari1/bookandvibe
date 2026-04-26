"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Play, Frown, Music, Zap, ArrowRight, Ticket } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { fetchApi } from "@/lib/api";
import MobileHome from "@/components/mobile/MobileHome";

export default function Home() {
  const [events, setEvents] = useState<{ id: string; location?: string; venue?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [websiteConfig, setWebsiteConfig] = useState<{ banners?: { id: string; buttonLink?: string; buttonText?: string }[] } | null>(null);
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

  const eventBanner = websiteConfig?.banners?.find((b: { id: string }) => b.id === "event-banner") || {
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074",
    title: "THE VIBE.",
    subtitle: "Discover concerts, events & experiences near you",
    buttonText: "Explore Events",
    buttonLink: "/events"
  };

  const gamehubBanner = websiteConfig?.banners?.find((b: { id: string }) => b.id === "gamehub-banner") || {
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
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover/pane:opacity-100 transition-opacity duration-700"
            />
            {/* Bottom Gradient Overlay for Button Visibility */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end items-center p-16 lg:p-24 z-10 transition-transform duration-700 ease-out group-hover/pane:-translate-y-2">
              
              {/* Typography Block */}
              <div className="absolute top-[40%] md:top-[45%] -translate-y-1/2 right-6 md:right-32 xl:right-40 flex flex-col items-end pointer-events-none">
                <div className="flex items-center gap-2 text-[#ff4b4b] font-semibold tracking-wider text-[11px] md:text-[13px] uppercase mb-[-12px] md:mb-[-15px] z-10">
                  <Music size={16} strokeWidth={2.5} /> LIVE EVENTS & CONCERTS
                </div>
                <h2 className="text-[50px] md:text-[75px] xl:text-[95px] font-bold text-white/[0.08] uppercase tracking-tighter leading-none whitespace-nowrap select-none">
                  THE VIBE.
                </h2>
              </div>

              <Link href={eventBanner.buttonLink || "/events"} className="absolute bottom-10 left-8 md:bottom-16 md:left-16 z-20 group/btn inline-flex items-center gap-4 bg-[#0a0a0a]/60 border border-white/15 text-white pl-8 pr-2 py-2 rounded-full font-semibold text-[13px] md:text-[15px] tracking-wider uppercase transition-all duration-300 hover:bg-orange-500/90 hover:border-orange-400 shadow-lg">
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
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover/pane:opacity-100 transition-opacity duration-700"
            />
            {/* Bottom Gradient Overlay for Button Visibility */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end items-center p-16 lg:p-24 z-10 transition-transform duration-700 ease-out group-hover/pane:-translate-y-2">
              
              {/* Typography Block */}
              <div className="absolute top-[40%] md:top-[45%] -translate-y-1/2 left-6 md:left-32 xl:left-40 flex flex-col items-start pointer-events-none">
                <div className="flex items-center gap-2 text-[#42B460] font-semibold tracking-wider text-[11px] md:text-[13px] uppercase mb-[-12px] md:mb-[-15px] z-10">
                  PREMIUM COURTS <Zap size={16} strokeWidth={2.5} />
                </div>
                <h2 className="text-[50px] md:text-[75px] xl:text-[95px] font-bold text-white/[0.08] uppercase tracking-tighter leading-none whitespace-nowrap select-none">
                  THE GAME.
                </h2>
              </div>

              <Link href={gamehubBanner.buttonLink || "/gamehub"} className="absolute bottom-10 right-8 md:bottom-16 md:right-16 z-20 group/btn inline-flex items-center gap-4 bg-[#0a0a0a]/60 border border-white/15 text-white pl-8 pr-2 py-2 rounded-full font-semibold text-[13px] md:text-[15px] tracking-wider uppercase transition-all duration-300 hover:bg-[#42B460]/90 hover:border-[#42B460] shadow-lg">
                {gamehubBanner.buttonText}
                <div className="bg-white text-black rounded-full p-3 md:p-4 group-hover/btn:bg-white group-hover/btn:scale-105 transition-all duration-300">
                  <ArrowRight size={20} strokeWidth={2.5} className="group-hover/btn:-rotate-45 transition-transform duration-500" />
                </div>
              </Link>
            </div>
          </div>

          {/* Central Logo Overlay */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center">
            <div className="relative flex items-center justify-center p-6 mb-8">
              <img src="/bv-white.png" alt="BV Logo" className="w-[180px] md:w-[220px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
            </div>

            <div className="flex flex-col items-center px-4">
              <h3 className="text-white font-bold text-2xl md:text-[32px] tracking-tight mb-3 drop-shadow-xl text-center">
                Refined Entertainment. Premium Sports.
              </h3>
              
              <p className="text-white/50 text-[12px] md:text-[14px] font-semibold tracking-[0.2em] leading-relaxed text-center uppercase max-w-md">
                ELEVATING YOUR LOCAL EXPERIENCES
              </p>

              <div className="mt-12 flex items-center justify-center gap-6 w-full opacity-60">
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-white/40"></div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-white/60 tracking-[0.3em] font-bold uppercase">LIVE</span>
                  <span className="text-[10px] text-white/60 tracking-[0.3em] font-bold uppercase">PLAY</span>
                  <span className="text-[10px] text-white/60 tracking-[0.3em] font-bold uppercase">VIBE</span>
                </div>
                <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-white/40"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
