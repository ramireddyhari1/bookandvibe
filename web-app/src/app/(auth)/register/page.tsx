"use client";
import { useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  Ticket,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Music,
  Zap,
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
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
      const data = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      if (data.token && data.user) {
        login(data.token, data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-400" };
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-amber-400" };
    if (score <= 3) return { level: 3, label: "Good", color: "bg-yellow-400" };
    if (score <= 4) return { level: 4, label: "Strong", color: "bg-green-400" };
    return { level: 5, label: "Very Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

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
              <span className="font-bold tracking-wider uppercase text-xs">Live Events & Concerts</span>
           </div>
           <h3 className="text-4xl lg:text-5xl font-bold text-white/10 tracking-tighter">THE VIBE.</h3>
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
              <span className="font-bold tracking-wider uppercase text-xs">Premium Courts</span>
              <Zap size={18} />
           </div>
           <h3 className="text-4xl lg:text-5xl font-bold text-white/10 tracking-tighter">THE GAME.</h3>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CENTER FLOATING CARD — Register Form
      ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[420px] px-4 py-8 my-auto">
        
        {/* White Container */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          
          {/* Fusion Logo Header */}
          <div className="flex flex-col items-center justify-center mb-6 mt-2">
            <img src="/bv-orange.png" alt="Book & Vibe" className="h-32 w-auto mb-2 scale-[1.25]" />
            <p className="text-gray-500 font-medium text-xs text-center mt-1">
              Start your journey with us.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3 rounded-lg mb-5 flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-100 flex flex-shrink-0 items-center justify-center mt-0.5">
                <span className="text-red-500 text-[10px] font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-100 focus:border-rose-500 rounded-xl px-4 py-3 text-gray-900 text-[14px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-100 focus:border-[#42B460] rounded-xl px-4 py-3 text-gray-900 text-[14px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(66,180,96,0.15)]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-100 focus:border-[#42B460] rounded-xl pl-4 pr-10 py-3 text-gray-900 text-[14px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(66,180,96,0.15)]"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.level ? strength.color : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${strength.level <= 1 ? "text-red-500" : strength.level <= 3 ? "text-amber-500" : "text-emerald-500"}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-gray-300 text-[#42B460] focus:ring-[#42B460] accent-[#42B460]"
              />
              <label htmlFor="terms" className="text-[11px] font-medium text-gray-500">
                I agree to the <span className="text-gray-800 font-bold">Terms</span> & <span className="text-gray-800 font-bold">Privacy</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-[#42B460] hover:opacity-90 text-white font-bold uppercase tracking-wide text-[13px] py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>



          {/* Sign in link */}
          <p className="mt-6 text-center text-gray-500 text-xs font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-rose-500 hover:text-rose-600 font-bold transition underline-offset-4 hover:underline"
            >
              Sign In
            </Link>
          </p>
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
