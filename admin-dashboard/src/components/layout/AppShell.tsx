"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useMemo } from "react";
import { Bell, CalendarDays, Search, User } from "lucide-react";

function titleFromPath(pathname: string): string {
  if (pathname === "/") return "Operations Overview";
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" / ");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login";

  const sessionUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("admin_dash_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { name?: string; role?: string };
    } catch {
      return null;
    }
  }, []);

  const userName = sessionUser?.name || "Dashboard User";
  const roleLabel = String(sessionUser?.role || "ADMIN").toUpperCase();
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "BV";

  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="app-main relative z-10 min-h-screen px-4 pb-10 pt-5 md:px-8">
        <header className="dash-card sticky top-4 z-30 mb-6 flex items-center justify-between gap-3 border-emerald-100/50 bg-white/80 px-3 py-3 md:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600/60">Control Suite</p>
            <h1 className="dash-title truncate text-xl font-extrabold text-slate-900">{titleFromPath(pathname)}</h1>
          </div>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <label className="group flex w-full max-w-md items-center gap-2 rounded-2xl border border-emerald-50 bg-emerald-50/30 px-3 py-2 text-left transition-all duration-300 focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-[0_12px_24px_rgba(16,185,129,0.06)]">
              <Search size={14} className="text-emerald-600/40 transition group-hover:text-emerald-600/60" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-emerald-900/30 outline-none"
              />
              <span className="ml-auto rounded-md border border-emerald-100 bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-600/40">⌘K</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-glass focus-premium inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-700">
              <CalendarDays size={14} className="text-emerald-500" />
              <span className="hidden sm:inline">{today}</span>
            </button>

            <button className="btn-glass focus-premium relative rounded-xl p-2.5 text-slate-600">
              <Bell size={16} className="text-emerald-600" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            </button>

            <details className="group relative">
              <summary className="focus-premium flex cursor-pointer list-none items-center gap-2 rounded-xl border border-emerald-50 bg-emerald-50/20 px-2 py-1.5 transition-all hover:bg-emerald-50/50">
                <div className="rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-[2px] shadow-lg shadow-emerald-200/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-600">
                    {initials}
                  </div>
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-xs font-black text-slate-900">{userName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/60">{roleLabel}</p>
                </div>
              </summary>
              <div className="dash-card absolute right-0 mt-2 w-48 origin-top-right border-emerald-100 bg-white p-2 text-xs text-slate-700 shadow-2xl group-open:animate-in group-open:fade-in group-open:zoom-in-95">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-bold transition hover:bg-emerald-50 hover:text-emerald-700">
                  <User size={14} className="text-emerald-500" /> Profile Settings
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-bold transition hover:bg-emerald-50 hover:text-emerald-700">
                  <Bell size={14} className="text-emerald-500" /> System Alerts
                </button>
              </div>
            </details>
          </div>
        </header>
        <div className="fade-rise">{children}</div>
      </main>
    </div>
  );
}
