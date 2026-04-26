"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Star,
  Edit3,
} from "lucide-react";

const mockAddresses = [
  {
    id: "1",
    label: "Home",
    icon: Home,
    address: "Flat 302, Sky Towers, Madhapur",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    isDefault: true,
  },
  {
    id: "2",
    label: "Work",
    icon: Briefcase,
    address: "Floor 5, Tech Park, HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500032",
    isDefault: false,
  },
  {
    id: "3",
    label: "Other",
    icon: Star,
    address: "123, MG Road, Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560038",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState(mockAddresses);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const remove = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-[700px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-sm text-gray-500 font-medium">Home, work & other locations</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-bold text-[13px] rounded-xl hover:bg-gray-800 transition shadow-sm">
            <Plus size={16} />
            Add Address
          </button>
        </div>

        {/* Address Cards */}
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${
                addr.isDefault ? "border-[#42B460]/30 ring-1 ring-[#42B460]/10" : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-4 p-5">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  addr.isDefault
                    ? "bg-[#42B460]/10 text-[#42B460]"
                    : "bg-gray-50 text-gray-500"
                }`}>
                  <addr.icon size={18} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-gray-900">{addr.label}</h3>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-100">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-gray-600 mt-1">{addr.address}</p>
                  <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                    {addr.city}, {addr.state} – {addr.pincode}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="px-3 py-1.5 text-[12px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                    >
                      Set Default
                    </button>
                  )}
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 transition">
                    <Edit3 size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => remove(addr.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {addresses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold">No saved addresses</p>
            <p className="text-gray-400 text-sm mt-1">Add your first address above</p>
          </div>
        )}
      </div>
    </div>
  );
}
