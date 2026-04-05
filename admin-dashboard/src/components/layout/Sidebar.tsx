"use client";
import Link from "next/link";
import {
  LayoutDashboard,
  Ticket,
  Gamepad2,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Search,
  Shield,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Events", href: "/events", icon: Ticket },
    { name: "GameHub", href: "/gamehub", icon: Gamepad2 },
    { name: "Users", href: "/users", icon: Users },
    { name: "Bookings", href: "/bookings", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#0f172a] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Ticket size={18} className="text-white -rotate-45" />
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-white tracking-tight leading-none">
              Book & Vibe
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl px-3.5 py-2.5 transition cursor-pointer group">
          <Search size={16} className="text-slate-500 group-hover:text-slate-400 transition" />
          <span className="text-sm text-slate-500 group-hover:text-slate-400 font-medium transition">Search...</span>
          <span className="ml-auto text-[10px] font-bold text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">⌘K</span>
        </div>
      </div>

      {/* Nav Label */}
      <div className="px-6 mb-2">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">
          Main Menu
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-gradient-to-r from-rose-500/15 to-pink-500/10 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full" />
              )}
              <div
                className={`p-1.5 rounded-lg transition ${
                  isActive
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className={`text-[14px] font-semibold ${isActive ? "text-white" : ""}`}>
                {item.name}
              </span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto text-rose-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-2 mt-auto border-t border-slate-800 pt-4">
        {/* Notifications */}
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 rounded-xl transition-all group">
          <div className="relative">
            <Bell size={18} className="text-slate-500 group-hover:text-slate-300 transition" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0f172a]" />
          </div>
          <span className="text-[14px] font-semibold">Notifications</span>
          <span className="ml-auto text-[11px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">3</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-none truncate">Admin</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <Shield size={10} /> Super Admin
            </p>
          </div>
          <button className="text-slate-500 hover:text-red-400 transition p-1 hover:bg-red-500/10 rounded-lg" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
