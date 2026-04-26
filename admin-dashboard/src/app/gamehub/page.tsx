"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gamepad2, MapPin, Search, Star, Users, Ticket, Sparkles, ArrowUpRight, RefreshCw, Plus, Pencil, Trash2, X, Clock, HelpCircle, Check, ChevronRight, Zap, Building2, ShieldCheck } from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";

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
  terms?: string;
  mapLink?: string;
  reviewsCount?: number;
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
  terms: string;
  mapLink: string;
  slotStartHour: string;
  slotEndHour: string;
  slotInterval: string;
  peakStartHour: string;
  peakEndHour: string;
  peakPrice: string;
  weekendPrice: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  partnerId: string;
  reviewsCount: string;
};

import { fetchApi } from "@/lib/api";

const defaultImage = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200";
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOURS_24 = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`
}));

const HOURS_24_PLUS_1 = Array.from({ length: 24 }, (_, i) => {
  const h = i + 1;
  return {
    value: String(h),
    label: h === 12 ? "12 PM" : h < 12 ? `${h} AM` : h === 24 ? "12 AM" : `${h - 12} PM`
  };
});

const emptyFormState: FacilityFormState = {
  name: "",
  type: "",
  location: "",
  venue: "",
  distance: "0 km away",
  rating: "4.5",
  priceRange: "",
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
  pricingRules: "[]",
  slotTemplate: "[]",
  availableSports: "",
  terms: "",
  mapLink: "",
  slotStartHour: "6",
  slotEndHour: "22",
  slotInterval: "60",
  peakStartHour: "18",
  peakEndHour: "22",
  peakPrice: "800",
  weekendPrice: "1000",
  status: "ACTIVE",
  partnerId: "",
  reviewsCount: "0",
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

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const entry = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  if (!entry) return "";
  return decodeURIComponent(entry.split("=").slice(1).join("="));
}

function generateSlotTemplate({ startHour = 6, endHour = 22, intervalMinutes = 60, basePrice = 500, peakStartHour, peakEndHour, peakPrice, weekendPrice }: any) {
  const slots = [];
  const startMinute = Math.max(0, Math.min(23, Number(startHour))) * 60;
  const endMinute = Math.max(0, Math.min(24, Number(endHour))) * 60;
  const step = Math.max(15, Number(intervalMinutes) || 60);

  function labelFor(minute: number) {
    const hour24 = Math.floor(minute / 60);
    const minuteValue = minute % 60;
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = ((hour24 + 11) % 12) + 1;
    return `${String(hour12).padStart(2, "0")}:${String(minuteValue).padStart(2, "0")} ${period}`;
  }

  for (let cursor = startMinute; cursor + step <= endMinute; cursor += step) {
    const hour = Math.floor(cursor / 60);
    const inPeak = Number.isFinite(Number(peakStartHour)) && Number.isFinite(Number(peakEndHour))
      ? hour >= Number(peakStartHour) && hour < Number(peakEndHour)
      : false;

    slots.push({
      label: `${labelFor(cursor)} - ${labelFor(cursor + step)}`,
      isBooked: false,
      price: inPeak && Number(peakPrice) > 0 ? Number(peakPrice) : Number(basePrice),
      weekendPrice: Number(weekendPrice) > 0 ? Number(weekendPrice) : Number(basePrice),
    });
  }

  return slots;
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
    terms: facility.terms || "",
    mapLink: facility.mapLink || "",
    slotStartHour: "6",
    slotEndHour: "22",
    slotInterval: "60",
    peakStartHour: "18",
    peakEndHour: "22",
    peakPrice: "800",
    weekendPrice: "1000",
    status: facility.status || "ACTIVE",
    partnerId: facility.partnerId || "",
    reviewsCount: String(facility.reviewsCount || 0),
  };
}

export default function GameHubAdminPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<GameHubFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
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
  const [dayAvailability, setDayAvailability] = useState<any[]>([]);
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
  const [editorExperience, setEditorExperience] = useState<"easy" | "advanced">("easy");
  const [mounted, setMounted] = useState(false);
  
  // Custom input states for Step 3
  const [customSport, setCustomSport] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [customFeature, setCustomFeature] = useState("");
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setWizardStep(1);
    setShowAdvanced(false);
    setActionError("");
    setActionMessage("");
    setIsEditorOpen(true);
  }

  function openEditEditor(facility: GameHubFacility) {
    setEditorMode("edit");
    setEditingFacilityId(facility.id);
    setFormState(mapFacilityToForm(facility));
    setWizardStep(1);
    setShowAdvanced(true);
    setActionError("");
    setActionMessage("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingFacilityId(null);
    setActionError("");
  }

  function hourToTimeString(hourInput: number | string) {
    const hour = Number(hourInput);
    if (isNaN(hour)) return "12:00 AM";
    const period = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:00 ${period}`;
  }

  function handleFormChange(field: keyof FacilityFormState, value: string) {
    setFormState((prev) => {
      const next = { ...prev, [field]: value };
      
      // Sync back to openHours if slot hours change in Step 4
      if (field === "slotStartHour" || field === "slotEndHour") {
        const start = hourToTimeString(Number(next.slotStartHour));
        const end = hourToTimeString(Number(next.slotEndHour));
        next.openHours = `${start} - ${end}`;
      }
      
      return next;
    });
  }

  function timeStringToHour(timeStr: string) {
    const parts = timeStr.split(' ');
    if (parts.length < 2) return 0;
    const [time, period] = parts;
    let [hourStr] = time.split(':');
    let hour = parseInt(hourStr);
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  }

  function handleOpenHoursChange(start: string, end: string) {
    const startHour = timeStringToHour(start);
    const endHour = timeStringToHour(end);
    setFormState(prev => ({
      ...prev,
      openHours: `${start} - ${end}`,
      slotStartHour: String(startHour),
      slotEndHour: String(endHour)
    }));
  }

  async function generateSlotsFromPreset() {
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to generate slots");
      return;
    }

    setActionError("");
    try {
      const payload = await fetchApi("/gamehub/facilities/slot-template/generate", {
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
      }) as { data: Array<{ label: string; isBooked?: boolean; price?: number; weekendPrice?: number }> };

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

  async function handleSubmitFacility(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    // Safety check: Only allow submission if on the final step (Step 4)
    if (wizardStep < 4) {
      console.warn("Prevented premature submission at step:", wizardStep);
      return;
    }

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
      
      // Auto-generate slots if missing and we have basic pricing info
      let templateStr = formState.slotTemplate.trim();
      if (!templateStr || templateStr === "[]") {
        const generated = generateSlotTemplate({
          startHour: Number(formState.slotStartHour || 6),
          endHour: Number(formState.slotEndHour || 22),
          intervalMinutes: Number(formState.slotInterval || 60),
          basePrice: Number(formState.pricePerHour || 500),
          peakStartHour: Number(formState.peakStartHour || 18),
          peakEndHour: Number(formState.peakEndHour || 22),
          peakPrice: Number(formState.peakPrice || 800),
          weekendPrice: Number(formState.weekendPrice || 1000),
        });
        parsedSlotTemplate = generated;
      } else {
        parsedSlotTemplate = JSON.parse(templateStr);
      }
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
      priceRange: formState.priceRange.trim() === "" || formState.priceRange === "INR 500 / hr" 
        ? `INR ${Number(formState.pricePerHour || 0)} / ${formState.unit.trim() || "hr"}`
        : formState.priceRange.trim(),
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
      terms: formState.terms.trim(),
      mapLink: formState.mapLink.trim(),
      reviewsCount: Number(formState.reviewsCount || 0),
      partnerId: formState.partnerId || null,
    };

    try {
      const isEdit = editorMode === "edit";
      const endpoint = isEdit ? `/gamehub/facilities/${editingFacilityId}` : "/gamehub/facilities";
      const method = isEdit ? "PATCH" : "POST";

      const data = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload),
      }) as { data: GameHubFacility };

      const facility = data?.data;
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
      const payload = await fetchApi(`/gamehub/facilities/${facilityId}/assign-partner`, {
        method: "PATCH",
        body: JSON.stringify({ partnerId }),
      }) as { data: GameHubFacility };

      const updated = payload?.data;
      setFacilities((prev) => prev.map((item) => (item.id === facilityId ? { ...item, ...updated } : item)));
      setActionMessage("Facility partner updated successfully.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to assign facility partner");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function verifyAdminSession() {
      const token =
        sessionStorage.getItem("admin_dash_token") ||
        localStorage.getItem("admin_dash_token") ||
        readCookie("admin_dash_token") ||
        "";

      if (token && !sessionStorage.getItem("admin_dash_token")) {
        sessionStorage.setItem("admin_dash_token", token);
      }

      if (!token) {
        if (mounted) {
          setHasAdminAccess(false);
          setAuthError("No dashboard session token found. Log in as ADMIN or PARTNER to manage GameHub operations.");
          setAdminChecked(true);
        }
        return;
      }

      try {
        const payload = await fetchApi("/auth/me") as { user: { role: string } };
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
            const partnerPayload = await fetchApi("/users/partners?status=ACTIVE&limit=200") as { data: PartnerOption[] };
            if (mounted) {
              setPartners(Array.isArray(partnerPayload?.data) ? partnerPayload.data : []);
            }
          } catch (pErr) {
            console.warn("Failed to fetch partners:", pErr);
          }
        }
      } catch (err) {
        if (mounted) {
          const status = (err as { status?: number }).status || 0;
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

        const payload = await fetchApi(`/gamehub/facilities/manage/list?${params.toString()}`) as { data: GameHubFacility[] };
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
    if (selectedDate && selectedCalendarFacilityId) {
      fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/availability?date=${selectedDate}`)
        .then((res: any) => {
          if (res?.data?.slots) setDayAvailability(res.data.slots);
        })
        .catch(() => setDayAvailability([]));
    }
  }, [selectedDate, selectedCalendarFacilityId]);

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
        const payload = await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`) as { data: { days: CalendarDay[] } };
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

      const refreshedPayload = await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`) as { data: { days: CalendarDay[] } };
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

      const refreshedPayload = await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`) as { data: { days: CalendarDay[] } };
      setCalendarDays(Array.isArray(refreshedPayload?.data?.days) ? refreshedPayload.data.days : []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to unblock slot");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelBooking(bookingId: string) {
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to cancel bookings");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to cancel this booking? This will free up the slot for others.");
    if (!isConfirmed) return;

    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      await fetchApi(`/gamehub/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      setActionMessage("Booking cancelled successfully.");

      const refreshedPayload = await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`) as { data: { days: CalendarDay[] } };
      setCalendarDays(Array.isArray(refreshedPayload?.data?.days) ? refreshedPayload.data.days : []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleQuickHold(slotLabel: string) {
    if (!hasAdminAccess) {
      setActionError("Admin or Partner login required to hold slots");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    try {
      await fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/block-slots`, {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          slotLabels: [slotLabel],
          reason: "Manual Hold",
        }),
      });

      setActionMessage(`Slot ${slotLabel} held successfully.`);
      
      // Refresh calendar and availability
      const [cal, avail] = await Promise.all([
        fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/calendar?month=${calendarMonth}`),
        fetchApi(`/gamehub/facilities/${selectedCalendarFacilityId}/availability?date=${selectedDate}`)
      ]) as [any, any];
      
      setCalendarDays(Array.isArray(cal?.data?.days) ? cal.data.days : []);
      if (avail?.data?.slots) setDayAvailability(avail.data.slots);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to hold slot");
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
      <section className="dash-card overflow-hidden bg-white border-gray-200 p-6 shadow-sm relative">
        <div className="hidden" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              GameHub
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage facility inventory, bookings, and availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Refresh
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
              <div key={item.label} className={`rounded-xl border border-gray-100 ${item.bg} p-6 transition-all `}>
                <div className="flex items-center gap-3 opacity-60">
                  <Icon size={18} className={item.color} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-900">{item.label}</span>
                </div>
                <div className="mt-3 text-4xl font-semibold text-slate-900">{item.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dash-card bg-white p-7 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Facilities</h2>
            <p className="mt-0.5 text-sm text-gray-500">Browse and manage facilities</p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold focus-within:bg-white focus-within:border-gray-200 transition-all md:w-auto">
              <Search size={18} className="text-emerald-600/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-transparent outline-none placeholder:text-gray-400 text-slate-900"
              />
            </label>

            <button
              type="button"
              onClick={openCreateEditor}
              className="bg-gray-900 text-white inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide shadow-sm transition-all "
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
          <div className="mt-5 rounded-2xl border border-gray-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {actionMessage}
          </div>
        ) : null}

        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 overflow-y-auto">
            <div className="bg-white rounded-none sm:rounded-xl shadow-lg w-full max-w-4xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
              {/* Wizard Header */}
              <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                    style={{ width: `${(wizardStep / 4) * 100}%` }}
                  />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {editorMode === "create" ? "New Facility" : "Edit Facility"}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 sm:mt-1.5">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                      Step {wizardStep} of 4
                    </span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest hidden sm:inline">
                      {
                        wizardStep === 1 ? "Basic Identity" :
                        wizardStep === 2 ? "Media & Stats" :
                        wizardStep === 3 ? "Categories" :
                        "Pricing & Slots"
                      }
                    </span>
                  </div>
                </div>
                <button type="button" onClick={closeEditor} className="p-2 sm:p-2.5 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-xl border border-gray-200 transition-all group">
                  <X size={16} className="text-gray-400 group-hover:text-rose-500" />
                </button>
              </div>

              {actionError && (
                <div className="mx-10 mt-8 rounded-2xl border border-red-100 bg-red-50/50 p-5 text-xs font-semibold text-red-600 flex items-center gap-3 uppercase tracking-wider animate-in shake duration-500">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <X size={16} className="text-red-500" /> 
                  </div>
                  {actionError}
                </div>
              )}

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 sm:pt-6">
                {/* Step 1: Basic Details */}
                {mounted && wizardStep === 1 && (
                  <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Facility Name</label>
                        <input 
                          value={formState.name} 
                          onChange={(e) => handleFormChange("name", e.target.value)} 
                          placeholder="e.g. Neon Turf Arena" 
                          required 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Facility Type</label>
                        <input 
                          value={formState.type} 
                          onChange={(e) => handleFormChange("type", e.target.value)} 
                          placeholder="e.g. Football" 
                          required 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                      </div>

                      {currentRole === "ADMIN" && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Assign Partner (Owner)</label>
                          <select 
                            value={formState.partnerId} 
                            onChange={(e) => handleFormChange("partnerId", e.target.value)} 
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none cursor-pointer appearance-none"
                          >
                            <option value="">No Partner (Admin Managed)</option>
                            {partners.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Location (City/Area)</label>
                        <input 
                          value={formState.location} 
                          onChange={(e) => handleFormChange("location", e.target.value)} 
                          placeholder="e.g. Gachibowli, Hyd" 
                          required 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Specific Venue Address</label>
                        <input 
                          value={formState.venue} 
                          onChange={(e) => handleFormChange("venue", e.target.value)} 
                          placeholder="Full Address" 
                          required 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Open Hours</label>
                        <div className="flex items-center gap-3">
                          <select 
                            value={formState.openHours.split(" - ")[0] || "6:00 AM"} 
                            onChange={(e) => handleOpenHoursChange(e.target.value, formState.openHours.split(" - ")[1] || "10:00 PM")}
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none cursor-pointer appearance-none"
                          >
                            {[
                              "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
                              "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
                            ].map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-slate-300 font-bold">to</span>
                          <select 
                            value={formState.openHours.split(" - ")[1] || "10:00 PM"} 
                            onChange={(e) => handleOpenHoursChange(formState.openHours.split(" - ")[0] || "6:00 AM", e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none cursor-pointer appearance-none"
                          >
                            {[
                              "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
                              "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
                            ].map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Status</label>
                        <select 
                          value={formState.status} 
                          onChange={(e) => handleFormChange("status", e.target.value)} 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none cursor-pointer appearance-none"
                        >
                          <option value="ACTIVE">Active (Bookable)</option>
                          <option value="INACTIVE">Inactive (Hidden)</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Pricing Unit</label>
                        <select 
                          value={formState.unit} 
                          onChange={(e) => handleFormChange("unit", e.target.value)} 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none cursor-pointer appearance-none"
                        >
                          <option value="hr">Per Hour</option>
                          <option value="session">Per Session</option>
                          <option value="match">Per Match</option>
                          <option value="day">Per Day</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Display Distance / Area</label>
                        <input 
                          value={formState.distance} 
                          onChange={(e) => handleFormChange("distance", e.target.value)} 
                          placeholder="e.g. 2 km away" 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Google Maps Embed Link / Location URL</label>
                        <input 
                          value={formState.mapLink} 
                          onChange={(e) => handleFormChange("mapLink", e.target.value)} 
                          placeholder="Paste Google Maps URL (for live map preview)" 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                        <p className="text-[9px] text-gray-400 font-medium ml-1">If provided, this link will be used for the live map display on the facility page.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Media & Description */}
                {mounted && wizardStep === 2 && (
                  <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Cover Image URL</label>
                      <input 
                        value={formState.image} 
                        onChange={(e) => handleFormChange("image", e.target.value)} 
                        placeholder="https://images.unsplash.com/..." 
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                      />
                      {formState.image && (
                        <div className="mt-4 h-52 w-full rounded-xl overflow-hidden border-4 border-white shadow-xl">
                           <img src={formState.image} alt="Cover Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Facility Description</label>
                      <textarea 
                        value={formState.description} 
                        onChange={(e) => handleFormChange("description", e.target.value)} 
                        placeholder="Describe the atmosphere, equipment, and unique features..." 
                        rows={4} 
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                        <input 
                          value={formState.phone} 
                          onChange={(e) => handleFormChange("phone", e.target.value)} 
                          placeholder="+91 98765 43210" 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Initial Rating (0-5)</label>
                        <input 
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={formState.rating} 
                          onChange={(e) => handleFormChange("rating", e.target.value)} 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Initial Reviews Count</label>
                        <input 
                          type="number"
                          value={formState.reviewsCount || "0"} 
                          onChange={(e) => handleFormChange("reviewsCount", e.target.value)} 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Gallery Images (Max 10)</label>
                        <button 
                          type="button"
                          onClick={() => {
                            const list = csvToList(formState.gallery);
                            if (list.length < 10) {
                              handleFormChange("gallery", listToCsv([...list, ""]));
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Image
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {csvToList(formState.gallery).map((url, idx) => (
                          <div key={`gallery-${idx}`} className="flex items-center gap-3">
                            <input 
                              value={url} 
                              onChange={(e) => {
                                const list = csvToList(formState.gallery);
                                list[idx] = e.target.value;
                                handleFormChange("gallery", listToCsv(list));
                              }} 
                              placeholder={`Gallery Image URL #${idx + 1}`} 
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs text-gray-900 focus:border-gray-400 outline-none" 
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const list = csvToList(formState.gallery);
                                const newList = list.filter((_, i) => i !== idx);
                                handleFormChange("gallery", listToCsv(newList));
                              }}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {csvToList(formState.gallery).length === 0 && (
                          <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                             <Gamepad2 size={32} className="mb-2 opacity-20" />
                             <p className="text-[10px] font-semibold uppercase tracking-wider">No gallery images added yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Terms & Conditions</label>
                        <textarea 
                          value={formState.terms} 
                          onChange={(e) => handleFormChange("terms", e.target.value)} 
                          placeholder="Usage policy, cancellation rules..." 
                          rows={2} 
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-gray-400 transition-colors outline-none placeholder:text-gray-400" 
                        />
                    </div>
                  </div>
                )}

                {/* Step 3: Amenities & Sports */}
                {mounted && wizardStep === 3 && (
                  <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Available Sports</label>
                      <div className="flex flex-wrap gap-2.5 p-5 bg-slate-50/50 rounded-xl border border-slate-200 ">
                        {["Cricket", "Football", "Tennis", "Badminton", "Basketball", "Volleyball", "Table Tennis", "Swimming", "Squash", "Box Cricket", "Pickleball"].map(sport => {
                          const isSelected = csvToList(formState.availableSports).includes(sport);
                          return (
                            <button
                              key={sport}
                              type="button"
                              onClick={() => {
                                const list = csvToList(formState.availableSports);
                                const newList = list.includes(sport) ? list.filter(s => s !== sport) : [...list, sport];
                                handleFormChange("availableSports", listToCsv(newList));
                              }}
                              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${isSelected ? 'bg-emerald-500 text-gray-900 border-emerald-600 ' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-gray-700'}`}
                            >
                              {sport}
                            </button>
                          );
                        })}
                        <div className="flex items-center gap-2 px-2 border-l border-slate-200 ml-2">
                           <input 
                             type="text" 
                             value={customSport}
                             onChange={(e) => setCustomSport(e.target.value)}
                             placeholder="Custom Sport"
                             className="px-4 py-2 text-[10px] rounded-lg border border-slate-200 outline-none w-32"
                           />
                           <button 
                             type="button" 
                             onClick={() => {
                               if (!customSport.trim()) return;
                               const list = csvToList(formState.availableSports);
                               if (!list.includes(customSport.trim())) {
                                 handleFormChange("availableSports", listToCsv([...list, customSport.trim()]));
                               }
                               setCustomSport("");
                             }}
                             className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                           >
                             <Plus size={14} />
                           </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Amenities</label>
                      <div className="flex flex-wrap gap-2.5 p-5 bg-slate-50/50 rounded-xl border border-slate-200 ">
                        {["Parking", "Washrooms", "Drinking Water", "First Aid", "Changing Rooms", "Lockers", "Seating Area", "Cafe/Snacks", "Wi-Fi", "Equipment Rental"].map(amenity => {
                          const isSelected = csvToList(formState.amenities).includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => {
                                const list = csvToList(formState.amenities);
                                const newList = list.includes(amenity) ? list.filter(a => a !== amenity) : [...list, amenity];
                                handleFormChange("amenities", listToCsv(newList));
                              }}
                              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${isSelected ? 'bg-amber-500 text-gray-900 border-amber-600 ' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600'}`}
                            >
                              {amenity}
                            </button>
                          );
                        })}
                        <div className="flex items-center gap-2 px-2 border-l border-slate-200 ml-2">
                           <input 
                             type="text" 
                             value={customAmenity}
                             onChange={(e) => setCustomAmenity(e.target.value)}
                             placeholder="Custom Amenity"
                             className="px-4 py-2 text-[10px] rounded-lg border border-slate-200 outline-none w-32"
                           />
                           <button 
                             type="button" 
                             onClick={() => {
                               if (!customAmenity.trim()) return;
                               const list = csvToList(formState.amenities);
                               if (!list.includes(customAmenity.trim())) {
                                 handleFormChange("amenities", listToCsv([...list, customAmenity.trim()]));
                               }
                               setCustomAmenity("");
                             }}
                             className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
                           >
                             <Plus size={14} />
                           </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Special Features</label>
                      <div className="flex flex-wrap gap-2.5 p-5 bg-slate-50/50 rounded-xl border border-slate-200 ">
                        {["Floodlights", "Artificial Grass", "Wooden Court", "Synthetic Court", "Indoor", "Outdoor", "CCTV", "Turf", "24/7 Power", "Coach Available"].map(feature => {
                          const isSelected = csvToList(formState.features).includes(feature);
                          return (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => {
                                const list = csvToList(formState.features);
                                const newList = list.includes(feature) ? list.filter(f => f !== feature) : [...list, feature];
                                handleFormChange("features", listToCsv(newList));
                              }}
                              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${isSelected ? 'bg-indigo-500 text-gray-900 border-indigo-600 ' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                            >
                              {feature}
                            </button>
                          );
                        })}
                        <div className="flex items-center gap-2 px-2 border-l border-slate-200 ml-2">
                           <input 
                             type="text" 
                             value={customFeature}
                             onChange={(e) => setCustomFeature(e.target.value)}
                             placeholder="Custom Feature"
                             className="px-4 py-2 text-[10px] rounded-lg border border-slate-200 outline-none w-32"
                           />
                           <button 
                             type="button" 
                             onClick={() => {
                               if (!customFeature.trim()) return;
                               const list = csvToList(formState.features);
                               if (!list.includes(customFeature.trim())) {
                                 handleFormChange("features", listToCsv([...list, customFeature.trim()]));
                               }
                               setCustomFeature("");
                             }}
                             className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
                           >
                             <Plus size={14} />
                           </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">System Tags</label>
                      <div className="flex flex-wrap gap-2.5 p-5 bg-slate-50/50 rounded-xl border border-slate-200 ">
                        {["featured", "premium", "new", "popular", "discount", "family-friendly", "tournament-ready", "corporate-events", "training"].map(tag => {
                          const isSelected = csvToList(formState.tags).includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const list = csvToList(formState.tags);
                                const newList = list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag];
                                handleFormChange("tags", listToCsv(newList));
                              }}
                              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${isSelected ? 'bg-rose-500 text-gray-900 border-rose-600 ' : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'}`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                        <div className="flex items-center gap-2 px-2 border-l border-slate-200 ml-2">
                           <input 
                             type="text" 
                             value={customTag}
                             onChange={(e) => setCustomTag(e.target.value)}
                             placeholder="Custom Tag"
                             className="px-4 py-2 text-[10px] rounded-lg border border-slate-200 outline-none w-32"
                           />
                           <button 
                             type="button" 
                             onClick={() => {
                               if (!customTag.trim()) return;
                               const list = csvToList(formState.tags);
                               if (!list.includes(customTag.trim())) {
                                 handleFormChange("tags", listToCsv([...list, customTag.trim()]));
                               }
                               setCustomTag("");
                             }}
                             className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"
                           >
                             <Plus size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Pricing & Slots */}
                {mounted && wizardStep === 4 && (
                  <div key="step-4-pricing-v3" className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-2xl p-8 relative overflow-hidden border border-gray-100 shadow-sm">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Zap size={120} className="text-emerald-500" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-5">
                            <div className="bg-emerald-500 p-3.5 rounded-2xl shadow-lg shadow-emerald-500/20">
                               <Zap size={24} className="text-white" />
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900 tracking-tight">Pricing Setup</h4>
                              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Configure slot timing and pricing
                              </p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-all border border-gray-200"
                          >
                            {showAdvanced ? "Basic Mode" : "Developer JSON"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {/* Left Column: Hours & Pricing */}
                          <div className="space-y-8">
                            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <h5 className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-4 flex items-center justify-between">
                                Operating Hours
                                <span className="text-[9px] lowercase font-normal text-gray-400 tracking-normal">(Synced from Step 1)</span>
                              </h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider ml-1">Start Hour</label>
                                  <select 
                                    value={String(formState.slotStartHour)} 
                                    onChange={(e) => handleFormChange("slotStartHour", e.target.value)} 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                  >
                                    {HOURS_24.map((h) => (
                                      <option key={`slot-start-${h.value}`} value={h.value}>{h.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider ml-1">End Hour</label>
                                  <select 
                                    value={String(formState.slotEndHour)} 
                                    onChange={(e) => handleFormChange("slotEndHour", e.target.value)} 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                  >
                                    {HOURS_24_PLUS_1.map((h) => (
                                      <option key={`slot-end-${h.value}`} value={h.value}>{h.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
                              <h5 className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-4">Base Pricing (INR)</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider ml-1">Standard (₹)</label>
                                  <input 
                                    type="number" 
                                    value={formState.pricePerHour} 
                                    onChange={(e) => handleFormChange("pricePerHour", e.target.value)} 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold text-emerald-600 outline-none focus:border-emerald-500 transition-all" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider ml-1">Weekend (₹)</label>
                                  <input 
                                    type="number" 
                                    value={formState.weekendPrice} 
                                    onChange={(e) => handleFormChange("weekendPrice", e.target.value)} 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold text-indigo-600 outline-none focus:border-indigo-500 transition-all" 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Peak Pricing & Generate */}
                          <div className="space-y-8 flex flex-col justify-between">
                            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
                              <h5 className="text-[10px] font-semibold text-rose-600 uppercase tracking-wide mb-4">Peak Hour Optimization</h5>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider ml-1">Start</label>
                                  <select 
                                    value={String(formState.peakStartHour)} 
                                    onChange={(e) => handleFormChange("peakStartHour", e.target.value)} 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-3 text-xs font-bold text-gray-900 outline-none focus:border-rose-500 cursor-pointer"
                                  >
                                    {HOURS_24.map((h) => (
                                      <option key={`peak-start-${h.value}`} value={h.value}>{h.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider ml-1">End</label>
                                  <select 
                                    value={String(formState.peakEndHour)} 
                                    onChange={(e) => handleFormChange("peakEndHour", e.target.value)} 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-3 text-xs font-bold text-gray-900 outline-none focus:border-rose-500 cursor-pointer"
                                  >
                                    {HOURS_24.map((h) => (
                                      <option key={`peak-end-${h.value}`} value={h.value}>{h.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider ml-1">Price (₹)</label>
                                  <input 
                                    type="number" 
                                    value={formState.peakPrice} 
                                    onChange={(e) => handleFormChange("peakPrice", e.target.value)} 
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-3 text-xs font-semibold text-rose-600 outline-none focus:border-rose-500" 
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <button
                                type="button"
                                onClick={generateSlotsFromPreset}
                                className="w-full group relative overflow-hidden px-8 py-5 bg-gray-900 text-white text-sm font-bold uppercase tracking-widest rounded-[1.5rem] hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-3"
                              >
                                <Zap size={18} fill="currentColor" className="text-emerald-400" /> Initialize Configuration
                              </button>
                              
                              {formState.slotTemplate && formState.slotTemplate !== "[]" ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-center gap-3 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                      <Check size={16} className="text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                      {JSON.parse(formState.slotTemplate || "[]").length} Slots Active
                                    </span>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => handleFormChange("slotTemplate", "[]")}
                                    className="w-full py-2 text-[10px] font-bold text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={12} /> Discard & Reset
                                  </button>
                                </div>
                              ) : (
                                <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                    No slots configured yet. <br /> Auto-generation recommended.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {showAdvanced && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                         <div className="space-y-3">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Slot Pipeline (JSON)</label>
                            <textarea 
                              value={formState.slotTemplate || "[]"} 
                              onChange={(e) => handleFormChange("slotTemplate", e.target.value)} 
                              rows={8} 
                              className="w-full rounded-[2rem] border border-slate-200 bg-slate-900 p-6 font-mono text-[10px] text-emerald-400 outline-none shadow-xl custom-scrollbar" 
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Pricing Logic (JSON)</label>
                            <textarea 
                              value={formState.pricingRules || "[]"} 
                              onChange={(e) => handleFormChange("pricingRules", e.target.value)} 
                              rows={8} 
                              className="w-full rounded-[2rem] border border-slate-200 bg-slate-900 p-6 font-mono text-[10px] text-amber-400 outline-none shadow-xl custom-scrollbar" 
                            />
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wizard Footer / Actions */}
              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 sm:px-8 sm:py-6 z-10">
                <div className="flex items-center justify-between gap-4">
                  <button 
                    type="button" 
                    onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                    disabled={wizardStep === 1}
                    className="px-6 py-4 rounded-[1.25rem] bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Back
                  </button>

                  {wizardStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (wizardStep === 1 && (!formState.name || !formState.type || !formState.location || !formState.venue)) {
                          setActionError("Required: Please fill in all facility details.");
                          return;
                        }
                        if (wizardStep === 2 && (!formState.description || !formState.phone || !formState.image)) {
                          setActionError("Required: Please provide a description, phone number, and cover image.");
                          return;
                        }
                        setActionError("");
                        setWizardStep(prev => Math.min(4, prev + 1));
                      }}
                      className="group px-8 sm:px-10 py-4 rounded-[1.25rem] bg-emerald-500 text-gray-900 text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-emerald-400 transition-all active:scale-95 flex items-center gap-3"
                    >
                      Next Phase
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      key="submit-facility-btn"
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSubmitFacility()}
                      className="px-8 sm:px-10 py-4 rounded-[1.25rem] bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                      {actionLoading ? "Finalizing..." : editorMode === "create" ? "Initialize Asset" : "Commit Changes"}
                      {!actionLoading && <Check size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <PremiumLoader size="lg" color="#10b981" text="Retrieving Resources" />
          </div>
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
              <article key={facility.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-sm">
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={facility.image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200"}
                    alt={facility.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-gray-900 ">
                    <MapPin size={13} /> {facility.location}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{facility.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{facility.venue}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-600">
                      {facility.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
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
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-black"
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

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Booking Calendar & Slot Blocking</h2>
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

        <form onSubmit={handleBlockSlots} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" required />
          <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" required />
          <input value={blockSlotsInput} onChange={(e) => setBlockSlotsInput(e.target.value)} placeholder="Slots CSV (empty = full day)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm sm:col-span-2 lg:col-span-2" />
          <button type="submit" disabled={actionLoading || !hasAdminAccess} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-gray-900 disabled:opacity-60 sm:col-span-2 lg:col-span-4">
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
                      className={`min-h-[60px] sm:min-h-[88px] rounded-xl border p-1.5 sm:p-2 text-left transition ${
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
                <p className="text-sm font-bold text-slate-900">{selectedDay.date}</p>
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
                <div className="mt-4 space-y-3">
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <Check size={12} /> Active Bookings
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.bookings.map((booking) => (
                      <div key={booking.id} className="group relative rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 transition-all hover:bg-emerald-50">
                        <div className="flex items-center justify-between gap-3">
                           <div>
                              <p className="text-xs font-bold text-emerald-900">{booking.slotLabel}</p>
                              <p className="text-[9px] text-emerald-600/60 font-semibold uppercase tracking-tighter mt-0.5">Booking Confirmed</p>
                           </div>
                           <button 
                             type="button"
                             disabled={!hasAdminAccess || actionLoading}
                             onClick={() => handleCancelBooking(booking.id)}
                             className="p-1.5 rounded-lg bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-0"
                             title="Cancel Booking"
                           >
                             <X size={14} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedDay.blocks.length > 0 ? (
                <div className="mt-6 space-y-3">
                  <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} /> Blocked Slots (Hold)
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.blocks.map((block) => (
                      <div key={block.id} className="group relative rounded-xl border border-amber-200 bg-amber-50/30 p-3 transition-all hover:bg-amber-50">
                        <div className="flex items-center justify-between gap-3">
                           <div>
                              <p className="text-xs font-bold text-amber-900">{block.slotLabel === "*" ? "Full Day" : block.slotLabel}</p>
                              <p className="text-[9px] text-amber-600/60 font-semibold uppercase tracking-tighter mt-0.5">{block.reason || "Manual Hold"}</p>
                           </div>
                           <button 
                             type="button"
                             disabled={!hasAdminAccess || actionLoading}
                             onClick={() => handleUnblockSlot(block.id)}
                             className="px-2.5 py-1.5 rounded-lg bg-white text-amber-600 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                           >
                             Unblock
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {dayAvailability.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Full Day Slot Manager
                  </h4>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {dayAvailability.map((slot) => {
                      const isBooked = slot.status === "BOOKED";
                      const isBlocked = slot.status === "BLOCKED";
                      const isAvailable = slot.status === "AVAILABLE";
                      
                      return (
                        <div key={slot.label} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                           <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : isBooked ? 'bg-blue-400' : 'bg-amber-400'}`} />
                              <span className="text-[11px] font-bold text-slate-700">{slot.label}</span>
                           </div>
                           
                           {isAvailable ? (
                             <button
                               type="button"
                               onClick={() => handleQuickHold(slot.label)}
                               disabled={!hasAdminAccess || actionLoading}
                               className="text-[10px] font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-200 bg-white transition-all uppercase tracking-wider shadow-sm"
                             >
                               Hold Slot
                             </button>
                           ) : (
                             <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-1 rounded-md border ${isBooked ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                               {slot.status}
                             </span>
                           )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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