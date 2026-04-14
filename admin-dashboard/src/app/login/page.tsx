"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Users } from "lucide-react";

import { fetchApi } from "@/lib/api";

const ALLOWED_ROLES = new Set(["ADMIN", "PARTNER"]);

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function setAuthCookies(token: string, role: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `admin_dash_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
  document.cookie = `admin_dash_role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_dash_token");
    const role = String(localStorage.getItem("admin_dash_role") || "").toUpperCase();
    if (token && ALLOWED_ROLES.has(role)) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = await fetchApi("/auth/login", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const token = String(payload?.token || "");
      const user = payload?.user as LoginUser | undefined;
      const role = String(user?.role || "").toUpperCase();

      if (!token || !user?.id || !ALLOWED_ROLES.has(role)) {
        throw new Error("Only ADMIN or PARTNER accounts can access this dashboard");
      }

      localStorage.setItem("admin_dash_token", token);
      localStorage.setItem("admin_dash_role", role);
      localStorage.setItem("admin_dash_user", JSON.stringify(user));
      setAuthCookies(token, role);

      router.replace("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-48 w-48 items-center justify-center overflow-hidden rounded-[2.5rem] bg-white p-3 shadow-2xl shadow-rose-500/20 ring-1 ring-white/10 transition-transform hover:scale-105">
            <img 
              src="/logo.png" 
              alt="Book & Vibe" 
              className="h-full w-full scale-[2.2] object-contain transition-transform duration-500 hover:scale-[2.4]"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Dashboard Login</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">Sign in using an ADMIN or PARTNER account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-400 focus:border-rose-400"
              placeholder="you@bookandvibe.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 pr-11 text-sm text-white outline-none placeholder:text-slate-400 focus:border-rose-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error ? (
            <div className="rounded-xl border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            <Users size={16} /> {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
