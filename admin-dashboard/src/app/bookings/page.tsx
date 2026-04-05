"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Search, Ticket } from "lucide-react";

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

const API_BASE = "http://localhost:5000/api";

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
        const response = await fetch(`${API_BASE}/bookings/all`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch bookings");
        }
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bookings</h1>
        <p className="text-slate-500 mt-1 font-medium">Live booking data from backend</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">Total Bookings</p>
          <p className="text-2xl font-extrabold mt-1">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">Confirmed Revenue</p>
          <p className="text-2xl font-extrabold mt-1">INR {Math.round(stats.totalRevenue).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">Average Ticket Value</p>
          <p className="text-2xl font-extrabold mt-1">INR {Math.round(stats.averageValue).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">Refunded</p>
          <p className="text-2xl font-extrabold mt-1">INR {Math.round(stats.refunded).toLocaleString()}</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold ${statusFilter === tab ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
          <Search size={16} className="text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking id, user, event"
            className="bg-transparent w-full outline-none text-sm"
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
                    <td className="p-3 font-mono">{booking.id}</td>
                    <td className="p-3">{booking.user?.name || "-"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Ticket size={13} className="text-rose-400" />
                        {booking.event?.title || "-"}
                      </span>
                    </td>
                    <td className="p-3">{booking.quantity}</td>
                    <td className="p-3 font-bold">INR {Math.round(booking.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-3">{booking.payment?.method || "-"}</td>
                    <td className="p-3">{formatStatus(booking.status)}</td>
                    <td className="p-3 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
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
