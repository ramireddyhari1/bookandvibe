import Link from "next/link";
import Image from "next/image";
import { Compass, Home } from "lucide-react";

export default function GameHubNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] via-white to-[#ECFDF5] flex items-center justify-center px-5">
      <div className="max-w-lg w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 text-[11px] font-black uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          GameHub · 404
        </div>

        {/* Illustration */}
        <div className="relative w-full max-w-[360px] mx-auto mb-8">
          <div className="absolute inset-0 rounded-[40px] bg-emerald-400 blur-3xl opacity-20" />
          <Image
            src="/404-gamehub.png"
            alt="Court Not Found"
            width={360}
            height={360}
            className="relative w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <h1 className="text-[40px] sm:text-[52px] font-black text-gray-900 tracking-tight leading-none mb-4">
          Game Not Found
        </h1>
        <p className="text-gray-500 text-[16px] font-medium leading-relaxed max-w-sm mx-auto mb-10">
          Looks like this court doesn&apos;t exist. Maybe it was double-faulted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/gamehub"
            className="flex items-center gap-2 bg-[#00A63E] hover:bg-[#008c34] text-white px-8 py-3.5 rounded-2xl font-bold text-[14px] transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-95"
          >
            <Compass size={16} />
            Browse Courts
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-8 py-3.5 rounded-2xl font-bold text-[14px] transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
