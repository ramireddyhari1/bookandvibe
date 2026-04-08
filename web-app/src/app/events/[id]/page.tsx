"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Shield,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";

type PaymentState = "IDLE" | "PROCESSING" | "SUCCESS";

type EventData = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  images: string;
  availableSlots: number;
  vibeTags?: string[];
  highlights?: string[];
};

function parseImages(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const eventId = String(params.id || "");

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentState, setPaymentState] = useState<PaymentState>("IDLE");

  useEffect(() => {
    let mounted = true;

    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/events/${eventId}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Event not found in API");
        }

        const payload = await response.json();
        if (!payload?.data) {
          throw new Error("Invalid event payload");
        }

        if (mounted) {
          const apiEvent = payload.data;
          setEvent({
            id: String(apiEvent.id),
            title: apiEvent.title,
            description: apiEvent.description,
            category: apiEvent.category,
            location: apiEvent.location,
            venue: apiEvent.venue,
            date: apiEvent.date,
            time: apiEvent.time,
            price: Number(apiEvent.price) || 0,
            images: String(apiEvent.images || "[]"),
            availableSlots: Number(apiEvent.availableSlots) || 0,
            vibeTags: ["Live", "Trending", "Limited Seats"],
            highlights: [
              "Digital ticket with instant confirmation",
              "Secure payments and support",
              "Smart seat and tier availability",
              "Fast check-in with booking QR",
            ],
          });
        }
      } catch {
        if (mounted) {
          setError("Event not found.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadEvent();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const imageList = useMemo(() => {
    if (!event) return [];
    const parsed = parseImages(event.images);
    if (parsed.length) return parsed;
    return ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070"];
  }, [event]);

  const formattedDate = useMemo(() => {
    if (!event) return "";
    return new Date(event.date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [event]);

  const subtotal = useMemo(() => {
    if (!event) return 0;
    return event.price * quantity;
  }, [event, quantity]);

  const platformFee = 39;
  const totalAmount = subtotal + platformFee;

  const openCheckout = () => {
    if (!event) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!event) return;

    setPaymentState("PROCESSING");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
          totalAmount: subtotal,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      setPaymentState("SUCCESS");
      setTimeout(() => router.push("/tickets"), 1200);
    } catch {
      setPaymentState("IDLE");
      alert("Booking failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] flex items-center justify-center font-bold text-lg pt-24">
        Loading event experience...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] flex flex-col items-center justify-center gap-4 pt-24">
        <AlertCircle size={36} className="text-rose-500" />
        <h1 className="text-2xl font-extrabold">{error || "Event not found"}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] pb-20 md:pb-24">
      <section className="pt-24 md:pt-28 pb-8 md:pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8 items-start">
            <div className="order-2 lg:order-1 lg:col-span-2 rounded-3xl border border-rose-200/60 bg-white/70 backdrop-blur-sm p-2 sm:p-3 shadow-lg shadow-rose-200/40">
              <div className="grid grid-cols-1 items-start">
                <img
                  src={imageList[0]}
                  alt={event.title}
                  className="w-full aspect-[2/3] max-h-[640px] rounded-2xl object-cover"
                />
              </div>
            </div>

            <aside className="order-1 lg:order-2 rounded-3xl border border-rose-200 bg-white p-5 sm:p-6 shadow-xl shadow-rose-200/30 self-start">
              <div>
                <span className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase">
                  <Sparkles size={14} />
                  {event.category}
                </span>

                <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight mt-3 sm:mt-4">{event.title}</h1>

                <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3">
                  <div className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                    <Calendar size={17} className="text-rose-500 mt-0.5" />
                    <span>{formattedDate} • {event.time}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                    <MapPin size={17} className="text-rose-500 mt-0.5" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                    <Users size={17} className="text-rose-500 mt-0.5" />
                    <span>{event.availableSlots} spots left</span>
                  </div>
                </div>

              </div>

              <div className="mt-5 sm:mt-7 border-t border-rose-100 pt-4 sm:pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Ticket Price</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">INR {event.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={openCheckout}
                  className="mt-5 w-full rounded-2xl bg-rose-500 hover:bg-rose-600 text-white py-3.5 text-base font-extrabold shadow-md transition"
                >
                  {isAuthenticated ? "Reserve Your Spot" : "Sign In To Book"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-7">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2">
                <Ticket size={21} className="text-rose-500" />
                About This Event
              </h2>
              <p className="text-[15px] leading-7 font-medium text-slate-600 whitespace-pre-wrap">{event.description}</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2">
                <Zap size={21} className="text-rose-500" />
                Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(event.highlights || []).map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-sm font-semibold text-slate-700">
                    <CheckCircle size={16} className="text-rose-500" />
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-7">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-3">Event Vibe</h3>
              <div className="flex flex-wrap gap-2">
                {(event.vibeTags || []).map((tag) => (
                  <span key={tag} className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2">
                <Shield size={18} className="text-rose-500" />
                Booking Confidence
              </h3>
              <ul className="space-y-2 text-sm font-semibold text-slate-600">
                <li>Instant booking confirmation</li>
                <li>Secure payment checkout</li>
                <li>Quick support for booking issues</li>
                <li>Digital ticket delivery</li>
              </ul>
            </article>
          </aside>
        </div>
      </section>

      {showCheckout && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Confirm Booking</h3>
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setPaymentState("IDLE");
                }}
                className="text-sm font-bold text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            {paymentState === "IDLE" && (
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide font-bold text-slate-400">Event</p>
                  <p className="font-extrabold text-slate-900">{event.title}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-600">Tickets</p>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-full bg-white border border-slate-200 font-extrabold text-slate-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-extrabold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-9 h-9 rounded-full bg-white border border-slate-200 font-extrabold text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 space-y-2 text-sm font-semibold text-slate-700">
                  <div className="flex justify-between"><span>Subtotal</span><span>INR {subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Platform Fee</span><span>INR {platformFee}</span></div>
                  <div className="pt-2 border-t border-rose-200 flex justify-between text-base font-extrabold text-slate-900">
                    <span>Total</span>
                    <span>INR {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-black text-white py-3.5 font-extrabold flex items-center justify-center gap-2"
                >
                  Confirm and Pay <CreditCard size={18} />
                </button>
              </div>
            )}

            {paymentState === "PROCESSING" && (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <Loader2 size={36} className="animate-spin text-rose-500" />
                <p className="text-lg font-extrabold">Processing payment...</p>
                <p className="text-sm font-medium text-slate-500">Securing your booking.</p>
              </div>
            )}

            {paymentState === "SUCCESS" && (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <CheckCircle size={42} className="text-emerald-600" />
                <p className="text-xl font-extrabold">Booking Confirmed</p>
                <p className="text-sm font-medium text-slate-500">Redirecting to your tickets.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
