"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Filter,
  Download,
  CreditCard,
  DollarSign,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";

type Transaction = {
  id: string;
  amount: number;
  type: "EARNING" | "PAYOUT" | "REFUND";
  description: string;
  createdAt: string;
};

type WalletData = {
  id: string;
  balance: number;
  totalEarnings: number;
  currency: string;
  transactions: Transaction[];
};

export default function PaymentsPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchWalletData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchApi("/partners/wallet");
      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to load wallet data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching wallet data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWalletData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: data?.currency || "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-black uppercase tracking-widest text-emerald-900/40">Loading Financial Repository...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/50">
            <Wallet className="text-white" size={24} />
          </div>
          <div>
            <h1 className="dash-title text-2xl font-black text-slate-900">Financial Insights</h1>
            <p className="text-sm font-bold text-slate-400">Monitor your earnings and manage payouts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchWalletData}
            className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-600 transition hover:bg-emerald-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-slate-200 transition hover:scale-[1.02] active:scale-[0.98]">
            <Download size={14} />
            Export Statement
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 font-bold text-red-600 shadow-sm animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="dash-card group relative overflow-hidden border-emerald-100/50 bg-white p-6 shadow-sm shadow-emerald-500/5">
          <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all group-hover:scale-150" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Wallet size={20} />
              </div>
              <TrendingUp className="text-emerald-500" size={16} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Balance</p>
            <h2 className="dash-title mt-1 text-3xl font-black text-slate-900">{formatCurrency(data?.balance || 0)}</h2>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600">
              <ArrowUpRight size={14} /> Available for withdrawal
            </div>
          </div>
        </div>

        <div className="dash-card group relative overflow-hidden border-emerald-100/50 bg-white p-6 shadow-sm shadow-emerald-500/5">
          <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-teal-500/5 blur-2xl transition-all group-hover:scale-150" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                <TrendingUp size={20} />
              </div>
              <DollarSign className="text-teal-500" size={16} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Lifetime Earnings</p>
            <h2 className="dash-title mt-1 text-3xl font-black text-slate-900">{formatCurrency(data?.totalEarnings || 0)}</h2>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-teal-600">
              <CheckCircle size={14} className="lucide-check-circle" /> Net revenue after fees
            </div>
          </div>
        </div>

        <div className="dash-card group border-emerald-100/50 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-500/20">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-white/20 p-3 text-white backdrop-blur-md">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/70">Quick Action</p>
          <h2 className="dash-title mt-1 text-xl font-black text-white">Need a Payout?</h2>
          <p className="mt-2 text-xs font-bold text-emerald-50/70 leading-relaxed">
            Requests are processed within 24-48 business hours to your linked bank account.
          </p>
          <a 
            href="/withdraw"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-[11px] font-black uppercase tracking-widest text-emerald-700 transition hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            Submit Request <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Transactions */}
      <div className="dash-card border-emerald-50 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-emerald-50 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="dash-title text-lg font-black text-slate-900">Recent Transactions</h3>
            <p className="text-sm font-bold text-slate-400">A detailed log of all your movement</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search description..." 
                className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-2 pl-9 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            </div>
            <button className="rounded-xl border border-emerald-100 bg-white p-2 text-slate-400 hover:text-emerald-600 transition shadow-sm">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-emerald-50/30 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">
                <th className="p-4 pl-6">Description</th>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 text-sm">
              {data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map((tx) => (
                  <tr key={tx.id} className="group transition hover:bg-emerald-50/20">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
                          tx.type === "EARNING" ? "bg-emerald-100 text-emerald-600" : 
                          tx.type === "PAYOUT" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                        }`}>
                          {tx.type === "EARNING" ? <TrendingUp size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{tx.description}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tx.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold text-slate-400">#{(tx.id || "").slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-500 font-bold">
                        <Clock size={12} />
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 shadow-sm shadow-emerald-200/50">
                        COMPLETED
                      </span>
                    </td>
                    <td className={`p-4 text-right pr-6 font-black text-base ${tx.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-slate-50 p-6">
                        <DollarSign className="text-slate-200" size={40} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-400">No Transactions Found</h4>
                        <p className="mt-1 text-sm font-medium text-slate-300">Your earnings history will appear here once you start receiving bookings.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.transactions && data.transactions.length > 0 && (
          <div className="border-t border-emerald-50 p-4 text-center">
            <button className="text-[11px] font-black uppercase tracking-widest text-emerald-600 transition hover:text-emerald-700">
              Show More Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckCircle({ size, className }: { size: number; className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function Search({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
