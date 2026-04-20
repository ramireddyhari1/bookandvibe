"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Edit2, Search, Shield, Users as UsersIcon } from "lucide-react";
import EditUserModal from "@/components/users/EditUserModal";
import { fetchApi } from "@/lib/api";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  _count?: { bookings?: number };
  totalSpent?: number;
};

function toTitle(value: string): string {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  function clearDashboardSession() {
    sessionStorage.removeItem("admin_dash_token");
    sessionStorage.removeItem("admin_dash_role");
    sessionStorage.removeItem("admin_dash_user");
    localStorage.removeItem("admin_dash_token");
    localStorage.removeItem("admin_dash_role");
    localStorage.removeItem("admin_dash_user");
    document.cookie = "admin_dash_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_role=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_session=; path=/; max-age=0; samesite=lax";
  }

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("admin_dash_token") || localStorage.getItem("admin_dash_token") || "";
        if (!token) {
          setError("Session expired. Please login again.");
          setUsers([]);
          setLoading(false);
          router.replace("/login");
          return;
        }

        const sessionPayload = await fetchApi("/auth/me") as { user: { role: string } };
        const role = String(sessionPayload?.user?.role || "").toUpperCase();
        if (role !== "ADMIN") {
          setError("Only ADMIN can view users data.");
          setUsers([]);
          setLoading(false);
          router.replace("/");
          return;
        }

        const payload = await fetchApi("/users") as { data: UserRecord[] };
        setUsers(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        const status = (err as { status?: number }).status || 0;
        if ([401, 403, 404].includes(status)) {
          clearDashboardSession();
          setError("Session expired. Please login again.");
          setUsers([]);
          setLoading(false);
          router.replace("/login");
          return;
        }
        const message = err instanceof Error ? err.message : "Failed to fetch users";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchSpace = `${user.name} ${user.email}`.toLowerCase();
      const matchesSearch = searchSpace.includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "All" || toTitle(user.role) === roleFilter;
      const matchesStatus = statusFilter === "All" || toTitle(user.status) === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => String(u.status).toUpperCase() === "ACTIVE").length;
    const suspended = users.filter((u) => String(u.status).toUpperCase() === "SUSPENDED").length;
    const newThisMonth = users.filter((u) => {
      const d = new Date(u.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, active, suspended, newThisMonth };
  }, [users]);

  const roleOptions = ["All", "Admin", "Partner", "User"];
  const statusOptions = ["All", "Active", "Suspended", "Inactive"];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">User Directory</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mt-1">Platform-wide account management and insights</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Total Users</p>
          <p className="text-3xl font-black mt-1 text-slate-900 tracking-tight">{stats.total}</p>
        </div>
        <div className="dash-card bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Active</p>
          <p className="text-3xl font-black mt-1 text-emerald-600 tracking-tight">{stats.active}</p>
        </div>
        <div className="dash-card bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Suspended</p>
          <p className="text-3xl font-black mt-1 text-red-500 tracking-tight">{stats.suspended}</p>
        </div>
        <div className="dash-card bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm transition-all hover:bg-emerald-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Growth (MTD)</p>
          <p className="text-3xl font-black mt-1 text-teal-600 tracking-tight">+{stats.newThisMonth}</p>
        </div>
      </section>

      <section className="dash-card bg-white rounded-3xl border border-emerald-50 p-5 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
        <div className="md:col-span-2 flex items-center gap-3 bg-emerald-50/30 rounded-2xl px-4 py-3 border border-emerald-50/50 focus-within:border-emerald-200 focus-within:bg-white transition-all">
          <Search size={18} className="text-emerald-600/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 placeholder:text-emerald-900/30"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-2xl border border-emerald-50/50 bg-emerald-50/20 px-4 py-3 text-sm font-black uppercase tracking-wider text-emerald-800 outline-none focus:bg-white focus:border-emerald-200 transition-all cursor-pointer"
        >
          {roleOptions.map((option) => (
            <option key={option} value={option}>{option === "All" ? "Every Role" : option}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-emerald-50/50 bg-emerald-50/20 px-4 py-3 text-sm font-black uppercase tracking-wider text-emerald-800 outline-none focus:bg-white focus:border-emerald-200 transition-all cursor-pointer"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>{option === "All" ? "Any Status" : option}</option>
          ))}
        </select>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3">Spent</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-emerald-50 transition-all hover:bg-emerald-50/30">
                    <td className="p-4">
                      <div className="font-black text-slate-800">{user.name}</div>
                      <div className="text-[11px] font-bold text-emerald-600/60">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${user.role === "ADMIN" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {toTitle(user.role) === "Admin" ? <Shield size={12} /> : <UsersIcon size={12} />}
                        {toTitle(user.role)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {toTitle(user.status)}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900">{user._count?.bookings || 0}</td>
                    <td className="p-4 font-black text-emerald-600">₹{Math.round(user.totalSpent || 0).toLocaleString()}</td>
                     <td className="p-4 text-slate-400 font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-emerald-400/60" />
                        {new Date(user.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95"
                        title="Edit Profile"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <EditUserModal 
        user={editingUser as any} 
        onClose={() => setEditingUser(null)}
        onUpdate={(updated) => {
          setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        }}
      />
    </div>
  );
}
