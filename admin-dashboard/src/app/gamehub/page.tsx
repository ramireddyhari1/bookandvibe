"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gamepad2, MapPin, Search, Star, Users, Ticket, Sparkles, ArrowUpRight, RefreshCw, Plus, Pencil, Trash2, X, Clock, HelpCircle } from "lucide-react";

type GameHubFacility = {
  id: string;
  name: string;
  type: string;
  location: string;
  venue: string;
  rating: number;
  priceRange: string;
  pricePerHour?: number;
  unit?: string;
  distance?: string;
  description?: string;
  phone?: string;
  openHours?: string;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  pricingRules?: Array<{ type: string; time?: string; day?: string; price: number }>;
  features?: string[];
  amenities?: string[];
  image?: string;
  tags?: string[];
  gallery?: string[];
  battleModes?: Array<{ name: string; players: string; duration: string }>;
  slotTemplate?: Array<{ label: string; isBooked?: boolean }>;
  availableSports?: string[];
  partnerId?: string | null;
  partner?: { id: string; name: string; email: string } | null;
};

type PartnerOption = {
  id: string;
  name: string;
  email: string;
};

type CalendarDay = {
  date: string;
  bookingCount: number;
  blockedCount: number;
  bookings: Array<{ id: string; slotLabel: string; status: string }>;
  blocks: Array<{ id: string; slotLabel: string; reason: string; createdAt: string }>;
};

type CalendarGridCell = {
  date: string;
  inCurrentMonth: boolean;
};

type FacilityFormState = {
  name: string;
  type: string;
  location: string;
  venue: string;
  distance: string;
  rating: string;
  priceRange: string;
  pricePerHour: string;
  unit: string;
  image: string;
  description: string;
  phone: string;
  openHours: string;
  amenities: string;
  features: string;
  tags: string;
  gallery: string;
  pricingRules: string;
  slotTemplate: string;
  availableSports: string;
  slotStartHour: string;
  slotEndHour: string;
  slotInterval: string;
  peakStartHour: string;
  peakEndHour: string;
  peakPrice: string;
  weekendPrice: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
};

import { fetchApi } from "@/lib/api";

type GameHubFacility = {
  id: string;
  name: string;
  type: string;
  location: string;
  venue: string;
  rating: number;
  priceRange: string;
  pricePerHour?: number;
  unit?: string;
  distance?: string;
  description?: string;
  phone?: string;
  openHours?: string;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  pricingRules?: Array<{ type: string; time?: string; day?: string; price: number }>;
  features?: string[];
  amenities?: string[];
  image?: string;
  tags?: string[];
  gallery?: string[];
  battleModes?: Array<{ name: string; players: string; duration: string }>;
  slotTemplate?: Array<{ label: string; isBooked?: boolean }>;
  availableSports?: string[];
  partnerId?: string | null;
  partner?: { id: string; name: string; email: string } | null;
};

type PartnerOption = {
  id: string;
  name: string;
  email: string;
};

type CalendarDay = {
  date: string;
  bookingCount: number;
  blockedCount: number;
  bookings: Array<{ id: string; slotLabel: string; status: string }>;
  blocks: Array<{ id: string; slotLabel: string; reason: string; createdAt: string }>;
};

type CalendarGridCell = {
  date: string;
  inCurrentMonth: boolean;
};

type FacilityFormState = {
  name: string;
  type: string;
  location: string;
  venue: string;
  distance: string;
  rating: string;
  priceRange: string;
  pricePerHour: string;
  unit: string;
  image: string;
  description: string;
  phone: string;
  openHours: string;
  amenities: string;
  features: string;
  tags: string;
  gallery: string;
  pricingRules: string;
  slotTemplate: string;
  availableSports: string;
  slotStartHour: string;
  slotEndHour: string;
  slotInterval: string;
  peakStartHour: string;
  peakEndHour: string;
  peakPrice: string;
  weekendPrice: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
};

