"use client";
import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, Clock, Ticket, AlertCircle, Info } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const [listRes, countRes] = await Promise.all([
        fetchApi("/notifications"),
        fetchApi("/notifications/unread-count"),
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.count || 0);
      setHasLoaded(true);
    } catch {
      setHasLoaded(true);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    if (!hasLoaded) {
      void Promise.resolve().then(() => loadNotifications());
    }

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, hasLoaded]);

  async function markAsRead(id: string) {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  }

  async function markAllAsRead() {
    try {
      await fetchApi("/notifications/read-all", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "BOOKING": return <Ticket size={14} className="text-emerald-500" />;
      case "PAYMENT": return <AlertCircle size={14} className="text-amber-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-glass focus-premium relative rounded-xl p-2.5 text-slate-600 hover:text-emerald-600 transition-all"
      >
        <Bell size={18} className={unreadCount > 0 ? "text-emerald-600" : ""} />
        {unreadCount > 0 && (
          <>
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="dash-card absolute right-0 mt-3 w-80 max-h-[480px] origin-top-right border-emerald-100 bg-white shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-emerald-50 p-4 bg-emerald-50/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Center Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar font-sans">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`group flex cursor-pointer items-start gap-3 border-b border-emerald-50/50 p-4 transition-all hover:bg-emerald-50/30 ${!n.isRead ? "bg-white" : "opacity-60"}`}
                >
                  <div className={`mt-1 rounded-xl p-2 ${!n.isRead ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-xs font-black ${!n.isRead ? "text-slate-900" : "text-slate-500"}`}>{n.title}</p>
                      {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed text-slate-500 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <Clock size={10} /> {formatTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                <Bell size={40} className="mb-4 text-emerald-200" />
                <p className="text-xs font-bold text-slate-400">All caught up!</p>
                <p className="mt-1 text-[10px] font-medium text-slate-300">No new notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-emerald-50 bg-slate-50/50 p-3 text-center">
              <button className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">
                View all history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
