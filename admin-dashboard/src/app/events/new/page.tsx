"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Eye,
  Globe,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Lock,
  MapPin,
  Navigation,
  Plus,
  Shield,
  Tag,
  Ticket,
  Trash2,
  Type,
  Users,
} from "lucide-react";

import { fetchApi } from "@/lib/api";

type BookingFormat = "SEAT" | "TIER" | "HYBRID";
type VisibilityType = "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
type PlatformFeeType = "PERCENT" | "FIXED";

interface Tier {
  id: string;
  name: string;
  price: string;
  quantity: string;
  description: string;
  color: string;
}

const TIER_COLORS = [
  { value: "rose", label: "Rose", className: "bg-rose-500" },
  { value: "amber", label: "Amber", className: "bg-amber-500" },
  { value: "emerald", label: "Emerald", className: "bg-emerald-500" },
  { value: "blue", label: "Blue", className: "bg-blue-500" },
  { value: "slate", label: "Slate", className: "bg-slate-500" },
];

const DEFAULT_TIERS: Tier[] = [
  { id: "1", name: "VIP", price: "", quantity: "", description: "Premium view", color: "rose" },
  { id: "2", name: "General", price: "", quantity: "", description: "General admission", color: "blue" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromQuery = String(searchParams.get("eventId") || "");

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [reviewIssues, setReviewIssues] = useState<string[]>([]);
  const [hasManagerAccess, setHasManagerAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  function clearDashboardSession() {
    localStorage.removeItem("admin_dash_token");
    localStorage.removeItem("admin_dash_role");
    localStorage.removeItem("admin_dash_user");
    document.cookie = "admin_dash_token=; path=/; max-age=0; samesite=lax";
    document.cookie = "admin_dash_role=; path=/; max-age=0; samesite=lax";
  }

  const [bookingFormat, setBookingFormat] = useState<BookingFormat>("HYBRID");

  const [eventDetails, setEventDetails] = useState({
    title: "",
    description: "",
    category: "MUSIC",
    location: "",
    venue: "",
    mapLink: "",
    cardImage: "",
    bannerImage: "",
  });
  const [cardInputMode, setCardInputMode] = useState<"url" | "upload">("url");
  const [bannerInputMode, setBannerInputMode] = useState<"url" | "upload">("url");

  const [schedule, setSchedule] = useState({
    date: "",
    time: "",
    bookingStartAt: "",
    bookingEndAt: "",
  });

  const [seatConfig, setSeatConfig] = useState({
    totalCapacity: "",
    seatLayout: "standard",
    rows: "",
    seatsPerRow: "",
    hasNumberedSeats: true,
    allowSeatSelection: true,
  });

  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);

  const [pricing, setPricing] = useState({
    basePrice: "",
    currency: "INR",
    taxPercent: "0",
    platformFeeType: "PERCENT" as PlatformFeeType,
    platformFeeValue: "0",
    visibility: "PUBLIC" as VisibilityType,
    accessCode: "",
    featured: false,
  });

  const [tags, setTags] = useState<string[]>([]);

  const requiresSeat = bookingFormat === "SEAT" || bookingFormat === "HYBRID";
  const requiresTier = bookingFormat === "TIER" || bookingFormat === "HYBRID";

  const totalTierSeats = useMemo(() => {
    return tiers.reduce((sum, tier) => sum + (parseInt(tier.quantity, 10) || 0), 0);
  }, [tiers]);

  const minTierPrice = useMemo(() => {
    const validPrices = tiers
      .map((tier) => parseFloat(tier.price))
      .filter((price) => Number.isFinite(price) && price > 0);
    return validPrices.length ? Math.min(...validPrices) : 0;
  }, [tiers]);

  const totalSlots = useMemo(() => {
    if (requiresSeat) return parseInt(seatConfig.totalCapacity, 10) || 0;
    return totalTierSeats;
  }, [requiresSeat, seatConfig.totalCapacity, totalTierSeats]);

  const stepMeta = [
    { num: 1, label: "Booking Format" },
    { num: 2, label: "Event Details" },
    { num: 3, label: "Date & Window" },
    { num: 4, label: "Seating" },
    { num: 5, label: "Tiers & Pricing" },
    { num: 6, label: "Review & Publish" },
  ];

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

  const setError = (message: string) => {
    setGlobalError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "cardImage" | "bannerImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(`Please upload a valid image file for the ${field === "cardImage" ? "card" : "banner"}.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setEventDetails((v) => ({ ...v, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!["SEAT", "TIER", "HYBRID"].includes(bookingFormat)) return "Select a valid booking format.";
      return null;
    }

    if (step === 2) {
      if (!eventDetails.title.trim()) return "Event title is required.";
      if (!eventDetails.description.trim() || eventDetails.description.trim().length < 20) {
        return "Event description must be at least 20 characters.";
      }
      if (!eventDetails.location.trim() || !eventDetails.venue.trim()) {
        return "City and venue are required.";
      }
      if (!eventDetails.cardImage.trim()) return "Please provide a card image using URL or direct upload.";
      if (!eventDetails.bannerImage.trim()) return "Please provide a banner image using URL or direct upload.";
      return null;
    }

    if (step === 3) {
      if (!schedule.date || !schedule.time) return "Event date and time are required.";

      if (schedule.bookingStartAt && schedule.bookingEndAt) {
        const start = new Date(schedule.bookingStartAt);
        const end = new Date(schedule.bookingEndAt);
        if (start >= end) return "Booking start must be before booking end.";

        const eventDateTime = new Date(`${schedule.date}T${schedule.time}`);
        if (end > eventDateTime) return "Booking end cannot be after event start.";
      }
      return null;
    }

    if (step === 4) {
      if (!requiresSeat) return null;
      if (!seatConfig.totalCapacity || parseInt(seatConfig.totalCapacity, 10) <= 0) {
        return "Total capacity must be greater than 0 for seat-based or hybrid events.";
      }
      if (seatConfig.seatLayout !== "openground") {
        if (!seatConfig.rows || parseInt(seatConfig.rows, 10) <= 0) return "Rows must be greater than 0.";
        if (!seatConfig.seatsPerRow || parseInt(seatConfig.seatsPerRow, 10) <= 0) return "Seats per row must be greater than 0.";
      }
      return null;
    }

    if (step === 5) {
      if (requiresTier) {
        if (!tiers.length) return "Add at least one tier.";
        const invalidTier = tiers.find((tier) => {
          return !tier.name.trim() || (parseFloat(tier.price) || 0) <= 0 || (parseInt(tier.quantity, 10) || 0) <= 0;
        });
        if (invalidTier) return "Each tier needs valid name, price, and quantity.";
      } else {
        if (!pricing.basePrice || parseFloat(pricing.basePrice) < 0) {
          return "Base price is required and cannot be negative.";
        }
      }

      const tax = parseFloat(pricing.taxPercent) || 0;
      if (tax < 0 || tax > 100) return "Tax percent must be between 0 and 100.";

      const fee = parseFloat(pricing.platformFeeValue) || 0;
      if (fee < 0) return "Platform fee cannot be negative.";
      if (pricing.platformFeeType === "PERCENT" && fee > 100) return "Platform fee percent must be between 0 and 100.";

      if (pricing.visibility !== "PUBLIC" && pricing.accessCode.trim().length < 4) {
        return "Private/Invite-only events require an access code of at least 4 characters.";
      }

      if (requiresSeat && requiresTier && totalTierSeats !== totalSlots) {
        return "For hybrid events, total tier seats must match total seat capacity.";
      }
      return null;
    }

    return null;
  };

  const validateAllSteps = () => {
    const issues: string[] = [];
    for (let step = 1; step <= 5; step += 1) {
      const error = validateStep(step);
      if (error) issues.push(error);
    }
    return issues;
  };

  const buildPayload = () => {
    const bookingStartAt = schedule.bookingStartAt ? new Date(schedule.bookingStartAt).toISOString() : null;
    const bookingEndAt = schedule.bookingEndAt ? new Date(schedule.bookingEndAt).toISOString() : null;

    return {
      title: eventDetails.title,
      description: eventDetails.description,
      category: eventDetails.category,
      bookingFormat,
      location: eventDetails.location,
      venue: eventDetails.venue,
      mapLink: eventDetails.mapLink || null,
      date: schedule.date,
      time: schedule.time,
      bookingStartAt,
      bookingEndAt,
      image: eventDetails.cardImage,
      images: [eventDetails.cardImage, eventDetails.bannerImage],
      totalSlots,
      price: requiresTier ? minTierPrice : (parseFloat(pricing.basePrice) || 0),
      currency: pricing.currency,
      taxPercent: parseFloat(pricing.taxPercent) || 0,
      platformFeeType: pricing.platformFeeType,
      platformFeeValue: parseFloat(pricing.platformFeeValue) || 0,
      visibility: pricing.visibility,
      accessCode: pricing.visibility === "PUBLIC" ? null : pricing.accessCode.trim(),
      featured: pricing.featured,
      seating: {
        totalCapacity: seatConfig.totalCapacity,
        seatLayout: seatConfig.seatLayout,
        rows: seatConfig.rows,
        seatsPerRow: seatConfig.seatsPerRow,
        hasNumberedSeats: seatConfig.hasNumberedSeats,
        allowSeatSelection: seatConfig.allowSeatSelection,
      },
      tiers: requiresTier
        ? tiers.map((tier) => ({
            name: tier.name.trim(),
            price: parseFloat(tier.price),
            quantity: parseInt(tier.quantity, 10),
            description: tier.description,
            color: tier.color,
          }))
        : [],
      tags: tags,
    };
  };

  const persistDraft = async () => {
    if (!hasManagerAccess) {
      throw new Error("Log in as ADMIN or PARTNER to manage events.");
    }

    const payload = buildPayload();
    if (draftId) {
      await fetchApi(`/events/${draftId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return draftId;
    }

    const data = await fetchApi("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setDraftId((data as any)?.data?.id || "");
    return (data as any)?.data?.id || "";
  };

  const handleSaveDraft = async () => {
    setGlobalError("");
    setReviewIssues([]);

    const minimumChecks = [1, 2, 3]
      .map((step) => validateStep(step))
      .filter(Boolean) as string[];

    if (minimumChecks.length) {
      setError(minimumChecks[0]);
      return;
    }

    setLoading(true);
    try {
      await persistDraft();
      alert("Draft saved successfully.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setGlobalError("");
    const localIssues = validateAllSteps();
    if (localIssues.length) {
      setReviewIssues(localIssues);
      setError("Fix all review issues before publishing.");
      return;
    }

    setLoading(true);
    try {
      const eventId = await persistDraft();
      if (!eventId) throw new Error("Unable to resolve draft id for publishing.");

      const validateData = await fetchApi(`/events/${eventId}/validate-publish`, {
        method: "POST",
      });

      if (!(validateData as any)?.data?.canPublish) {
        const failures = (validateData as any)?.data?.failures || ["Event is incomplete."];
        setReviewIssues(failures);
        setError(failures[0] || "Publish blocked by backend validation.");
        return;
      }

      await fetchApi(`/events/${eventId}/publish`, {
        method: "POST",
      });

      router.push("/events");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to publish event.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const error = validateStep(activeStep);
    if (error) {
      setError(error);
      return;
    }
    setGlobalError("");
    setActiveStep((value) => Math.min(6, value + 1));
  };

  const previousStep = () => {
    setGlobalError("");
    setActiveStep((value) => Math.max(1, value - 1));
  };

  const updateTier = (id: string, field: keyof Tier, value: string) => {
    setTiers((current) => current.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier)));
  };

  const addTier = () => {
    setTiers((current) => [
      ...current,
      {
        id: String(Date.now()),
        name: "",
        price: "",
        quantity: "",
        description: "",
        color: TIER_COLORS[current.length % TIER_COLORS.length].value,
      },
    ]);
  };

  const removeTier = (id: string) => {
    setTiers((current) => (current.length <= 1 ? current : current.filter((tier) => tier.id !== id)));
  };

  const reviewList = [
    ["Format", bookingFormat],
    ["Event", eventDetails.title || "Missing title"],
    ["Schedule", schedule.date && schedule.time ? `${schedule.date} ${schedule.time}` : "Missing date/time"],
    ["Booking Window", schedule.bookingStartAt && schedule.bookingEndAt ? "Configured" : "Not configured"],
    ["Capacity", totalSlots ? `${totalSlots} slots` : "Missing capacity"],
    ["Pricing", requiresTier ? `${tiers.length} tiers` : "No tiers required"],
    ["Visibility", pricing.visibility],
    ["Tax", `${pricing.taxPercent || "0"}%`],
    [
      "Platform Fee",
      pricing.platformFeeType === "PERCENT"
        ? `${pricing.platformFeeValue || "0"}%`
        : `${pricing.currency} ${pricing.platformFeeValue || "0"}`,
    ],
  ];

  useEffect(() => {
    let mounted = true;

    async function verifyAccessAndMaybeLoad() {
      const token = localStorage.getItem("admin_dash_token") || "";
      if (!token) {
        if (mounted) {
          setHasManagerAccess(false);
          setGlobalError("Log in as ADMIN or PARTNER to manage events.");
          setAccessChecked(true);
        }
        return;
      }

      try {
        const sessionPayload: any = await fetchApi("/auth/me");
        const role = String(sessionPayload?.user?.role || "").toUpperCase();
        const isManager = (role === "ADMIN" || role === "PARTNER");

        if (!isManager) {
          if (mounted) {
            setHasManagerAccess(false);
            setGlobalError("Current account cannot manage events. Use ADMIN or PARTNER.");
            setAccessChecked(true);
          }
          return;
        }

        if (mounted) {
          setHasManagerAccess(true);
          setAccessChecked(true);
        }

        if (!eventIdFromQuery) return;

        const eventPayload: any = await fetchApi(`/events/manage/${eventIdFromQuery}`);
        const event = eventPayload?.data;
        if (!event || !mounted) return;

        const parsedImages = (() => {
          try {
            const arr = JSON.parse(event.images || "[]");
            return Array.isArray(arr) ? arr : [];
          } catch {
            return [];
          }
        })();

        setDraftId(event.id);
        setBookingFormat((event.bookingFormat || "HYBRID") as BookingFormat);
        setEventDetails({
          title: event.title || "",
          description: event.description || "",
          category: event.category || "MUSIC",
          location: event.location || "",
          venue: event.venue || "",
          cardImage: parsedImages[0] || "",
          bannerImage: parsedImages[1] || parsedImages[0] || "",
        });
        setSchedule({
          date: event.date ? String(event.date).slice(0, 10) : "",
          time: event.time || "",
          bookingStartAt: event.bookingStartAt ? new Date(event.bookingStartAt).toISOString().slice(0, 16) : "",
          bookingEndAt: event.bookingEndAt ? new Date(event.bookingEndAt).toISOString().slice(0, 16) : "",
        });
        setSeatConfig({
          totalCapacity: String(event.totalSlots || ""),
          seatLayout: event.seatLayout || "standard",
          rows: event.seatRows ? String(event.seatRows) : "",
          seatsPerRow: event.seatsPerRow ? String(event.seatsPerRow) : "",
          hasNumberedSeats: event.numberedSeats !== false,
          allowSeatSelection: event.seatSelection !== false,
        });
        setPricing({
          basePrice: String(event.price ?? "0"),
          currency: event.currency || "INR",
          taxPercent: String(event.taxPercent ?? "0"),
          platformFeeType: (event.platformFeeType || "PERCENT") as PlatformFeeType,
          platformFeeValue: String(event.platformFeeValue ?? "0"),
          visibility: (event.visibility || "PUBLIC") as VisibilityType,
          accessCode: event.accessCode || "",
          featured: Boolean(event.featured),
        });
        setTiers(
          Array.isArray(event.tiers) && event.tiers.length
            ? event.tiers.map((tier: { id: string; name: string; price: number; quantity: number; description: string; color: string }) => ({
                id: tier.id,
                name: tier.name || "",
                price: String(tier.price ?? ""),
                quantity: String(tier.quantity ?? ""),
                description: tier.description || "",
                color: tier.color || "rose",
              }))
            : DEFAULT_TIERS
        );
        setTags(event.tags ? JSON.parse(event.tags) : []);
      } catch (loadErr) {
        if (mounted) {
          const status = (loadErr as any).status || 0;
          if ([401, 403, 404].includes(status)) {
            clearDashboardSession();
            setGlobalError("Session expired. Please login again as ADMIN or PARTNER.");
            router.replace("/login");
          } else {
            setGlobalError(loadErr instanceof Error ? loadErr.message : "Failed to load event editor");
          }
          setAccessChecked(true);
        }
      }
    }

    verifyAccessAndMaybeLoad();

    return () => {
      mounted = false;
    };
  }, [eventIdFromQuery, router]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {eventIdFromQuery ? "District-Style Event Editor" : "District-Style Event Creation"}
            </h1>
            <p className="text-sm font-medium text-slate-500">Mandatory guided flow with publish gate and compliance checks</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={loading || !hasManagerAccess || !accessChecked}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {eventIdFromQuery ? "Save Changes" : "Save Draft"}
        </button>
      </header>

      <div className={`${cardClass} p-4`}>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {stepMeta.map((step) => (
            <button
              key={step.num}
              type="button"
              onClick={() => setActiveStep(step.num)}
              className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                activeStep === step.num
                  ? "border-teal-400 bg-teal-50 text-teal-800"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <div className="text-[10px] uppercase">Step {step.num}</div>
              <div className="mt-1 text-[12px]">{step.label}</div>
            </button>
          ))}
        </div>
      </div>

      {globalError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          <AlertCircle size={16} className="mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {activeStep === 1 && (
          <section className={`${cardClass} p-6`}>
            <h2 className="text-lg font-extrabold text-slate-900">1. Booking Format</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Choose how inventory will be sold. This is mandatory.</p>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  value: "SEAT",
                  title: "Seat-Based",
                  desc: "Users pick exact seats from the map.",
                  icon: <LayoutGrid size={16} />,
                },
                {
                  value: "TIER",
                  title: "Tier-Based",
                  desc: "Users buy by category like VIP or General.",
                  icon: <Ticket size={16} />,
                },
                {
                  value: "HYBRID",
                  title: "Hybrid",
                  desc: "Exact seats + category pricing together.",
                  icon: <Shield size={16} />,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBookingFormat(option.value as BookingFormat)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    bookingFormat === option.value
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    {option.icon}
                    {option.title}
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500">{option.desc}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeStep === 2 && (
          <section className={`${cardClass} p-6`}>
            <h2 className="text-lg font-extrabold text-slate-900">2. Event Details</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Type size={13} /> Title</span>
                <input
                  value={eventDetails.title}
                  onChange={(e) => setEventDetails((v) => ({ ...v, title: e.target.value }))}
                  className={inputClass}
                  placeholder="Event title"
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Ticket size={13} /> Category</span>
                <select
                  value={eventDetails.category}
                  onChange={(e) => setEventDetails((v) => ({ ...v, category: e.target.value }))}
                  className={inputClass}
                >
                  <option value="MUSIC">Music</option>
                  <option value="SPORTS">Sports</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="COMEDY">Comedy</option>
                  <option value="FESTIVAL">Festival</option>
                  <option value="THEATER">Theater</option>
                  <option value="EXHIBITION">Exhibition</option>
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase text-slate-500">Description (min 20 chars)</span>
                <textarea
                  value={eventDetails.description}
                  onChange={(e) => setEventDetails((v) => ({ ...v, description: e.target.value }))}
                  className={inputClass}
                  rows={4}
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><MapPin size={13} /> City</span>
                <input
                  value={eventDetails.location}
                  onChange={(e) => setEventDetails((v) => ({ ...v, location: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><MapPin size={13} /> Venue</span>
                <input
                  value={eventDetails.venue}
                  onChange={(e) => setEventDetails((v) => ({ ...v, venue: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Navigation size={13} /> Google Maps Link <span className="text-slate-400 normal-case font-medium">(optional)</span></span>
                <input
                  value={eventDetails.mapLink}
                  onChange={(e) => setEventDetails((v) => ({ ...v, mapLink: e.target.value }))}
                  className={inputClass}
                  placeholder="https://maps.google.com/..."
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><ImageIcon size={13} /> Card Image</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCardInputMode("url")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${cardInputMode === "url" ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-slate-500 border-slate-300"}`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardInputMode("upload")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${cardInputMode === "upload" ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-slate-500 border-slate-300"}`}
                  >
                    Upload Image
                  </button>
                </div>

                {cardInputMode === "url" ? (
                  <input
                    value={eventDetails.cardImage}
                    onChange={(e) => setEventDetails((v) => ({ ...v, cardImage: e.target.value }))}
                    className={inputClass}
                    placeholder="https://..."
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "cardImage")}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                )}

                {eventDetails.cardImage && (
                  <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={eventDetails.cardImage} alt="Card preview" className="w-full h-44 object-cover" />
                  </div>
                )}
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><ImageIcon size={13} /> Banner Image</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBannerInputMode("url")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${bannerInputMode === "url" ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-slate-500 border-slate-300"}`}
                  >
                    Banner URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerInputMode("upload")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${bannerInputMode === "upload" ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-slate-500 border-slate-300"}`}
                  >
                    Upload Banner
                  </button>
                </div>

                {bannerInputMode === "url" ? (
                  <input
                    value={eventDetails.bannerImage}
                    onChange={(e) => setEventDetails((v) => ({ ...v, bannerImage: e.target.value }))}
                    className={inputClass}
                    placeholder="https://..."
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "bannerImage")}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                )}

                {eventDetails.bannerImage && (
                  <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={eventDetails.bannerImage} alt="Banner preview" className="w-full h-44 object-cover" />
                  </div>
                )}
              </label>
            </div>
          </section>
        )}

        {activeStep === 3 && (
          <section className={`${cardClass} p-6`}>
            <h2 className="text-lg font-extrabold text-slate-900">3. Date, Time and Booking Window</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Calendar size={13} /> Event Date</span>
                <input
                  type="date"
                  value={schedule.date}
                  onChange={(e) => setSchedule((v) => ({ ...v, date: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Clock size={13} /> Event Time</span>
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => setSchedule((v) => ({ ...v, time: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Booking Start</span>
                <input
                  type="datetime-local"
                  value={schedule.bookingStartAt}
                  onChange={(e) => setSchedule((v) => ({ ...v, bookingStartAt: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Booking End</span>
                <input
                  type="datetime-local"
                  value={schedule.bookingEndAt}
                  onChange={(e) => setSchedule((v) => ({ ...v, bookingEndAt: e.target.value }))}
                  className={inputClass}
                />
              </label>
            </div>
          </section>
        )}

        {activeStep === 4 && (
          <section className={`${cardClass} p-6`}>
            <h2 className="text-lg font-extrabold text-slate-900">4. Seat Configuration</h2>
            {!requiresSeat && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700">
                Not required for tier-only events. You can keep defaults.
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Users size={13} /> Total Capacity</span>
                <input
                  type="number"
                  min="0"
                  value={seatConfig.totalCapacity}
                  onChange={(e) => setSeatConfig((v) => ({ ...v, totalCapacity: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><LayoutGrid size={13} /> Layout</span>
                <select
                  value={seatConfig.seatLayout}
                  onChange={(e) => setSeatConfig((v) => ({ ...v, seatLayout: e.target.value }))}
                  className={inputClass}
                >
                  <option value="standard">Standard</option>
                  <option value="theater">Theater</option>
                  <option value="stadium">Stadium</option>
                  <option value="openground">Open Ground</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              {seatConfig.seatLayout !== "openground" && (
                <>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Rows</span>
                    <input
                      type="number"
                      min="0"
                      value={seatConfig.rows}
                      onChange={(e) => setSeatConfig((v) => ({ ...v, rows: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Seats Per Row</span>
                    <input
                      type="number"
                      min="0"
                      value={seatConfig.seatsPerRow}
                      onChange={(e) => setSeatConfig((v) => ({ ...v, seatsPerRow: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={seatConfig.hasNumberedSeats}
                  onChange={(e) => setSeatConfig((v) => ({ ...v, hasNumberedSeats: e.target.checked }))}
                />
                Numbered seats
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={seatConfig.allowSeatSelection}
                  onChange={(e) => setSeatConfig((v) => ({ ...v, allowSeatSelection: e.target.checked }))}
                />
                Allow seat selection
              </label>
            </div>
          </section>
        )}

        {activeStep === 5 && (
          <section className={`${cardClass} p-6 space-y-5`}>
            <h2 className="text-lg font-extrabold text-slate-900">5. Tiers, Fees and Visibility</h2>

            {!requiresTier && (
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700">
                  Not required for seat-only events. You can keep defaults.
                </div>
                <label className="space-y-2 block">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><DollarSign size={13} /> Base Ticket Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.basePrice}
                    onChange={(e) => setPricing((v) => ({ ...v, basePrice: e.target.value }))}
                    className={inputClass}
                  />
                </label>
              </div>
            )}

            {requiresTier && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800">Ticket Tiers</h3>
                  <button
                    type="button"
                    onClick={addTier}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus size={13} className="inline-block" /> Add Tier
                  </button>
                </div>

                {tiers.map((tier) => (
                  <div key={tier.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <input
                        placeholder="Tier name"
                        value={tier.name}
                        onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={tier.price}
                        onChange={(e) => updateTier(tier.id, "price", e.target.value)}
                        className={inputClass}
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={tier.quantity}
                        onChange={(e) => updateTier(tier.id, "quantity", e.target.value)}
                        className={inputClass}
                        min="0"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={tier.color}
                          onChange={(e) => updateTier(tier.id, "color", e.target.value)}
                          className={inputClass}
                        >
                          {TIER_COLORS.map((color) => (
                            <option key={color.value} value={color.value}>{color.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeTier(tier.id)}
                          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                          title="Remove tier"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <input
                      placeholder="Description"
                      value={tier.description}
                      onChange={(e) => updateTier(tier.id, "description", e.target.value)}
                      className={`${inputClass} mt-3`}
                    />
                  </div>
                ))}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  Total tier seats: {totalTierSeats.toLocaleString()}
                  {requiresSeat && (
                    <span className="ml-2 text-xs text-slate-500">(must match capacity: {(parseInt(seatConfig.totalCapacity, 10) || 0).toLocaleString()})</span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Globe size={13} /> Currency</span>
                <input
                  value={pricing.currency}
                  onChange={(e) => setPricing((v) => ({ ...v, currency: e.target.value.toUpperCase() }))}
                  className={inputClass}
                  maxLength={6}
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><DollarSign size={13} /> Tax %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={pricing.taxPercent}
                  onChange={(e) => setPricing((v) => ({ ...v, taxPercent: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Platform Fee Type</span>
                <select
                  value={pricing.platformFeeType}
                  onChange={(e) => setPricing((v) => ({ ...v, platformFeeType: e.target.value as PlatformFeeType }))}
                  className={inputClass}
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FIXED">Fixed</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500">Platform Fee Value</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.platformFeeValue}
                  onChange={(e) => setPricing((v) => ({ ...v, platformFeeValue: e.target.value }))}
                  className={inputClass}
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Eye size={13} /> Visibility</span>
                <select
                  value={pricing.visibility}
                  onChange={(e) => setPricing((v) => ({ ...v, visibility: e.target.value as VisibilityType }))}
                  className={inputClass}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="INVITE_ONLY">Invite-only</option>
                </select>
              </label>

              {pricing.visibility !== "PUBLIC" && (
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Lock size={13} /> Access Code</span>
                  <input
                    value={pricing.accessCode}
                    onChange={(e) => setPricing((v) => ({ ...v, accessCode: e.target.value }))}
                    className={inputClass}
                    placeholder="Minimum 4 characters"
                  />
                </label>
              )}

              <div className="md:col-span-2 space-y-3">
                <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500"><Tag size={13} /> Event Tags (e.g. Buy 2 Get 1 Free)</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg bg-teal-50 border border-teal-200 px-3 py-1.5 text-sm font-bold text-teal-700">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== idx))}><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const t = prompt("Enter tag (e.g. Buy 2, Get 1 Free)");
                      if (t) setTags([...tags, t]);
                    }}
                    className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    + Add Custom Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!tags.includes("Buy 2, Get 1 Free on select tickets")) {
                        setTags([...tags, "Buy 2, Get 1 Free on select tickets"]);
                      }
                    }}
                    className="rounded-lg border border-slate-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    + Buy 2 Get 1
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={pricing.featured}
                  onChange={(e) => setPricing((v) => ({ ...v, featured: e.target.checked }))}
                />
                Mark this event as featured
              </label>
            </div>
          </section>
        )}

        {activeStep === 6 && (
          <section className={`${cardClass} p-6 space-y-4`}>
            <h2 className="text-lg font-extrabold text-slate-900">6. Review and Publish</h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
              Publish is blocked until all required validations pass.
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {reviewList.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>

            {reviewIssues.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <h3 className="text-sm font-extrabold text-red-700">Publish blockers</h3>
                <ul className="mt-2 list-disc pl-5 text-sm font-semibold text-red-700">
                  {reviewIssues.map((issue, idx) => (
                    <li key={`${issue}-${idx}`}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-700">
              <Info size={15} className="mt-0.5" />
              Drafts remain unpublished and hidden from public listing. Publish transitions status to ACTIVE only after server checks.
            </div>
          </section>
        )}

        <section className={`${cardClass} flex items-center justify-between p-4`}>
          <button
            type="button"
            onClick={previousStep}
            disabled={activeStep === 1 || loading}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {activeStep < 6 && (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading || !hasManagerAccess || !accessChecked}
                className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
              >
                Next
              </button>
            )}
            {activeStep === 6 && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading || !hasManagerAccess || !accessChecked}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Publishing..." : "Publish Event"}
              </button>
            )}
          </div>
        </section>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2 text-slate-700">
          <Check size={14} /> Coverage implemented
        </div>
        <p className="mt-1">
          Critical: mandatory booking format, six-step guided workflow, publish blocker. High: visibility/access, booking window,
          tax and platform fee controls. Medium: review diagnostics and seat/tier consistency checks.
        </p>
      </section>
    </div>
  );
}
