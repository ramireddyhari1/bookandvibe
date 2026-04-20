"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Eye, EyeOff, ShieldCheck, Sparkles, Users } from "lucide-react";

import { fetchApi } from "@/lib/api";

const ALLOWED_ROLES = new Set(["ADMIN", "PARTNER"]);

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function setAuthCookies(token: string, role: string) {
  // Session cookies expire when the browser session ends.
  document.cookie = `admin_dash_token=${encodeURIComponent(token)}; path=/; samesite=lax`;
  document.cookie = `admin_dash_role=${encodeURIComponent(role)}; path=/; samesite=lax`;
  document.cookie = "admin_dash_session=1; path=/; samesite=lax";
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_dash_token");
    const role = String(sessionStorage.getItem("admin_dash_role") || "").toUpperCase();
    if (token && ALLOWED_ROLES.has(role)) {
      router.replace(searchParams.get("next") || "/");
    }
  }, [router, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = (await fetchApi("/auth/login", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify({ email: email.trim(), password }),
      })) as any;

      const token = String(payload?.token || "");
      const user = payload?.user as LoginUser | undefined;
      const role = String(user?.role || "").toUpperCase();

      if (!token || !user?.id || !ALLOWED_ROLES.has(role)) {
        throw new Error("Only approved accounts can access this portal");
      }

      sessionStorage.setItem("admin_dash_token", token);
      sessionStorage.setItem("admin_dash_role", role);
      sessionStorage.setItem("admin_dash_user", JSON.stringify(user));

      localStorage.removeItem("admin_dash_token");
      localStorage.removeItem("admin_dash_role");
      localStorage.removeItem("admin_dash_user");

      setAuthCookies(token, role);
      router.replace(searchParams.get("next") || "/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b1d] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(244,63,94,0.16),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(7,11,29,1)_52%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:gap-10">
          <section className="hidden flex-col justify-between rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:flex xl:p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-emerald-500/10">
                  <img src="/logo.png" alt="Book & Vibe" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300/80">Book & Vibe</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white xl:text-3xl">Company Access Portal</h1>
                </div>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
                Secure Sign In
              </div>
            </div>

            <div className="max-w-xl pt-6">
              <p className="text-sm font-medium leading-7 text-slate-300 xl:text-base">
                Access the operations console for events, bookings, partners, and live controls from one secure workspace.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Centralized workflow", desc: "Track bookings, revenue, and live activity in one place.", icon: Building2 },
                  { title: "Role-aware access", desc: "Sign in with approved company credentials only.", icon: ShieldCheck },
                  { title: "Fast operations", desc: "Move between tasks without losing context.", icon: Sparkles },
                  { title: "Team ready", desc: "Built for admins, partners, and operators.", icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Icon size={18} />
                      </div>
                      <h2 className="mt-3 text-sm font-extrabold text-white">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              <span>Verified Workspace</span>
              <span>Encrypted Session</span>
              <span>Live Operations</span>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/7 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8 lg:mx-0 lg:max-w-none lg:self-center xl:p-10">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white shadow-2xl shadow-emerald-500/10 lg:mx-0">
                <img src="/logo.png" alt="Book & Vibe" className="h-14 w-14 object-contain" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300/80">Company Portal</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Welcome back</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Sign in to continue to your secure operations workspace.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">Work Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-slate-950/60"
                  placeholder="you@bookandvibe.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50 focus:bg-slate-950/60"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
                  {error}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/8 px-4 py-3 text-sm text-slate-200">
                  Use your approved company credentials to access the portal.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary-glow flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black uppercase tracking-[0.24em] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Sign In <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
              <span>Secure session</span>
              <span>Protected access</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b1d] flex items-center justify-center text-white">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
