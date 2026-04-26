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
import PremiumLoader from "@/components/ui/PremiumLoader";

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return "Just now";
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
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <PremiumLoader size="md" color="#42B460" />
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

        <div className="mb-8">
          <h1 className="text-3xl md:text-[42px] font-bold text-gray-900 tracking-tight">Account</h1>
          <p className="text-gray-500 font-medium text-[15px] mt-1">Manage your profile, bookings, and preferences.</p>
        </div>

        {/* Profile Header & Stats (Bento Top) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Main User Identity Card */}
          <div className="md:col-span-2 relative bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm overflow-hidden group">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 z-10 h-full">
              {/* Floating Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 shadow-sm flex items-center justify-center border-4 border-white overflow-hidden relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">
                      {initials}
                    </span>
                  )}
                </div>
                <button
                  onClick={openEditModal}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Camera size={14} />
                </button>
              </div>

              {/* User Meta */}
              <div className="flex-1 text-center sm:text-left flex flex-col justify-end">
                <div className="flex flex-col mb-1.5">
                  <h1 className="text-2xl sm:text-[28px] leading-none font-bold text-gray-900 tracking-tight">{user.name}</h1>
                  <p className="text-gray-500 text-[15px] font-medium mt-1">{user.email}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                  <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-[12px] font-bold text-gray-500 flex items-center gap-1.5">
                    <Shield size={14} className="text-blue-500" />
                    <span className="uppercase tracking-wider">{user.role}</span>
                  </div>
                  <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-[12px] font-bold text-gray-500 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="tracking-wide">Since 2026</span>
                  </div>
                </div>
              </div>

              <button
                onClick={openEditModal}
                className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 sm:self-center px-5 py-2.5 bg-gray-900 text-white font-bold text-[14px] rounded-xl hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Points/Loyalty Card - Refactored to Editorial Style */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                <Star size={18} />
              </div>
              <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                {tier.name} Member
              </span>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider mb-1">Loyalty Points</p>
              <div className="flex items-baseline gap-1.5">
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                  {loyaltyPoints.toLocaleString()}
                </h2>
                <span className="text-lg text-gray-400 font-bold">pts</span>
              </div>
              
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Next: {tier.next}</span>
                  <span className="text-gray-900">{Math.floor(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-gray-500 text-[11px] font-medium leading-relaxed">
                  Earn <span className="text-gray-900 font-bold">{tier.max - loyaltyPoints} more points</span> to upgrade.
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
                className={`group relative bg-white p-5 border border-gray-100 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between rounded-2xl ${i === 0 ? 'col-span-2 md:col-span-2 row-span-2' : ''} ${i === 4 ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 transition-transform group-hover:-translate-y-0.5 ${i === 0 ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 group-hover:text-gray-900'}`}>
                    <item.icon size={18} strokeWidth={2.5} />
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className={`font-bold text-gray-900 tracking-tight ${i === 0 ? 'text-[18px]' : 'text-[15px]'}`}>{item.label}</h3>
                  <p className={`font-medium text-gray-500 mt-0.5 line-clamp-2 ${i === 0 ? 'text-[13px] max-w-[200px]' : 'text-[12px]'}`}>{item.desc}</p>
                </div>

                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all">
                  <ChevronRight size={16} className={i === 0 ? "text-gray-900" : "text-gray-400"} />
                </div>
              </Link>
            ))}

          </div>

          {/* Sidebar (Right side 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Quick Stats Mini-Bento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center text-center justify-center h-[120px]">
                <Zap size={20} className="text-gray-400 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{totalCourts}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Courts</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center text-center justify-center h-[120px]">
                <Ticket size={20} className="text-gray-400 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{totalEvents}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Events</span>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
              <h3 className="text-[15px] font-bold text-gray-900 mb-5 flex items-center justify-between">
                Recent Activity
                <span className="text-[12px] font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider cursor-pointer">View All</span>
              </h3>

              {loadingActivities ? (
                <div className="flex justify-center items-center py-12">
                  <PremiumLoader size="sm" color="#111827" />
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm font-medium">
                  No recent activity found.
                </div>
              ) : (
                <div className="space-y-5">
                  {recentActivities.map((activity, i) => (
                    <div key={activity.id || i} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <activity.icon size={14} className="text-gray-500" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 leading-tight">{activity.action}</p>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">{activity.venue}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout Card */}
            <button
              onClick={logout}
              className="w-full bg-white rounded-2xl p-4 border border-red-100 shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all text-red-600 font-bold"
            >
              <LogOut size={16} />
              Sign Out
            </button>

          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button onClick={() => setIsEditingProfile(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-[20px] font-bold text-gray-900 mb-6">Edit Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><User size={12} /> Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-gray-900 outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Phone size={12} /> Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-gray-900 outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><ImageIcon size={12} /> Profile Image URL</label>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-gray-900 outline-none focus:border-gray-400 transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsEditingProfile(false)} className="flex-1 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-[14px] rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-5 py-2.5 bg-gray-900 text-white font-bold text-[14px] rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
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
