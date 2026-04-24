"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
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
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import LiveMatchScorer from "@/components/mobile/LiveMatchScorer";
import { Trophy } from "lucide-react";

type BookingTab = "all" | "events" | "courts";

interface BookingEvent {
  id: string;
  title: string;
  venue: string;
  location?: string;
  date: string;
  time: string;
  images: string;
  mapLink?: string;
}

interface BookingFacility {
  id: string;
  name: string;
  venue?: string;
  location: string;
  image: string;
  mapLink?: string;
  type?: string;
}

interface BookingItem {
  id: string;
  quantity: number;
  tier?: {
    name: string;
  };
}

interface Booking {
  id: string;
  _type: "event" | "court";
  event?: BookingEvent;
  facility?: BookingFacility;
  bookingDate?: string;
  slotLabel?: string;
  qrCode?: string;
  transactionId?: string;
  status: string;
  quantity?: number;
  totalAmount: number;
  seatNumbers?: string;
  items?: BookingItem[];
  createdAt?: string;
}

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  CONFIRMED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Confirmed",
  },
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Pending",
  },
  CANCELLED: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Cancelled",
  },
  USED: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    label: "Used",
  },
  SUCCESS: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Success",
  },
};

function getStatusStyle(status: string) {
  return STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.CONFIRMED;
}

