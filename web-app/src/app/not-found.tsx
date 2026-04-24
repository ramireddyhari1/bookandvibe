"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();
  const isGameHub = pathname?.includes("gamehub");

  const theme = isGameHub
    ? {
        image: "/404-gamehub.png",
        headline: "Game Not Found",
        sub: "Looks like this court doesn't exist. Maybe it was double-faulted.",
        accent: "#00A63E",
        bg: "from-[#F0FDF4] via-white to-[#ECFDF5]",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        badgeText: "GameHub",
        primaryBtn: "bg-[#00A63E] hover:bg-[#008c34] shadow-emerald-500/25",
        primaryLabel: "Browse Courts",
        primaryHref: "/gamehub",
        secondaryLabel: "Back to Home",
      }
    : {
        image: "/404-events.png",
        headline: "Show Not Found",
        sub: "This event has left the building. But the party goes on elsewhere!",
        accent: "#D53F17",
        bg: "from-[#FFF7ED] via-white to-[#FFEDD5]",
        badge: "bg-orange-100 text-orange-700 border-orange-200",
        badgeText: "Events",
        primaryBtn: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25",
        primaryLabel: "Browse Events",
        primaryHref: "/events",
        secondaryLabel: "Back to Home",
      };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center px-5`}>
      <div className="max-w-lg w-full text-center">

        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest mb-8 ${theme.badge}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {theme.badgeText} · 404
        </div>

        {/* Illustration */}
        <div className="relative w-full max-w-[360px] mx-auto mb-8">
          <div
            className="absolute inset-0 rounded-[40px] blur-3xl opacity-20"
            style={{ backgroundColor: theme.accent }}
          />
          <Image
            src={theme.image}
            alt="404 Not Found"
            width={360}
            height={360}
            className="relative w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Text */}
        <h1 className="text-[40px] sm:text-[52px] font-black text-gray-900 tracking-tight leading-none mb-4">
          {theme.headline}
        </h1>
        <p className="text-gray-500 text-[16px] font-medium leading-relaxed max-w-sm mx-auto mb-10">
          {theme.sub}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={theme.primaryHref}
            className={`flex items-center gap-2 text-white px-8 py-3.5 rounded-2xl font-bold text-[14px] transition-all shadow-lg hover:shadow-xl active:scale-95 ${theme.primaryBtn}`}
          >
            <Compass size={16} />
            {theme.primaryLabel}
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-8 py-3.5 rounded-2xl font-bold text-[14px] transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Home size={16} />
            {theme.secondaryLabel}
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-[13px] font-bold transition-colors mx-auto"
        >
          <ArrowLeft size={14} />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
