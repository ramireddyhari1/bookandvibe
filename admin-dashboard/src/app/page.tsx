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
import PremiumLoader from "@/components/ui/PremiumLoader";

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
  return `₹${value.toLocaleString("en-IN")}`;
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
        fetchApi("/events/stats") as Promise<{ data: { totalUsers?: number, totalEvents?: number, totalBookings?: number, totalRevenue?: number } }>,
        fetchApi("/bookings/manage/list?limit=5") as Promise<{ data: Array<{ id: string; user?: { name: string }; userName?: string; event?: { title: string }; eventTitle?: string; slotLabel?: string; totalAmount?: number; amount?: number; status?: string; createdAt?: string; }> }>,
      ]);

      const stats = statsPayload?.data || {};
      const totalUsers = stats.totalUsers || 0;
      const activeEvents = stats.totalEvents || 0;
      const totalBookings = stats.totalBookings || 0;
      const totalRevenue = stats.totalRevenue || 0;

      const bookings = Array.isArray(bookingsPayload?.data) ? bookingsPayload.data : [];
      const recentBookings: DashboardData["recentBookings"] = bookings.map((b: { 
        id: string; 
        user?: { name: string }; 
        userName?: string; 
        event?: { title: string }; 
        eventTitle?: string; 
        slotLabel?: string; 
        totalAmount?: number; 
        amount?: number; 
        status?: string; 
        createdAt?: string; 
      }) => {
        const name = b.user?.name || b.userName || "User";
        const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
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
          { id: "1", user: "Aarav Patel", avatar: "AP", event: "Mumbai EDM Fest", amount: "₹2,999", status: "Confirmed", time: "2 min ago" },
          { id: "2", user: "Priya Sharma", avatar: "PS", event: "Comedy Special", amount: "₹799", status: "Confirmed", time: "15 min ago" },
          { id: "3", user: "Rahul Verma", avatar: "RV", event: "Pottery Workshop", amount: "₹1,799", status: "Pending", time: "32 min ago" },
          { id: "4", user: "Sneha Reddy", avatar: "SR", event: "Sunburn Reload", amount: "₹3,499", status: "Confirmed", time: "1 hr ago" },
          { id: "5", user: "Amit Kumar", avatar: "AK", event: "Delhi Food Fest", amount: "₹499", status: "Cancelled", time: "2 hr ago" },
        ],
      });
    } finally {
      setLoading(false);
    }

    // Fetch live activity feed
    try {
      const activityPayload = await fetchApi("/config/activity?limit=8") as { data: { type: string; text: string; createdAt: string }[] };
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
    },
    {
      name: isAdmin ? "Active Events" : "My Events",
      value: data ? String(data.activeEvents) : "—",
      change: "+8.2%",
      trend: "up",
      icon: Ticket,
    },
    {
      name: isAdmin ? "Total Revenue" : "My Earnings",
      value: data ? formatCurrency(data.totalRevenue) : "—",
      change: "+24.3%",
      trend: "up",
      icon: DollarSign,
    },
    {
      name: "Total Bookings",
      value: data ? data.totalBookings.toLocaleString() : "—",
      change: "-3.1%",
      trend: "down",
      icon: ShoppingBag,
    },
  ];

  const opsHealth = [
    { label: "Payments", state: "Healthy", icon: CircleCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Notifications", state: "Warning", icon: CircleAlert, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Seat Locks", state: "Healthy", icon: CircleCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  const activityIconMap: Record<string, { icon: React.ElementType; iconColor: string }> = {
    user_registered: { icon: UserPlus, iconColor: "text-emerald-600" },
    partner_joined: { icon: Users, iconColor: "text-blue-600" },
    event_published: { icon: Ticket, iconColor: "text-violet-600" },
    event_created: { icon: Ticket, iconColor: "text-gray-600" },
    booking: { icon: ShoppingBag, iconColor: "text-emerald-600" },
    payment: { icon: CreditCard, iconColor: "text-blue-600" },
  };

  const renderedActivity = activityFeed.map((item) => {
    const style = activityIconMap[item.type] || { icon: Zap, iconColor: "text-gray-500" };
    return {
      icon: style.icon,
      text: item.text,
      time: timeAgo(item.createdAt),
      iconColor: style.iconColor,
    };
  });

  const statusColor: Record<string, string> = {
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    Cancelled: "bg-red-50 text-red-700 border-red-100",
    CANCELLED: "bg-red-50 text-red-700 border-red-100",
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

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PremiumLoader size="md" color="#10b981" text="Loading Analytics" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-6">

      {/* Welcome Banner */}
      <section className="dash-card p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-end">
          <div>
            <h2 className="dash-title text-xl sm:text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Track metrics, monitor operations, and manage your platform.
              {error && <span className="ml-2 text-amber-600">(⚠ {error})</span>}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">System Status</p>
              <button onClick={fetchDashboardData} className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-600 transition" title="Refresh">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {opsHealth.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[12px] font-semibold ${item.color}`}>
                    <span className="inline-flex items-center gap-2"><Icon size={14} /> {item.label}</span>
                    <span className="uppercase tracking-wider text-[11px]">{item.state}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="dash-card group p-4 md:p-5 transition-all hover:border-gray-200">
              <div className="mb-3 flex items-start justify-between">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Icon size={16} className="text-gray-600" />
                </div>
                <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${stat.trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {stat.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span className="hidden xs:inline">{stat.change}</span>
                </div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{stat.name}</p>
              <p className="dash-title mt-1 text-[22px] md:text-[28px] font-bold text-gray-900">{loading ? "..." : stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Bookings Table + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="dash-card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h3 className="dash-title text-base font-bold text-gray-900">Recent Bookings</h3>
            <Link href="/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="p-4">User</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {recentBookings.length > 0 ? recentBookings.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                          {booking.avatar}
                        </div>
                        <span className="font-semibold text-gray-800">{booking.user}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{booking.event}</td>
                    <td className="p-4 font-semibold text-gray-900">{booking.amount}</td>
                    <td className="p-4">
                      <span className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${statusColor[booking.status] || "bg-gray-50 text-gray-600"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-[12px] text-gray-400">{booking.time}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                      {loading ? "Loading..." : "No bookings found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-card p-5 hidden md:block">
          <h3 className="dash-title mb-4 text-base font-bold text-gray-900">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/events/new" className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition-all hover:bg-gray-50 hover:border-gray-200">
              <div className="rounded-lg bg-gray-100 p-2.5 transition group-hover:bg-gray-200">
                <Plus size={16} className="text-gray-600" />
              </div>
              <div>
                <span className="text-[14px] font-semibold text-gray-900">Create Event</span>
                <p className="mt-0.5 text-[11px] text-gray-500">Launch a new experience</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-gray-300 transition group-hover:text-gray-500" />
            </Link>

            <Link href="/gamehub" className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition-all hover:bg-gray-50 hover:border-gray-200">
              <div className="rounded-lg bg-gray-100 p-2.5 transition group-hover:bg-gray-200">
                <ShieldCheck size={16} className="text-gray-600" />
              </div>
              <div>
                <span className="text-[14px] font-semibold text-gray-900">Manage GameHub</span>
                <p className="mt-0.5 text-[11px] text-gray-500">Operations & Scheduling</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-gray-300 transition group-hover:text-gray-500" />
            </Link>

            <Link href="/partners" className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition-all hover:bg-gray-50 hover:border-gray-200">
              <div className="rounded-lg bg-gray-100 p-2.5 transition group-hover:bg-gray-200">
                <Users size={16} className="text-gray-600" />
              </div>
              <div>
                <span className="text-[14px] font-semibold text-gray-900">Partner Hub</span>
                <p className="mt-0.5 text-[11px] text-gray-500">Collaborations & Access</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-gray-300 transition group-hover:text-gray-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="dash-card xl:col-span-2 p-6 flex flex-col">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="dash-title text-base font-bold text-gray-900">Revenue Performance</h3>
              <p className="text-sm text-gray-500 mt-0.5">Monthly trend for FY 2026</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <TrendingUp size={14} /> +24.3%
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="relative h-[200px] overflow-x-auto custom-scrollbar">
              <div className="min-w-[600px] h-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full" preserveAspectRatio="none" aria-label="Revenue trend chart">
                  <defs>
                    <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(16,185,129,0.1)" />
                      <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                    </linearGradient>
                  </defs>

                  <path d={areaPath} fill="url(#areaGlow)" />
                  <path d={linePath} fill="none" stroke="url(#lineGlow)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {points.map((point, index) => (
                    <g key={chartLabels[index]}>
                      <circle cx={point.x} cy={point.y} r="3" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                    </g>
                  ))}
                </svg>
                <div className="absolute inset-x-2 bottom-0 flex justify-between">
                  {chartLabels.map((label, idx) => (
                    <span key={label} className={`text-center text-[10px] font-semibold text-gray-400 ${(idx % 2 !== 0 && chartLabels.length > 6) ? 'hidden sm:block' : ''}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-gray-500 font-semibold">
              <p className="rounded-lg border border-gray-100 bg-white px-1 py-2 text-center truncate">Peak: ₹45.6k</p>
              <p className="rounded-lg border border-gray-100 bg-white px-1 py-2 text-center truncate">Avg: ₹31.2k</p>
              <p className="rounded-lg border border-gray-100 bg-white px-1 py-2 text-center truncate">YoY: +24%</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="dash-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="dash-title inline-flex items-center gap-2 text-base font-bold text-gray-900">
              <Activity size={16} className="text-gray-400" />
              Activity
            </h3>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Live</span>
          </div>

          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {renderedActivity.length > 0 ? renderedActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50">
                  <div className="shrink-0 mt-0.5">
                    <Icon size={15} className={item.iconColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-gray-800 leading-snug">{item.text}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={10} /> {item.time}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-sm text-gray-400 py-6">{loading ? "Loading..." : "No recent activity"}</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
