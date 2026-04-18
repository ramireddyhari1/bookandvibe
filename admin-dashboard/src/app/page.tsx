"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Ticket,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Activity,
  Clock,
  UserPlus,
  CreditCard,
  Zap,
  Plus,
  ShieldCheck,
  CircleCheck,
  CircleAlert,
  RefreshCw,
} from "lucide-react";

import { fetchApi } from "@/lib/api";

type DashboardData = {
  totalUsers: number;
  activeEvents: number;
  totalRevenue: number;
  totalBookings: number;
  recentBookings: Array<{
    id: string;
    user: string;
    avatar: string;
    event: string;
    amount: string;
    status: string;
    time: string;
  }>;
};

function formatCurrency(value: number): string {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityFeed, setActivityFeed] = useState<Array<{ type: string; text: string; createdAt: string }>>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function hasAuthState() {
    if (typeof window === "undefined") return false;
    const token = sessionStorage.getItem("admin_dash_token") || localStorage.getItem("admin_dash_token");
    const role = String(sessionStorage.getItem("admin_dash_role") || localStorage.getItem("admin_dash_role") || "").toUpperCase();
    const cookieToken = document.cookie.includes("admin_dash_token=");
    return Boolean(token && role && cookieToken);
  }

  useEffect(() => {
    const authenticated = hasAuthState();
    setIsAuthenticated(authenticated);
    setAuthChecked(true);

    if (!authenticated) {
      router.replace("/login?next=/");
    }
  }, [router]);

  async function fetchDashboardData() {
    setLoading(true);
    setError("");

    try {
      const [statsPayload, bookingsPayload] = await Promise.all([
        fetchApi("/events/stats"),
        fetchApi("/bookings/manage/list?limit=5"),
      ]);

      const stats = statsPayload?.data || {};
      const totalUsers = stats.totalUsers || 0;
      const activeEvents = stats.totalEvents || 0;
      const totalBookings = stats.totalBookings || 0;
      const totalRevenue = stats.totalRevenue || 0;

      const bookings = Array.isArray(bookingsPayload?.data) ? bookingsPayload.data : [];
      const recentBookings: DashboardData["recentBookings"] = bookings.map((b: any) => {
        const name = b.user?.name || b.userName || "User";
        const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
        return {
          id: b.id,
          user: name,
          avatar: initials,
          event: b.event?.title || b.eventTitle || b.slotLabel || "Booking",
          amount: formatCurrency(Number(b.totalAmount || b.amount) || 0),
          status: b.status || "Confirmed",
          time: b.createdAt ? timeAgo(b.createdAt) : "recently",
        };
      });

      setData({ totalUsers, activeEvents, totalRevenue, totalBookings, recentBookings });
    } catch (err) {
      console.warn("Dashboard fetch error:", err);
      setError("Could not connect to backend. Showing fallback data.");
      setData({
        totalUsers: 12482,
        activeEvents: 342,
        totalRevenue: 42890,
        totalBookings: 1847,
        recentBookings: [
          { id: "1", user: "Aarav Patel", avatar: "AP", event: "Mumbai EDM Fest", amount: "INR 2,999", status: "Confirmed", time: "2 min ago" },
          { id: "2", user: "Priya Sharma", avatar: "PS", event: "Comedy Special", amount: "INR 799", status: "Confirmed", time: "15 min ago" },
          { id: "3", user: "Rahul Verma", avatar: "RV", event: "Pottery Workshop", amount: "INR 1,799", status: "Pending", time: "32 min ago" },
          { id: "4", user: "Sneha Reddy", avatar: "SR", event: "Sunburn Reload", amount: "INR 3,499", status: "Confirmed", time: "1 hr ago" },
          { id: "5", user: "Amit Kumar", avatar: "AK", event: "Delhi Food Fest", amount: "INR 499", status: "Cancelled", time: "2 hr ago" },
        ],
      });
    } finally {
      setLoading(false);
    }

    // Fetch live activity feed
    try {
      const activityPayload = await fetchApi("/config/activity?limit=8");
      if (Array.isArray(activityPayload?.data)) {
        setActivityFeed(activityPayload.data);
      }
    } catch (err) {
      console.warn("Activity feed fetch error:", err);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDashboardData();
  }, [isAuthenticated]);

  const sessionUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("admin_dash_user");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, []);
  const isAdmin = String(sessionUser?.role || "ADMIN").toUpperCase() === "ADMIN";

  const stats = [
    {
      name: isAdmin ? "Total Accounts" : "Event Attendees",
      value: data ? data.totalUsers.toLocaleString() : "—",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600",
    },
    {
      name: isAdmin ? "Active Events" : "My Events",
      value: data ? String(data.activeEvents) : "—",
      change: "+8.2%",
      trend: "up",
      icon: Ticket,
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600",
    },
    {
      name: isAdmin ? "Total Revenue" : "My Earnings",
      value: data ? formatCurrency(data.totalRevenue) : "—",
      change: "+24.3%",
      trend: "up",
      icon: DollarSign,
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-700",
    },
    {
      name: "Total Bookings",
      value: data ? data.totalBookings.toLocaleString() : "—",
      change: "-3.1%",
      trend: "down",
      icon: ShoppingBag,
      bgColor: "bg-red-500/10",
      textColor: "text-red-500",
    },
  ];

  const opsHealth = [
    { label: "Payments", state: "Healthy", icon: CircleCheck, tone: "text-emerald-700 bg-emerald-50 border-emerald-100/50 shadow-[0_8px_20px_rgba(16,185,129,0.08)]" },
    { label: "Notifications", state: "Warning", icon: CircleAlert, tone: "text-amber-700 bg-amber-50 border-amber-100/50 shadow-[0_8px_20px_rgba(245,158,11,0.08)]" },
    { label: "Seat Locks", state: "Healthy", icon: CircleCheck, tone: "text-emerald-700 bg-emerald-50 border-emerald-100/50 shadow-[0_8px_20px_rgba(16,185,129,0.08)]" },
  ];

  const activityIconMap: Record<string, { icon: any; iconBg: string; iconColor: string }> = {
    user_registered: { icon: UserPlus, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    partner_joined: { icon: Users, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
    event_published: { icon: Ticket, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    event_created: { icon: Ticket, iconBg: "bg-slate-100", iconColor: "text-slate-600" },
    booking: { icon: ShoppingBag, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    payment: { icon: CreditCard, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  };

  const renderedActivity = activityFeed.map((item) => {
    const style = activityIconMap[item.type] || { icon: Zap, iconBg: "bg-slate-100", iconColor: "text-slate-600" };
    return {
      icon: style.icon,
      text: item.text,
      time: timeAgo(item.createdAt),
      iconBg: style.iconBg,
      iconColor: style.iconColor,
    };
  });

  const statusColor: Record<string, string> = {
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
    Pending: "bg-amber-50 text-amber-700 border-amber-100/50",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100/50",
    Cancelled: "bg-red-50 text-red-700 border-red-100/50",
    CANCELLED: "bg-red-50 text-red-700 border-red-100/50",
  };

  const chartBars = [35, 58, 42, 70, 55, 82, 68, 90, 75, 60, 88, 95];
  const chartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxBar = Math.max(...chartBars);
  const chartWidth = 760;
  const chartHeight = 200;
  const chartPadX = 20;
  const chartPadY = 16;
  const stepX = (chartWidth - chartPadX * 2) / (chartBars.length - 1);

  const points = chartBars.map((value, index) => {
    const x = chartPadX + index * stepX;
    const y = chartHeight - chartPadY - (value / maxBar) * (chartHeight - chartPadY * 2);
    return { x, y, value };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L ${chartWidth - chartPadX},${chartHeight - chartPadY} L ${chartPadX},${chartHeight - chartPadY} Z`;

  const recentBookings = data?.recentBookings || [];

  if (!authChecked) {
    return <div className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-7">
      <section className="dash-card order-last md:order-none overflow-hidden border-emerald-100/50 p-6 md:p-7">
        <div className="pointer-events-none absolute -right-10 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-emerald-200/10 blur-3xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700/80">Executive Overview</p>
            <h2 className="dash-title mt-2 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 bg-clip-text text-xl sm:text-3xl font-black leading-tight text-transparent md:text-4xl">
              Professional command center for events, partners, and live operations
            </h2>
            <p className="hidden sm:block mt-4 max-w-3xl text-sm font-bold text-slate-600">
              Track key growth metrics, monitor operational health, and execute high-priority actions from one focused dashboard.
              {error && <span className="ml-2 text-amber-600">(⚠ {error})</span>}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-50 bg-emerald-50/20 p-4 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60">System Integrity</p>
              <button onClick={fetchDashboardData} className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 transition" title="Refresh">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {opsHealth.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`pill-health flex items-center justify-between rounded-xl border px-3 py-2 text-[11px] font-bold ${item.tone}`}>
                    <span className="inline-flex items-center gap-2"><Icon size={14} className="text-emerald-500" /> {item.label}</span>
                    <span className="uppercase tracking-wider">{item.state}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="dash-card surface-elevate group border-emerald-50/50 p-3.5 md:p-5 shadow-sm transition-all hover:bg-emerald-50/30">
              <div className="mb-3 md:mb-4 flex items-start justify-between">
                <div className={`rounded-xl p-2 md:p-3 ${stat.bgColor} transition-transform group-hover:scale-110`}>
                  <Icon size={16} className={`${stat.textColor} md:w-5 md:h-5`} />
                </div>
                <div className={`flex items-center gap-1 rounded-lg px-1.5 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-[12px] font-black ${stat.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                  {stat.trend === "up" ? <ArrowUpRight size={12} className="md:size-3.5" /> : <ArrowDownRight size={12} className="md:size-3.5" />}
                  <span className="hidden xs:inline">{stat.change}</span>
                </div>
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-500 truncate">{stat.name}</p>
              <p className="dash-title mt-1 text-[20px] md:text-[30px] font-black leading-none text-slate-900">{loading ? "..." : stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="dash-card xl:col-span-2 border-emerald-50/50 p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="dash-title text-lg font-black text-slate-900">Revenue Performance</h3>
              <p className="text-sm font-bold text-slate-500">Monthly trend and momentum for FY 2026</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-700 shadow-sm">
              <TrendingUp size={14} /> +24.3%
            </span>
          </div>

          <div className="chart-grid rounded-2xl border border-emerald-50 bg-emerald-50/20 p-3 flex-1 flex flex-col justify-between">
            <div className="relative h-[200px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full" preserveAspectRatio="none" aria-label="Revenue trend chart">
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="58%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(16,185,129,0.15)" />
                    <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                  </linearGradient>
                </defs>

                <path d={areaPath} fill="url(#areaGlow)" />
                <path d={linePath} fill="none" stroke="url(#lineGlow)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((point, index) => (
                  <g key={chartLabels[index]}>
                    <circle cx={point.x} cy={point.y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  </g>
                ))}
              </svg>
              <div className="absolute inset-x-2 bottom-0 flex justify-between">
                {chartLabels.map((label, idx) => (
                  <span key={label} className={`text-center text-[10px] font-black uppercase text-slate-400/60 ${(idx % 2 !== 0 && chartLabels.length > 6) ? 'hidden sm:block' : ''}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-emerald-800/60 font-black uppercase tracking-widest">
              <p className="rounded-xl border border-emerald-100 bg-white px-2 py-2 text-center">Peak: INR 45,600</p>
              <p className="rounded-xl border border-emerald-100 bg-white px-2 py-2 text-center">Avg: INR 31,240</p>
              <p className="rounded-xl border border-emerald-100 bg-white px-2 py-2 text-center">YoY: +24.3%</p>
            </div>
          </div>
        </div>

        <div className="dash-card border-emerald-50/50 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="dash-title inline-flex items-center gap-2 text-lg font-black text-slate-900">
              <Activity size={17} className="text-emerald-500" />
              Live Activity
            </h3>
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">Realtime</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {renderedActivity.length > 0 ? renderedActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="group flex cursor-pointer items-start gap-4 rounded-xl border border-transparent p-3 transition-all hover:bg-emerald-50/50 hover:border-emerald-50">
                  <div className={`shrink-0 rounded-xl p-2.5 ${item.iconBg} transition-transform group-hover:scale-110 shadow-sm`}>
                    <Icon size={15} className={item.iconColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black leading-snug text-slate-800">{item.text}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <Clock size={10} /> {item.time}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-sm font-bold text-slate-400 py-6">{loading ? "Loading..." : "No recent activity"}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="dash-card overflow-hidden xl:col-span-2 border-emerald-50/50 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-50 p-6">
            <h3 className="dash-title text-lg font-black text-slate-900">Recent Bookings</h3>
            <Link href="/bookings" className="inline-flex items-center gap-1 text-sm font-black uppercase tracking-wider text-emerald-600 transition hover:text-emerald-500">
              Explore All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-emerald-50 bg-emerald-50/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">
                  <th className="p-4">User</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 text-sm">
                {recentBookings.length > 0 ? recentBookings.map((booking) => (
                  <tr key={booking.id} className="group transition hover:bg-emerald-50/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-[10px] font-black text-white shadow-sm">
                          {booking.avatar}
                        </div>
                        <span className="font-black text-slate-800">{booking.user}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-500">{booking.event}</td>
                    <td className="p-4 font-black text-slate-900">{booking.amount}</td>
                    <td className="p-4">
                      <span className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${statusColor[booking.status] || "bg-slate-50 text-slate-600"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-[12px] font-bold text-slate-400">{booking.time}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-slate-400 font-bold">
                      {loading ? "Loading live data..." : "No bookings found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card border-emerald-50/50 p-6 shadow-sm">
          <h3 className="dash-title mb-6 text-lg font-black text-slate-900">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/events/new" className="group flex w-full items-center gap-4 rounded-2xl border border-emerald-50 bg-white p-4 transition-all hover:bg-emerald-50 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 hover:scale-[1.02]">
              <div className="rounded-2xl bg-emerald-100 p-3 transition group-hover:bg-emerald-200/50">
                <Plus size={18} className="text-emerald-700" />
              </div>
              <div>
                <span className="text-[14px] font-black text-slate-900">Create Event</span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-500">Launch a new experience</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-emerald-300 transition group-hover:text-emerald-600" />
            </Link>

            <Link href="/gamehub" className="group flex w-full items-center gap-4 rounded-2xl border border-emerald-50 bg-white p-4 transition-all hover:bg-emerald-50 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 hover:scale-[1.02]">
              <div className="rounded-2xl bg-emerald-100 p-3 transition group-hover:bg-emerald-200/50">
                <ShieldCheck size={18} className="text-emerald-700" />
              </div>
              <div>
                <span className="text-[14px] font-black text-slate-900">Manage GameHub</span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-500">Operations & Scheduling</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-emerald-300 transition group-hover:text-emerald-600" />
            </Link>

            <Link href="/partners" className="group flex w-full items-center gap-4 rounded-2xl border border-emerald-50 bg-white p-4 transition-all hover:bg-emerald-50 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 hover:scale-[1.02]">
              <div className="rounded-2xl bg-emerald-100 p-3 transition group-hover:bg-emerald-200/50">
                <Users size={18} className="text-emerald-700" />
              </div>
              <div>
                <span className="text-[14px] font-black text-slate-900">Partner Hub</span>
                <p className="mt-0.5 text-[11px] font-bold text-slate-500">Collaborations & Access</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-emerald-300 transition group-hover:text-emerald-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
