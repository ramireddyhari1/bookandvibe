"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Link as LinkIcon } from "lucide-react";
import { fetchApi } from "@/lib/api";

type UserRecord = {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
};

interface EditUserModalProps {
  user: UserRecord | null;
  onClose: () => void;
  onUpdate: (updatedUser: UserRecord) => void;
}

export default function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || "");
    }
  }, [user]);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetchApi(`/users/${user.id}`, {
        method: "PUT",
        requiresAuth: true,
        body: JSON.stringify({ name, avatar }),
      }) as { data: UserRecord };

      if (res.data) {
        onUpdate(res.data);
        onClose();
      }
    } catch (err) {
      setError((err as Error).message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      <div 
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mt-1">Update host information</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-[13px] font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 focus-within:border-emerald-200 focus-within:bg-white transition-all">
              <User size={18} className="text-emerald-600/40" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Avatar URL</label>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 focus-within:border-emerald-200 focus-within:bg-white transition-all">
              <LinkIcon size={18} className="text-emerald-600/40" />
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
