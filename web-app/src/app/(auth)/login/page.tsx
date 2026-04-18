"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import {
  Loader2,
  Ticket,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Music,
  Calendar,
  Star,
  Zap,
  ArrowLeft,
  Briefcase,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.token && data.user) {
        login(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f1115] overflow-y-auto overflow-x-hidden">
      
      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-bold tracking-wide">Back to Home</span>
      </Link>

      {/* ═══════════════════════════════════════════════════
          LEFT BACKGROUND — Events Theme (Rose)
      ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden hidden md:block border-r border-white/5">
        <img
          src="/events.png"
          alt="Concert atmosphere"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115]/95 via-[#0f1115]/80 to-[#0f1115]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-[#0f1115]/40" />

        {/* Floating decorative orbs */}
        <div className="absolute top-20 left-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-70" />
        
        {/* Subtle Watermark Copy */}
        <div className="absolute bottom-12 left-12 opacity-80">
           <div className="flex items-center gap-2 mb-2 text-rose-400">
              <Music size={18} />
              <span className="font-bold tracking-widest uppercase text-xs">Live Events & Concerts</span>
           </div>
           <h3 className="text-4xl lg:text-5xl font-black text-white/10 tracking-tighter">THE VIBE.</h3>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT BACKGROUND — GameHub Theme (Green)
      ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden hidden md:block border-l border-white/5">
        <img
          src="/gamehub.png"
          alt="Sports stadium"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0f1115]/95 via-[#0f1115]/80 to-[#0f1115]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-[#0f1115]/40" />

        {/* Floating decorative orbs */}
        <div className="absolute top-1/3 right-20 w-80 h-80 bg-[#42B460]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-60" />

        {/* Subtle Watermark Copy */}
        <div className="absolute bottom-12 right-12 opacity-80 text-right flex flex-col items-end">
           <div className="flex items-center gap-2 mb-2 text-[#42B460]">
              <span className="font-bold tracking-widest uppercase text-xs">Premium Courts</span>
              <Zap size={18} />
           </div>
           <h3 className="text-4xl lg:text-5xl font-black text-white/10 tracking-tighter">THE GAME.</h3>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CENTER FLOATING CARD — Login Form
      ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[420px] px-4 py-8 my-auto">
        
        {/* White Container */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          
          {/* Fusion Logo Header */}
          <div className="flex flex-col items-center justify-center mb-6 mt-2">
            <img src="/bv-orange.png" alt="Book & Vibe" className="h-32 w-auto mb-2 scale-[1.25]" />
            <p className="text-gray-500 font-medium text-xs text-center mt-1">
              Premium courts & live events.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3 rounded-lg mb-5 flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-100 flex flex-shrink-0 items-center justify-center mt-0.5">
                <span className="text-red-500 text-[10px] font-black">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Primary Action: Google Auth */}
          <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-[14px] py-3 rounded-xl transition-all shadow-sm">
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              or enter manually
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone/Email Field */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone number or email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-100 focus:border-[#42B460] rounded-xl px-4 py-3 text-gray-900 text-[14px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(66,180,96,0.15)]"
                  placeholder="Enter phone or email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition"
                >
                  Forgot limits?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-100 focus:border-[#42B460] rounded-xl pl-4 pr-10 py-3 text-gray-900 text-[14px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(66,180,96,0.15)]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-[#42B460] hover:opacity-90 text-white font-black uppercase tracking-wide text-[13px] py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-gray-500 text-xs font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#42B460] hover:text-[#38A354] font-bold transition underline-offset-4 hover:underline"
            >
              Create one for free
            </Link>
          </p>

          {/* Partner / Admin Login */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-[12px] uppercase tracking-wider py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Briefcase size={15} />
              Partner Login
            </a>
            <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
              Manage your events & venues
            </p>
          </div>
        </div>
        
        {/* Subtle Bottom Links */}
        <div className="flex items-center justify-center gap-4 mt-6 text-gray-400 text-[11px] font-medium bg-white/5 backdrop-blur-md py-1.5 px-4 rounded-full w-max mx-auto border border-white/10">
          <span className="hover:text-white transition cursor-pointer">Terms</span>
          <span className="hover:text-white transition cursor-pointer">Privacy</span>
        </div>
      </div>
    </div>
  );
}
