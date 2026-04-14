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
  }, []);

  return (
    <>
      {/* Mobile View - Matches native mobile app design */}
      <div className="md:hidden">
        <MobileHome />
      </div>

      {/* Desktop View - Completely unchanged */}
      <div className="hidden md:block h-screen w-full overflow-hidden bg-[#0f1115] text-[#1c222b] font-sans">

        {/* Equal Split Hero Section */}
        <div className="relative w-full h-screen min-h-[700px] flex flex-col md:flex-row pt-[80px]">
          {/* Left Pane - The Vibe (Events) */}
          <div className="relative flex-1 hover:flex-[1.15] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full overflow-hidden group/pane border-b md:border-b-0 md:border-r border-[#1c222b]/20 bg-[#0f1115]">
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074"
              alt="Concerts"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/pane:scale-[1.03] transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/50 to-transparent md:bg-gradient-to-r md:from-[#0f1115] md:via-[#0f1115]/80 md:to-transparent" />

            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/20 rounded-full blur-[100px] opacity-70 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 md:items-start md:text-left md:p-16 lg:p-24 transition-transform duration-1000 group-hover/pane:-translate-y-2">
              <div className="flex items-center gap-2 mb-4 text-rose-400">
                <Music size={24} />
                <span className="font-bold tracking-widest uppercase text-xs md:text-sm">Live Events & Concerts</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-[100px] font-black text-white tracking-tighter leading-none mb-4">
                THE VIBE.
              </h2>
              <p className="text-lg md:text-xl text-rose-100/80 font-medium mb-8 max-w-md">
                Discover concerts, events & experiences near you
              </p>
              <Link href="/events" className="group/btn flex items-center justify-center gap-3 w-fit bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_8px_25px_rgba(244,63,94,0.4)] hover:shadow-[0_12px_35px_rgba(244,63,94,0.6)] hover:scale-[1.02] mt-4 md:mt-6">
                Explore Events <ArrowRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Pane - The Game (GameHub) */}
          <div className="relative flex-1 hover:flex-[1.15] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full overflow-hidden group/pane bg-[#0f1115]">
            <img
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000"
              alt="Sports"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/pane:scale-[1.03] transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/50 to-transparent md:bg-gradient-to-l md:from-[#0f1115] md:via-[#0f1115]/80 md:to-transparent" />

            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#42B460]/20 rounded-full blur-[100px] opacity-70 pointer-events-none animate-pulse" />
            <div className="absolute bottom-20 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 md:items-end md:text-right md:p-16 lg:p-24 transition-transform duration-1000 group-hover/pane:-translate-y-2">
              <div className="flex items-center gap-2 mb-4 text-[#42B460] md:flex-row-reverse">
                <Zap size={24} />
                <span className="font-bold tracking-widest uppercase text-xs md:text-sm">Premium Courts</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-[100px] font-black text-white tracking-tighter leading-none mb-4">
                THE GAME.
              </h2>
              <p className="text-lg md:text-xl text-[#42B460]/80 font-medium mb-8 max-w-md">
                Book turfs, play matches & compete locally
              </p>
              <Link href="/gamehub" className="group/btn flex items-center justify-center gap-3 w-fit bg-gradient-to-r from-[#42B460] to-[#38A354] hover:from-[#4ade80] hover:to-[#42B460] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_8px_25px_rgba(66,180,96,0.3)] hover:shadow-[0_12px_35px_rgba(66,180,96,0.5)] hover:scale-[1.02] mt-4 md:mt-6">
                Explore GameHub <ArrowRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