/* ─── QR Ticket Modal (Kept Mostly Original for Contrast) ── */
function QrTicketModal({
  booking,
  onClose,
}: {
  booking: Booking;
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
        <div className="bg-white rounded-[32px] shadow-2xl shadow-black/30 overflow-hidden">
          
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
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex items-center justify-center w-[40px] h-[28px] shrink-0 drop-shadow-md">
                  <svg 
                    className="absolute inset-0 w-full h-full z-0 overflow-visible" 
                    viewBox="0 0 200 140" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                       <linearGradient id="ticketG" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#D53F17" />
                         <stop offset="100%" stopColor="#ea580c" />
                       </linearGradient>
                    </defs>
                    <path d="M 14 4 L 186 4 Q 196 4 196 14 L 196 50 A 20 20 0 0 0 196 90 L 196 126 Q 196 136 186 136 L 14 136 Q 4 136 4 126 L 4 90 A 20 20 0 0 0 4 50 L 4 14 Q 4 4 14 4 Z" 
                          fill="url(#ticketG)" />
                    <line x1="100" y1="6" x2="100" y2="134" stroke="white" strokeWidth="8" strokeDasharray="16 12" opacity="0.4" strokeLinecap="round" />
                  </svg>
                  <img src="/bv-white.png" alt="BV Logo" className="relative z-10 w-[55%] h-auto object-contain" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold tracking-tight leading-none text-white">BOOK & VIBE</p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60 mt-0.5">Digital Pass</p>
                </div>
              </div>

              <h3 className="text-[18px] font-extrabold leading-tight tracking-tight pr-8 line-clamp-2 text-white">{title}</h3>
              
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {dateStr && (
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-[12px] text-[11px] font-bold text-white/90 border border-white/10">
                    <Calendar size={11} className="text-orange-400" />
                    {new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}
                  </span>
                )}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-sm px-3 py-1.5 rounded-[12px] text-[11px] font-bold text-orange-300 border border-orange-500/20 transition-all"
                >
                  <Navigation size={11} />
                  Directions
                </a>
              </div>
              {(venue || location) && (
                <p className="flex items-center gap-1.5 text-white/60 text-[11px] font-medium mt-2">
                  <MapPin size={11} className="text-orange-400/70" />
                  {[venue, location].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative h-6 flex items-center">
            <div className="absolute -left-4 w-8 h-8 bg-black/80 rounded-full" style={{ top: '-16px' }} />
            <div className="absolute -right-4 w-8 h-8 bg-black/80 rounded-full" style={{ top: '-16px' }} />
            <div className="w-full border-t-2 border-dashed border-gray-200 mx-8" />
          </div>

          {/* QR Code */}
          <div className="px-6 pb-3 flex flex-col items-center">
            <div className="relative p-1.5">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-[2.5px] border-l-[2.5px] border-orange-500 rounded-tl-md" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-[2.5px] border-r-[2.5px] border-orange-500 rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-[2.5px] border-l-[2.5px] border-orange-500 rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-[2.5px] border-r-[2.5px] border-orange-500 rounded-br-md" />
              <div className="p-3">
                <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 rounded-xl" />
              </div>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-1.5">Scan at venue</p>
          </div>

          {/* Booking Code */}
          <div className="mx-6 mb-3">
            <div className="bg-gray-50 rounded-[16px] p-3 flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-gray-400">Booking Code</p>
                <p className="text-[14px] font-black text-gray-900 tracking-wider font-mono mt-0.5">{qrCode}</p>
              </div>
              <button onClick={handleCopy} className="p-2 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-gray-400 hover:text-orange-500">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mx-6 mb-4 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-[16px] px-3 py-2.5 text-center border border-gray-100">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{isEvent ? "Tickets" : "Slot"}</p>
              <p className="font-black text-gray-900 text-[15px] mt-0.5">{isEvent ? `${booking.quantity || 1}` : "1"}</p>
            </div>
            <div className="bg-gray-50 rounded-[16px] px-3 py-2.5 text-center border border-gray-100">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Amount</p>
              <p className="font-black text-gray-900 text-[15px] mt-0.5">₹{(booking.totalAmount || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-gray-50 rounded-[16px] px-3 py-2.5 text-center border border-gray-100">
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
                  <div className="mx-6 mb-4 bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400 mb-2">Assigned Seats</p>
                    <div className="flex flex-wrap gap-1.5">
                      {seats.map((s: string) => (
                        <span key={s} className="bg-white border border-gray-200 text-gray-900 font-bold text-xs px-2.5 py-1 rounded-[10px] shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch { /* ignore */ }
            return null;
          })()}

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between rounded-b-[32px]">
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500">Secured by Book & Vibe</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-orange-400 fill-orange-400" />
              <Star size={10} className="text-orange-400 fill-orange-400" />
              <Star size={10} className="text-orange-400 fill-orange-400" />
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
  const [eventBookings, setEventBookings] = useState<Booking[]>([]);
  const [courtBookings, setCourtBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [scorerBooking, setScorerBooking] = useState<{ id: string; type: string } | null>(null);

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
          setEventBookings(((evtRes.value as { data: Booking[] })?.data || []).map((b) => ({ ...b, _type: "event" })));
        }
        if (courtRes.status === "fulfilled") {
          setCourtBookings(((courtRes.value as { data: Booking[] })?.data || []).map((b) => ({ ...b, _type: "court" })));
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
    { key: "all", label: "All Passes", icon: <Ticket size={16} />, count: allBookings.length },
    { key: "events", label: "Events", icon: <Music size={16} />, count: eventBookings.length },
    { key: "courts", label: "Courts", icon: <Gamepad2 size={16} />, count: courtBookings.length },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pt-[max(env(safe-area-inset-top),24px)] md:pt-[130px] pb-16 selection:bg-orange-500/20">
      {/* QR Modal */}
      {selectedBooking && <QrTicketModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}

      {/* Scorer Modal */}
      <AnimatePresence>
        {scorerBooking && (
          <LiveMatchScorer 
            bookingId={scorerBooking.id} 
            sportType={scorerBooking.type} 
            onClose={() => setScorerBooking(null)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push('/profile')} 
          className="inline-flex items-center gap-2.5 px-2.5 py-2 pr-5 bg-white hover:bg-gray-50 rounded-full border border-gray-200 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] text-gray-600 hover:text-gray-900 font-bold text-[13px] transition-all duration-300 group mb-6 md:mb-8"
        >
          <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-200 flex items-center justify-center transition-all duration-300">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Back to Profile
        </button>

        {/* ─── Bento Hero Header ─── */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_30px_rgb(0,0,0,0.02)] mb-8 flex flex-col md:flex-row md:items-end justify-between gap-8 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-[#42B460]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-4xl md:text-[42px] font-black text-gray-900 tracking-[-0.02em] leading-tight mb-2">My Bookings</h1>
            <p className="text-gray-500 font-medium text-[15px] max-w-sm">Your confirmed tickets, court reservations, and everything in between.</p>
          </div>

          {!loading && (
            <div className="relative z-10 flex items-center gap-6 md:gap-8 bg-gray-50/80 backdrop-blur-md rounded-[24px] px-8 py-5 border border-gray-100 self-start md:self-auto shrink-0 shadow-sm">
              <div className="text-center">
                <p className="text-[26px] leading-none font-black text-gray-900">{allBookings.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">Total</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-[26px] leading-none font-black text-gray-900">{eventBookings.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">Events</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-[26px] leading-none font-black text-orange-500">₹{totalSpent.toLocaleString("en-IN")}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">Spent</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Tabs + Search ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-20 z-40">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-[20px] border border-gray-100 shadow-sm w-full md:w-auto overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[16px] text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className={`${activeTab === tab.key ? "text-orange-400" : "text-gray-400"}`}>
                  {tab.icon}
                </div>
                {tab.label}
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-[20px] px-5 py-3 w-full md:w-80 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] font-bold text-gray-900 placeholder:text-gray-400 w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── Booking Cards ─── */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin mb-5" />
              <p className="text-gray-400 font-bold text-[14px] tracking-wide">Loading your passes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 mx-auto rounded-[24px] bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                <Ticket size={32} className="text-gray-400" />
              </div>
              <h3 className="text-[22px] font-black text-gray-900 tracking-tight mb-2">
                {searchQuery ? "No matches found" : "No bookings yet"}
              </h3>
              <p className="text-gray-500 text-[14px] max-w-xs mx-auto font-medium">
                {searchQuery ? "Try adjusting your search terms" : "Discover top events and book your first experience"}
              </p>
              {!searchQuery && (
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold text-[14px] mt-8 transition-all shadow-md shadow-gray-900/10 hover:shadow-orange-500/20 active:scale-95"
                >
                  Browse Events <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((booking: Booking) => {
                const isEvent = booking._type === "event";
                const title = isEvent ? booking.event?.title : booking.facility?.name;
                const venue = isEvent ? booking.event?.venue : booking.facility?.venue;
                const location = isEvent ? booking.event?.location : booking.facility?.location;
                const dateStr = isEvent ? booking.event?.date : booking.bookingDate;
                const timeStr = isEvent ? booking.event?.time : booking.slotLabel;
                const status = booking.status || "CONFIRMED";
                const statusStyle = getStatusStyle(status);
                const amount = booking.totalAmount || 0;
                const imageUrl = isEvent ? getEventImage(booking.event?.images || "") : booking.facility?.image || "";

                const formattedDate = dateStr
                  ? new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : "TBD";

                return (
                  <div
                    key={booking.id}
                    className="group bg-white rounded-[28px] p-3 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 flex flex-col md:flex-row gap-5"
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-[220px] h-[180px] md:h-auto shrink-0 rounded-[24px] overflow-hidden bg-gray-50 border border-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title || "Booking"}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                           {isEvent ? <Music size={32} className="text-gray-300" /> : <Gamepad2 size={32} className="text-gray-300" />}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60 md:opacity-0 group-hover:opacity-10 transition-opacity" />

                      {/* Type badge */}
                      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
                        isEvent
                          ? "bg-rose-500/90 text-white"
                          : "bg-[#42B460]/90 text-white"
                      }`}>
                        {isEvent ? <Music size={12} /> : <Gamepad2 size={12} />}
                        {isEvent ? "Event" : "Court"}
                      </div>
                      
                      {/* Date overlay on mobile */}
                      <div className="absolute bottom-3 left-3 md:hidden">
                        <p className="text-white font-black text-[15px] leading-none drop-shadow-md">{formattedDate}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-1 pr-1 md:py-3 md:pr-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-[20px] font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-orange-500 transition-colors">
                            {title || "Untitled"}
                          </h3>
                          <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-[10px] border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                             {statusStyle.label}
                          </span>
                        </div>

                        {/* Info row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
                          {(venue || location) && (
                            <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500">
                              <MapPin size={14} className="text-gray-400" />
                              {[venue, location].filter(Boolean).join(", ")}
                            </span>
                          )}
                          <span className="hidden md:flex items-center gap-1.5 text-[13px] font-bold text-gray-500">
                            <Calendar size={14} className="text-gray-400" />
                            {formattedDate}
                          </span>
                          {timeStr && (
                            <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500">
                              <Clock size={14} className="text-gray-400" />
                              {timeStr}
                            </span>
                          )}
                        </div>

                        {/* Tier breakdown */}
                        {isEvent && booking.items && booking.items.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {booking.items.map((item) => (
                              <span key={item.id} className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-100">
                                <Users size={12} className="text-gray-400" /> {item.quantity}× {item.tier?.name || "General"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-6 md:gap-8">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Paid</p>
                            <p className="font-black text-gray-900 text-[18px] mt-0.5">₹{amount.toLocaleString("en-IN")}</p>
                          </div>
                          {isEvent && (
                            <>
                              <div className="h-8 w-px bg-gray-200" />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tickets</p>
                                <p className="font-black text-gray-900 text-[18px] mt-0.5">{booking.quantity || 1}</p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEvent && status.toUpperCase() === 'CONFIRMED' && (
                            <button
                              onClick={() => setScorerBooking({ id: booking.id, type: booking.facility?.type || 'Cricket' })}
                              className="flex items-center gap-2 bg-[#00A63E] hover:bg-[#008c34] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md shadow-emerald-900/10 hover:shadow-emerald-500/25 active:scale-95 group/btn"
                            >
                              <Trophy size={16} />
                              Score Live
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md shadow-gray-900/10 hover:shadow-orange-500/25 active:scale-95 group/btn"
                          >
                            <QrCode size={16} />
                            View Ticket
                            <ChevronRight size={16} className="opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all font-bold text-white/50 group-hover/btn:text-white" />
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
    </div>
  );
}
