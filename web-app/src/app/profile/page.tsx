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
  X,
  Phone,
  Image as ImageIcon,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " YEARS AGO";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " MONTHS AGO";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " DAYS AGO";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " HOURS AGO";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " MINS AGO";
  return "JUST NOW";
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalCourts, setTotalCourts] = useState(0);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", avatar: "" });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = () => {
    setEditForm({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await fetchApi(`/users/${user?.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
        requiresAuth: true
      });
      if (updateUser) updateUser(res.data);
      setIsEditingProfile(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      const loadActivities = async () => {
        try {
          const [eventRes, gamehubRes] = await Promise.all([
            fetchApi("/bookings?limit=5"),
            fetchApi("/gamehub/bookings?limit=5").catch(() => ({ data: [] }))
          ]);

          const eventBookings = (eventRes?.data || []).map((b: any) => ({
            id: b.id,
            action: "Purchased Event Ticket",
            venue: b.event?.title || "Unknown Event",
            date: new Date(b.createdAt),
            icon: Ticket,
            color: "text-rose-500 bg-rose-50 ring-rose-50"
          }));

          const gamehubBookings = (gamehubRes?.data || []).map((b: any) => ({
            id: b.id,
            action: "Booked a Court/Turf",
            venue: b.facility?.name || "Unknown Facility",
            date: new Date(b.createdAt),
            icon: Zap,
            color: "text-[#42B460] bg-emerald-50 ring-emerald-50"
          }));

          const combined = [...eventBookings, ...gamehubBookings]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 3)
            .map(a => ({
              ...a,
              time: timeAgo(a.date.toISOString())
            }));

          setTotalEvents(eventRes?.pagination?.total || 0);
          setTotalCourts(gamehubRes?.pagination?.total || 0);
          setRecentActivities(combined);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingActivities(false);
        }
      };
      loadActivities();
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
    { icon: Settings, label: "Settings", desc: "Account preferences & privacy", badge: null, href: "/profile/settings" },
  ];

  const loyaltyPoints = (totalEvents + totalCourts) * 10;

  let tier = { name: "Silver", max: 100, next: "Gold" };
  if (loyaltyPoints >= 500) tier = { name: "Platinum", max: 1000, next: "Titanium" };
  else if (loyaltyPoints >= 100) tier = { name: "Gold", max: 500, next: "Platinum" };

  const progress = Math.max(5, Math.min((loyaltyPoints / tier.max) * 100, 100));

  return (
    <div className="min-h-screen bg-[#fafafa] pt-[max(env(safe-area-inset-top),24px)] md:pt-[130px] pb-16 selection:bg-orange-500/20">
      <div className="max-w-[1100px] mx-auto px-4 lg:px-8">

        {/* Back Button */}
        <button 
          onClick={() => router.push('/')} 
          className="inline-flex items-center gap-2.5 px-2.5 py-2 pr-5 bg-white hover:bg-gray-50 rounded-full border border-gray-200 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] text-gray-600 hover:text-gray-900 font-bold text-[13px] transition-all duration-300 group mb-6 md:mb-8"
        >
          <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-200 flex items-center justify-center transition-all duration-300">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Go to Home
        </button>

        {/* Profile Header & Stats (Bento Top) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Main User Identity Card */}
          <div className="md:col-span-2 relative bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_30px_rgb(0,0,0,0.02)] overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-[#42B460]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 z-10 h-full">
              {/* Floating Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-gray-100 to-white shadow-[0_8px_30px_rgb(249,115,22,0.2)] flex items-center justify-center border-[3px] border-orange-500 group-hover:border-orange-400 group-hover:scale-105 transition-all duration-500 ease-out overflow-hidden relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {initials}
                    </span>
                  )}
                </div>
                <button
                  onClick={openEditModal}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white border-[2px] border-orange-500 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 translate-y-2 transition-all duration-300 hover:scale-110 active:scale-95 text-gray-500 hover:text-orange-500">
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
                onClick={openEditModal}
                className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 sm:self-center px-6 py-3 bg-gray-900 text-white font-bold text-[14px] rounded-2xl hover:bg-orange-500 shadow-md shadow-gray-900/10 hover:shadow-orange-500/25 transition-all duration-300"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Points/Loyalty Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[32px] p-6 sm:p-8 shadow-xl shadow-orange-500/20 text-white flex flex-col justify-between overflow-hidden relative group">
            {/* Background Texture & Glowing Orbs */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/20 blur-[60px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-yellow-400/20 blur-[40px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center shadow-inner">
                <Star size={24} className="text-white fill-white/20" />
              </div>
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-widest border border-white/30 shadow-sm">
                {tier.name}
              </span>
            </div>

            <div className="relative z-10 mt-6">
              <p className="text-white/80 font-semibold text-[13px] uppercase tracking-wider mb-1">Loyalty Balance</p>
              <div className="flex items-baseline gap-1.5">
                <h2 className="text-5xl sm:text-[54px] font-black tracking-tight group-hover:scale-105 origin-left transition-transform duration-500">
                  {loyaltyPoints.toLocaleString()}
                </h2>
                <span className="text-2xl text-white/70 font-bold">pts</span>
              </div>

              {/* Progress Container */}
              <div className="mt-6 bg-black/10 rounded-[20px] p-4 border border-white/10 backdrop-blur-sm group-hover:bg-black/20 transition-colors">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">{tier.next} Progress</span>
                  <span className="text-white text-[12px] font-black">{Math.floor(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-white/80 to-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-white/70 text-[11px] font-medium mt-3 leading-relaxed">
                  Earn <strong className="text-white font-bold">{tier.max - loyaltyPoints} more points</strong> to unlock exclusive {tier.next} benefits & rewards.
                </p>
              </div>
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
                className={`group relative bg-white p-6 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 flex flex-col justify-between ${i === 0 ? 'col-span-2 md:col-span-2 row-span-2 rounded-[32px] bg-gradient-to-br from-white to-gray-50/50' : 'rounded-[28px]'} ${i === 4 ? 'md:col-span-2' : ''}`}
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
                <span className="text-3xl font-black text-emerald-900 group-hover:scale-110 transition-transform">{totalCourts}</span>
                <span className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-widest mt-1">Courts</span>
              </div>
              <div className="bg-rose-50 rounded-[28px] p-5 border border-rose-100/50 flex flex-col items-center text-center justify-center h-[140px] group hover:bg-rose-100 transition-colors">
                <Ticket size={22} className="text-rose-500 mb-2" />
                <span className="text-3xl font-black text-rose-900 group-hover:scale-110 transition-transform">{totalEvents}</span>
                <span className="text-[11px] font-bold text-rose-600/80 uppercase tracking-widest mt-1">Events</span>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_30px_rgb(0,0,0,0.02)] flex-1">
              <h3 className="text-[16px] font-black text-gray-900 mb-6 flex items-center justify-between">
                Recent Activity
                <span className="text-[12px] font-bold text-orange-500 uppercase tracking-wider cursor-pointer hover:underline">View All</span>
              </h3>

              {loadingActivities ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm font-medium">
                  No recent activity found.
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-100 before:to-transparent">
                  {recentActivities.map((activity, i) => (
                    <div key={activity.id || i} className="relative flex items-start justify-between group cursor-pointer pl-12 md:pl-0">
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
                        <p className="md:hidden text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{activity.time}</p>
                      </div>
                      <div className="hidden md:block md:w-[calc(50%-2.5rem)] text-left group-hover:-translate-y-0.5 transition-transform">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsEditingProfile(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Edit Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2"><User size={14} /> Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2"><Phone size={14} /> Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2"><ImageIcon size={14} /> Profile Image URL</label>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsEditingProfile(false)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold text-[15px] rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold text-[15px] rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
