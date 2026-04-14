"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Ticket,
  Zap,
  Gift,
  Info,
  Trash2,
} from "lucide-react";

const mockNotifications = [
  {
    id: "1",
    type: "booking" as const,
    title: "Booking Confirmed",
    message: "Your badminton court booking at SportVista Arena for Apr 10, 6:00 AM is confirmed.",
    time: "2 hours ago",
    read: false,
    icon: "🏸",
  },
  {
    id: "2",
    type: "event" as const,
    title: "Event Reminder",
    message: "Summer Music Festival starts in 5 days! Don't forget to download your e-ticket.",
    time: "5 hours ago",
    read: false,
    icon: "🎵",
  },
  {
    id: "3",
    type: "promo" as const,
    title: "Weekend Offer 🔥",
    message: "Get 30% off on all court bookings this weekend. Use code: WEEKEND30",
    time: "1 day ago",
    read: false,
    icon: "🎉",
  },
  {
    id: "4",
    type: "system" as const,
    title: "Profile Updated",
    message: "Your account details have been successfully updated.",
    time: "2 days ago",
    read: true,
    icon: "✅",
  },
  {
    id: "5",
    type: "booking" as const,
    title: "Booking Completed",
    message: "Your Stand-up Comedy Night booking has been completed. Rate your experience!",
    time: "5 days ago",
    read: true,
    icon: "🎤",
  },
  {
    id: "6",
    type: "promo" as const,
    title: "New Venue Near You",
    message: "Elite Sports Complex just opened in your area. Check out their premium facilities!",
    time: "1 week ago",
    read: true,
    icon: "🏟️",
  },
];

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-[700px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-medium">Alerts & reminders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-[#42B460] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${
                notif.read
                  ? "border-gray-100 opacity-70"
                  : "border-l-4 border-l-rose-400 border-gray-100"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                {notif.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-[14px] font-bold ${notif.read ? "text-gray-600" : "text-gray-900"}`}>
                    {notif.title}
                  </h3>
                  {!notif.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-[12px] font-medium text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-[11px] font-semibold text-gray-400 mt-2">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold">All caught up!</p>
            <p className="text-gray-400 text-sm mt-1">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
