"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Pencil,
  Eye,
  UserRound,
  FolderSearch,
  Layers,
  CalendarClock,
  Radio,
} from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price: number;
  status: string;
  images?: string;
  partnerId?: string | null;
};

type PartnerOption = {
  id: string;
  name: string;
  email: string;
};

import { fetchApi } from "@/lib/api";

// Removed redundant type declaration

type PartnerOption = {
  id: string;
  name: string;
  email: string;
};

const ALLOWED_ROLES = new Set(["ADMIN", "PARTNER"]);

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function CardSkeleton() {
  return (
    <div className="dash-card loading-shimmer overflow-hidden bg-white border-emerald-50">
      <div className="h-48 bg-emerald-50/50" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-emerald-50/70" />
        <div className="h-4 w-1/2 rounded bg-emerald-50/50" />
        <div className="h-4 w-4/5 rounded bg-emerald-50/50" />
        <div className="h-9 w-full rounded-xl bg-emerald-50/50" />
      </div>
    </div>
  );
}

function toDisplayDate(dateValue: string) {
  const dt = new Date(dateValue);
  if (Number.isNaN(dt.getTime())) return "Date TBD";
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function categoryTone(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("music")) return "from-emerald-500/10 to-teal-500/5 border-emerald-200/50 text-emerald-700";
  if (normalized.includes("sport")) return "from-emerald-600/10 to-emerald-400/5 border-emerald-300/50 text-emerald-800";
  if (normalized.includes("comedy")) return "from-emerald-400/10 to-teal-400/5 border-teal-200/50 text-teal-700";
  return "from-slate-100 to-slate-50 border-slate-200 text-slate-600";
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasManagerAccess, setHasManagerAccess] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [partners, setPartners] = useState<PartnerOption[]>([]);

  function clearDashboardSession() {
    sessionStorage.removeItem("admin_dash_token");
    sessionStorage.removeItem("admin_dash_role");
    sessionStorage.removeItem("admin_dash_user");
    localStorage.removeItem("admin_dash_token");
    localStorage.removeItem("admin_dash_role");
    localStorage.removeItem("admin_dash_user");
    document.cookie = "admin_dash_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_role=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_session=; path=/; max-age=0; samesite=lax";
  }

  function readPrimaryImage(event: EventItem) {
    try {
      const parsed = JSON.parse(event.images || "[]");
      return Array.isArray(parsed) && parsed[0] ? String(parsed[0]) : "";
    } catch {
      return "";
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadManagedEvents() {
      setLoading(true);
      setError("");

      try {
        const token = sessionStorage.getItem("admin_dash_token") || localStorage.getItem("admin_dash_token") || "";
        const cookieRole = String(readCookie("admin_dash_role") || "").toUpperCase();
        const role = String(
          sessionStorage.getItem("admin_dash_role") ||
            localStorage.getItem("admin_dash_role") ||
            cookieRole ||
            (() => {
              try {
                const rawUser = sessionStorage.getItem("admin_dash_user") || localStorage.getItem("admin_dash_user") || "null";
                const user = JSON.parse(rawUser);
                return user?.role || "";
              } catch {
                return "";
              }
            })()
        ).toUpperCase();

        if (!token || !ALLOWED_ROLES.has(role)) {
          if (mounted) {
            setHasManagerAccess(false);
            setError("Log in as ADMIN or PARTNER to manage events.");
            setEvents([]);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setHasManagerAccess(true);
          setCurrentRole(role);
        }

        if (role === "ADMIN") {
          try {
            const partnersPayload = await fetchApi("/users/partners?status=ACTIVE&limit=200");
            if (mounted) {
              setPartners(Array.isArray(partnersPayload?.data) ? partnersPayload.data : []);
            }
          } catch (pErr) {
            console.warn("Failed to fetch partners:", pErr);
          }
        }

        const payload = await fetchApi("/events/manage/list");
        if (mounted) {
          setEvents(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        if (mounted) {
          const status = (err as any).status || 0;
          if ([401, 403, 404].includes(status)) {
            clearDashboardSession();
            setError("Session expired. Please login again.");
            router.replace("/login");
            return;
          }
          setError(err instanceof Error ? err.message : "Failed to load events");
          setEvents([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadManagedEvents();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!hasManagerAccess) {
      setError("Log in as ADMIN or PARTNER to delete events.");
      return;
    }

    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await fetchApi(`/events/${id}`, { method: "DELETE" });
        setEvents((prev) => prev.filter((event) => event.id !== id));
      } catch (deleteError) {
        const status = (deleteError as any).status || 0;
        if ([401, 403, 404].includes(status)) {
          clearDashboardSession();
          setError("Session expired. Please login again.");
          router.replace("/login");
          return;
        }
        setError(deleteError instanceof Error ? deleteError.message : "Failed to delete event");
      }
    }
  };

  const handleAssignPartner = async (eventId: string, partnerId: string) => {
    if (currentRole !== "ADMIN") return;
    try {
      await fetchApi(`/events/${eventId}/assign-partner`, {
        method: "PATCH",
        body: JSON.stringify({ partnerId }),
      });
      setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, partnerId } : event)));
    } catch (assignErr) {
      setError(assignErr instanceof Error ? assignErr.message : "Failed to assign partner");
    }
  };

  const handleApprovalAction = async (eventId: string, action: "approve" | "reject") => {
    if (currentRole !== "ADMIN") return;
    try {
      await fetchApi(`/events/${eventId}/${action}`, { method: "POST" });
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, status: action === "approve" ? "ACTIVE" : "REJECTED" } : event
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} event`);
    }
  };

  const stats = useMemo(() => {
    const total = events.length;
    const now = Date.now();
    const upcoming = events.filter((event) => new Date(event.date).getTime() > now).length;
    const active = Math.max(total - Math.max(0, upcoming - 1), 0);
    return { total, active, upcoming };
  }, [events]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="dash-card relative overflow-hidden bg-white border-emerald-100 p-6 md:p-7 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-emerald-200/10 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/60">Inventory Control</p>
            <h1 className="dash-title mt-2 bg-gradient-to-r from-emerald-900 to-teal-800 bg-clip-text text-3xl font-black text-transparent md:text-4xl uppercase tracking-tighter">
              Manage Events
            </h1>
            <p className="mt-3 text-sm font-bold text-slate-500/80">Control publishing, assignments, and lifecycle operations for all event inventory.</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider">Total: {stats.total}</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider">Active: {stats.active}</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider">Upcoming: {stats.upcoming}</span>
            </div>
          </div>
          <Link href="/events/new" className="btn-primary-glow inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-200">
            <Plus size={18} strokeWidth={3} /> New Event
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="dash-card rounded-2xl border-rose-400/40 p-12 text-center">
          <p className="text-base font-bold text-rose-300">Connection Error</p>
          <p className="mt-2 text-sm text-slate-300">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-glass mt-5 rounded-xl px-4 py-2 text-sm font-bold">
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="dash-card p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-600/60 bg-slate-900/60 text-slate-300">
            <FolderSearch size={26} />
          </div>
          <h3 className="dash-title mt-4 text-xl font-black text-slate-100">No events yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">Create your first event and start building demand across venues and audiences.</p>
          <Link href="/events/new" className="btn-primary-glow mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold">
            <Plus size={16} /> Create First Event
          </Link>
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-600/20 via-rose-500/15 to-orange-500/15 blur-3xl" />
          <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {events.map((event) => {
              const cover = readPrimaryImage(event);
              return (
                <article
                  key={event.id}
                  className="dash-card group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.55)]"
                >
                  <div className="relative h-48 overflow-hidden">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={event.title}
                        fill
                        unoptimized
                        className="object-cover transition duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <Layers size={32} className="text-slate-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <span className={`inline-flex rounded-full border bg-white/90 shadow-sm px-3 py-1 text-[11px] font-black uppercase tracking-wider ${categoryTone(event.category)}`}>
                        {event.category || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-5 bg-white">
                    <div>
                      <h3 className="dash-title line-clamp-2 text-lg font-black text-slate-900 leading-tight">{event.title}</h3>
                      <p className="mt-1 text-sm font-black text-emerald-600">₹{Number(event.price || 0).toLocaleString()}</p>
                    </div>

                    <div className="space-y-2 text-xs font-bold text-slate-500">
                      <p className="flex items-center gap-2"><Calendar size={14} className="text-emerald-500/70" /> {toDisplayDate(event.date)}</p>
                      <p className="flex items-center gap-2"><CalendarClock size={14} className="text-emerald-500/70" /> {event.time || "TBD"}</p>
                      <p className="line-clamp-1 flex items-center gap-2"><MapPin size={14} className="text-emerald-500/70" /> {event.venue}, {event.location}</p>
                    </div>

                    {currentRole === "ADMIN" ? (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400/80">Manage Assignment</label>
                        <div className="bg-emerald-50/30 border border-emerald-50 rounded-xl flex items-center gap-2 px-2 py-1 transition-all focus-within:bg-white focus-within:border-emerald-100">
                          <UserRound size={13} className="text-emerald-500/50" />
                          <select
                            value={event.partnerId || ""}
                            onChange={(e) => handleAssignPartner(event.id, e.target.value)}
                            className="w-full appearance-none bg-transparent px-1 py-1.5 text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            <option className="bg-white" value="" disabled>
                              Select partner
                            </option>
                            {partners.map((partner) => (
                              <option className="bg-white" key={partner.id} value={partner.id}>
                                {partner.name} ({partner.email})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}

                    <div className={currentRole === "ADMIN" && event.status === "PENDING" ? "space-y-3" : ""}>
                      {currentRole === "ADMIN" && event.status === "PENDING" && (
                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                          <button
                            onClick={() => handleApprovalAction(event.id, "approve")}
                            className="flex-1 rounded-xl bg-emerald-600 py-2 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprovalAction(event.id, "reject")}
                            className="flex-1 rounded-xl bg-rose-50 py-2 text-[11px] font-black uppercase tracking-wider text-rose-600 transition hover:bg-rose-100 border border-rose-100"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                          {event.status === "ACTIVE" ? (
                            <div className="rounded-full border border-emerald-400/25 bg-emerald-50 text-[10px] font-black uppercase tracking-wider text-emerald-600 px-2 py-0.5">
                              Active
                            </div>
                          ) : event.status === "PENDING" ? (
                            <div className="rounded-full border border-amber-400/25 bg-amber-50 text-[10px] font-black uppercase tracking-wider text-amber-600 px-2 py-0.5 animate-pulse">
                              Pending
                            </div>
                          ) : event.status === "REJECTED" ? (
                            <div className="rounded-full border border-rose-400/25 bg-rose-50 text-[10px] font-black uppercase tracking-wider text-rose-600 px-2 py-0.5">
                              Rejected
                            </div>
                          ) : (
                            <div className="rounded-full border border-slate-400/25 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 py-0.5">
                              Draft
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="group/tooltip relative">
                            <Link
                              href={`/events/${event.id}`}
                              title="View"
                              className="btn-glass focus-premium rounded-lg p-2.5 hover:shadow-[0_0_20px_rgba(125,211,252,0.25)]"
                            >
                              <Eye size={15} />
                            </Link>
                            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-slate-200 opacity-0 transition group-hover/tooltip:opacity-100">View</span>
                          </div>
                          <div className="group/tooltip relative">
                            <Link
                              href={`/events/new?eventId=${event.id}`}
                              title="Edit"
                              className="btn-glass focus-premium rounded-lg p-2.5 hover:shadow-[0_0_20px_rgba(167,139,250,0.25)]"
                            >
                              <Pencil size={15} />
                            </Link>
                            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-slate-200 opacity-0 transition group-hover/tooltip:opacity-100">Edit</span>
                          </div>
                          <div className="group/tooltip relative">
                            <button
                              onClick={() => handleDelete(event.id)}
                              title="Delete"
                              className="btn-danger-soft focus-premium rounded-lg p-2.5"
                            >
                              <Trash2 size={15} />
                            </button>
                            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md border border-rose-300/25 bg-rose-950/85 px-2 py-0.5 text-[10px] font-bold text-rose-200 opacity-0 transition group-hover/tooltip:opacity-100">Delete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
