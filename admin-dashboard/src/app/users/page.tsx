"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Search, Shield, Users as UsersIcon } from "lucide-react";

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

const API_BASE = "http://localhost:5000/api";

function toTitle(value: string): string {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/users`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch users");
        }
        setUsers(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch users";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Users Management</h1>
        <p className="text-slate-500 mt-1 font-medium">Live user data from backend</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">Total Users</p>
          <p className="text-2xl font-extrabold mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">Active Users</p>
          <p className="text-2xl font-extrabold mt-1">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">Suspended</p>
          <p className="text-2xl font-extrabold mt-1">{stats.suspended}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase">New This Month</p>
          <p className="text-2xl font-extrabold mt-1">{stats.newThisMonth}</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
          <Search size={16} className="text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email"
            className="bg-transparent w-full outline-none text-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
        >
          {roleOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
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
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold">
                        {toTitle(user.role) === "Admin" ? <Shield size={12} /> : <UsersIcon size={12} />}
                        {toTitle(user.role)}
                      </span>
                    </td>
                    <td className="p-3">{toTitle(user.status)}</td>
                    <td className="p-3">{user._count?.bookings || 0}</td>
                    <td className="p-3 font-bold">INR {Math.round(user.totalSpent || 0).toLocaleString()}</td>
                    <td className="p-3 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(user.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
