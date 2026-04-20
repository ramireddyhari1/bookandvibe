"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useMemo } from "react";
import { Bell, CalendarDays, Menu, Search, User } from "lucide-react";
import NotificationDropdown from "@/components/layout/NotificationDropdown";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  if (!match) return "";
  return decodeURIComponent(match.slice(name.length + 1));
}

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
  const router = useRouter();
  const isAuthRoute = pathname === "/login";

  const [sessionUser, setSessionUser] = useState<{ id?: string; name?: string; role?: string; partnerType?: string | null } | null>(null);
  const [resolvedRole, setResolvedRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cookieRole = typeof window !== "undefined" ? String(readCookie("admin_dash_role") || "").toUpperCase() : "";

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
    const raw = sessionStorage.getItem("admin_dash_user") || localStorage.getItem("admin_dash_user");

    if (raw) {
      try {
        const parsedUser = JSON.parse(raw);
        const storageRole = String(parsedUser?.role || "").toUpperCase();
        const normalizedRole = cookieRole || storageRole;
        const normalizedUser = normalizedRole ? { ...parsedUser, role: normalizedRole } : parsedUser;

        Promise.resolve().then(() => {
          setSessionUser(normalizedUser);
          setResolvedRole(normalizedRole);
        });

        if (normalizedRole && normalizedRole !== storageRole) {
          sessionStorage.setItem("admin_dash_user", JSON.stringify(normalizedUser));
          localStorage.setItem("admin_dash_user", JSON.stringify(normalizedUser));
        }
      } catch (e) {
        console.error("Failed to parse session user", e);
        Promise.resolve().then(() => setResolvedRole(cookieRole));
      }
    } else {
      Promise.resolve().then(() => setResolvedRole(cookieRole));
    }
  }, [cookieRole]);

  // Close mobile menu on path changes
  useEffect(() => {
    Promise.resolve().then(() => setIsMobileMenuOpen(false));
  }, [pathname]);

  const userName = sessionUser?.name || "Dashboard User";
  const roleLabel = resolvedRole || String(sessionUser?.role || "ADMIN").toUpperCase();
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "BV";

  const role = resolvedRole || String(sessionUser?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (!mounted) return;
    if (!role) return;

    const restrictedPaths = ["/partners", "/users", "/settings"];
    const isSystemRestricted = restrictedPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
    
    if (!isAdmin && isSystemRestricted) {
      console.warn("Restricted system access attempt:", pathname);
      router.replace("/");
      return;
    }

    // Role-specific type protection
    if (!isAdmin && role === "PARTNER") {
      const partnerType = String(sessionUser?.partnerType || "").toUpperCase();
      
      const isEventRoute = pathname.startsWith("/events") || pathname.startsWith("/bookings");
      const isGameHubRoute = pathname.startsWith("/gamehub");

      if (partnerType === "EVENT_HOST" && isGameHubRoute) {
        console.warn("Event Host attempted GameHub access:", pathname);
        router.replace("/");
      } else if (partnerType === "VENUE_OWNER" && isEventRoute) {
        console.warn("Venue Owner attempted Event access:", pathname);
        router.replace("/");
      }
    }
  }, [pathname, isAdmin, role, sessionUser, mounted, router]);

  const [today, setToday] = useState("");
  useEffect(() => {
    Promise.resolve().then(() => {
      setToday(new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }));
    });
  }, []);

  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="dashboard-shell">
      <Sidebar 
        mobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)} 
      />
      <main className="app-main relative min-h-screen px-4 pb-10 pt-4 md:px-8 md:pt-6">
        <header className="dash-card sticky top-2 lg:top-4 z-20 mb-6 flex items-center justify-between gap-3 border-emerald-100/50 bg-white/80 px-3 py-2.5 transition-all md:px-5 md:py-3 lg:top-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex lg:hidden btn-glass focus-premium rounded-xl p-2 text-slate-600 hover:text-emerald-600"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600/60">Control Suite</p>
              <h1 className="dash-title truncate text-lg md:text-xl font-extrabold text-slate-900">{titleFromPath(pathname)}</h1>
            </div>
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

            <NotificationDropdown />

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
