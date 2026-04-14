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
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/90 via-purple-500/80 to-[#42B460]/90" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-black text-white">{initials}</span>
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <Camera size={14} className="text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black text-white tracking-tight">{user.name}</h1>
              <p className="text-white/70 text-sm font-medium mt-1">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2.5">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-bold text-white uppercase tracking-wider border border-white/20">
                  <Shield size={11} className="inline mr-1 -mt-0.5" />
                  {user.role}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-bold text-white uppercase tracking-wider border border-white/20">
                  <Calendar size={11} className="inline mr-1 -mt-0.5" />
                  Member since 2026
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="px-6 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-[13px] rounded-xl hover:bg-white/30 transition-all">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="max-w-[1200px] mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 flex items-center gap-4 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column — Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-wide">Personal Info</h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <User size={16} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-[14px] font-semibold text-gray-800 mt-0.5">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="text-[14px] font-semibold text-gray-800 mt-0.5">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Shield size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Account Type</p>
                    <p className="text-[14px] font-semibold text-gray-800 mt-0.5 capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 border-red-100 text-red-500 font-bold text-[13px] hover:bg-red-50 hover:border-red-200 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column — Menu Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-wide">Account</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {menuItems.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="w-full flex items-center gap-4 px-6 py-4.5 hover:bg-gray-50/80 transition-all group text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all shrink-0">
                      <item.icon size={18} className="text-gray-500 group-hover:text-[#42B460] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-800 group-hover:text-gray-900 transition">{item.label}</p>
                      <p className="text-[12px] font-medium text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-wide">Recent Activity</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { action: "Booked a Badminton Court", venue: "SportVista Arena", time: "2 hours ago", icon: Zap, color: "text-[#42B460] bg-emerald-50" },
                  { action: "Purchased Event Ticket", venue: "Summer Music Festival", time: "Yesterday", icon: Ticket, color: "text-rose-500 bg-rose-50" },
                  { action: "Added to Favorites", venue: "Elite Sports Complex", time: "3 days ago", icon: Heart, color: "text-pink-500 bg-pink-50" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center shrink-0`}>
                      <activity.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-800">{activity.action}</p>
                      <p className="text-[12px] text-gray-400 font-medium">{activity.venue}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400 shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
