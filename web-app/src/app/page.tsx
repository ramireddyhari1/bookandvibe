"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Play, Frown } from "lucide-react";
import HeroMarquee from "@/components/home/HeroMarquee";
import { useLocation } from "@/context/LocationContext";

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
    fetch("http://localhost:5000/api/events", { cache: "no-store" })
      .then(res => res.json())
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
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] pb-24 font-sans">
      
      {/* Hero Section */}
      <div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-center relative">
        
        {/* Small Tag */}
        <div className="inline-block bg-rose-200 text-rose-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6 shadow-sm border border-rose-300/50">
          Join over 100,000 happy attendees
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold mb-6 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Engage Audiences <br />
          <span className="relative">
            with Stunning Events
            <svg className="absolute w-full h-4 -bottom-2 right-0 text-rose-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 15 100 5 L 100 10 L 0 10 Z" fill="currentColor"/>
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#1c222b]/70 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
          Boost your lifestyle with high-impact live experiences. Our platform is ready to propel your weekends forward.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/events" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-md">
            Get Started
          </Link>
          <Link href="/about" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-[#1c222b] px-8 py-3.5 rounded-full font-bold text-lg transition shadow-sm">
            <Play size={18} className="fill-[#1c222b]"/> See How It Works
          </Link>
        </div>

        {/* Infinite Scrolling Auto Poster Marquee */}
        <HeroMarquee />

      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mt-16">
        
        {/* Promotional Banner */}
        <div className="mb-16 relative w-full h-[140px] md:h-[180px] rounded-3xl overflow-hidden shadow-md group cursor-pointer block">
           <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Promo Banner" />
           <div className="absolute inset-0 bg-gradient-to-r from-rose-950/90 via-rose-900/60 to-transparent"></div>
           <div className="absolute inset-y-0 left-0 p-6 md:p-10 flex flex-col justify-center">
             <span className="bg-rose-500 text-white text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full w-fit mb-3 shadow-sm">Exclusive Offer</span>
             <h3 className="text-white text-2xl md:text-4xl font-extrabold mb-2 tracking-tight">The Eras Tour Live Stream</h3>
             <p className="text-rose-100 text-sm md:text-lg font-medium">Book your virtual front row seat today.</p>
           </div>
        </div>

        {/* Featured Section */}
        <div className="mb-10 flex justify-between items-end border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Top events near you</h2>
          <Link href="/events" className="text-sm font-bold text-[#1c222b]/60 hover:text-[#1c222b] transition">View All</Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12 text-[#1c222b]/50 font-medium">Loading upcoming events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl bg-white/50">
            <Frown className="text-rose-300 mx-auto mb-4" size={64} strokeWidth={1} />
            <h3 className="text-2xl font-black text-[#1c222b] mb-2">No live events found</h3>
            <p className="text-[#1c222b]/60 font-medium">There are currently no events listed in <strong className="text-rose-500">{selectedLocation.city}</strong>. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredEvents.map((event: any) => {
              const imageUrl = event.images && JSON.parse(event.images)[0] 
                ? JSON.parse(event.images)[0] 
                : "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070";

              return (
                <Link href={`/events/${event.id}`} key={event.id} className="block group">
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col cursor-pointer">
                    
                    {/* Portrait Image Container */}
                    <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                      <img src={imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-1 bg-white">
                      {/* Date */}
                      <p className="text-[#9d7936] text-[13px] font-semibold mb-1.5 tracking-tight">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}, {event.time} {/* Assuming time fits the PM/AM format roughly */}
                      </p>
                      
                      {/* Title */}
                      <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-rose-600 transition-colors">
                        {event.title}
                      </h3>
                      
                      {/* Venue / Location */}
                      <p className="text-gray-500 text-[13px] truncate mb-2">
                        {event.venue || event.location}
                      </p>
                      
                      {/* Price */}
                      <p className="text-gray-600 text-[13px] mt-auto font-medium">
                        ₹{event.price.toFixed(0)} onwards
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
