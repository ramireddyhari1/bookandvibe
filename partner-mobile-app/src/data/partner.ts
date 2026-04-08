export type PartnerFacility = {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  reviews: number;
  priceFloor: number;
  status: 'ACTIVE' | 'DRAFT';
};

export type PartnerBooking = {
  id: string;
  customerName: string;
  facilityName: string;
  date: string;
  time: string;
  amount: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  phone: string;
  channel: string;
};

export type PartnerSlot = {
  id: string;
  time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  basePrice: number;
  suggestedPrice: number;
  demand: 'Low' | 'Medium' | 'High';
};

export type PartnerTransaction = {
  id: string;
  label: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
};

export type PartnerReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export const mockFacilities: PartnerFacility[] = [
  {
    id: 'fac_1',
    name: 'Grand Turf Arena',
    type: 'Cricket Turf',
    address: 'MG Road, Bangalore',
    rating: 4.8,
    reviews: 128,
    priceFloor: 900,
    status: 'ACTIVE',
  },
  {
    id: 'fac_2',
    name: 'Night Match Nets',
    type: 'Training Nets',
    address: 'Indiranagar, Bangalore',
    rating: 4.6,
    reviews: 64,
    priceFloor: 550,
    status: 'ACTIVE',
  },
];

export const mockBookings: PartnerBooking[] = [
  {
    id: 'bk_1001',
    customerName: 'Ramesh Kumar',
    facilityName: 'Grand Turf Arena',
    date: 'Today',
    time: '6:00 PM - 7:00 PM',
    amount: 1200,
    status: 'UPCOMING',
    phone: '+91 98765 43210',
    channel: 'App Booking',
  },
  {
    id: 'bk_1002',
    customerName: 'Aarav Singh',
    facilityName: 'Grand Turf Arena',
    date: 'Today',
    time: '7:00 PM - 8:00 PM',
    amount: 1500,
    status: 'COMPLETED',
    phone: '+91 99887 66554',
    channel: 'QR Check-in',
  },
  {
    id: 'bk_1003',
    customerName: 'Club Eleven',
    facilityName: 'Night Match Nets',
    date: 'Tomorrow',
    time: '8:00 PM - 9:00 PM',
    amount: 900,
    status: 'CANCELLED',
    phone: '+91 90123 45678',
    channel: 'Partner Call',
  },
];

export const mockSlots: PartnerSlot[] = [
  { id: 'slot_1', time: '06:00 AM - 07:00 AM', status: 'AVAILABLE', basePrice: 500, suggestedPrice: 450, demand: 'Low' },
  { id: 'slot_2', time: '07:00 AM - 08:00 AM', status: 'AVAILABLE', basePrice: 550, suggestedPrice: 600, demand: 'Medium' },
  { id: 'slot_3', time: '08:00 AM - 09:00 AM', status: 'BLOCKED', basePrice: 600, suggestedPrice: 700, demand: 'Low' },
  { id: 'slot_4', time: '06:00 PM - 07:00 PM', status: 'BOOKED', basePrice: 1100, suggestedPrice: 1300, demand: 'High' },
  { id: 'slot_5', time: '07:00 PM - 08:00 PM', status: 'AVAILABLE', basePrice: 1200, suggestedPrice: 1450, demand: 'High' },
  { id: 'slot_6', time: '08:00 PM - 09:00 PM', status: 'AVAILABLE', basePrice: 1000, suggestedPrice: 1250, demand: 'High' },
];

export const mockTransactions: PartnerTransaction[] = [
  { id: 'tx_1', label: 'Booking payout', amount: 900, type: 'credit', date: '07 Apr' },
  { id: 'tx_2', label: 'Commission deducted', amount: -100, type: 'debit', date: '07 Apr' },
  { id: 'tx_3', label: 'Weekend peak booking', amount: 1350, type: 'credit', date: '06 Apr' },
  { id: 'tx_4', label: 'Payout withdrawal', amount: -1500, type: 'debit', date: '05 Apr' },
];

export const mockReviews: PartnerReview[] = [
  {
    id: 'rv_1',
    name: 'Nikhil P.',
    rating: 5,
    comment: 'Clean turf, quick check-in and good lighting.',
    date: '2 days ago',
  },
  {
    id: 'rv_2',
    name: 'Sana K.',
    rating: 4,
    comment: 'Easy booking flow. Parking could be better marked.',
    date: '5 days ago',
  },
];

export const mockNotifications = [
  {
    id: 'nt_1',
    title: 'New booking confirmed',
    message: 'Grand Turf Arena • 6:00 PM slot booked for today.',
    tone: 'success' as const,
  },
  {
    id: 'nt_2',
    title: 'Payout processed',
    message: '₹1,500 has been added to your wallet balance.',
    tone: 'info' as const,
  },
  {
    id: 'nt_3',
    title: 'High-demand slot',
    message: '7:00 PM - 9:00 PM slots are trending 18% above average.',
    tone: 'warning' as const,
  },
];

export const dashboardSnapshot = {
  totalRevenue: 184500,
  currentBalance: 42800,
  activeBookings: 12,
  facilityCount: 2,
  commissionAmount: 20500,
  occupancyRate: 78,
  suggestedPeakPrice: 1450,
  bestSlot: '7:00 PM - 8:00 PM',
  recentTransactions: mockTransactions,
};
