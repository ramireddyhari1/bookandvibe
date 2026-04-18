"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MapPin, Search, ChevronDown, Check, User as UserIcon, LogOut, CalendarCheck, Navigation } from "lucide-react";
import { useLocation, LOCATIONS } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedLocation, setSelectedLocation } = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Theme Logic
  const isHome = pathname === "/";
  const isGamehub = pathname?.includes("/gamehub");
  const isEvents = pathname?.includes("/events");
  const logoSrc = isGamehub ? "/bv-green.png" : isEvents ? "/bv-orange.png" : "/bv-white.png";
  // Pages that should use the immersive dark navbar (like Homepage)
  const isDarkPage = isHome || pathname === "/profile/bookings";

  const getTheme = () => {
    if (isGamehub) {
      return {
        primary: "text-[#42B460]",
        primaryFill: "fill-[#42B460]",
        primaryIcon: "text-[#42B460]",
        primaryBg: "bg-[#42B460]",
        primaryBgHover: "hover:bg-[#369650]",
        primaryLightBg: "bg-[#42B460]/10",
        primaryLightBgHover: "hover:bg-[#42B460]/20",
        primaryHover: "hover:text-[#42B460]",
        borderFocus: "focus:border-[#42B460]",
        ringFocus: "focus:ring-[#42B460]/20",
        activeBg: "bg-[#42B460]/10",
        activeText: "text-[#42B460]",
        borderHover: "hover:border-[#42B460]/50",
        buttonText: "text-white"
      };
    }
    if (isEvents) {
      return {
        primary: "text-orange-600",
        primaryFill: "fill-orange-500",
        primaryIcon: "text-orange-500",
        primaryBg: "bg-orange-500",
        primaryBgHover: "hover:bg-orange-600",
        primaryLightBg: "bg-orange-50",
        primaryLightBgHover: "hover:bg-orange-100",
        primaryHover: "hover:text-orange-600",
        borderFocus: "focus:border-orange-300",
        ringFocus: "focus:ring-orange-50",
        activeBg: "bg-orange-50",
        activeText: "text-orange-700",
        borderHover: "hover:border-orange-300",
        buttonText: "text-white"
      };
    }
    if (isHome) {
      return {
        primary: "text-white",
        primaryFill: "fill-white",
        primaryIcon: "text-white",
        primaryBg: "bg-white",
        primaryBgHover: "hover:bg-gray-200",
        primaryLightBg: "bg-white/10",
        primaryLightBgHover: "hover:bg-white/20",
        primaryHover: "hover:text-gray-300",
        borderFocus: "focus:border-white/50",
        ringFocus: "focus:ring-white/20",
        activeBg: "bg-white/10",
        activeText: "text-white",
        borderHover: "hover:border-white/50",
        buttonText: "text-[#0a0a0a]"
      };
    }
    return {
      primary: "text-rose-600",
      primaryFill: "fill-rose-500",
      primaryIcon: "text-rose-500",
      primaryBg: "bg-rose-500",
      primaryBgHover: "hover:bg-rose-600",
      primaryLightBg: "bg-rose-50",
      primaryLightBgHover: "hover:bg-rose-100",
      primaryHover: "hover:text-rose-600",
      borderFocus: "focus:border-rose-300",
      ringFocus: "focus:ring-rose-50",
      activeBg: "bg-rose-50",
      activeText: "text-rose-700",
      borderHover: "hover:border-rose-300",
      buttonText: "text-white"
    };
  };

  const theme = getTheme();

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
    <nav className={`fixed w-full z-[100] pt-4 pb-4 backdrop-blur-md transition-all duration-300 hidden md:block ${isDarkPage ? `bg-[#0f1115]/70 border-b-[3px] ${isGamehub ? 'border-[#42B460]' : isEvents ? 'border-orange-500' : 'border-white'} shadow-[0_4px_30px_rgba(0,0,0,0.3)]` : `bg-white/90 border-b-[3px] ${isGamehub ? 'border-[#42B460]' : isEvents ? 'border-orange-500' : 'border-rose-500'} shadow-lg`}`}>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo & Search (Left Side) */}
          <div className="flex items-center justify-start gap-6 flex-1 min-w-0">
            <Link href="/" className="flex items-center shrink-0 group">
              <img
                src={logoSrc}
                alt="Book & Vibe"
                className="h-28 lg:h-32 w-auto rounded-md transition-transform group-hover:scale-[1.03]"
              />
            </Link>

            {/* Search Bar */}
            <div className={`hidden lg:flex items-center gap-3 ${isDarkPage ? 'bg-white/10 border border-white/20 hover:border-white/40' : `bg-white border border-gray-200 ${theme.borderHover}`} transition rounded-xl px-4 py-2 w-full max-w-[280px] shadow-sm`}>
              <Search className={`${theme.primaryIcon} shrink-0`} size={18} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search events, movies..."
                className={`bg-transparent border-none outline-none text-[13px] font-medium ${isDarkPage ? 'text-white placeholder-gray-400' : 'text-[#1c222b] placeholder-gray-400'} w-full min-w-0`}
              />
            </div>
          </div>

          {/* Centered Navigation */}
          <div className="hidden xl:flex items-center justify-center space-x-12 shrink-0 px-4">
            <Link href="/" className={`text-[17px] font-bold ${isDarkPage ? 'text-white/90 hover:text-white' : `text-[#1c222b] ${theme.primaryHover}`} transition whitespace-nowrap uppercase tracking-widest`}>FOR YOU</Link>
            <Link href="/events" className={`text-[17px] font-bold ${isDarkPage ? 'text-white/90 hover:text-white' : `text-[#1c222b] ${theme.primaryHover}`} transition whitespace-nowrap uppercase tracking-widest`}>EVENTS</Link>
            <Link href="/gamehub" className={`text-[17px] font-bold ${isDarkPage ? 'text-white/90 hover:text-white' : isGamehub ? theme.primary : `text-[#1c222b]`} ${isDarkPage ? '' : theme.primaryHover} transition whitespace-nowrap uppercase tracking-widest`}>GAMEHUB</Link>
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
                    <span className={`text-[15px] font-bold ${isDarkPage ? 'text-white' : 'text-[#1c222b]'} ${theme.primaryHover} transition truncate max-w-[130px]`}>{selectedLocation.city}</span>
                    <ChevronDown size={14} className={`${isDarkPage ? 'text-white/50' : 'text-gray-400'} ${theme.primaryHover} transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <span className={`text-[12px] ${isDarkPage ? 'text-white/50' : 'text-gray-500'} font-medium mt-0.5 truncate max-w-[140px]`}>{selectedLocation.detail}</span>
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

                    {/* GPS Location Option */}
                    <button
                      onClick={() => {
                        // Normally this would trigger navigator.geolocation.getCurrentPosition()
                        setIsLocationOpen(false);
                      }}
                      className="w-full text-left flex items-start px-3 py-2.5 rounded-xl transition-all hover:bg-gray-50 group"
                    >
                      <div className={`mt-0.5 mr-3 shrink-0 ${theme.primaryIcon} ${theme.primaryLightBgHover} p-1 -m-1 rounded-full group-hover:scale-110 transition-all`}>
                        <Navigation size={16} className={theme.primaryFill} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[14px] font-bold ${theme.primary}`}>
                          Detect my location
                        </span>
                        <span className="text-[12px] text-gray-500 font-medium truncate max-w-[160px]">
                          Using GPS Device
                        </span>
                      </div>
                    </button>

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
            <div className={`flex items-center space-x-3 border-l ${isDarkPage ? 'border-white/20' : 'border-gray-200'} pl-6 shrink-0`}>
              {isAuthenticated ? (
                <div className="relative group">
                  <div className="flex items-center gap-2.5 cursor-pointer py-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${theme.primaryLightBg} ${theme.primaryIcon}`}>
                      <span className="text-sm font-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <span className={`text-[14px] font-[700] ${isDarkPage ? 'text-white' : 'text-[#1c222b]'} hidden md:block`}>
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown size={14} className={`${isDarkPage ? 'text-white/50' : 'text-gray-400'} group-hover:rotate-180 transition-transform duration-300 hidden md:block`} />
                  </div>

                  {/* Hover Dropdown */}
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden w-48">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-[13px] font-bold text-gray-800 truncate">{user?.name || 'User'}</p>
                        <p className="text-[11px] text-gray-400 font-medium truncate">{user?.email || ''}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <UserIcon size={16} className="text-gray-400" />
                          Profile
                        </Link>
                        <Link
                          href="/profile/bookings"
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          <CalendarCheck size={16} className="text-gray-400" />
                          My Bookings
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition"
                        >
                          <LogOut size={16} />
                          Log out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login" className={`text-[14px] font-[600] ${isDarkPage ? 'text-white hover:bg-white/10' : 'text-[#1c222b] hover:bg-black/5'} px-4 py-2 rounded-full transition whitespace-nowrap`}>
                    Log in
                  </Link>
                  <Link href="/register" className={`text-[14px] font-[600] ${theme.primaryBg} ${theme.primaryBgHover} ${theme.buttonText} px-6 py-2.5 rounded-full transition shadow-sm whitespace-nowrap`}>
                    Sign up
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
