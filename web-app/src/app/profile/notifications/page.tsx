"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
import { fetchApi } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

function getIconForType(type: string) {
  switch (type.toUpperCase()) {
    case "BOOKING": return "🎫";
    case "EVENT": return "🎸";
    case "PAYMENT": return "💳";
    case "PROMO": return "🎁";
    default: return "🔔";
  }
}

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
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchApi("/notifications");
      setNotifications(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      loadNotifications();
    }
  }, [isAuthenticated, router, loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await fetchApi("/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error(err);
      // Optional: rollback on error
    }
  };

  const clearAll = () => {
    // Backend doesn't have a clear all endpoint currently, but we can hide them in UI
    setNotifications([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[max(env(safe-area-inset-top),24px)] md:pt-28 pb-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[max(env(safe-area-inset-top),24px)] md:pt-28 pb-16">
      <div className="max-w-[700px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="shrink-0 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all duration-300 group">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
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
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 transition-all hover:shadow-md ${
                notif.isRead
                  ? "border-gray-100 opacity-70"
                  : "border-l-4 border-l-rose-400 border-gray-100 cursor-pointer"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                {getIconForType(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-[14px] font-bold ${notif.isRead ? "text-gray-600" : "text-gray-900"}`}>
                    {notif.title}
                  </h3>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-[12px] font-medium text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-[11px] font-semibold text-gray-400 mt-2">{timeAgo(notif.createdAt)}</p>
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
