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
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Trophy,
  Shield,
  Gift,
  Star,
  CheckCircle2,
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
    } catch (err: any) {
      setError(err.message);
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
    <div className="fixed inset-0 z-[200] flex bg-gradient-to-br from-rose-100 via-rose-50 to-white overflow-y-auto">
      {/* ═══════════════════════════════════════════════════
          LEFT PANEL — Visual / Branding
      ═══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"
          alt="Festival atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/90 via-rose-900/70 to-rose-800/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-rose-950/30" />

        {/* Floating decorative orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-16 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 xl:p-16">
          {/* Top — Logo */}
          <div className="flex items-center gap-2.5">
            <Ticket className="text-rose-400 fill-rose-400 -rotate-45" size={28} />
            <span className="text-[28px] font-mexicana text-white tracking-wide">
              BOOK & VIBE
            </span>
          </div>

          {/* Center — Benefits */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 px-4 py-2 rounded-full text-sm font-bold mb-8">
              <Gift size={14} className="text-rose-300" />
              Join free · No credit card required
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-8">
              Start your journey
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                with Book & Vibe
              </span>
            </h1>

            {/* Benefits List */}
            <div className="space-y-5">
              {[
                {
                  icon: <Sparkles size={18} />,
                  title: "Personalized Recommendations",
                  desc: "AI-curated events based on your interests",
                },
                {
                  icon: <Trophy size={18} />,
                  title: "Early Access & Presales",
                  desc: "Be first in line for trending events",
                },
                {
                  icon: <Shield size={18} />,
                  title: "Secure & Instant Booking",
                  desc: "256-bit encrypted payments, instant e-tickets",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-rose-300 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[15px] mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-white/50 text-sm font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Social Proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {["S", "A", "R", "M", "K"].map((letter, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-sm font-bold border-2 border-rose-900/50 shadow-lg"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-white/50 text-sm font-medium">
                Loved by 100K+ users across India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT PANEL — Register Form
      ═══════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-12 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-72 h-72 bg-rose-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-56 h-56 bg-pink-100 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2 mb-10 lg:hidden">
            <Ticket className="text-rose-500 fill-rose-500 -rotate-45" size={24} />
            <span className="text-[24px] font-mexicana text-rose-600 tracking-wide">
              BOOK & VIBE
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1c222b] tracking-tight mb-3">
              Create account ✨
            </h2>
            <p className="text-gray-500 font-medium text-[15px]">
              Join thousands discovering their perfect experiences every day.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-4 rounded-2xl mb-6 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-500 text-xs font-black">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-bold text-[#1c222b] mb-2">
                Full name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-200 focus:border-rose-400 rounded-2xl pl-12 pr-4 py-3.5 text-[#1c222b] text-[15px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-[#1c222b] mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-200 focus:border-rose-400 rounded-2xl pl-12 pr-4 py-3.5 text-[#1c222b] text-[15px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-[#1c222b] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white border-2 border-gray-200 focus:border-rose-400 rounded-2xl pl-12 pr-12 py-3.5 text-[#1c222b] text-[15px] font-medium placeholder-gray-400 outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength.level ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-bold ${
                      strength.level <= 1
                        ? "text-red-500"
                        : strength.level <= 2
                        ? "text-amber-500"
                        : strength.level <= 3
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400 accent-rose-500 mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium text-gray-500 cursor-pointer leading-relaxed"
              >
                I agree to the{" "}
                <span className="text-rose-500 hover:text-rose-600 transition font-semibold">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-rose-500 hover:text-rose-600 transition font-semibold">
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-[16px] py-4 rounded-2xl transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              or sign up with
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#1c222b] font-bold text-sm py-3.5 rounded-2xl transition-all">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#1c222b] font-bold text-sm py-3.5 rounded-2xl transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Sign in link */}
          <p className="mt-8 text-center text-gray-500 text-sm font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-rose-500 hover:text-rose-600 font-bold transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
