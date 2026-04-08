"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserPlus, Search, Users as UsersIcon, Calendar } from "lucide-react";

type PartnerRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt: string;
};

const API_BASE = "http://localhost:5000/api";

function toTitle(value: string): string {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "ACTIVE",
  });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = userRole === "ADMIN";

  function clearDashboardSession() {
    localStorage.removeItem("admin_dash_token");
    localStorage.removeItem("admin_dash_role");
    localStorage.removeItem("admin_dash_user");
    document.cookie = "admin_dash_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_role=; path=/; max-age=0; samesite=lax";
  }

  function authHeaders(includeJson = false): Record<string, string> {
    const headers: Record<string, string> = {};
    if (includeJson) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  const loadPartners = useCallback(async (activeToken: string) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "All") params.set("status", statusFilter.toUpperCase());

      const response = await fetch(`${API_BASE}/users/partners?${params.toString()}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload?.error || "Failed to load partners");
      setPartners(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      setPartners([]);
      setError(err instanceof Error ? err.message : "Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const storedToken = localStorage.getItem("admin_dash_token") || localStorage.getItem("token") || "";
      if (!storedToken) {
        if (mounted) {
          setError("No dashboard session found. Please login first.");
          setLoading(false);
        }
        return;
      }

      try {
        const meResponse = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
          cache: "no-store",
        });
        const mePayload = await meResponse.json().catch(() => ({}));

        if (!meResponse.ok) {
          const code = meResponse.status;
          if (code === 401 || code === 403 || code === 404) {
            clearDashboardSession();
            if (mounted) {
              setError("Session expired. Please login again as ADMIN.");
              setLoading(false);
            }
            router.replace("/login");
            return;
          }
          throw new Error(mePayload?.error || "Unable to verify session");
        }

        const normalizedRole = String(mePayload?.user?.role || "").toUpperCase();
        if (mounted) {
          setToken(storedToken);
          setUserRole(normalizedRole);
        }

        if (normalizedRole !== "ADMIN") {
          if (mounted) {
            setError("Only ADMIN can manage partners.");
            setLoading(false);
          }
          return;
        }

        await loadPartners(storedToken);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to initialize partners page");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [loadPartners, router]);

  useEffect(() => {
    if (isAdmin && token) {
      loadPartners(token);
    }
  }, [isAdmin, token, loadPartners]);

  const partnerStats = useMemo(() => {
    const total = partners.length;
    const active = partners.filter((partner) => String(partner.status).toUpperCase() === "ACTIVE").length;
    const suspended = partners.filter((partner) => String(partner.status).toUpperCase() === "SUSPENDED").length;
    return { total, active, suspended };
  }, [partners]);

  async function handleCreatePartner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAdmin) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/users/partners`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
          password: formState.password,
          status: formState.status,
        }),
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload?.error || "Failed to create partner");

      setMessage("Partner created successfully.");
      setFormState({ name: "", email: "", phone: "", password: "", status: "ACTIVE" });
      await loadPartners(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create partner");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(partnerId: string, role: string) {
    if (!isAdmin) return;

    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/users/${partnerId}/role`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ role }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to update role");

      setMessage("Partner role updated.");
      await loadPartners(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleStatusChange(partnerId: string, status: string) {
    if (!isAdmin) return;

    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/users/${partnerId}/status`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to update status");

      setMessage("Partner status updated.");
      await loadPartners(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Partners Management</h1>
        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Create and manage partner accounts with role restrictions</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="dash-card bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Total Partners</p>
          <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">{partnerStats.total}</p>
        </div>
        <div className="dash-card bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Active</p>
          <p className="mt-1 text-3xl font-black text-emerald-600 tracking-tight">{partnerStats.active}</p>
        </div>
        <div className="dash-card bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Suspended</p>
          <p className="mt-1 text-3xl font-black text-red-500 tracking-tight">{partnerStats.suspended}</p>
        </div>
      </section>

      {!isAdmin ? (
        <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-[11px] font-black uppercase tracking-wider text-amber-700">
          Only ADMIN can add or change partner restrictions.
        </section>
      ) : (
        <section className="dash-card bg-white p-7 rounded-3xl border border-emerald-50 shadow-sm">
          <div className="mb-6 flex items-center gap-2 text-emerald-900">
            <UserPlus size={20} className="text-emerald-500" />
            <h2 className="text-lg font-black uppercase tracking-tighter">Add New Partner</h2>
          </div>
          <form onSubmit={handleCreatePartner} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 ml-1">Full Name</label>
              <input
                required
                placeholder="Partner name"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-2xl border border-emerald-50 bg-emerald-50/20 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-200 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 ml-1">Email Address</label>
              <input
                required
                type="email"
                placeholder="Partner email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-2xl border border-emerald-50 bg-emerald-50/20 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-200 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 ml-1">Phone Number</label>
              <input
                placeholder="Phone"
                value={formState.phone}
                onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-2xl border border-emerald-50 bg-emerald-50/20 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-200 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 ml-1">Initial Password</label>
              <input
                required
                type="password"
                placeholder="Temporary password"
                value={formState.password}
                onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-2xl border border-emerald-50 bg-emerald-50/20 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-200 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 ml-1">Status</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-2xl border border-emerald-50 bg-emerald-50/20 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary-glow w-full rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Partner Account"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="dash-card bg-white p-5 rounded-3xl border border-emerald-50 shadow-sm">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-emerald-50/50 bg-emerald-50/20 px-4 py-3 focus-within:bg-white focus-within:border-emerald-200 transition-all">
            <Search size={18} className="text-emerald-600/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partner directory..."
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-emerald-900/30"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-emerald-50/50 bg-emerald-50/20 px-4 py-3 text-sm font-black uppercase tracking-wider text-emerald-800 outline-none focus:bg-white focus:border-emerald-200 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active only</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</div>
        ) : null}

        {loading ? (
          <div className="py-10 text-center text-sm font-semibold text-slate-500">Loading partners...</div>
        ) : partners.length === 0 ? (
          <div className="py-10 text-center text-sm font-semibold text-slate-500">No partners found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Partner</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-t border-slate-100">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{partner.name}</div>
                      <div className="text-xs text-slate-500">{partner.email}</div>
                      {partner.phone ? <div className="text-xs text-slate-400">{partner.phone}</div> : null}
                    </td>
                    <td className="p-3">
                      {isAdmin ? (
                        <select
                          value={String(partner.role || "PARTNER").toUpperCase()}
                          onChange={(e) => handleRoleChange(partner.id, e.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                        >
                          <option value="PARTNER">PARTNER</option>
                          <option value="USER">USER</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700"><Shield size={12} /> {toTitle(partner.role)}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isAdmin ? (
                        <select
                          value={String(partner.status || "ACTIVE").toUpperCase()}
                          onChange={(e) => handleStatusChange(partner.id, e.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      ) : (
                        <span className="text-xs font-bold text-slate-700">{toTitle(partner.status)}</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(partner.createdAt).toLocaleDateString("en-IN")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-blue-50 bg-blue-50/30 p-5 text-[11px] font-black uppercase tracking-wider text-blue-800/60 leading-relaxed shadow-sm">
        <p className="inline-flex items-center gap-2 italic"><UsersIcon size={14} className="text-blue-500" /> Restriction policy: only ADMIN can create partners and change role/status. Role changes are restricted to USER/PARTNER (no ADMIN escalation).</p>
      </section>
    </div>
  );
}
