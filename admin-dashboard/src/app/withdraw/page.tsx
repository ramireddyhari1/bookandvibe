"use client";

import { useEffect, useState } from "react";
import { 
  ArrowUpToLine, 
  Building2, 
  CreditCard, 
  Landmark, 
  Info, 
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function WithdrawPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    ifscCode: "",
  });

  async function fetchBalance() {
    try {
      const response = await fetchApi("/partners/wallet");
      if (response.success) {
        setBalance(response.data.balance);
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBalance();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (balance !== null && parseFloat(formData.amount) > balance) {
      setError("Insufficient balance in your wallet");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetchApi("/partners/payouts", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          bankDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountHolder: formData.accountHolder,
            ifscCode: formData.ifscCode,
          }
        })
      });

      if (response.success) {
        setSuccess(true);
        fetchBalance(); // Refresh balance
      } else {
        setError(response.error || "Failed to submit payout request");
      }
    } catch (err: any) {
      setError(err.message || "Error submitting request");
    } finally {
      setSubmitting(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (success) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-6">
        <div className="dash-card max-w-lg overflow-hidden border-emerald-100 bg-white text-center shadow-2xl shadow-emerald-500/10 animate-in zoom-in-95 duration-500">
          <div className="bg-emerald-500 p-10 text-white">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl shadow-inner">
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>
            <h2 className="dash-title text-3xl font-black">Request Submitted!</h2>
            <p className="mt-3 text-sm font-bold text-emerald-50/80 leading-relaxed">
              Your payout request for <span className="text-white underline underline-offset-4">{formatCurrency(parseFloat(formData.amount))}</span> has been successfully sent to the administration team.
            </p>
          </div>
          <div className="p-10 space-y-6">
            <div className="rounded-2xl border border-emerald-50 bg-emerald-50/30 p-4 text-left">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-900/40">
                <Info size={12} /> Next Steps
              </p>
              <p className="mt-2 text-xs font-bold text-slate-500 leading-relaxed">
                Management will review your earnings and verify the bank details provided. This typically takes <span className="text-emerald-700">1-2 business days</span>. You will receive a notification once the transfer is initiated.
              </p>
            </div>
            <button 
              onClick={() => { setSuccess(false); setFormData({ ...formData, amount: "" }); }}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200"
            >
              Return to Earnings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/50">
            <ArrowUpToLine className="text-white" size={24} />
          </div>
          <div>
            <h1 className="dash-title text-2xl font-black text-slate-900">Withdraw Funds</h1>
            <p className="text-sm font-bold text-slate-400">Request your earnings to be transferred to your bank account</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Info & Balance */}
        <div className="space-y-6">
          <div className="dash-card overflow-hidden border-emerald-100 bg-white shadow-sm">
            <div className="bg-emerald-50/50 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Available for Payout</p>
              <h3 className="dash-title mt-2 text-3xl font-black text-slate-900">
                {loading ? "..." : formatCurrency(balance || 0)}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 rounded-xl border border-blue-50 bg-blue-50/30 p-3 text-[11px] font-bold text-blue-700 leading-relaxed">
                <Info size={14} className="shrink-0" />
                Minimum payout amount is ₹500.
              </div>
            </div>
          </div>

          <div className="dash-card border-slate-100 bg-slate-50/50 p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Security & Privacy</h4>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 text-emerald-500" size={18} />
              <div>
                <p className="text-xs font-bold text-slate-700">Encrypted Processing</p>
                <p className="mt-0.5 text-[10px] text-slate-400 font-medium">Your bank details are encrypted and visible only to authorized personnel.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 text-emerald-500" size={18} />
              <div>
                <p className="text-xs font-bold text-slate-700">Direct Transfer</p>
                <p className="mt-0.5 text-[10px] text-slate-400 font-medium">Funds are moved via NEFT/IMPS for rapid settlement.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-2">
          <div className="dash-card border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-500/5">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <CreditCard size={18} className="text-emerald-500" />
                  1. Payout Amount
                </h3>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="500"
                    placeholder="Enter amount (e.g. 5000)"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-6 py-4 pl-12 text-lg font-black text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-emerald-600">₹</span>
                </div>
                {error && <p className="text-xs font-bold text-red-500">{error}</p>}
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <Landmark size={18} className="text-emerald-500" />
                  2. Bank Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="As per bank records"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC, SBI"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="000000000000"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      placeholder="HDFC0123456"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-8">
                <p className="mb-6 text-[10px] text-center font-bold text-slate-400">
                  By submitting this request, you agree to our <span className="text-emerald-500 underline">Terms of Payout</span> and represent that the bank information provided is accurate and belongs to you.
                </p>
                <button
                  type="submit"
                  disabled={submitting || loading || !formData.amount}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      Confirm Payout Request <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
