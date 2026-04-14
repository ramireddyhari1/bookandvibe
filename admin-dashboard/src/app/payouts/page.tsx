"use client";

import { useEffect, useState } from "react";
import { 
  HandCoins, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Building2, 
  User, 
  RefreshCw,
  MoreVertical,
  Banknote
} from "lucide-react";
import { fetchApi } from "@/lib/api";

type Payout = {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  bankDetails: string; // JSON string
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchPayouts() {
    setLoading(true);
    try {
      const response = await fetchApi("/partners/all-payouts");
      if (response.success) {
        setPayouts(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const response = await fetchApi(`/partners/payouts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (response.success) {
        fetchPayouts();
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
      case "PROCESSING": return "bg-blue-50 text-blue-700 border-blue-100";
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "FAILED": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-600 shadow-lg shadow-indigo-200/50">
            <HandCoins className="text-white" size={24} />
          </div>
          <div>
            <h1 className="dash-title text-2xl font-black text-slate-900">Payout Requests</h1>
            <p className="text-sm font-bold text-slate-400">Review and process partner withdrawal requests</p>
          </div>
        </div>
        <button 
          onClick={fetchPayouts}
          className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </header>

      <div className="dash-card border-slate-100 bg-white shadow-sm overflow-hidden min-h-[600px]">
        <div className="flex flex-col gap-4 border-b border-slate-50 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search partner or ID..." 
                className="w-64 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2 pl-9 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            </div>
            <button className="rounded-xl border border-slate-100 bg-white p-2 text-slate-400 hover:text-indigo-600 transition">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="p-4 pl-6">Partner</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Bank Details</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading && payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400 font-bold">Loading requests...</td>
                </tr>
              ) : payouts.length > 0 ? (
                payouts.map((p) => {
                  let bank = {};
                  try { bank = JSON.parse(p.bankDetails); } catch {}
                  return (
                    <tr key={p.id} className="group transition hover:bg-slate-50/30">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-slate-50 text-indigo-700 font-black shadow-inner">
                            {p.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{p.user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{p.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                          <Banknote size={14} className="text-emerald-500" />
                          {formatCurrency(p.amount)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-2.5 text-[10px] font-bold text-slate-600 leading-relaxed">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Building2 size={10} className="text-slate-400" />
                            {(bank as any).bankName || "Unknown Bank"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CreditCard size={10} className="text-slate-400" />
                            {(bank as any).accountNumber || "N/A"} ({(bank as any).ifscCode || "N/A"})
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                          <Clock size={12} />
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        {p.status === "PENDING" || p.status === "PROCESSING" ? (
                          <div className="flex justify-end gap-1.5">
                            {p.status === "PENDING" && (
                              <button 
                                onClick={() => updateStatus(p.id, "PROCESSING")}
                                disabled={updatingId === p.id}
                                className="rounded-lg bg-blue-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-blue-600 disabled:opacity-50"
                              >
                                {updatingId === p.id ? "..." : "Process"}
                              </button>
                            )}
                            <button 
                              onClick={() => updateStatus(p.id, "COMPLETED")}
                              disabled={updatingId === p.id}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-emerald-600 disabled:opacity-50"
                            >
                              Complete
                            </button>
                            <button 
                              onClick={() => updateStatus(p.id, "FAILED")}
                              disabled={updatingId === p.id}
                              className="rounded-lg bg-red-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                              Fail
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">No Actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-slate-50 p-6">
                        <HandCoins className="text-slate-200" size={40} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-400">All Clear!</h4>
                        <p className="mt-1 text-sm font-medium text-slate-300">No pending payout requests currently.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
