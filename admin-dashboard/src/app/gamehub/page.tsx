"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Gamepad2, MapPin, Search, Star, Users, Ticket, Sparkles, ArrowUpRight, RefreshCw } from "lucide-react";

type GameHubFacility = {
  id: string;
  name: string;
  type: string;
  location: string;
  venue: string;
  rating: number;
  priceRange: string;
  features?: string[];
  amenities?: string[];
  image?: string;
  tags?: string[];
};

const API_BASE = "http://localhost:5000/api";

export default function GameHubAdminPage() {
  const [facilities, setFacilities] = useState<GameHubFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadFacilities = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(`${API_BASE}/gamehub/facilities?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load GameHub facilities");

        const payload = await response.json();
        if (mounted) setFacilities(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        if (mounted) {
          setFacilities([]);
          setError(err instanceof Error ? err.message : "Failed to load GameHub data");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const timer = window.setTimeout(loadFacilities, 200);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  const stats = useMemo(() => {
    const total = facilities.length;
    const featured = facilities.filter((item) => (item.tags || []).some((tag) => /featured|premium/i.test(tag))).length;
    const avgRating = total
      ? (facilities.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / total).toFixed(1)
      : "0.0";
    return { total, featured, avgRating };
  }, [facilities]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-8 text-white shadow-2xl shadow-slate-200/40">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/75">
              <Gamepad2 size={14} /> GameHub Control Center
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Manage every GameHub section from one place</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/70 md:text-base">
                Review facilities, monitor ratings, open public pages, and keep the GameHub catalog organized for the web app.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "Facilities", value: stats.total, icon: Ticket },
            { label: "Featured", value: stats.featured, icon: Sparkles },
            { label: "Average Rating", value: stats.avgRating, icon: Star },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-white/70">
                  <Icon size={18} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <div className="mt-3 text-3xl font-black text-white">{item.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">GameHub Facilities</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Search and inspect the content shown in the public GameHub area.</p>
          </div>

          <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 md:w-auto">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facilities..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-slate-500">Loading GameHub facilities...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : facilities.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-semibold text-slate-500">
            No GameHub facilities found.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => (
              <article key={facility.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={facility.image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200"}
                    alt={facility.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                    <MapPin size={13} /> {facility.location}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{facility.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{facility.venue}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-600">
                      {facility.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-amber-500" /> {facility.rating}</span>
                    <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {facility.priceRange}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(facility.features || facility.amenities || []).slice(0, 4).map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`http://localhost:3000/gamehub/${facility.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
                    >
                      Open Public Page <ArrowUpRight size={16} />
                    </Link>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Synced</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}