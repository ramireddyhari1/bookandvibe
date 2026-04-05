"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react";

type Review = {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
};

type Facility = {
  id: string;
  name: string;
  type: string;
  location: string;
  venue: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  pricePerHour: number;
  unit: string;
  image: string;
  description: string;
  phone: string;
  openHours: string;
  amenities: string[];
  gallery: string[];
  slotTemplate: Array<{ label: string; isBooked: boolean }>;
  reviews?: Review[];
};

const API_BASE = "http://localhost:5000/api";

export default function FacilityDetailPage() {
  const params = useParams();
  const facilityId = String(params.id || "");

  const [facility, setFacility] = useState<Facility | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState(0);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      setError("");
      try {
        const [facilityRes, listRes] = await Promise.all([
          fetch(`${API_BASE}/gamehub/facilities/${facilityId}`),
          fetch(`${API_BASE}/gamehub/facilities`),
        ]);

        const facilityPayload = await facilityRes.json();
        const listPayload = await listRes.json();

        if (!facilityRes.ok) {
          throw new Error(facilityPayload?.error || "Failed to fetch facility");
        }

        setFacility(facilityPayload.data);
        setReviews(Array.isArray(facilityPayload?.data?.reviews) ? facilityPayload.data.reviews : []);
        setAllFacilities(Array.isArray(listPayload?.data) ? listPayload.data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load facility";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [facilityId]);

  const similarFacilities = useMemo(() => {
    return allFacilities.filter((f) => f.id !== facilityId).slice(0, 3);
  }, [allFacilities, facilityId]);

  const totalStars = (rating: number) => Math.round(rating);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading facility...</div>;
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-semibold">{error || "Facility not found"}</p>
        <Link href="/gamehub" className="text-rose-600 font-bold">Back to GameHub</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-50 to-white text-[#1c222b] pb-24 font-sans">
      <div className="relative w-full h-[52vh] min-h-[380px] max-h-[560px] overflow-hidden">
        <img
          src={facility.gallery[activeGalleryImg] || facility.image}
          alt={facility.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />

        <div className="absolute top-28 left-0 right-0 px-4 sm:px-6 lg:px-12 max-w-[1400px] mx-auto flex justify-between items-center z-20">
          <Link href="/gamehub" className="bg-white/15 backdrop-blur border border-white/30 text-white px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-12 max-w-[1400px] mx-auto pb-8 z-20">
          <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{facility.type}</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-3">{facility.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-white/90 text-sm font-semibold">
            <span className="inline-flex items-center gap-1"><MapPin size={14} /> {facility.venue}</span>
            <span className="inline-flex items-center gap-1"><Clock size={14} /> {facility.openHours}</span>
            <span className="inline-flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" /> {facility.rating} ({facility.reviewsCount})</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 -mt-6 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-xl font-extrabold mb-3">About Facility</h2>
              <p className="text-slate-600 text-sm leading-7">{facility.description}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-xl font-extrabold mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {facility.amenities.map((item) => (
                  <span key={item} className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-xl font-extrabold mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-slate-500 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{review.name}</p>
                          <p className="text-xs text-slate-400">{review.date}</p>
                        </div>
                        <div className="text-xs font-bold text-amber-600">{review.rating}/5</div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <p className="text-xs text-slate-400 font-bold uppercase">Price</p>
              <p className="text-3xl font-extrabold mt-1">INR {facility.pricePerHour}</p>
              <p className="text-sm text-slate-500 font-semibold">per {facility.unit}</p>

              <h3 className="text-sm font-extrabold mt-5 mb-3">Slots</h3>
              <div className="grid grid-cols-2 gap-2">
                {facility.slotTemplate.map((slot) => (
                  <button
                    key={slot.label}
                    disabled={slot.isBooked}
                    onClick={() => setSelectedSlot(slot.label)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                      slot.isBooked
                        ? "bg-slate-100 text-slate-400 border-slate-200"
                        : selectedSlot === slot.label
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedSlot}
                className="mt-5 w-full bg-rose-500 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold"
              >
                {selectedSlot ? "Proceed to Booking" : "Select Slot"}
              </button>

              <div className="mt-4 text-sm text-slate-600 inline-flex items-center gap-2">
                <Phone size={14} /> {facility.phone}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-extrabold mb-3">Gallery</h3>
              <div className="grid grid-cols-3 gap-2">
                {facility.gallery.map((img, idx) => (
                  <button key={img} onClick={() => setActiveGalleryImg(idx)}>
                    <img src={img} alt="gallery" className={`w-full h-20 rounded-lg object-cover border ${idx === activeGalleryImg ? "border-rose-500" : "border-slate-200"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {similarFacilities.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-extrabold mb-4">Similar Facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {similarFacilities.map((item) => (
                <Link key={item.id} href={`/gamehub/${item.id}`} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
                  <div className="p-4">
                    <p className="font-extrabold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.venue}</p>
                    <p className="text-sm font-bold mt-2">INR {item.pricePerHour} / {item.unit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
