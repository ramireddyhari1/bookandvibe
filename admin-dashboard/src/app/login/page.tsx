"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Book & Vibe" className="h-10 w-10 object-contain" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Sign in to your account</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-gray-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors"
                placeholder="you@bookandvibe.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-gray-600">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <PremiumLoader size="sm" color="#ffffff" />
                </div>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          Admin & Partner access only
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
