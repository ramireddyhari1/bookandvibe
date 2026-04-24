"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Star,
  Trash2,
  Calendar,
  Zap,
} from "lucide-react";

type FavTab = "all" | "events" | "venues";

const mockFavorites = [
  {
    id: "1",
    type: "event" as const,
    title: "Summer Music Festival 2026",
    location: "Marine Drive, Mumbai",
    rating: 4.8,
    date: "Apr 15, 2026",
    image: "🎵",
    tag: "Music",
  },
  {
    id: "2",
    type: "venue" as const,
    title: "SportVista Arena",
    location: "Madhapur, Hyderabad",
    rating: 4.6,
    date: null,
    image: "🏟️",
    tag: "Sports Complex",
  },
  {
    id: "3",
    type: "venue" as const,
    title: "Elite Sports Complex",
    location: "Koramangala, Bangalore",
    rating: 4.9,
    date: null,
    image: "🏸",
    tag: "Badminton",
  },
  {
    id: "4",
    type: "event" as const,
    title: "AI & Future Tech Summit",
    location: "HITEX, Hyderabad",
    rating: 4.5,
    date: "May 20, 2026",
    image: "💡",
    tag: "Tech",
  },
  {
    id: "5",
    type: "venue" as const,
    title: "Green Turf Football Ground",
    location: "Jubilee Hills, Hyderabad",
    rating: 4.7,
    date: null,
    image: "⚽",
    tag: "Football",
  },
];

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FavTab>("all");
  const [favorites, setFavorites] = useState(mockFavorites);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const filtered = favorites.filter((f) => {
    if (activeTab === "events") return f.type === "event";
    if (activeTab === "venues") return f.type === "venue";
    return true;
  });

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[max(env(safe-area-inset-top),24px)] md:pt-28 pb-16">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="shrink-0 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all duration-300 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Favorites</h1>
            <p className="text-sm text-gray-500 font-medium">Saved events and venues</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm mb-6 w-fit">
          {(["all", "events", "venues"] as FavTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-[13px] font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden group"
            >
              {/* Top Section */}
              <div className={`h-32 flex items-center justify-center text-5xl relative ${
                item.type === "event"
                  ? "bg-gradient-to-br from-rose-50 to-pink-100"
                  : "bg-gradient-to-br from-emerald-50 to-green-100"
              }`}>
                {item.image}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  item.type === "event"
                    ? "bg-rose-500 text-white"
                    : "bg-[#42B460] text-white"
                }`}>
                  {item.tag}
                </span>
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="text-[14px] font-bold text-gray-900 truncate">{item.title}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-[12px] font-medium text-gray-500 truncate">{item.location}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-[13px] font-bold text-gray-800">{item.rating}</span>
                  </div>
                  {item.date && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                      <Calendar size={11} /> {item.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Heart size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold">No favorites yet</p>
            <p className="text-gray-400 text-sm mt-1">Items you save will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