const defaultImage = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200";
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyFormState: FacilityFormState = {
  name: "",
  type: "",
  location: "",
  venue: "",
  distance: "0 km away",
  rating: "4.5",
  priceRange: "INR 500 / hr",
  pricePerHour: "500",
  unit: "hr",
  image: defaultImage,
  description: "",
  phone: "",
  openHours: "6:00 AM - 10:00 PM",
  amenities: "",
  features: "",
  tags: "",
  gallery: "",
  pricingRules: "",
  slotTemplate: "",
  availableSports: "",
  slotStartHour: "6",
  slotEndHour: "22",
  slotInterval: "60",
  peakStartHour: "18",
  peakEndHour: "22",
  peakPrice: "800",
  weekendPrice: "1000",
  status: "ACTIVE",
};

function listToCsv(input?: string[]) {
  return (input || []).join(", ");
}

function csvToList(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapFacilityToForm(facility: GameHubFacility): FacilityFormState {
  return {
    name: facility.name || "",
    type: facility.type || "",
    location: facility.location || "",
    venue: facility.venue || "",
    distance: facility.distance || "0 km away",
    rating: String(facility.rating ?? ""),
    priceRange: facility.priceRange || "",
    pricePerHour: String(facility.pricePerHour ?? ""),
    unit: facility.unit || "hr",
    image: facility.image || defaultImage,
    description: facility.description || "",
    phone: facility.phone || "",
    openHours: facility.openHours || "",
    amenities: listToCsv(facility.amenities),
    features: listToCsv(facility.features),
    tags: listToCsv(facility.tags),
    gallery: listToCsv(facility.gallery),
    pricingRules: JSON.stringify(facility.pricingRules || [], null, 2),
    slotTemplate: JSON.stringify(facility.slotTemplate || [], null, 2),
    availableSports: listToCsv(facility.availableSports),
    slotStartHour: "6",
    slotEndHour: "22",
    slotInterval: "60",
    peakStartHour: "18",
    peakEndHour: "22",
    peakPrice: "800",
    weekendPrice: "1000",
    status: facility.status || "ACTIVE",
  };
}

export default function GameHubAdminPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<GameHubFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FacilityFormState>(emptyFormState);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(currentMonthString());
  const [selectedCalendarFacilityId, setSelectedCalendarFacilityId] = useState("");
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [blockDate, setBlockDate] = useState(todayDateString());
  const [blockReason, setBlockReason] = useState("Maintenance");
  const [blockSlotsInput, setBlockSlotsInput] = useState("");
  const [adminChecked, setAdminChecked] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [authError, setAuthError] = useState("");
  const [selectedDate, setSelectedDate] = useState(`${currentMonthString()}-01`);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function clearDashboardSession() {
    localStorage.removeItem("admin_dash_token");
    localStorage.removeItem("admin_dash_role");
    localStorage.removeItem("admin_dash_user");
    document.cookie = "admin_dash_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_role=; path=/; max-age=0; samesite=lax";
  }

  const selectedDay = useMemo(() => {
    return (
      calendarDays.find((day) => day.date === selectedDate) || {
        date: selectedDate,
        bookingCount: 0,
        blockedCount: 0,
        bookings: [],
        blocks: [],
      }
    );
  }, [calendarDays, selectedDate]);

  const daysByDate = useMemo(() => {
    return new Map(calendarDays.map((day) => [day.date, day]));
  }, [calendarDays]);

  const monthGrid = useMemo(() => buildMonthGrid(calendarMonth), [calendarMonth]);

  function openCreateEditor() {
    setEditorMode("create");
    setEditingFacilityId(null);
    setFormState(emptyFormState);
    setActionError("");
    setActionMessage("");
    setIsEditorOpen(true);
  }

  function openEditEditor(facility: GameHubFacility) {
    setEditorMode("edit");
    setEditingFacilityId(facility.id);
    setFormState(mapFacilityToForm(facility));
    setActionError("");
    setActionMessage("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingFacilityId(null);
    setActionError("");
  }

  function handleFormChange(field: keyof FacilityFormState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  async function generateSlotsFromPreset() {
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to generate slots");
      return;
    }

    setActionError("");
    try {
      const payload: any = await fetchApi("/gamehub/facilities/slot-template/generate", {
        method: "POST",
        body: JSON.stringify({
          startHour: Number(formState.slotStartHour || 6),
          endHour: Number(formState.slotEndHour || 22),
          intervalMinutes: Number(formState.slotInterval || 60),
          basePrice: Number(formState.pricePerHour || 500),
          peakStartHour: Number(formState.peakStartHour || 18),
          peakEndHour: Number(formState.peakEndHour || 22),
          peakPrice: Number(formState.peakPrice || 800),
          weekendPrice: Number(formState.weekendPrice || 1000),
        }),
      });

      setFormState((prev) => ({
        ...prev,
        slotTemplate: JSON.stringify(payload?.data || [], null, 2),
        pricingRules: JSON.stringify([
          {
            type: "PEAK",
            time: `${prev.peakStartHour}:00-${prev.peakEndHour}:00`,
            price: Number(prev.peakPrice || 0),
          },
          {
            type: "WEEKEND",
            day: "SAT,SUN",
            price: Number(prev.weekendPrice || 0),
          },
        ], null, 2),
      }));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to generate slots");
    }
  }

  async function handleSubmitFacility(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to save facilities");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    let parsedPricingRules: Array<{ type: string; time?: string; day?: string; price: number }> = [];
    let parsedSlotTemplate: Array<{ label: string; isBooked?: boolean; price?: number; weekendPrice?: number }> = [];

    try {
      parsedPricingRules = formState.pricingRules.trim() ? JSON.parse(formState.pricingRules) : [];
      parsedSlotTemplate = formState.slotTemplate.trim() ? JSON.parse(formState.slotTemplate) : [];
    } catch (_) {
      setActionLoading(false);
      setActionError("Pricing rules / slot template must be valid JSON");
      return;
    }

    const payload = {
      name: formState.name.trim(),
      type: formState.type.trim(),
      location: formState.location.trim(),
      venue: formState.venue.trim(),
      distance: formState.distance.trim(),
      rating: Number(formState.rating || 0),
      priceRange: formState.priceRange.trim(),
      pricePerHour: Number(formState.pricePerHour || 0),
      unit: formState.unit.trim() || "hr",
      image: formState.image.trim() || defaultImage,
      description: formState.description.trim(),
      phone: formState.phone.trim(),
      openHours: formState.openHours.trim(),
      status: formState.status,
      pricingRules: Array.isArray(parsedPricingRules) ? parsedPricingRules : [],
      amenities: csvToList(formState.amenities),
      features: csvToList(formState.features),
      tags: csvToList(formState.tags),
      gallery: csvToList(formState.gallery),
      battleModes: [],
      slotTemplate: Array.isArray(parsedSlotTemplate) ? parsedSlotTemplate : [],
      availableSports: csvToList(formState.availableSports),
    };

    try {
      const isEdit = editorMode === "edit";
      const endpoint = isEdit ? `/gamehub/facilities/${editingFacilityId}` : "/gamehub/facilities";
      const method = isEdit ? "PATCH" : "POST";

      const data: any = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      const facility = data?.data as GameHubFacility;
      if (isEdit && editingFacilityId) {
        setFacilities((prev) => prev.map((item) => (item.id === editingFacilityId ? { ...item, ...facility } : item)));
        setActionMessage("Facility updated successfully.");
      } else {
        setFacilities((prev) => [facility, ...prev]);
        setActionMessage("Facility created successfully.");
      }

      setIsEditorOpen(false);
      setFormState(emptyFormState);
      setEditingFacilityId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save facility");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteFacility(facility: GameHubFacility) {
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to delete facilities");
      return;
    }

    const isConfirmed = window.confirm(`Delete \"${facility.name}\"? This action cannot be undone.`);
    if (!isConfirmed) return;

    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      await fetchApi(`/gamehub/facilities/${facility.id}`, { method: "DELETE" });
      setFacilities((prev) => prev.filter((item) => item.id !== facility.id));
      setActionMessage("Facility deleted successfully.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete facility");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAssignFacilityPartner(facilityId: string, partnerId: string) {
    if (currentRole !== "ADMIN") return;

    setActionError("");
    setActionMessage("");

    try {
      const payload: any = await fetchApi(`/gamehub/facilities/${facilityId}/assign-partner`, {
        method: "PATCH",
        body: JSON.stringify({ partnerId }),
      });

      const updated = payload?.data as GameHubFacility;
      setFacilities((prev) => prev.map((item) => (item.id === facilityId ? { ...item, ...updated } : item)));
      setActionMessage("Facility partner updated successfully.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to assign facility partner");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function verifyAdminSession() {
      const token = localStorage.getItem("admin_dash_token") || "";
      if (!token) {
        if (mounted) {
          setHasAdminAccess(false);
          setAuthError("No dashboard session token found. Log in as ADMIN or PARTNER to manage GameHub operations.");
          setAdminChecked(true);
        }
        return;
      }

      try {
        const payload: any = await fetchApi("/auth/me");
        const normalizedRole = String(payload?.user?.role || "").toUpperCase();
        const isAdmin = Boolean(normalizedRole === "ADMIN" || normalizedRole === "PARTNER");
        if (mounted) {
          setHasAdminAccess(isAdmin);
          setCurrentRole(normalizedRole);
          setAuthError(isAdmin ? "" : "Current account is not ADMIN/PARTNER. Protected actions are disabled.");
          setAdminChecked(true);
        }

        if (mounted && normalizedRole === "ADMIN") {
          try {
            const partnerPayload: any = await fetchApi("/users/partners?status=ACTIVE&limit=200");
            if (mounted) {
              setPartners(Array.isArray(partnerPayload?.data) ? partnerPayload.data : []);
            }
          } catch (pErr) {
            console.warn("Failed to fetch partners:", pErr);
          }
        }
      } catch (err) {
        if (mounted) {
          const status = (err as any).status || 0;
          if ([401, 403, 404].includes(status)) {
            clearDashboardSession();
            setHasAdminAccess(false);
            setAuthError("Session expired. Please login again as ADMIN or PARTNER.");
            router.replace("/login");
          } else {
            setHasAdminAccess(false);
            setAuthError("Unable to verify admin session. Protected actions are disabled.");
          }
          setAdminChecked(true);
        }
      }
    }

    verifyAdminSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    let mounted = true;

    const loadFacilities = async () => {
      if (!adminChecked || !hasAdminAccess) {
        setFacilities([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());

        const payload: any = await fetchApi(`/gamehub/facilities/manage/list?${params.toString()}`);
        if (mounted) setFacilities(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        if (mounted) {
          setFacilities([]);
          setError(err instanceof Error ? err.message : "Failed to load GameHub data");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const timer = window.setTimeout(loadFacilities, 200);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [search, adminChecked, hasAdminAccess]);

  useEffect(() => {
    if (!selectedCalendarFacilityId && facilities.length > 0) {
      setSelectedCalendarFacilityId(facilities[0].id);
    }
  }, [facilities, selectedCalendarFacilityId]);

  useEffect(() => {
    setSelectedDate(`${calendarMonth}-01`);
  }, [calendarMonth]);

  useEffect(() => {
    setBlockDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    async function loadCalendar() {
      if (!adminChecked || !hasAdminAccess) {
        setCalendarDays([]);
        return;
      }

      if (!selectedCalendarFacilityId || !calendarMonth) {
        setCalendarDays([]);
        return;
      }

      setCalendarLoading(true);
      setActionError("");
      try {
        const payload: any = await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`);
        setCalendarDays(Array.isArray(payload?.data?.days) ? payload.data.days : []);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to load calendar");
      } finally {
        setCalendarLoading(false);
      }
    }

    loadCalendar();
  }, [selectedCalendarFacilityId, calendarMonth, adminChecked, hasAdminAccess]);

  async function handleBlockSlots(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to block slots");
      return;
    }

    if (!selectedCalendarFacilityId) {
      setActionError("Select a facility before blocking slots");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      const slotLabels = blockSlotsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/block-slots`, {
        method: "POST",
        body: JSON.stringify({
          date: blockDate,
          slotLabels,
          reason: blockReason,
        }),
      });

      setActionMessage("Slots blocked successfully.");
      setBlockSlotsInput("");

      const refreshedPayload: any = await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`);
      setCalendarDays(Array.isArray(refreshedPayload?.data?.days) ? refreshedPayload.data.days : []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to block slots");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnblockSlot(blockId: string) {
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to unblock slots");
      return;
    }

    if (!selectedCalendarFacilityId) return;

    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/block-slots/${blockId}`, {
        method: "DELETE",
      });

      setActionMessage("Blocked slot removed.");

      const refreshedPayload: any = await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`);
      setCalendarDays(Array.isArray(refreshedPayload?.data?.days) ? refreshedPayload.data.days : []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to unblock slot");
    } finally {
      setActionLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = facilities.length;
    const featured = facilities.filter((item) => (item.tags || []).some((tag) => /featured|premium/i.test(tag))).length;
    const avgRating = total
      ? (facilities.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / total).toFixed(1)
      : "0.0";
    return { total, featured, avgRating };
  }, [facilities]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="dash-card overflow-hidden bg-white border-emerald-100 p-8 shadow-sm relative">
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/10 to-emerald-200/5 blur-3xl opacity-70" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
              <Gamepad2 size={14} /> GameHub Operations
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter md:text-5xl text-slate-900 uppercase">
                Unified Control for GameHub Facilities
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-slate-500/80 md:text-base">
                Monitor live availability, manage facility metadata, and execute operational blocks from one professional command center.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-emerald-100 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-emerald-700 transition hover:bg-emerald-50 hover:shadow-lg shadow-emerald-100/50"
          >
            <RefreshCw size={16} /> Sync Live Data
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { label: "Total Facilities", value: stats.total, icon: Ticket, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Featured Assets", value: stats.featured, icon: Sparkles, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Community Rating", value: stats.avgRating, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`rounded-3xl border border-emerald-50 ${item.bg} p-6 transition-all hover:scale-[1.02]`}>
                <div className="flex items-center gap-3 opacity-60">
                  <Icon size={18} className={item.color} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{item.label}</span>
                </div>
                <div className="mt-3 text-4xl font-black text-slate-900">{item.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dash-card bg-white p-7 rounded-3xl border border-emerald-100 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Facilities Catalog</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-emerald-600/60">Search and inspect live facility inventory</p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-emerald-50/50 bg-emerald-50/20 px-4 py-3 text-sm font-bold focus-within:bg-white focus-within:border-emerald-200 transition-all md:w-auto">
              <Search size={18} className="text-emerald-600/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-transparent outline-none placeholder:text-emerald-900/30 text-slate-900"
              />
            </label>

            <button
              type="button"
              onClick={openCreateEditor}
              className="btn-primary-glow inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02]"
            >
              <Plus size={18} strokeWidth={3} /> Add Facility
            </button>
          </div>
        </div>

        {actionError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {actionError}
          </div>
        ) : null}
        {authError ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {authError}
          </div>
        ) : null}
        {actionMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {actionMessage}
          </div>
        ) : null}

        {isEditorOpen ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editorMode === "create" ? "Add New Facility" : "Edit Facility"}
              </h3>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
              >
                <span className="inline-flex items-center gap-1"><X size={14} /> Close</span>
              </button>
            </div>

                disabled={!hasAdminAccess}
            <form onSubmit={handleSubmitFacility} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select value={formState.status} onChange={(e) => handleFormChange("status", e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
              <input value={formState.name} onChange={(e) => handleFormChange("name", e.target.value)} required placeholder="Name" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.type} onChange={(e) => handleFormChange("type", e.target.value)} required placeholder="Type (e.g. Cricket Nets)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.availableSports} onChange={(e) => handleFormChange("availableSports", e.target.value)} placeholder="Sports Available (e.g. Badminton, Football)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.location} onChange={(e) => handleFormChange("location", e.target.value)} required placeholder="Location" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.venue} onChange={(e) => handleFormChange("venue", e.target.value)} required placeholder="Venue" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.distance} onChange={(e) => handleFormChange("distance", e.target.value)} placeholder="Distance" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.rating} onChange={(e) => handleFormChange("rating", e.target.value)} type="number" min="0" max="5" step="0.1" placeholder="Rating" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.priceRange} onChange={(e) => handleFormChange("priceRange", e.target.value)} placeholder="Price Range" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input value={formState.pricePerHour} onChange={(e) => handleFormChange("pricePerHour", e.target.value)} type="number" min="0" step="1" placeholder="Price" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
                <input value={formState.unit} onChange={(e) => handleFormChange("unit", e.target.value)} placeholder="Unit" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>
              <input value={formState.image} onChange={(e) => handleFormChange("image", e.target.value)} placeholder="Cover Image URL" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2" />
              <input value={formState.gallery} onChange={(e) => handleFormChange("gallery", e.target.value)} placeholder="Gallery URLs (comma separated)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2" />
              {csvToList(formState.gallery).length > 0 ? (
                <div className="grid grid-cols-3 gap-2 md:col-span-2">
                  {csvToList(formState.gallery).slice(0, 6).map((url) => (
                    <img key={url} src={url} alt="gallery preview" className="h-20 w-full rounded-lg border border-slate-200 object-cover" />
                  ))}
                </div>
              ) : null}
              <textarea value={formState.description} onChange={(e) => handleFormChange("description", e.target.value)} placeholder="Description" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2" rows={3} />
              <input value={formState.phone} onChange={(e) => handleFormChange("phone", e.target.value)} placeholder="Phone" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.openHours} onChange={(e) => handleFormChange("openHours", e.target.value)} placeholder="Open Hours" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <input value={formState.amenities} onChange={(e) => handleFormChange("amenities", e.target.value)} placeholder="Amenities (comma separated)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2" />
              <input value={formState.features} onChange={(e) => handleFormChange("features", e.target.value)} placeholder="Features (comma separated)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2" />
              <input value={formState.tags} onChange={(e) => handleFormChange("tags", e.target.value)} placeholder="Tags (comma separated)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2" />

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/20 p-6 md:col-span-2 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-base font-black text-slate-900 uppercase tracking-tight">
                      <Clock size={18} className="text-emerald-500" />
                      Slot Generator
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Define bookable hours and pricing logic</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                    <HelpCircle size={12} /> 24h Format: 18 = 6 PM
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Row 1: Operational Hours */}
                  <div className="space-y-4 rounded-2xl bg-white p-4 border border-emerald-50 shadow-sm">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-50 pb-2">Operational Hours</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Start Hour (0-23)</label>
                        <input value={formState.slotStartHour} onChange={(e) => handleFormChange("slotStartHour", e.target.value)} type="number" min="0" max="23" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-300 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">End Hour (1-24)</label>
                        <input value={formState.slotEndHour} onChange={(e) => handleFormChange("slotEndHour", e.target.value)} type="number" min="1" max="24" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-300 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Slot Duration (Min)</label>
                        <select value={formState.slotInterval} onChange={(e) => handleFormChange("slotInterval", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-300 transition-all outline-none">
                          <option value="30">30 Minutes</option>
                          <option value="45">45 Minutes</option>
                          <option value="60">60 Minutes</option>
                          <option value="90">90 Minutes</option>
                          <option value="120">120 Minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Peak Hours */}
                  <div className="space-y-4 rounded-2xl bg-white p-4 border border-emerald-50 shadow-sm">
                    <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-50 pb-2">Peak Pricing</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Peak Start (e.g. 18)</label>
                        <input value={formState.peakStartHour} onChange={(e) => handleFormChange("peakStartHour", e.target.value)} type="number" min="0" max="23" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-rose-300 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Peak End (e.g. 22)</label>
                        <input value={formState.peakEndHour} onChange={(e) => handleFormChange("peakEndHour", e.target.value)} type="number" min="1" max="24" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-rose-300 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Peak Hourly Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₹</span>
                          <input value={formState.peakPrice} onChange={(e) => handleFormChange("peakPrice", e.target.value)} type="number" min="0" className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2 text-sm font-black text-slate-900 focus:bg-white focus:border-rose-300 transition-all outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Special Pricing */}
                  <div className="space-y-4 rounded-2xl bg-white p-4 border border-emerald-50 shadow-sm">
                    <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2">Weekend Pricing</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Weekend (Sat/Sun) Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₹</span>
                          <input value={formState.weekendPrice} onChange={(e) => handleFormChange("weekendPrice", e.target.value)} type="number" min="0" className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2 text-sm font-black text-slate-900 focus:bg-white focus:border-indigo-300 transition-all outline-none" />
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={generateSlotsFromPreset}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
                        >
                          <Sparkles size={14} /> Generate Slots
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold text-center italic">Must generate after changing times</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-emerald-100/50 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 self-start text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-all"
                  >
                    {showAdvanced ? "Hide Advanced Configuration" : "View Advanced JSON Configuration"}
                    <ArrowUpRight size={12} className={showAdvanced ? "rotate-180" : ""} />
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pricing Rules Logic (JSON)</label>
                        <textarea value={formState.pricingRules} onChange={(e) => handleFormChange("pricingRules", e.target.value)} placeholder="Pricing Rules JSON" className="w-full rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 outline-none h-40" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Slot Template Data (JSON)</label>
                        <textarea value={formState.slotTemplate} onChange={(e) => handleFormChange("slotTemplate", e.target.value)} placeholder="Slot Template JSON" className="w-full rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 outline-none h-60" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 mt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
                >
                  {actionLoading ? "Saving..." : editorMode === "create" ? "Create Facility" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-slate-500">Loading GameHub facilities...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : facilities.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-semibold text-slate-500">
            No GameHub facilities found.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => (
              <article key={facility.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={facility.image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200"}
                    alt={facility.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                    <MapPin size={13} /> {facility.location}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{facility.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{facility.venue}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-600">
                      {facility.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                      facility.status === "MAINTENANCE"
                        ? "bg-amber-100 text-amber-700"
                        : facility.status === "INACTIVE"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {facility.status || "ACTIVE"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-amber-500" /> {facility.rating}</span>
                    <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {facility.priceRange}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(facility.features || facility.amenities || []).slice(0, 4).map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>

                  {currentRole === "ADMIN" ? (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Assigned Partner</label>
                      <select
                        value={facility.partnerId || ""}
                        onChange={(e) => handleAssignFacilityPartner(facility.id, e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-semibold"
                      >
                        <option value="" disabled>Select partner</option>
                        {partners.map((partner) => (
                          <option key={partner.id} value={partner.id}>
                            {partner.name} ({partner.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`http://localhost:3000/gamehub/${facility.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
                      >
                        Open Public Page <ArrowUpRight size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditEditor(facility)}
                        disabled={!hasAdminAccess}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFacility(facility)}
                        disabled={actionLoading || !hasAdminAccess}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-60"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Synced</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Booking Calendar & Slot Blocking</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Monitor monthly activity and block slots for maintenance or tournaments.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <select
              value={selectedCalendarFacilityId}
              onChange={(e) => setSelectedCalendarFacilityId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>{facility.name}</option>
              ))}
            </select>
            <input
              type="month"
              value={calendarMonth}
              onChange={(e) => setCalendarMonth(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        <form onSubmit={handleBlockSlots} className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
          <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" required />
          <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" required />
          <input value={blockSlotsInput} onChange={(e) => setBlockSlotsInput(e.target.value)} placeholder="Slots CSV (empty = full day)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2" />
          <button type="submit" disabled={actionLoading || !hasAdminAccess} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60 md:col-span-4">
            {actionLoading ? "Updating..." : "Block Slots"}
          </button>
        </form>

        {calendarLoading ? <div className="mt-5 text-sm font-semibold text-slate-500">Loading calendar...</div> : null}

        {!calendarLoading ? (
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 grid grid-cols-7 gap-2">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthGrid.map((cell) => {
                  const day = daysByDate.get(cell.date);
                  const isSelected = cell.date === selectedDate;
                  const dayNumber = Number(cell.date.slice(-2));

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      onClick={() => setSelectedDate(cell.date)}
                      className={`min-h-[88px] rounded-xl border p-2 text-left transition ${
                        isSelected
                          ? "border-rose-400 bg-rose-50"
                          : cell.inCurrentMonth
                          ? "border-slate-200 bg-white hover:border-slate-300"
                          : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <p className="text-xs font-bold">{dayNumber}</p>
                      <div className="mt-2 space-y-1 text-[11px]">
                        {day?.bookingCount ? (
                          <p className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">B {day.bookingCount}</p>
                        ) : null}
                        {day?.blockedCount ? (
                          <p className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-700">X {day.blockedCount}</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-slate-900">{selectedDay.date}</p>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Bookings: {selectedDay.bookingCount}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Blocked: {selectedDay.blockedCount}</span>
                </div>
              </div>

              {selectedDay.bookingCount === 0 && selectedDay.blockedCount === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                  No bookings or blocked slots for this day.
                </div>
              ) : null}

              {selectedDay.bookings.length > 0 ? (
                <div className="mt-4 space-y-1 text-xs text-slate-600">
                  {selectedDay.bookings.map((booking) => (
                    <div key={booking.id} className="rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                      {booking.slotLabel}
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedDay.blocks.length > 0 ? (
                <div className="mt-4 space-y-2 text-xs">
                  {selectedDay.blocks.map((block) => (
                    <div key={block.id} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2">
                      <p className="font-bold text-amber-800">{block.slotLabel === "*" ? "Full Day" : block.slotLabel}</p>
                      <p className="text-amber-700">{block.reason}</p>
                      <button
                        type="button"
                        disabled={!hasAdminAccess || actionLoading}
                        onClick={() => handleUnblockSlot(block.id)}
                        className="mt-1 rounded-md bg-white px-2 py-1 font-bold text-amber-700 disabled:opacity-50"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function currentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function buildMonthGrid(month: string): CalendarGridCell[] {
  const [yearText, monthText] = String(month || "").split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return [];
  }

  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));
  const startDay = firstOfMonth.getUTCDay();
  const startDate = new Date(firstOfMonth);
  startDate.setUTCDate(startDate.getUTCDate() - startDay);

  const cells: CalendarGridCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cursor = new Date(startDate);
    cursor.setUTCDate(startDate.getUTCDate() + i);
    const cursorMonthIndex = cursor.getUTCMonth();
    cells.push({
      date: cursor.toISOString().slice(0, 10),
      inCurrentMonth: cursorMonthIndex === monthIndex,
    });
  }

  return cells;
}