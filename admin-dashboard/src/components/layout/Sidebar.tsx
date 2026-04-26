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
  HandCoins,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Wallet,
  ArrowUpToLine,
  Tag,
} from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";
import { usePathname, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  partnerType?: string | null;
};

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadUnreadCount() {
    try {
      const data = await fetchApi("/notifications/unread-count");
      setUnreadCount(data?.data?.count || 0);
    } catch {}
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      loadUnreadCount();
    });
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Read from localStorage only on the client after hydration
    const storedState = localStorage.getItem("dash_sidebar_collapsed");
    Promise.resolve().then(() => {
      if (storedState) {
        setCollapsed(storedState === "1");
      } else if (window.matchMedia("(max-width: 1024px)").matches) {
        setCollapsed(true);
      }
    });

    const raw = sessionStorage.getItem("admin_dash_user") || localStorage.getItem("admin_dash_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionUser;
        if (parsed?.id) {
          Promise.resolve().then(() => setSessionUser(parsed));
        }
      } catch {}
    }
    Promise.resolve().then(() => setHydrated(true));
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
    sessionStorage.removeItem("admin_dash_token");
    sessionStorage.removeItem("admin_dash_role");
    sessionStorage.removeItem("admin_dash_user");
    localStorage.removeItem("admin_dash_token");
    localStorage.removeItem("admin_dash_role");
    localStorage.removeItem("admin_dash_user");
    document.cookie = "admin_dash_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_role=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_session=; path=/; max-age=0; samesite=lax";
    router.replace("/login");
  }

  const menuSections = useMemo(() => {
    const role = String(sessionUser?.role || "ADMIN").toUpperCase();
    const isAdmin = role === "ADMIN";
    const partnerType = String(sessionUser?.partnerType || "").toUpperCase();

    const sections = [
      {
        title: "Core",
        items: [
          { name: "Dashboard", href: "/", icon: LayoutDashboard },
          ...(isAdmin ? [{ name: "Partners", href: "/partners", icon: Users }] : []),
          ...(isAdmin ? [{ name: "Users", href: "/users", icon: Users }] : []),
        ],
      },
      // Event Host modules
      ...((isAdmin || partnerType === "EVENT_HOST") ? [
        {
          title: "Web Platform",
          items: [
            { name: "Bookings", href: "/bookings", icon: CreditCard },
            { name: "Events", href: "/events", icon: Ticket },
            { name: "Coupons", href: "/coupons", icon: Tag },
          ],
        }
      ] : []),
      // GameHub Partner modules
      ...((isAdmin || partnerType === "VENUE_OWNER") ? [
        {
          title: "Mobile App",
          items: [
            { name: "GameHub", href: "/gamehub", icon: Gamepad2 },
          ],
        }
      ] : []),
      // Operations & Financials for Partners
      ...(!isAdmin ? [
        {
          title: "Operations",
          items: [
            { name: "Scan QR", href: "/scan", icon: QrCode },
          ],
        },
        {
          title: "Financials",
          items: [
            { name: "Payments", href: "/payments", icon: Wallet },
            { name: "Withdraw", href: "/withdraw", icon: ArrowUpToLine },
          ],
        }
      ] : []),
    ];

    if (isAdmin) {
      sections.push({
        title: "System",
        items: [
          { name: "Payout Requests", href: "/payouts", icon: HandCoins },
          { name: "Settings", href: "/settings", icon: Settings },
        ],
      });
    }

    return sections;
  }, [sessionUser]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[70] flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200 
          ${collapsed ? "w-[88px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-4 pb-5 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className={`flex flex-col transition-all duration-300 ${collapsed ? "items-center" : "items-start w-full"}`}>
              <div className={`flex items-center justify-center overflow-hidden bg-white transition-all duration-300 ${collapsed ? "h-11 w-11 rounded-xl shadow-sm ring-1 ring-emerald-50" : "h-24 w-full"}`}>
                <img 
                  src="/logo.png" 
                  alt="Book & Vibe" 
                  className={`h-full w-full object-contain transition-transform duration-500 ${collapsed ? "scale-[2]" : "scale-[2.5]"}`}
                />
              </div>
            </div>
            {/* Collapse button - Desktop only */}
            <button
              onClick={() => setCollapsed((value) => !value)}
              className="hidden lg:flex btn-glass focus-premium rounded-lg p-2 text-slate-400 hover:text-emerald-600"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
            
            {/* Close button - Mobile only */}
            <button
              onClick={onMobileClose}
              className="flex lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-600"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>
        </div>

        <div className="px-3 pb-5">
          <div className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-all hover:bg-gray-100">
            <Search size={14} className="text-gray-400" />
            {!collapsed ? (
              <>
                <span className="text-xs text-gray-400">Search...</span>
                <span className="ml-auto rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400">⌘K</span>
              </>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 space-y-4 px-3 overflow-y-auto custom-scrollbar">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
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
                      onClick={onMobileClose}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"} />
                      {!collapsed ? (
                        <span className={`text-[14px] font-medium ${isActive ? "text-white" : ""}`}>
                          {item.name}
                        </span>
                      ) : null}
                      {!collapsed && isActive ? <ChevronRight size={14} className="ml-auto text-white/70" /> : null}
                    </Link>
                  );
                })}
              </div>
              {collapsed && <div className="h-px bg-emerald-50/50 mx-4 my-2 last:hidden" />}
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-gray-100 px-3 pb-6 pt-4">
          <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <div className="relative">
              <Bell size={18} className="text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </div>
            {!collapsed ? (
              <>
                <span className="text-[14px] font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{unreadCount}</span>
                )}
              </>
            ) : null}
          </button>

          <div className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 ${collapsed ? "justify-center" : "px-4"}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
              {initials}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-none text-gray-900">{sessionUser?.name || "Admin"}</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  <Shield size={10} /> {roleLabel === "PARTNER" ? "Partner" : "Admin"}
                </p>
              </div>
            ) : null}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
