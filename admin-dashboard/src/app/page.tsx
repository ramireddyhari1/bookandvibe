"use client";
import {
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  MoreHorizontal,
  UserPlus,
  CreditCard,
  Clock,
  Activity,
  Zap,
  BarChart3,
  ShoppingBag,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    {
      name: "Total Users",
      value: "12,482",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      name: "Active Events",
      value: "342",
      change: "+8.2%",
      trend: "up",
      icon: Ticket,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      name: "Revenue",
      value: "₹42,890",
      change: "+24.3%",
      trend: "up",
      icon: DollarSign,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      name: "Bookings",
      value: "1,847",
      change: "-3.1%",
      trend: "down",
      icon: ShoppingBag,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  const recentBookings = [
    { user: "Aarav Patel", avatar: "AP", event: "Mumbai EDM Fest", amount: "₹2,999", status: "Confirmed", time: "2 min ago" },
    { user: "Priya Sharma", avatar: "PS", event: "Comedy Special", amount: "₹799", status: "Confirmed", time: "15 min ago" },
    { user: "Rahul Verma", avatar: "RV", event: "Pottery Workshop", amount: "₹1,799", status: "Pending", time: "32 min ago" },
    { user: "Sneha Reddy", avatar: "SR", event: "Sunburn Reload", amount: "₹3,499", status: "Confirmed", time: "1 hr ago" },
    { user: "Amit Kumar", avatar: "AK", event: "Delhi Food Fest", amount: "₹499", status: "Cancelled", time: "2 hr ago" },
    { user: "Deepika Nair", avatar: "DN", event: "Indie Unplugged", amount: "₹1,499", status: "Confirmed", time: "3 hr ago" },
  ];

  const activityFeed = [
    { icon: UserPlus, text: "New user Vikram Singh registered", time: "5 min ago", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    { icon: Ticket, text: "Event 'Delhi Food Fest' published", time: "18 min ago", iconBg: "bg-rose-50", iconColor: "text-rose-500" },
    { icon: CreditCard, text: "Payment ₹4,999 received", time: "45 min ago", iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
    { icon: Users, text: "Partner 'Arena Events' onboarded", time: "2 hr ago", iconBg: "bg-violet-50", iconColor: "text-violet-500" },
    { icon: Zap, text: "System update deployed v2.4.1", time: "4 hr ago", iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  ];

  const statusColor: Record<string, string> = {
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-red-50 text-red-600 border-red-200",
  };

  // Simple bar chart data (simulated)
  const chartBars = [35, 58, 42, 70, 55, 82, 68, 90, 75, 60, 88, 95];
  const chartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxBar = Math.max(...chartBars);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back, Admin. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-600 flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon size={20} className={stat.textColor} />
                </div>
                <div
                  className={`flex items-center gap-1 text-[13px] font-bold px-2.5 py-1 rounded-lg ${
                    stat.trend === "up"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1">
                {stat.name}
              </p>
              <p className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart + Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Revenue Overview</h2>
              <p className="text-sm text-slate-500 font-medium">Monthly revenue for 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <TrendingUp size={14} /> +24.3%
              </span>
            </div>
          </div>

          {/* Simple CSS Bar Chart */}
          <div className="flex items-end gap-2 h-[200px] pt-4">
            {chartBars.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group/bar">
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                    ₹{(val * 480).toLocaleString()}
                  </div>
                  <div
                    className={`w-full rounded-lg transition-all duration-500 hover:opacity-80 cursor-pointer ${
                      i === chartBars.length - 1
                        ? "bg-gradient-to-t from-rose-500 to-pink-400"
                        : "bg-gradient-to-t from-slate-200 to-slate-100"
                    }`}
                    style={{ height: `${(val / maxBar) * 180}px` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {chartLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-rose-500" />
              Activity
            </h2>
            <button className="text-sm text-rose-500 font-bold hover:text-rose-600 transition">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {activityFeed.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition group cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${item.iconBg} shrink-0`}>
                    <Icon size={15} className={item.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 leading-snug">
                      {item.text}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Bookings + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900">
              Recent Bookings
            </h2>
            <Link
              href="/bookings"
              className="text-sm text-rose-500 font-bold hover:text-rose-600 transition flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[12px] uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Event</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentBookings.map((booking, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                          {booking.avatar}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {booking.user}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {booking.event}
                    </td>
                    <td className="p-4 text-slate-900 font-bold">
                      {booking.amount}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                          statusColor[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[13px] font-medium">
                      {booking.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/events/new"
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-rose-50 hover:border-rose-200 transition group"
            >
              <div className="p-2.5 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition">
                <Plus size={18} className="text-rose-500" />
              </div>
              <div>
                <span className="font-bold text-slate-700 text-[14px]">Create Event</span>
                <p className="text-[11px] text-slate-400 font-medium">Publish a new event</p>
              </div>
            </Link>

            <Link
              href="/users"
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-violet-50 hover:border-violet-200 transition group"
            >
              <div className="p-2.5 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition">
                <Users size={18} className="text-violet-500" />
              </div>
              <div>
                <span className="font-bold text-slate-700 text-[14px]">Manage Users</span>
                <p className="text-[11px] text-slate-400 font-medium">View all platform users</p>
              </div>
            </Link>

            <Link
              href="/bookings"
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition group"
            >
              <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition">
                <BarChart3 size={18} className="text-emerald-500" />
              </div>
              <div>
                <span className="font-bold text-slate-700 text-[14px]">View Analytics</span>
                <p className="text-[11px] text-slate-400 font-medium">Bookings & revenue</p>
              </div>
            </Link>

            <Link
              href="/settings"
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-amber-50 hover:border-amber-200 transition group"
            >
              <div className="p-2.5 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition">
                <Zap size={18} className="text-amber-500" />
              </div>
              <div>
                <span className="font-bold text-slate-700 text-[14px]">Settings</span>
                <p className="text-[11px] text-slate-400 font-medium">Platform configuration</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
