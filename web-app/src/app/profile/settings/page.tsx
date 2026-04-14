"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  Lock,
  Eye,
  Smartphone,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Trash2,
  LogOut,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const Toggle = ({
    enabled,
    onToggle,
  }: {
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <button onClick={onToggle} className="transition-all">
      {enabled ? (
        <ToggleRight size={28} className="text-[#42B460]" />
      ) : (
        <ToggleLeft size={28} className="text-gray-300" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-[700px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 font-medium">Account preferences & privacy</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-[13px] font-black text-gray-500 uppercase tracking-wider">Appearance</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-500" />}
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">Dark Mode</p>
                    <p className="text-[12px] text-gray-400 font-medium">Switch between light and dark theme</p>
                  </div>
                </div>
                <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-blue-500" />
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">Language</p>
                    <p className="text-[12px] text-gray-400 font-medium">English (India)</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-[13px] font-black text-gray-500 uppercase tracking-wider">Notifications</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-rose-500" />
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">Email Notifications</p>
                    <p className="text-[12px] text-gray-400 font-medium">Booking confirmations & event updates</p>
                  </div>
                </div>
                <Toggle enabled={emailNotif} onToggle={() => setEmailNotif(!emailNotif)} />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-purple-500" />
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">Push Notifications</p>
                    <p className="text-[12px] text-gray-400 font-medium">Real-time alerts on your device</p>
                  </div>
                </div>
                <Toggle enabled={pushNotif} onToggle={() => setPushNotif(!pushNotif)} />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">SMS Notifications</p>
                    <p className="text-[12px] text-gray-400 font-medium">Text messages for important updates</p>
                  </div>
                </div>
                <Toggle enabled={smsNotif} onToggle={() => setSmsNotif(!smsNotif)} />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-[13px] font-black text-gray-500 uppercase tracking-wider">Security</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-gray-500" />
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">Change Password</p>
                    <p className="text-[12px] text-gray-400 font-medium">Update your account password</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-blue-500" />
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">Two-Factor Authentication</p>
                    <p className="text-[12px] text-gray-400 font-medium">Extra security for your account</p>
                  </div>
                </div>
                <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
              </div>
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <Eye size={18} className="text-gray-500" />
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">Privacy Settings</p>
                    <p className="text-[12px] text-gray-400 font-medium">Manage data sharing & visibility</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-[13px] font-black text-gray-500 uppercase tracking-wider">Support</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-gray-500" />
                  <p className="text-[14px] font-bold text-gray-800">Help Centre</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-500" />
                  <p className="text-[14px] font-bold text-gray-800">Terms & Privacy Policy</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-red-50">
              <h3 className="text-[13px] font-black text-red-400 uppercase tracking-wider">Danger Zone</h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
              <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 border-red-100 text-red-500 font-bold text-[13px] hover:bg-red-50 hover:border-red-200 transition-all">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>

          {/* Version */}
          <p className="text-center text-[12px] text-gray-400 font-medium pb-4">
            Book & Vibe v2.0.0 • Made with ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
