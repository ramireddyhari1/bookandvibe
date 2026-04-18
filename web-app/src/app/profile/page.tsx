"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Ticket,
  MapPin,
  Settings,
  Bell,
  Heart,
  CreditCard,
  ChevronRight,
  LogOut,
  Camera,
  Star,
  Zap,
  ArrowLeft,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#42B460] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const menuItems = [
    { icon: Ticket, label: "My Bookings", desc: "View event tickets & court reservations", badge: "3", href: "/profile/bookings" },
    { icon: Heart, label: "Favorites", desc: "Saved events and venues", badge: null, href: "/profile/favorites" },
    { icon: CreditCard, label: "Payment Methods", desc: "Manage cards & wallets", badge: null, href: "/profile/payments" },
    { icon: Bell, label: "Notifications", desc: "Alerts & reminders", badge: "5", href: "/profile/notifications" },
    { icon: MapPin, label: "Saved Addresses", desc: "Home, work & other locations", badge: null, href: "/profile/addresses" },
    { icon: Settings, label: "Settings", desc: "Account preferences & privacy", badge: null, href: "/profile/settings" },
  ];

  const stats = [
    { label: "Events Attended", value: "12", icon: Ticket, color: "from-rose-500 to-pink-500" },
    { label: "Courts Booked", value: "8", icon: Zap, color: "from-[#42B460] to-emerald-400" },
    { label: "Loyalty Points", value: "2,450", icon: Star, color: "from-amber-500 to-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-16 selection:bg-orange-500/20">
      <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
        
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold text-[14px] mb-6 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-orange-500 transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Go Back
        </button>

        {/* Profile Header & Stats (Bento Top) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Main User Identity Card */}
          <div className="md:col-span-2 relative bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_30px_rgb(0,0,0,0.02)] overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-[#42B460]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-8 z-10 h-full">
              {/* Floating Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-gray-100 to-white shadow-[0_8px_30px_rgb(249,115,22,0.2)] flex items-center justify-center border-[3px] border-orange-500 group-hover:border-orange-400 group-hover:scale-105 transition-all duration-500 ease-out">
                  <span className="text-5xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {initials}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white border-[2px] border-orange-500 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 translate-y-2 transition-all duration-300 hover:scale-110 active:scale-95 text-gray-500 hover:text-orange-500">
                  <Camera size={18} />
                </button>
              </div>

              {/* User Meta */}
              <div className="flex-1 text-center sm:text-left flex flex-col justify-end">
                <div className="flex flex-col mb-1.5">
                  <h1 className="text-3xl sm:text-[34px] leading-none font-black text-gray-900 tracking-[-0.02em]">{user.name}</h1>
                  <p className="text-gray-500 text-[15px] font-medium mt-2">{user.email}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                  <div className="px-3.5 py-1.5 bg-gray-50 rounded-xl border border-gray-100 text-[12px] font-bold text-gray-500 flex items-center gap-1.5">
                    <Shield size={14} className="text-blue-500" />
                    <span className="uppercase tracking-widest">{user.role}</span>
                  </div>
                  <div className="px-3.5 py-1.5 bg-gray-50 rounded-xl border border-gray-100 text-[12px] font-bold text-gray-500 flex items-center gap-1.5">
                    <Calendar size={14} className="text-orange-500" />
                    <span className="tracking-wide">Since 2026</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => router.push('/profile/settings')}
                className="shrink-0 sm:self-center px-6 py-3 bg-gray-900 text-white font-bold text-[14px] rounded-2xl hover:bg-orange-500 shadow-md shadow-gray-900/10 hover:shadow-orange-500/25 transition-all duration-300"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Points/Loyalty Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[32px] p-8 shadow-xl shadow-orange-500/20 text-white flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center shadow-inner">
                <Star size={24} className="text-white fill-white/20" />
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-widest border border-white/30">
                Premium
              </span>
            </div>

            <div className="relative z-10 mt-8">
              <p className="text-white/80 font-semibold text-[13px] uppercase tracking-wider mb-1">Loyalty Balance</p>
              <h2 className="text-4xl font-black tracking-tight group-hover:scale-105 origin-left transition-transform duration-500">2,450 <span className="text-2xl text-white/70">pts</span></h2>
              <div className="h-1.5 w-full bg-white/20 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-white w-[65%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </div>
              <p className="text-white/70 text-[11px] font-medium mt-2 text-right">550 pts to Gold Tier</p>
            </div>
          </div>

        </div>

        {/* Action Grid & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Main Navigation Bento (Left side 8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">

            {menuItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`group relative bg-white p-6 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 flex flex-col justify-between ${i === 0 ? 'col-span-2 md:col-span-2 row-span-2 rounded-[32px] bg-gradient-to-br from-white to-gray-50/50' : 'rounded-[28px]'}`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 border border-gray-50 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 ${i === 0 ? 'bg-orange-50 text-orange-500 scale-110' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900'}`}>
                    <item.icon size={20} strokeWidth={2.5} />
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white shadow-md shadow-red-500/20 text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className={`font-black text-gray-900 tracking-tight ${i === 0 ? 'text-[22px]' : 'text-[15px]'}`}>{item.label}</h3>
                  <p className={`font-medium text-gray-400 mt-1 line-clamp-2 ${i === 0 ? 'text-[14px] max-w-[200px]' : 'text-[12px]'}`}>{item.desc}</p>
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ChevronRight size={18} className={i === 0 ? "text-orange-500" : "text-gray-400"} />
                </div>
              </Link>
            ))}

          </div>

          {/* Sidebar (Right side 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Quick Stats Mini-Bento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-[28px] p-5 border border-emerald-100/50 flex flex-col items-center text-center justify-center h-[140px] group hover:bg-emerald-100 transition-colors">
                <Zap size={22} className="text-emerald-500 mb-2" />
                <span className="text-3xl font-black text-emerald-900 group-hover:scale-110 transition-transform">8</span>
                <span className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-widest mt-1">Courts</span>
              </div>
              <div className="bg-rose-50 rounded-[28px] p-5 border border-rose-100/50 flex flex-col items-center text-center justify-center h-[140px] group hover:bg-rose-100 transition-colors">
                <Ticket size={22} className="text-rose-500 mb-2" />
                <span className="text-3xl font-black text-rose-900 group-hover:scale-110 transition-transform">12</span>
                <span className="text-[11px] font-bold text-rose-600/80 uppercase tracking-widest mt-1">Events</span>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_30px_rgb(0,0,0,0.02)] flex-1">
              <h3 className="text-[16px] font-black text-gray-900 mb-6 flex items-center justify-between">
                Recent Activity
                <span className="text-[12px] font-bold text-orange-500 uppercase tracking-wider cursor-pointer hover:underline">View All</span>
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-100 before:to-transparent">

                {[
                  { action: "Booked a Badminton Court", venue: "SportVista Arena", time: "2 hours ago", icon: Zap, color: "text-[#42B460] bg-emerald-50 ring-emerald-50" },
                  { action: "Purchased Event Ticket", venue: "Summer Music Festival", time: "Yesterday", icon: Ticket, color: "text-rose-500 bg-rose-50 ring-rose-50" },
                  { action: "Added Venue to Favorites", venue: "Elite Sports Complex", time: "3 days ago", icon: Heart, color: "text-pink-500 bg-pink-50 ring-pink-50" },
                ].map((activity, i) => (
                  <div key={i} className="relative flex items-start justify-between group cursor-pointer pl-12 md:pl-0">
                    {/* Timeline Dot */}
                    <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm ring-4 ring-white z-10 transition-transform group-hover:scale-110`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.color.split(' ').slice(0, 2).join(' ')}`}>
                        <activity.icon size={14} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-[calc(50%-2.5rem)] md:text-right group-hover:-translate-y-0.5 transition-transform">
                      <p className="text-[14px] font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{activity.action}</p>
                      <p className="text-[12px] text-gray-400 font-medium mt-0.5">{activity.venue}</p>
                    </div>
                    <div className="hidden md:block md:w-[calc(50%-2.5rem)] text-left group-hover:-translate-y-0.5 transition-transform">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">{activity.time}</span>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Logout Card */}
            <button
              onClick={logout}
              className="w-full bg-white rounded-[24px] p-5 border border-red-100 shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all text-red-500 font-bold group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              Sign Out from Book & Vibe
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
