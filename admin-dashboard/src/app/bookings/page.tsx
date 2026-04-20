"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Search, Ticket } from "lucide-react";

import { fetchApi } from "@/lib/api";

type BookingRecord = {
  id: string;
  status: string;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  user?: { name?: string; email?: string };
  event?: { title?: string };
  payment?: { method?: string };
};

function formatStatus(status: string): string {
  const value = String(status || "").toUpperCase();
  if (value === "CONFIRMED") return "Confirmed";
  if (value === "PENDING") return "Pending";
  if (value === "CANCELLED") return "Cancelled";
  if (value === "REFUNDED") return "Refunded";
  if (value === "USED") return "Used";
  return value || "Unknown";
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError("");
      try {
        const payload = await fetchApi("/bookings/manage/list") as { data: BookingRecord[] };
        setBookings(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch bookings";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const userName = booking.user?.name || "";
      const eventName = booking.event?.title || "";
      const searchSpace = `${booking.id} ${userName} ${eventName}`.toLowerCase();
      const matchesSearch = searchSpace.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || formatStatus(booking.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter((b) => String(b.status).toUpperCase() === "CONFIRMED")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const refunded = bookings
      .filter((b) => String(b.status).toUpperCase() === "REFUNDED")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const avg = totalBookings ? totalRevenue / totalBookings : 0;

    return {
      totalBookings,
      totalRevenue,
      refunded,
      averageValue: avg,
    };
  }, [bookings]);

  const statusTabs = ["All", "Confirmed", "Pending", "Cancelled", "Refunded", "Used"];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Bookings</h1>
        <p className="text-emerald-600/70 mt-1 font-bold uppercase text-[10px] tracking-wider">Live tracking & operations</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Total Bookings</p>
          <p className="text-3xl font-black mt-1 text-slate-900 tracking-tight">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Confirmed Revenue</p>
          <p className="text-3xl font-black mt-1 text-emerald-600 tracking-tight">₹{Math.round(stats.totalRevenue).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Avg Ticket</p>
          <p className="text-3xl font-black mt-1 text-slate-900 tracking-tight">₹{Math.round(stats.averageValue).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Refunded</p>
          <p className="text-3xl font-black mt-1 text-red-500 tracking-tight">₹{Math.round(stats.refunded).toLocaleString()}</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-emerald-50 p-5 space-y-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${statusFilter === tab ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-emerald-50/50 text-emerald-800/60 hover:bg-emerald-50"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-emerald-50/30 rounded-2xl px-4 py-3 border border-emerald-50/50 focus-within:border-emerald-200 focus-within:bg-white transition-all">
          <Search size={18} className="text-emerald-600/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking id, user, event..."
            className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 placeholder:text-emerald-900/30"
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading bookings...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="p-3">Booking</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="p-4 font-mono text-emerald-700/60 font-bold">{booking.id}</td>
                    <td className="p-4 font-black text-slate-800">{booking.user?.name || "-"}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 font-bold text-slate-600">
                        <Ticket size={14} className="text-emerald-500" />
                        {booking.event?.title || "-"}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900">{booking.quantity}</td>
                    <td className="p-4 font-black text-slate-900">₹{Math.round(booking.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4 font-bold text-slate-500">{booking.payment?.method || "-"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusFilter === "Confirmed" || formatStatus(booking.status) === "Confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                        {formatStatus(booking.status)}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-emerald-400/60" />
                        {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
