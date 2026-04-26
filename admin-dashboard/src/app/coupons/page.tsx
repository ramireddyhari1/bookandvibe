"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Tag, Check, X, Shield, Calendar, Users, AlertTriangle, AlertCircle, Percent, DollarSign, LayoutDashboard, Clock, Loader2 } from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";
import { fetchApi } from "@/lib/api";
import Portal from "@/components/layout/Portal";

type Coupon = {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  applicableTo: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [applicableTo, setApplicableTo] = useState("ALL");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadCoupons = async () => {
    try {
      const res = await fetchApi("/coupons") as { data: Coupon[] };
      setCoupons(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openNewModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDescription("");
    setDiscountType("PERCENT");
    setDiscountValue("");
    setMinOrderAmount("0");
    setMaxDiscount("");
    setUsageLimit("");
    setPerUserLimit("1");
    setApplicableTo("ALL");
    setExpiresAt("");
    setIsActive(true);
    setErrorMsg("");
    setShowModal(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description || "");
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setMinOrderAmount((c.minOrderAmount || 0).toString());
    setMaxDiscount(c.maxDiscount ? c.maxDiscount.toString() : "");
    setUsageLimit(c.usageLimit ? c.usageLimit.toString() : "");
    setPerUserLimit((c.perUserLimit || 1).toString());
    setApplicableTo(c.applicableTo);
    setExpiresAt(c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "");
    setIsActive(c.isActive);
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!code || !discountType || !discountValue) {
      setErrorMsg("Please fill all required fields");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    
    const payload = {
      code,
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount || "0"),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      perUserLimit: parseInt(perUserLimit || "1"),
      applicableTo,
      expiresAt: expiresAt || null,
      isActive
    };

    try {
      if (editingCoupon) {
        await fetchApi(`/coupons/${editingCoupon.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi("/coupons", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await fetchApi(`/coupons/${c.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !c.isActive })
      });
      loadCoupons();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await fetchApi(`/coupons/${id}`, { method: "DELETE" });
      loadCoupons();
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag size={24} className="text-emerald-500" />
            Promo Codes & Coupons
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
             Manage discounts to drive bookings on Book & Vibe
          </p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-emerald-600 hover:bg-gray-500 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
        >
          <Plus size={18} /> Create Promo Code
        </button>
      </div>

      <div className="dash-card border-gray-100 bg-white p-2">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by code or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="p-4 whitespace-nowrap">Code</th>
                <th className="p-4 whitespace-nowrap">Discount</th>
                <th className="p-4 whitespace-nowrap">Limits</th>
                <th className="p-4 whitespace-nowrap">Usage</th>
                <th className="p-4 whitespace-nowrap">Expiry</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-24">
                    <div className="flex flex-col items-center justify-center">
                      <PremiumLoader size="lg" color="#10b981" text="Updating Promos" />
                    </div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-sm font-bold text-slate-400">No promo codes found</td></tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[15px] text-slate-900 tracking-tight">{coupon.code}</span>
                        <span className="text-[11px] font-bold text-slate-500 mt-0.5 max-w-[150px] truncate">{coupon.description || "No description"}</span>
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 w-max px-2 py-0.5 rounded-full border border-gray-200">
                           {coupon.applicableTo}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-[14px]">
                        {coupon.discountType === "PERCENT" ? (
                          <><Percent size={14} className="text-emerald-500"/> {coupon.discountValue}% Off</>
                        ) : (
                          <>₹{coupon.discountValue} Off</>
                        )}
                      </div>
                      {coupon.maxDiscount && (
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Up to ₹{coupon.maxDiscount}</p>
                      )}
                      {coupon.minOrderAmount > 0 && (
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Min spend: ₹{coupon.minOrderAmount}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-[12px] font-semibold text-slate-600">
                         <span className="flex items-center gap-1.5"><Users size={12}/> Max {coupon.perUserLimit} per user</span>
                         <span className="flex items-center gap-1.5">
                           <LayoutDashboard size={12}/>
                           {coupon.usageLimit ? `Total limit: ${coupon.usageLimit}` : 'Unlimited total uses'}
                         </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-emerald-50 rounded-full h-2 w-20 overflow-hidden">
                          <div 
                            className={`h-full ${coupon.usageLimit && coupon.usedCount >= coupon.usageLimit ? "bg-red-400" : "bg-emerald-400"}`}
                            style={{ width: coupon.usageLimit ? `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` : '100%' }}
                          />
                        </div>
                        <span className="text-[12px] font-bold text-slate-700">
                          {coupon.usedCount} {coupon.usageLimit && `/ ${coupon.usageLimit}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {coupon.expiresAt ? (
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600">
                          <Clock size={14} className={new Date(coupon.expiresAt) < new Date() ? "text-red-400" : "text-emerald-400"} />
                          <span className={new Date(coupon.expiresAt) < new Date() ? "text-red-500" : ""}>
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[12px] font-bold text-slate-400 italic">Never expires</span>
                      )}
                    </td>
                    <td className="p-4">
                       <button 
                         onClick={() => handleToggleActive(coupon)}
                         className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${coupon.isActive ? "bg-emerald-500/20" : "bg-slate-200"}`}
                       >
                         <div className={`w-4 h-4 rounded-full transition-transform ${coupon.isActive ? "translate-x-6 bg-emerald-500" : "bg-slate-400"}`} />
                       </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(coupon)} className="text-[12px] font-bold text-emerald-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors mr-2">Edit</button>
                      <button onClick={() => handleDelete(coupon.id, coupon.code)} className="text-[12px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60  transition-all duration-300">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#fbfdfc] shrink-0">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Tag size={18} />
                </div>
                {editingCoupon ? "Edit Promo Code" : "Create Promo Code"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-[13px] font-bold p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                  <AlertCircle size={18} /> {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Promo Code *</label>
                    <input 
                      type="text" 
                      value={code} 
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 uppercase transition-all placeholder:text-slate-300"
                      placeholder="e.g. SUMMER20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Description</label>
                    <input 
                      type="text" 
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all placeholder:text-slate-300"
                      placeholder="Brief description (internal)"
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border border-gray-200/30 rounded-[24px] space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/60 ml-1">Discount Type *</label>
                      <select 
                        value={discountType} 
                        onChange={e => setDiscountType(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all"
                      >
                        <option value="PERCENT">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/60 ml-1">Discount Value *</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={discountValue} 
                          onChange={e => setDiscountValue(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all"
                          placeholder={discountType === "PERCENT" ? "20" : "150"}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          {discountType === "PERCENT" ? "%" : "₹"}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/60 ml-1">Max Discount (₹)</label>
                      <input 
                        type="number" 
                        value={maxDiscount} 
                        onChange={e => setMaxDiscount(e.target.value)}
                        disabled={discountType === "FIXED"}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all disabled:opacity-40 disabled:bg-slate-50"
                        placeholder="Optional cap"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Min Order Amount (₹)</label>
                    <input 
                      type="number" 
                      value={minOrderAmount} 
                      onChange={e => setMinOrderAmount(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1">Applicable To</label>
                    <select 
                      value={applicableTo} 
                      onChange={e => setApplicableTo(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all"
                    >
                      <option value="ALL">All Services</option>
                      <option value="EVENTS">Events Only</option>
                      <option value="GAMEHUB">GameHub Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5"><Users size={12}/> Max Uses Per User</label>
                    <input 
                      type="number" 
                      value={perUserLimit} 
                      onChange={e => setPerUserLimit(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5"><LayoutDashboard size={12}/> Total Usage Limit</label>
                    <input 
                      type="number" 
                      value={usageLimit} 
                      onChange={e => setUsageLimit(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5"><Calendar size={12}/> Expiration Date</label>
                    <input 
                      type="datetime-local" 
                      value={expiresAt} 
                      onChange={e => setExpiresAt(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-gray-1000 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6 ml-2">
                    <button 
                       onClick={() => setIsActive(!isActive)}
                       className={`w-12 h-6 flex shrink-0 items-center rounded-full p-1 transition-all duration-300 ${isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                     >
                       <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                     </button>
                     <span className={`text-[13px] font-bold ${isActive ? "text-emerald-600" : "text-slate-400"}`}>Coupon is {isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-100 bg-[#fbfdfc] flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-gray-500 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_25px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      </Portal>
    )}
    </div>
  );
}
