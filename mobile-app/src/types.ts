export type EventItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  venue: string;
  hostName?: string;
  partnerName?: string;
  partner?: {
    name?: string;
  };
  date: string;
  time?: string;
  price: number;
  image?: string;
  description?: string;
  terms?: string;
};

export type FacilityItem = {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  pricePerHour: number;
  image?: string;
  description?: string;
  terms?: string;
  amenities?: string[];
};

export type TicketItem = {
  id: string;
  bookingId: string;
  eventTitle: string;
  venue: string;
  date: string;
  qty: number;
  amount: number;
  seatZone: string;
  paymentMethod: string;
  createdAt: string;
};

export type Screen =
  | "onboarding"
  | "auth"
  | "discover"
  | "events"
  | "event"
  | "booking"
  | "facility-detail"
  | "facility-booking"
  | "checkout"
  | "tickets"
  | "profile";

export type BookingDraft = {
  qty: number;
  seatZone: "General" | "Premium" | "VIP";
  paymentMethod: "UPI" | "Card" | "Wallet";
};

export type FacilityBookingDraft = {
  date: string;
  slot: string;
  facilityId: string;
  price: number;
  paymentMethod: "UPI" | "Card" | "Wallet";
};
