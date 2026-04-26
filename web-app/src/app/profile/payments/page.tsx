"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Wallet,
  Smartphone,
} from "lucide-react";

const mockPayments = [
  {
    id: "1",
    type: "card" as const,
    brand: "Visa",
    last4: "4242",
    expiry: "12/28",
    isDefault: true,
    color: "from-blue-600 to-blue-400",
  },
  {
    id: "2",
    type: "card" as const,
    brand: "Mastercard",
    last4: "8888",
    expiry: "06/27",
    isDefault: false,
    color: "from-gray-800 to-gray-600",
  },
  {
    id: "3",
    type: "upi" as const,
    brand: "Google Pay",
    last4: "user@okaxis",
    expiry: null,
    isDefault: false,
    color: "from-emerald-500 to-teal-400",
  },
];

export default function PaymentsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [methods, setMethods] = useState(mockPayments);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const setDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const remove = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[max(env(safe-area-inset-top),24px)] md:pt-28 pb-16">
      <div className="max-w-[700px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="shrink-0 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all duration-300 group">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-sm text-gray-500 font-medium">Manage cards & wallets</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-bold text-[13px] rounded-xl hover:bg-gray-800 transition shadow-sm">
            <Plus size={16} />
            Add New
          </button>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {methods.map((method) => (
            <div key={method.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-center gap-5 p-5">
                {/* Card Visual */}
                <div className={`w-20 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-md shrink-0`}>
                  {method.type === "card" ? (
                    <CreditCard size={22} className="text-white/90" />
                  ) : method.type === "upi" ? (
                    <Smartphone size={22} className="text-white/90" />
                  ) : (
                    <Wallet size={22} className="text-white/90" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-gray-900">{method.brand}</h3>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-100">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                    {method.type === "card" ? `•••• ${method.last4}` : method.last4}
                    {method.expiry && <span className="ml-3 text-gray-400">Exp {method.expiry}</span>}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefault(method.id)}
                      className="px-3 py-1.5 text-[12px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => remove(method.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition"
                  >
                    <Trash2 size={15} className="text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-blue-800">Secure Payments</p>
            <p className="text-[12px] text-blue-600 mt-0.5">Your payment information is encrypted and stored securely. We never store your full card details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
