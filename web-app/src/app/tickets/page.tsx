"use client";
import { useEffect, useState } from "react";
import { QrCode, Calendar, MapPin, Clock, Ticket } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/bookings`)
      .then(res => res.json())
      .then(data => setBookings(data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-rose-50 text-slate-800 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-12 border-b border-rose-200 pb-6 flex items-center gap-4">
          <Ticket size={40} className="text-rose-500" />
          <div>
            <h1 className="text-4xl font-bold">My Digital Tickets</h1>
            <p className="text-slate-500 mt-2">Manage your upcoming experiences and event passes.</p>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading your tickets...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-rose-200 rounded-3xl">
            <p className="text-slate-500 mb-6">You haven't booked any events yet.</p>
            <Link href="/" className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-full font-bold transition">
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => {
              const event = booking.event;
              const imageUrl = event.images && JSON.parse(event.images)[0] 
                ? JSON.parse(event.images)[0] 
                : "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070";

              return (
                <div key={booking.id} className="bg-white border border-rose-200 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:bg-rose-100 transition group shadow-lg shadow-rose-500/5">
                  <div className="md:w-1/3 h-48 md:h-auto relative">
                    <img src={imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rose-50 hidden md:block" />
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold">{event.title}</h2>
                        <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-bold border border-green-500/30">
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Calendar size={16} className="text-rose-400" /> {new Date(event.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Clock size={16} className="text-rose-400" /> {event.time}</div>
                        <div className="flex items-center gap-2 col-span-2"><MapPin size={16} className="text-rose-400" /> {event.venue}, {event.location}</div>
                      </div>
                    </div>

                    <div className="border-t border-rose-200 mt-6 pt-6 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Order Amount</p>
                        <p className="font-bold text-lg">${booking.totalAmount.toFixed(2)} <span className="text-sm font-normal text-slate-500">({booking.quantity}x Tickets)</span></p>
                      </div>
                      <button className="flex items-center gap-2 border border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl transition">
                        <QrCode size={18} /> View QR TKT
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
