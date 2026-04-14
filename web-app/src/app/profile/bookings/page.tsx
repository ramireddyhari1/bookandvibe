"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Search,
  QrCode,
  X,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Gamepad2,
  Music,
  Navigation,
  Copy,
  Check,
  Shield,
  Star,
  Flame,
  ArrowRight,
  ChevronRight,
  IndianRupee,
  Eye,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

type BookingTab = "all" | "events" | "courts";

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; dot: string; icon: React.ReactNode; label: string }
> = {
  CONFIRMED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: <CheckCircle2 size={12} />,
    label: "Confirmed",
  },
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    icon: <Loader2 size={12} className="animate-spin" />,
    label: "Pending",
  },
  CANCELLED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-400",
    icon: <XCircle size={12} />,
    label: "Cancelled",
  },
  USED: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
    icon: <CheckCircle2 size={12} />,
    label: "Used",
  },
  SUCCESS: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: <CheckCircle2 size={12} />,
    label: "Success",
  },
};

function getStatusStyle(status: string) {
  return STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.CONFIRMED;
}

/* ─── QR Ticket Modal ────────────────────────────────────── */
function QrTicketModal({
  booking,
  onClose,
}: {
  booking: any;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isEvent = booking._type === "event";
  const title = isEvent ? booking.event?.title || "Event" : booking.facility?.name || "Court Booking";
  const venue = isEvent ? booking.event?.venue : booking.facility?.venue;
  const location = isEvent ? booking.event?.location : booking.facility?.location;
  const dateStr = isEvent ? booking.event?.date : booking.bookingDate;
  const timeStr = isEvent ? booking.event?.time : booking.slotLabel;
  const qrCode = booking.qrCode || booking.transactionId || booking.id?.slice(0, 12) || "N/A";
  const status = booking.status || "CONFIRMED";
  const statusStyle = getStatusStyle(status);
  const mapLink = isEvent ? booking.event?.mapLink : booking.facility?.mapLink;
  const directionsUrl = mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue, location].filter(Boolean).join(", "))}`;

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    JSON.stringify({ bookingId: booking.id, code: qrCode, title, qty: booking.quantity || 1 })
  )}&color=1c222b&bgcolor=ffffff`;

  const imageUrl = isEvent ? (() => {
    try {
      const images = JSON.parse(booking.event?.images || "[]");
      return Array.isArray(images) && images[0] ? images[0] : "";
    } catch { return ""; }
  })() : booking.facility?.image || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full max-w-[370px] animate-in zoom-in-95 fade-in duration-300">
        <div className="bg-white rounded-[24px] shadow-2xl shadow-black/30 overflow-hidden">
          
          {/* Header with poster */}
          <div className="relative bg-[#0a0a0a] px-6 pt-5 pb-6 text-white overflow-hidden min-h-[160px] flex flex-col justify-end">
            {imageUrl && (
              <>
                <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 brightness-75" />
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </>
            )}

            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md">
              <X size={16} />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <Flame size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold tracking-tight leading-none text-white">BOOK & VIBE</p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60 mt-0.5">Digital Pass</p>
                </div>
              </div>

              <h3 className="text-[18px] font-extrabold leading-tight tracking-tight pr-8 line-clamp-2 text-white">{title}</h3>
              
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {dateStr && (
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-white/90 border border-white/10">
                    <Calendar size={11} className="text-rose-400" />
                    {new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}
                  </span>
                )}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold text-rose-300 border border-rose-500/20 transition-all"
                >
                  <Navigation size={11} />
                  Directions
                </a>
              </div>
              {(venue || location) && (
                <p className="flex items-center gap-1.5 text-white/60 text-[11px] font-medium mt-2">
                  <MapPin size={11} className="text-rose-400/70" />
                  {[venue, location].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative h-6 flex items-center">
            <div className="absolute -left-4 w-8 h-8 bg-[#f5f5f5] rounded-full" style={{ top: '-16px' }} />
            <div className="absolute -right-4 w-8 h-8 bg-[#f5f5f5] rounded-full" style={{ top: '-16px' }} />
            <div className="w-full border-t-2 border-dashed border-gray-200 mx-8" />
          </div>

          {/* QR Code */}
          <div className="px-6 pb-3 flex flex-col items-center">
            <div className="relative p-1.5">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-[2.5px] border-l-[2.5px] border-rose-500 rounded-tl-md" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-[2.5px] border-r-[2.5px] border-rose-500 rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-[2.5px] border-l-[2.5px] border-rose-500 rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-[2.5px] border-r-[2.5px] border-rose-500 rounded-br-md" />
              <div className="p-3">
                <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 rounded-lg" />
              </div>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-1.5">Scan at venue</p>
          </div>

          {/* Booking Code */}
          <div className="mx-6 mb-3">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-gray-400">Booking Code</p>
                <p className="text-[14px] font-black text-gray-900 tracking-wider font-mono mt-0.5">{qrCode}</p>
              </div>
              <button onClick={handleCopy} className="p-2 rounded-lg bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-gray-400 hover:text-rose-500">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mx-6 mb-4 grid grid-cols-3 gap-1.5">
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{isEvent ? "Tickets" : "Slot"}</p>
              <p className="font-black text-gray-900 text-[15px] mt-0.5">{isEvent ? `${booking.quantity || 1}` : "1"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Amount</p>
              <p className="font-black text-gray-900 text-[15px] mt-0.5">₹{(booking.totalAmount || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Status</p>
              <p className={`font-black text-[12px] mt-0.5 ${statusStyle.text}`}>{statusStyle.label}</p>
            </div>
          </div>

          {/* Seat numbers */}
          {booking.seatNumbers && (() => {
            try {
              const seats = JSON.parse(booking.seatNumbers);
              if (Array.isArray(seats) && seats.length > 0) {
                return (
                  <div className="mx-6 mb-4 bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Assigned Seats</p>
                    <div className="flex flex-wrap gap-1.5">
                      {seats.map((s: string) => (
                        <span key={s} className="bg-white border border-gray-200 text-gray-900 font-bold text-xs px-2.5 py-1 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch { /* ignore */ }
            return null;
          })()}

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-gray-300" />
              <span className="text-[10px] font-bold text-gray-400">Secured by Book & Vibe</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Star size={9} className="text-rose-400 fill-rose-400" />
              <Star size={9} className="text-rose-400 fill-rose-400" />
              <Star size={9} className="text-rose-400 fill-rose-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function BookingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BookingTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [eventBookings, setEventBookings] = useState<any[]>([]);
  const [courtBookings, setCourtBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }

    const loadBookings = async () => {
      setLoading(true);
      try {
        const [evtRes, courtRes] = await Promise.allSettled([
          fetchApi("/bookings", { requiresAuth: true }),
          fetchApi("/gamehub/bookings", { requiresAuth: true }),
        ]);
        if (evtRes.status === "fulfilled") {
          setEventBookings(((evtRes.value as any)?.data || []).map((b: any) => ({ ...b, _type: "event" })));
        }
        if (courtRes.status === "fulfilled") {
          setCourtBookings(((courtRes.value as any)?.data || []).map((b: any) => ({ ...b, _type: "court" })));
        }
      } catch (err) { console.error("Failed to load bookings:", err); }
      finally { setLoading(false); }
    };
    loadBookings();
  }, [isAuthenticated, router]);

  const allBookings = [...eventBookings, ...courtBookings].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const filtered = allBookings.filter((b) => {
    if (activeTab === "events" && b._type !== "event") return false;
    if (activeTab === "courts" && b._type !== "court") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = b._type === "event" ? b.event?.title || "" : b.facility?.name || "";
      const venue = b._type === "event" ? b.event?.venue || "" : b.facility?.venue || "";
      return title.toLowerCase().includes(q) || venue.toLowerCase().includes(q);
    }
    return true;
  });

  const getEventImage = useCallback((imagesStr: string) => {
    try {
      const images = JSON.parse(imagesStr || "[]");
      return Array.isArray(images) && images[0] ? images[0] : "";
    } catch { return ""; }
  }, []);

  const totalSpent = allBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);

  const tabs: { key: BookingTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "all", label: "All Passes", icon: <Ticket size={15} />, count: allBookings.length },
    { key: "events", label: "Events", icon: <Music size={15} />, count: eventBookings.length },
    { key: "courts", label: "Courts", icon: <Gamepad2 size={15} />, count: courtBookings.length },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* QR Modal */}
      {selectedBooking && <QrTicketModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}

      {/* ─── Cinematic Hero ─── */}
      <div className="relative overflow-hidden">
        {/* Background imagery — abstract concert lights */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-600/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-12">
          {/* Back nav */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-[13px] font-medium transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            {/* Title */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9]">
                My<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-orange-400">Bookings.</span>
              </h1>
              <p className="text-white/30 text-[15px] font-medium mt-4 max-w-md leading-relaxed">
                Your confirmed tickets, court reservations,<br />and everything in between.
              </p>
            </div>

            {/* Stats row */}
            {!loading && (
              <div className="flex items-center gap-4 sm:gap-8 w-full lg:w-auto justify-between lg:justify-start">
                <div className="text-center flex-1 lg:flex-none">
                  <p className="text-2xl sm:text-3xl font-black text-white">{allBookings.length}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/25 mt-1">Bookings</p>
                </div>
                <div className="w-px h-8 sm:h-10 bg-white/10" />
                <div className="text-center flex-1 lg:flex-none">
                  <p className="text-2xl sm:text-3xl font-black text-white">{eventBookings.length}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/25 mt-1">Events</p>
                </div>
                <div className="w-px h-8 sm:h-10 bg-white/10" />
                <div className="text-center flex-1 lg:flex-none">
                  <p className="text-2xl sm:text-3xl font-black text-rose-400">₹{totalSpent.toLocaleString("en-IN")}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/25 mt-1">Spent</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Tabs + Search ─── */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-3">
            {/* Tab buttons */}
            <div className="flex items-center gap-1 w-full lg:w-auto overflow-x-auto scrollbar-hide pb-1 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-white text-black shadow-lg shadow-white/10"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                    activeTab === tab.key ? "bg-black/10 text-black/60" : "bg-white/5 text-white/30"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-2.5 w-full lg:w-72 focus-within:border-rose-500/30 focus-within:bg-white/8 transition-all">
              <Search size={15} className="text-white/30 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-white/20 w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-white shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Booking Cards ─── */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-5" />
            <p className="text-white/20 font-bold text-sm tracking-wide">Loading your passes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/3 border border-white/5 flex items-center justify-center mb-6">
              <Ticket size={32} className="text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
              {searchQuery ? "No matches" : "No bookings yet"}
            </h3>
            <p className="text-white/25 text-sm max-w-xs mx-auto font-medium">
              {searchQuery ? "Try a different search" : "Discover events and book your first experience"}
            </p>
            {!searchQuery && (
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-8 py-3.5 rounded-full font-bold text-sm mt-8 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
              >
                Browse Events <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking: any) => {
              const isEvent = booking._type === "event";
              const title = isEvent ? booking.event?.title : booking.facility?.name;
              const venue = isEvent ? booking.event?.venue : booking.facility?.venue;
              const location = isEvent ? booking.event?.location : booking.facility?.location;
              const dateStr = isEvent ? booking.event?.date : booking.bookingDate;
              const timeStr = isEvent ? booking.event?.time : booking.slotLabel;
              const status = booking.status || "CONFIRMED";
              const statusStyle = getStatusStyle(status);
              const amount = booking.totalAmount || 0;
              const imageUrl = isEvent ? getEventImage(booking.event?.images) : booking.facility?.image || "";

              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "TBD";

              return (
                <div
                  key={booking.id}
                  className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-56 h-44 md:h-auto shrink-0 overflow-hidden">
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl}
                            alt={title || "Booking"}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0a0a0a]" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/30 to-[#0a0a0a] flex items-center justify-center">
                          {isEvent ? <Music size={40} className="text-white/5" /> : <Gamepad2 size={40} className="text-white/5" />}
                        </div>
                      )}

                      {/* Type badge */}
                      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                        isEvent
                          ? "bg-rose-500/80 text-white"
                          : "bg-emerald-500/80 text-white"
                      }`}>
                        {isEvent ? <Music size={10} /> : <Gamepad2 size={10} />}
                        {isEvent ? "Event" : "Court"}
                      </div>

                      {/* Date overlay on mobile */}
                      <div className="absolute bottom-3 left-3 md:hidden">
                        <p className="text-white font-black text-lg leading-none">{formattedDate}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg md:text-xl font-extrabold text-white leading-tight tracking-tight line-clamp-1 group-hover:text-rose-400 transition-colors">
                            {title || "Untitled"}
                          </h3>
                          <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </span>
                        </div>

                        {/* Info row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                          {(venue || location) && (
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-white/30">
                              <MapPin size={12} className="text-rose-500/50" />
                              {[venue, location].filter(Boolean).join(", ")}
                            </span>
                          )}
                          <span className="hidden md:flex items-center gap-1.5 text-[12px] font-medium text-white/30">
                            <Calendar size={12} className="text-rose-500/50" />
                            {formattedDate}
                          </span>
                          {timeStr && (
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-white/30">
                              <Clock size={12} className="text-rose-500/50" />
                              {timeStr}
                            </span>
                          )}
                        </div>

                        {/* Tier breakdown */}
                        {isEvent && booking.items && booking.items.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {booking.items.map((item: any) => (
                              <span key={item.id} className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/10">
                                <Users size={10} /> {item.quantity}× {item.tier?.name || "General"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Amount</p>
                            <p className="font-black text-white text-lg mt-0.5">₹{amount.toLocaleString("en-IN")}</p>
                          </div>
                          {isEvent && (
                            <>
                              <div className="h-8 w-px bg-white/5" />
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Qty</p>
                                <p className="font-black text-white text-lg mt-0.5">{booking.quantity || 1}</p>
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex items-center gap-2 bg-white hover:bg-rose-500 text-black hover:text-white px-5 py-2.5 rounded-full text-[12px] font-bold transition-all duration-200 active:scale-95 group/btn"
                        >
                          <QrCode size={14} />
                          View Ticket
                          <ChevronRight size={14} className="opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                        </button>
                      </div>
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
