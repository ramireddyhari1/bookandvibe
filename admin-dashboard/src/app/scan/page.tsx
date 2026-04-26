"use client";

import { useState } from "react";
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  User, 
  Calendar, 
  MapPin,
  RefreshCw,
  Ticket
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import PremiumLoader from "@/components/ui/PremiumLoader";

type VerificationData = {
  type: "EVENT" | "VENUE";
  bookingId: string;
  userName: string;
  title: string;
  venue: string;
  date: string;
  status: string;
};

export default function ScanQRPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState("");

  async function handleVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetchApi("/partners/verify-ticket", {
        method: "POST",
        body: JSON.stringify({ ticketCode: ticketCode.trim() }),
      });

      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || "Invalid ticket code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setTicketCode("");
    setResult(null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-sm">
            <QrCode className="text-white" size={24} />
          </div>
          <div>
            <h1 className="dash-title text-2xl font-semibold text-slate-900">Ticket Verification</h1>
            <p className="text-sm font-bold text-slate-400">Scan or enter ticket codes to check-in guests</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left Side: Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dash-card border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-emerald-600">Manual Entry</h3>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter Ticket Code..."
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pl-11 text-sm font-bold text-slate-900 outline-none transition-all focus:border-gray-1000 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-300"
                />
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
              <button
                type="submit"
                disabled={loading || !ticketCode.trim()}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all   disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify Ticket"}
                {!loading && <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </form>
          </div>

          <div className="dash-card border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
              <QrCode className="text-emerald-500" size={32} />
            </div>
            <p className="text-sm font-bold text-gray-500">Using a mobile device?</p>
            <p className="mt-1 text-xs text-slate-400 font-medium leading-relaxed">
              Open this dashboard on your phone to use the camera scanner directly.
            </p>
            <button className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 transition hover:bg-gray-50">
              Open Camera
            </button>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-3">
          {!result && !error && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-12 text-center">
              <div className="mb-6 rounded-full bg-white p-6 shadow-sm">
                <Search size={40} className="text-slate-200" />
              </div>
              <h4 className="text-lg font-semibold text-slate-400">Waiting for Verification</h4>
              <p className="mt-2 max-w-xs text-sm font-medium text-slate-300">
                Enter a ticket code on the left to view guest details and confirm check-in.
              </p>
            </div>
          )}

          {error && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-red-50 bg-red-50/30 p-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="mb-6 rounded-full bg-white p-6 shadow-sm">
                <XCircle size={40} className="text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-red-900">Verification Failed</h4>
              <p className="mt-2 max-w-xs text-sm font-bold text-red-700/60 leading-relaxed">
                {error}
              </p>
              <button 
                onClick={reset}
                className="mt-8 rounded-xl bg-red-100 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-600 transition hover:bg-red-200"
              >
                Try Another Code
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="dash-card overflow-hidden border-gray-200 bg-white shadow-sm">
                <div className="bg-emerald-500 p-6 text-center text-white">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-semibold">Verified Successfully</h3>
                  <p className="mt-1 text-sm font-bold text-emerald-50/80">Check-in confirmed at {new Date().toLocaleTimeString()}</p>
                </div>

                <div className="p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-2xl font-semibold text-emerald-700 ">
                      {result.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Guest Name</p>
                      <p className="text-2xl font-semibold text-slate-900">{result.userName}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-600">
                        <User size={14} />
                        {result.type === "EVENT" ? "Event Attendee" : "Venue Player"}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-50" />

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-400">
                          <Ticket size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Entry For</p>
                          <p className="text-sm font-semibold text-slate-800">{result.title}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-400">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Location</p>
                          <p className="text-sm font-semibold text-slate-800">{result.venue}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-400">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scheduled</p>
                          <p className="text-sm font-semibold text-slate-800">{new Date(result.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-400">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
                          <span className="inline-flex rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                            Check-in Done
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 text-sm font-semibold text-emerald-600 transition hover:bg-gray-50 hover:border-gray-200"
                  >
                    Return to Scanner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
