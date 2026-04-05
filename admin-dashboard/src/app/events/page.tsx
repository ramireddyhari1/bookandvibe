"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, MapPin, Calendar, Clock } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then(res => res.json())
      .then(data => {
        setEvents(data.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch events:", err);
        setError("Could not connect to the backend. Make sure the server is running on port 5000.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
      setEvents(events.filter((e: any) => e.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-500 mt-2">View and manage all active events on the platform.</p>
        </div>
        <Link 
          href="/events/new"
          className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-medium">
          <Plus size={20} /> New Event
        </Link>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading events...</div>
      ) : error ? (
        <div className="text-center py-20 bg-white border border-dashed border-red-200 rounded-2xl">
          <p className="text-red-500 mb-2 font-semibold">⚠️ Connection Error</p>
          <p className="text-gray-500 mb-4 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sky-600 font-medium hover:underline">Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
          <p className="text-gray-500 mb-4">No events found. Start by creating one!</p>
          <Link href="/events/new" className="text-sky-600 font-medium hover:underline">Create First Event</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="h-48 bg-gray-200 relative">
                {event.images && JSON.parse(event.images)[0] && (
                  <img src={JSON.parse(event.images)[0]} alt={event.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-sky-700">
                  {event.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} /> {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} /> {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} /> {event.venue}, {event.location}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-lg font-bold text-gray-900">${event.price.toFixed(2)}</div>
                  <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
