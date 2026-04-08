"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedState = localStorage.getItem("dash_sidebar_collapsed");
    if (storedState) return storedState === "1";
    return window.matchMedia("(max-width: 1024px)").matches;
  });
  const sessionUser = useMemo(() => {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem("admin_dash_user");
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as SessionUser;
      return parsed?.id ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  const initials = useMemo(() => {
    const fallback = "A";
    if (!sessionUser?.name) return fallback;
    const parts = sessionUser.name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return fallback;
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [sessionUser]);

  const roleLabel = String(sessionUser?.role || "ADMIN").toUpperCase();

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.style.setProperty("--sidebar-w", collapsed ? "88px" : "280px");
    localStorage.setItem("dash_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  function handleLogout() {
    localStorage.removeItem("admin_dash_token");
    localStorage.removeItem("admin_dash_role");
    localStorage.removeItem("admin_dash_user");
    document.cookie = "admin_dash_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_role=; path=/; max-age=0; samesite=lax";
    router.replace("/login");
  }

  const menuSections = [
    {
      title: "Core",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Partners", href: "/partners", icon: Users },
        { name: "Users", href: "/users", icon: Users },
      ],
    },
    {
      title: "Web Platform",
      items: [
        { name: "Bookings", href: "/bookings", icon: CreditCard },
        { name: "Events", href: "/events", icon: Ticket },
      ],
    },
    {
      title: "Mobile App",
      items: [
        { name: "GameHub", href: "/gamehub", icon: Gamepad2 },
      ],
    },
    {
      title: "System",
      items: [
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-emerald-100 bg-white shadow-[0_0_40px_rgba(16,185,129,0.06)] transition-all duration-300 ${collapsed ? "w-[80px]" : "w-[280px]"}`}
    >
      <div className="px-4 pb-5 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/50">
              <Ticket size={18} className="-rotate-12 text-white" />
            </div>
            {!collapsed ? (
              <div>
                <h1 className="dash-title text-[18px] font-black leading-none text-slate-900 uppercase tracking-tight">Book & Vibe</h1>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/70">Control Suite</p>
              </div>
            ) : null}
          </div>
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="btn-glass focus-premium rounded-lg p-2 text-slate-400 hover:text-emerald-600"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      <div className="px-3 pb-5">
        <div className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-emerald-50/50 bg-emerald-50/30 px-3 py-2.5 transition-all hover:bg-emerald-50/60 hover:border-emerald-100">
          <Search size={16} className="text-emerald-600/50 transition group-hover:text-emerald-600" />
          {!collapsed ? (
            <>
              <span className="text-xs font-bold text-emerald-900/40 transition group-hover:text-emerald-900/60 uppercase tracking-wider">Search modules</span>
              <span className="ml-auto rounded border border-emerald-100 bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-600/40">⌘K</span>
            </>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-4 px-3 overflow-y-auto custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-900/30">
                  {section.title}
                </p>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-all duration-300 ${
                      isActive
                        ? "text-white shadow-lg shadow-emerald-200/40"
                        : "text-slate-500 hover:bg-emerald-50/50 hover:text-emerald-700 hover:scale-[1.01]"
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    {isActive ? (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    ) : null}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white animate-pulse" />
                    )}
                    <div
                      className={`relative z-10 rounded-lg p-1.5 transition ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-slate-400 group-hover:text-emerald-600"
                      }`}
                    >
                      <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    {!collapsed ? (
                      <span className={`relative z-10 text-[14px] font-bold tracking-tight ${isActive ? "text-white" : ""}`}>
                        {item.name}
                      </span>
                    ) : null}
                    {!collapsed && isActive ? <ChevronRight size={14} className="relative z-10 ml-auto text-white/70" /> : null}
                  </Link>
                );
              })}
            </div>
            {collapsed && <div className="h-px bg-emerald-50/50 mx-4 my-2 last:hidden" />}
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-emerald-50 px-3 pb-6 pt-4">
        <button className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-slate-500 transition-all hover:bg-emerald-50/50 hover:text-emerald-700">
          <div className="relative">
            <Bell size={18} className="text-slate-400 transition group-hover:text-emerald-600" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          {!collapsed ? (
            <>
              <span className="text-[14px] font-bold">Notifications</span>
              <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">3</span>
            </>
          ) : null}
        </button>

        <div className={`flex items-center gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/40 px-3 py-3 ${collapsed ? "justify-center" : "px-4"}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-md">
            {initials}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-none text-slate-900">{sessionUser?.name || "Admin"}</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600/60">
                <Shield size={10} /> {roleLabel === "PARTNER" ? "Partner" : "Admin"}
              </p>
            </div>
          ) : null}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="focus-premium rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
