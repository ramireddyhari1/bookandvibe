"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Key,
  Palette,
  Mail,
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCcw,
  Check,
  Camera,
  Ticket,
  LayoutTemplate,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Website Content State
  const [websiteConfig, setWebsiteConfig] = useState<any>({
    banners: [],
    footerText: "",
    socialLinks: []
  });
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "website" && !websiteConfig.footerText) {
      setConfigLoading(true);
      fetchApi('/config/website')
        .then(res => {
          if (res.data) setWebsiteConfig(res.data);
        })
        .catch(console.error)
        .finally(() => setConfigLoading(false));
    }
  }, [activeTab]);

  const handleSaveWebsiteConfig = async () => {
    try {
      setSaved(true);
      await fetchApi('/config/website', {
        method: 'PUT',
        body: JSON.stringify(websiteConfig)
      });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setSaved(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "API Keys", icon: Key },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "website", label: "Website Content", icon: LayoutTemplate },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          System Settings
        </h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mt-1">
          Global platform configuration and security protocols
        </p>
      </header>

      {/* Tab Navigation + Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Sidebar */}
        <div className="lg:w-[240px] shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-emerald-50 p-2 lg:sticky lg:top-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all ${
                    isActive
                      ? "bg-emerald-500 text-white font-black shadow-lg shadow-emerald-100"
                      : "text-slate-500 hover:bg-emerald-50/50 hover:text-emerald-700 font-bold"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-emerald-600/40"} />
                  <span className="text-[13px] uppercase tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* ── General Settings ──────────────── */}
          {activeTab === "general" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-900">General Settings</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Basic platform configuration</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Platform Logo */}
                <div className="flex items-center gap-6 pb-6 border-b border-emerald-50">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-100 relative group cursor-pointer">
                    <Ticket size={32} className="text-white -rotate-44" />
                    <div className="absolute inset-0 bg-emerald-900/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Camera size={22} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">Identity Branding</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG/SVG Preferred. Max 2MB.</p>
                    <button className="mt-3 text-xs text-emerald-600 font-black uppercase tracking-wider hover:text-emerald-700 transition-all">Update Asset</button>
                  </div>
                </div>

                {/* Platform Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Platform Identity</label>
                  <input
                    type="text"
                    defaultValue="Book & Vibe"
                    className="w-full bg-emerald-50/20 border border-emerald-50 focus:border-emerald-200 rounded-2xl px-5 py-3.5 text-slate-900 text-sm font-bold outline-none transition-all"
                  />
                </div>

                {/* Platform URL */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Platform URL</label>
                  <input
                    type="url"
                    defaultValue="https://bookandvibe.com"
                    className="w-full bg-emerald-50/20 border border-emerald-50 focus:border-emerald-200 rounded-2xl px-5 py-3.5 text-slate-900 text-sm font-bold outline-none transition-all"
                  />
                </div>

                {/* Support Email */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@bookandvibe.com"
                    className="w-full bg-emerald-50/20 border border-emerald-50 focus:border-emerald-200 rounded-2xl px-5 py-3.5 text-slate-900 text-sm font-bold outline-none transition-all"
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">System Timezone</label>
                  <select className="w-full bg-emerald-50/20 border border-emerald-50 focus:border-emerald-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-bold outline-none transition-all cursor-pointer">
                    <option>Asia/Kolkata (IST, +05:30)</option>
                    <option>America/New_York (EST, -05:00)</option>
                    <option>Europe/London (GMT, +00:00)</option>
                    <option>Asia/Singapore (SGT, +08:00)</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Default Currency</label>
                  <select className="w-full bg-emerald-50/20 border border-emerald-50 focus:border-emerald-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-bold outline-none transition-all cursor-pointer">
                    <option>₹ INR – Indian Rupee</option>
                    <option>$ USD – US Dollar</option>
                    <option>€ EUR – Euro</option>
                    <option>£ GBP – British Pound</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-emerald-50 bg-emerald-50/10 flex justify-end">
                <button
                  onClick={handleSave}
                  className="btn-primary-glow flex items-center gap-2 rounded-2xl px-8 py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100/50 hover:scale-[1.02] transition-all"
                >
                  {saved ? <Check size={18} strokeWidth={3} /> : <Save size={18} strokeWidth={3} />}
                  {saved ? "Synchronized" : "Commit Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── Notification Settings ────────── */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-50 overflow-hidden">
              <div className="p-6 border-b border-emerald-50">
                <h2 className="text-lg font-black text-slate-900 uppercase">Notification Protocols</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mt-1">Configure automated alert distribution</p>
              </div>

              <div className="p-6 space-y-0">
                {[
                  { label: "New Bookings", desc: "Get notified when a new booking is made", email: true, push: true },
                  { label: "User Registrations", desc: "Alert when new users sign up", email: true, push: false },
                  { label: "Payment Alerts", desc: "Notifications for payments and refunds", email: true, push: true },
                  { label: "Event Updates", desc: "Changes to published events", email: false, push: true },
                  { label: "Weekly Reports", desc: "Receive weekly performance summary", email: true, push: false },
                  { label: "System Alerts", desc: "Critical system notifications", email: true, push: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-5 border-b border-slate-100 last:border-b-0">
                    <div>
                      <h4 className="font-bold text-slate-900 text-[14px]">{item.label}</h4>
                      <p className="text-[13px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={item.email}
                          className="w-4 h-4 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-400 accent-emerald-500"
                        />
                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Mail size={12} className="text-emerald-400" /> Email
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={item.push}
                          className="w-4 h-4 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-400 accent-emerald-500"
                        />
                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Smartphone size={12} className="text-emerald-400" /> Push
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-rose-200 transition"
                >
                  {saved ? <Check size={17} /> : <Save size={17} />}
                  {saved ? "Saved!" : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* ── Security Settings ────────────── */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-extrabold text-slate-900">Change Password</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Update your admin account password</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                    <input type="password" className="w-full bg-slate-50 border-2 border-slate-200 focus:border-rose-400 rounded-xl px-4 py-3 text-[15px] font-medium outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <input type="password" className="w-full bg-slate-50 border-2 border-slate-200 focus:border-rose-400 rounded-xl px-4 py-3 text-[15px] font-medium outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                    <input type="password" className="w-full bg-slate-50 border-2 border-slate-200 focus:border-rose-400 rounded-xl px-4 py-3 text-[15px] font-medium outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]" placeholder="Confirm new password" />
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-rose-200 transition">
                    {saved ? <Check size={17} /> : <Shield size={17} />}
                    {saved ? "Updated!" : "Update Password"}
                  </button>
                </div>
              </div>

              {/* Two-Factor */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <button className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-100 transition">
                    Enable 2FA
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-extrabold text-slate-900">Active Sessions</h2>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { device: "Chrome on Windows", location: "Mumbai, India", time: "Active now", current: true },
                    { device: "Safari on macOS", location: "Delhi, India", time: "1 hour ago", current: false },
                    { device: "Mobile App - iOS", location: "Bangalore, India", time: "2 days ago", current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div>
                        <p className="font-bold text-slate-900 text-[14px]">{session.device}</p>
                        <p className="text-[12px] text-slate-500 font-medium">{session.location} · {session.time}</p>
                      </div>
                      {session.current ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Current
                        </span>
                      ) : (
                        <button className="text-sm text-red-500 font-bold hover:text-red-600 transition">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── API Keys ─────────────────────── */}
          {activeTab === "api" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-900">API Configuration</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Manage API keys for integrations</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Live API Key */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Live API Key</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-[14px] text-slate-600 flex items-center">
                      {showApiKey ? "bv_live_sk_a8f3d2e1b9c4f7a6d5e8b3c1f9a2" : "bv_live_sk_••••••••••••••••••••••••"}
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="ml-auto text-slate-400 hover:text-slate-600 transition"
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition" title="Copy">
                      <Copy size={16} className="text-slate-500" />
                    </button>
                    <button className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition" title="Regenerate">
                      <RefreshCcw size={16} className="text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Test API Key */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Test API Key</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-[14px] text-slate-600">
                      bv_test_sk_••••••••••••••••••••••••
                    </div>
                    <button className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition" title="Copy">
                      <Copy size={16} className="text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    defaultValue="https://bookandvibe.com/api/webhooks"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-rose-400 rounded-xl px-4 py-3 text-[15px] font-medium outline-none transition-all focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"
                  />
                </div>

                {/* Rate Limits Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <SettingsIcon size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 text-[14px]">Rate Limits</h4>
                    <p className="text-[13px] text-blue-700/80 font-medium mt-0.5">
                      Your current plan allows 10,000 API requests per minute in production and 1,000 in test mode.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-rose-200 transition"
                >
                  {saved ? <Check size={17} /> : <Save size={17} />}
                  {saved ? "Saved!" : "Save Configuration"}
                </button>
              </div>
            </div>
          )}

          {/* ── Appearance Settings ──────────── */}
          {activeTab === "appearance" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-900">Appearance</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Customize the dashboard look and feel</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Dashboard Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Light", bg: "bg-white border-rose-400", active: true },
                      { name: "Dark", bg: "bg-slate-900", active: false },
                      { name: "System", bg: "bg-gradient-to-r from-white to-slate-900", active: false },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme.active
                            ? "border-rose-400 shadow-sm shadow-rose-100"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-full h-16 rounded-lg mb-3 ${theme.bg} border border-slate-200`} />
                        <p className={`text-sm font-bold ${theme.active ? "text-rose-600" : "text-slate-600"}`}>
                          {theme.name}
                          {theme.active && <Check size={14} className="inline ml-1" />}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Accent Color</label>
                  <div className="flex gap-3">
                    {[
                      { color: "bg-emerald-500", name: "Emerald", active: true },
                      { color: "bg-teal-500", name: "Teal", active: false },
                      { color: "bg-cyan-500", name: "Cyan", active: false },
                      { color: "bg-violet-500", name: "Violet", active: false },
                      { color: "bg-rose-500", name: "Rose", active: false },
                    ].map((c) => (
                      <button
                        key={c.name}
                        className={`w-10 h-10 rounded-xl ${c.color} transition-all ${
                          c.active
                            ? "ring-4 ring-offset-2 ring-emerald-200 scale-110"
                            : "hover:scale-110"
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Sidebar Style */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sidebar Density</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 focus:border-rose-400 rounded-xl px-4 py-3 text-[15px] font-medium outline-none transition-all cursor-pointer">
                    <option>Comfortable</option>
                    <option>Compact</option>
                    <option>Spacious</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-emerald-50 bg-emerald-50/10 flex justify-end">
                <button
                  onClick={handleSave}
                  className="btn-primary-glow flex items-center gap-2 rounded-2xl px-8 py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100/50 hover:scale-[1.02] transition-all"
                >
                  {saved ? <Check size={18} strokeWidth={3} /> : <Save size={18} strokeWidth={3} />}
                  {saved ? "Synchronized" : "Apply Changes"}
                </button>
              </div>
            </div>
          )}
          {/* ── Website Content ────────────── */}
          {activeTab === "website" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-900">Website Content</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Manage public landing page banners and footer</p>
              </div>

              {configLoading ? (
                <div className="p-8 text-center text-sm font-bold text-slate-400">Loading Configuration...</div>
              ) : (
                <div className="p-6 space-y-8">
                  {/* Banners */}
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight mb-4">Hero Banners</h3>
                    <div className="space-y-6">
                      {websiteConfig.banners?.map((banner: any, index: number) => (
                        <div key={banner.id} className="p-5 border border-emerald-50 rounded-xl bg-emerald-50/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4">{banner.id}</p>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                              <input
                                type="text"
                                value={banner.title || ""}
                                onChange={(e) => {
                                  const newBanners = [...websiteConfig.banners];
                                  newBanners[index].title = e.target.value;
                                  setWebsiteConfig({ ...websiteConfig, banners: newBanners });
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded-xl px-4 py-3 text-slate-900 text-sm font-bold outline-none transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subtitle</label>
                              <input
                                type="text"
                                value={banner.subtitle || ""}
                                onChange={(e) => {
                                  const newBanners = [...websiteConfig.banners];
                                  newBanners[index].subtitle = e.target.value;
                                  setWebsiteConfig({ ...websiteConfig, banners: newBanners });
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded-xl px-4 py-3 text-slate-900 text-sm font-bold outline-none transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Background Image URL</label>
                              <input
                                type="text"
                                value={banner.image || ""}
                                onChange={(e) => {
                                  const newBanners = [...websiteConfig.banners];
                                  newBanners[index].image = e.target.value;
                                  setWebsiteConfig({ ...websiteConfig, banners: newBanners });
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded-xl px-4 py-3 text-slate-900 text-sm font-bold outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Setup */}
                  <div className="pt-6 border-t border-emerald-50">
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight mb-4">Footer Section</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bio Text</label>
                        <textarea
                          rows={3}
                          value={websiteConfig.footerText || ""}
                          onChange={(e) => setWebsiteConfig({ ...websiteConfig, footerText: e.target.value })}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded-xl px-4 py-3 text-slate-900 text-sm font-bold outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Social Media Links</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {websiteConfig.socialLinks?.map((link: any, index: number) => (
                            <div key={index} className="flex flex-col gap-1">
                              <span className="text-[11px] font-bold text-slate-600">{link.platform}</span>
                              <input
                                type="url"
                                value={link.url || ""}
                                onChange={(e) => {
                                  const newLinks = [...websiteConfig.socialLinks];
                                  newLinks[index].url = e.target.value;
                                  setWebsiteConfig({ ...websiteConfig, socialLinks: newLinks });
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded-lg px-3 py-2.5 text-slate-900 text-sm font-medium outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 border-t border-emerald-50 bg-emerald-50/10 flex justify-end">
                <button
                  onClick={handleSaveWebsiteConfig}
                  disabled={configLoading}
                  className="btn-primary-glow flex items-center gap-2 rounded-2xl px-8 py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saved ? <Check size={18} strokeWidth={3} /> : <Save size={18} strokeWidth={3} />}
                  {saved ? "Synchronized" : "Apply Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
