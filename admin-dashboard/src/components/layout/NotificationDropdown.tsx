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
      case "BOOKING": return <Ticket size={14} className="text-gray-500" />;
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
        className="relative rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[480px] origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg z-[100] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`group flex cursor-pointer items-start gap-3 border-b border-gray-50 p-3.5 transition-colors hover:bg-gray-50 ${!n.isRead ? "bg-white" : "opacity-60"}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-[13px] font-semibold ${!n.isRead ? "text-gray-900" : "text-gray-500"}`}>{n.title}</p>
                      {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-0.5 text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={10} /> {formatTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <Bell size={32} className="mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">All caught up!</p>
                <p className="mt-1 text-xs text-gray-300">No new notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-100 p-3 text-center">
              <button className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                View all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
