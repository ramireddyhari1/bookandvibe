"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Ticket, MapPin, Search, ChevronDown, Check } from "lucide-react";
import { useLocation, LOCATIONS } from "@/context/LocationContext";

export default function Navbar() {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedLocation, setSelectedLocation } = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Theme Logic
  const isGamehub = pathname?.includes("/gamehub");

  const theme = {
    primary: isGamehub ? "text-[#42B460]" : "text-rose-600",
    primaryFill: isGamehub ? "fill-[#42B460]" : "fill-rose-500",
    primaryIcon: isGamehub ? "text-[#42B460]" : "text-rose-500",
    primaryBg: isGamehub ? "bg-[#42B460]" : "bg-rose-500",
    primaryBgHover: isGamehub ? "hover:bg-[#369650]" : "hover:bg-rose-600",
    primaryLightBg: isGamehub ? "bg-[#42B460]/10" : "bg-rose-50",
    primaryLightBgHover: isGamehub ? "hover:bg-[#42B460]/20" : "hover:bg-rose-100",
    primaryHover: isGamehub ? "hover:text-[#42B460]" : "hover:text-rose-600",
    borderFocus: isGamehub ? "focus:border-[#42B460]" : "focus:border-rose-300",
    ringFocus: isGamehub ? "focus:ring-[#42B460]/20" : "focus:ring-rose-50",
    activeBg: isGamehub ? "bg-[#42B460]/10" : "bg-rose-50",
    activeText: isGamehub ? "text-[#42B460]" : "text-rose-700",
    borderHover: isGamehub ? "hover:border-[#42B460]/50" : "hover:border-rose-300",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed w-full z-[100] pt-8 bg-gradient-to-b from-white/95 via-white/80 to-transparent backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-12 gap-4">

          {/* Logo & Search (Left Side) */}
          <div className="flex items-center justify-start gap-6 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Ticket className={`${theme.primaryIcon} ${theme.primaryFill} -rotate-45 group-hover:scale-110 transition-transform`} size={32} />
              <span className={`text-[32px] font-mexicana ${theme.primary} tracking-wide py-1 pr-2 whitespace-nowrap leading-none`}>
                BOOK & VIBE
              </span>
            </Link>

            {/* Search Bar */}
            <div className={`hidden lg:flex items-center gap-3 bg-white border border-gray-200 ${theme.borderHover} transition rounded-xl px-4 py-2 w-full max-w-[280px] shadow-sm`}>
              <Search className={`${theme.primaryIcon} shrink-0`} size={18} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search events, movies..."
                className="bg-transparent border-none outline-none text-[13px] font-medium text-[#1c222b] placeholder-gray-400 w-full min-w-0"
              />
            </div>
          </div>

          {/* Centered Navigation */}
          <div className="hidden xl:flex items-center justify-center space-x-12 shrink-0 px-4">
            <Link href="/" className={`text-[17px] font-bold text-[#1c222b] ${theme.primaryHover} transition whitespace-nowrap uppercase tracking-widest`}>FOR YOU</Link>
            <Link href="/events" className={`text-[17px] font-bold text-[#1c222b] ${theme.primaryHover} transition whitespace-nowrap uppercase tracking-widest`}>EVENTS</Link>
            <Link href="/gamehub" className={`text-[17px] font-bold ${isGamehub ? theme.primary : 'text-[#1c222b]'} ${theme.primaryHover} transition whitespace-nowrap uppercase tracking-widest`}>GAMEHUB</Link>
          </div>

          {/* Location & Actions (Right Side) */}
          <div className="flex items-center justify-end gap-6 flex-1 min-w-0">

            {/* Location Selector */}
            <div className="hidden md:flex relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center gap-2 cursor-pointer group text-left outline-none"
              >
                <div className={`${theme.primaryIcon} ${theme.primaryLightBg} p-2 rounded-full ${theme.primaryLightBgHover} transition-colors`}>
                  <MapPin size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-1">
                    <span className={`text-[15px] font-bold text-[#1c222b] ${theme.primaryHover} transition truncate max-w-[130px]`}>{selectedLocation.city}</span>
                    <ChevronDown size={14} className={`text-gray-400 ${isGamehub ? 'group-hover:text-[#42B460]' : 'group-hover:text-rose-500'} transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <span className="text-[12px] text-gray-500 font-medium mt-0.5 truncate max-w-[140px]">{selectedLocation.detail}</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isLocationOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 transform origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2 px-1">Select your city</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        placeholder="Search for a town or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full bg-white border border-gray-200 ${theme.borderFocus} focus:ring-2 ${theme.ringFocus} rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none transition-all placeholder:text-gray-400 font-medium`}
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
                    {LOCATIONS.filter(loc => loc.city.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                      LOCATIONS.filter(loc => loc.city.toLowerCase().includes(searchQuery.toLowerCase())).map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => {
                            setSelectedLocation(loc);
                            setIsLocationOpen(false);
                            setSearchQuery("");
                          }}
                          className={`w-full text-left flex items-start px-3 py-2.5 rounded-xl transition-all ${selectedLocation.id === loc.id ? theme.activeBg : 'hover:bg-gray-50'
                            }`}
                        >
                          <div className={`mt-0.5 mr-3 shrink-0 ${selectedLocation.id === loc.id ? theme.primaryIcon : 'text-gray-300'}`}>
                            {selectedLocation.id === loc.id ? <Check size={16} strokeWidth={3} /> : <MapPin size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-[14px] font-bold ${selectedLocation.id === loc.id ? theme.activeText : 'text-gray-700'}`}>
                              {loc.city}
                            </span>
                            <span className="text-[12px] text-gray-500 font-medium truncate max-w-[160px]">
                              {loc.detail}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm font-medium text-gray-500">
                        No cities found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-6 shrink-0">
              <Link href="/login" className="text-[14px] font-[600] text-[#1c222b] hover:bg-black/5 px-4 py-2 rounded-full transition whitespace-nowrap">
                Log in
              </Link>
              <Link href="/register" className={`text-[14px] font-[600] ${theme.primaryBg} ${theme.primaryBgHover} text-white px-6 py-2.5 rounded-full transition shadow-sm whitespace-nowrap`}>
                Sign up
              </Link>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
