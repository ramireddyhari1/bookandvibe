const express = require('express');
const { randomUUID } = require('crypto');

const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdmin, requireAdminOrPartner } = require('../middleware/auth');
const { ensureRedisConnected } = require('../lib/redis');
const {
  SeatLockError,
  assertLockOwnership,
  lockSeats,
  releaseSeats,
} = require('../services/seatLock.service');
const {
  beginIdempotentRequest,
  clearIdempotentRequest,
  completeIdempotentRequest,
} = require('../services/idempotency.service');
const {
  FACILITIES,
  REVIEWS_BY_FACILITY,
  GAMEHUB_BOOKINGS,
  GAMEHUB_BLOCKED_SLOTS,
} = require('../data/gamehub.data');

function supportsGamehubPersistence() {
  return Boolean(
    prisma &&
    prisma.gamehubFacility &&
    prisma.gamehubReview &&
    prisma.gamehubBooking &&
    prisma.gamehubBlockedSlot
  );
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

const FACILITY_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'MAINTENANCE']);

function stringifyJsonArray(value) {
  return JSON.stringify(Array.isArray(value) ? value : []);
}

function hydrateFacilityFromRecord(record) {
  if (!record) return null;

  return {
    id: record.id,
    name: record.name,
    type: record.type,
    location: record.location,
    venue: record.venue,
    distance: record.distance,
    rating: Number(record.rating || 0),
    reviewsCount: Number(record.reviewsCount || record?._count?.reviews || 0),
    pricePerHour: Number(record.pricePerHour || 0),
    unit: record.unit || 'hr',
    priceRange: record.priceRange || '',
    image: record.image || '',
    description: record.description || '',
    phone: record.phone || '',
    openHours: record.openHours || '',
    status: FACILITY_STATUSES.has(record.status) ? record.status : 'ACTIVE',
    pricingRules: parseJsonArray(record.pricingRules),
    amenities: parseJsonArray(record.amenities),
    features: parseJsonArray(record.features),
    tags: parseJsonArray(record.tags),
    gallery: parseJsonArray(record.gallery),
    battleModes: parseJsonArray(record.battleModes),
    slotTemplate: parseJsonArray(record.slotTemplate),
    availableSports: parseJsonArray(record.availableSports),
    partnerId: record.partnerId || null,
    partner: record.partner
      ? {
          id: record.partner.id,
          name: record.partner.name,
          email: record.partner.email,
        }
      : null,
  };
}

function isAdminUser(user) {
  return String(user?.role || '').toUpperCase() === 'ADMIN';
}

function isPartnerUser(user) {
  return String(user?.role || '').toUpperCase() === 'PARTNER';
}

function hasFacilityManagementAccess(user, facility) {
  if (!user || !facility) return false;
  if (isAdminUser(user)) return true;
  if (!isPartnerUser(user)) return false;
  return Boolean(facility.partnerId) && String(facility.partnerId) === String(user.id);
}

async function resolvePartnerIdOrNull(partnerId) {
  if (!partnerId) return null;
  const partner = await prisma.user.findUnique({
    where: { id: String(partnerId) },
    select: { id: true, role: true, status: true },
  });
  if (!partner) {
    throw new Error('Partner not found');
  }
  if (String(partner.role || '').toUpperCase() !== 'PARTNER') {
    throw new Error('Selected user is not a PARTNER');
  }
  if (String(partner.status || '').toUpperCase() !== 'ACTIVE') {
    throw new Error('Selected partner is not ACTIVE');
  }
  return partner.id;
}

async function findFacilityById(id) {
  if (!supportsGamehubPersistence()) {
    const facility = FACILITIES.find((item) => item.id === id);
    if (!facility) return null;
    return {
      ...facility,
      status: FACILITY_STATUSES.has(facility.status) ? facility.status : 'ACTIVE',
      pricingRules: Array.isArray(facility.pricingRules) ? facility.pricingRules : [],
    };
  }

  const record = await prisma.gamehubFacility.findUnique({
    where: { id },
    include: {
      _count: { select: { reviews: true } },
      partner: { select: { id: true, name: true, email: true } },
    },
  });

  return hydrateFacilityFromRecord(record);
}

async function listFacilityReviews(facilityId) {
  if (!supportsGamehubPersistence()) {
    return REVIEWS_BY_FACILITY[facilityId] || [];
  }

  const rows = await prisma.gamehubReview.findMany({
    where: { facilityId },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((review) => ({
    id: review.id,
    name: review.userName,
    avatar: review.avatar,
    rating: review.rating,
    date: review.createdAt.toISOString(),
    text: review.comment,
    helpful: review.helpful,
  }));
}

async function createBookingRecord(payload) {
  if (!supportsGamehubPersistence()) {
    GAMEHUB_BOOKINGS.push(payload);
    return payload;
  }

  const created = await prisma.gamehubBooking.create({
    data: {
      facilityId: payload.facilityId,
      userId: payload.userId,
      bookingDate: new Date(`${payload.bookingDate}T00:00:00.000Z`),
      slotLabel: payload.slotLabel,
      totalAmount: payload.totalAmount,
      currency: payload.currency,
      status: payload.status,
      paymentMethod: payload.payment.method,
      paymentStatus: payload.payment.status,
      transactionId: payload.payment.transactionId,
    },
  });

  return {
    ...payload,
    id: created.id,
    createdAt: created.createdAt.toISOString(),
  };
}

async function listUserBookings({ userId, facilityId, bookingDate }) {
  if (!supportsGamehubPersistence()) {
    let bookings = GAMEHUB_BOOKINGS.filter((booking) => booking.userId === userId);

    if (facilityId) {
      bookings = bookings.filter((booking) => booking.facilityId === String(facilityId));
    }

    if (bookingDate) {
      bookings = bookings.filter((booking) => booking.bookingDate === bookingDate);
    }

    return bookings;
  }

  const where = { userId };
  if (facilityId) where.facilityId = String(facilityId);
  if (bookingDate) {
    const start = new Date(`${bookingDate}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.bookingDate = { gte: start, lt: end };
  }

  const rows = await prisma.gamehubBooking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((row) => ({
    id: row.id,
    facilityId: row.facilityId,
    userId: row.userId,
    bookingDate: row.bookingDate.toISOString().slice(0, 10),
    slotLabel: row.slotLabel,
    totalAmount: row.totalAmount,
    currency: row.currency,
    status: row.status,
    payment: {
      id: row.id,
      method: row.paymentMethod,
      status: row.paymentStatus,
      transactionId: row.transactionId,
    },
    createdAt: row.createdAt.toISOString(),
  }));
}

async function listFacilityBookingsByMonth({ facilityId, month }) {
  const [yearText, monthText] = String(month || '').split('-');
  const year = Number(yearText);
  const monthNumber = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    throw new Error('month must be in YYYY-MM format');
  }

  const start = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0));

  if (!supportsGamehubPersistence()) {
    return GAMEHUB_BOOKINGS.filter((booking) => {
      if (booking.facilityId !== facilityId) return false;
      if (booking.status !== 'CONFIRMED') return false;
      const bookingDate = new Date(`${booking.bookingDate}T00:00:00.000Z`);
      return bookingDate >= start && bookingDate < end;
    });
  }

  const rows = await prisma.gamehubBooking.findMany({
    where: {
      facilityId,
      status: 'CONFIRMED',
      bookingDate: { gte: start, lt: end },
    },
    orderBy: { bookingDate: 'asc' },
  });

  return rows.map((row) => ({
    id: row.id,
    facilityId: row.facilityId,
    userId: row.userId,
    bookingDate: row.bookingDate.toISOString().slice(0, 10),
    slotLabel: row.slotLabel,
    status: row.status,
  }));
}

async function listFacilityBlocksByMonth({ facilityId, month }) {
  const [yearText, monthText] = String(month || '').split('-');
  const year = Number(yearText);
  const monthNumber = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    throw new Error('month must be in YYYY-MM format');
  }

  const start = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0));

  if (supportsGamehubPersistence()) {
    const rows = await prisma.gamehubBlockedSlot.findMany({
      where: {
        facilityId,
        blockDate: { gte: start, lt: end },
      },
      orderBy: [{ blockDate: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      facilityId: row.facilityId,
      blockDate: row.blockDate.toISOString().slice(0, 10),
      slotLabel: row.slotLabel,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId || null,
    }));
  }

  const prefix = `${yearText}-${String(monthNumber).padStart(2, '0')}`;

  return GAMEHUB_BLOCKED_SLOTS.filter((block) => block.facilityId === facilityId && String(block.blockDate).startsWith(prefix));
}

async function blockedInfoForDate(facilityId, bookingDate) {
  let blocks = [];

  if (supportsGamehubPersistence()) {
    const start = new Date(`${bookingDate}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const rows = await prisma.gamehubBlockedSlot.findMany({
      where: {
        facilityId,
        blockDate: { gte: start, lt: end },
      },
      orderBy: { createdAt: 'asc' },
    });

    blocks = rows.map((row) => ({
      id: row.id,
      facilityId: row.facilityId,
      blockDate: row.blockDate.toISOString().slice(0, 10),
      slotLabel: row.slotLabel,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId || null,
    }));
  } else {
    blocks = GAMEHUB_BLOCKED_SLOTS.filter((item) => item.facilityId === facilityId && item.blockDate === bookingDate);
  }

  const allDayBlocked = blocks.some((item) => item.slotLabel === '*');
  const blockedLabels = new Set(
    blocks
      .filter((item) => item.slotLabel && item.slotLabel !== '*')
      .map((item) => item.slotLabel)
  );

  return {
    blocks,
    allDayBlocked,
    blockedLabels,
  };
}

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function toStatus(value, fallback = 'ACTIVE') {
  const normalized = toText(value, fallback).toUpperCase();
  return FACILITY_STATUSES.has(normalized) ? normalized : fallback;
}

function toPricingRules(value, fallback = []) {
  if (Array.isArray(value)) {
    return value
      .map((rule) => ({
        type: toText(rule?.type),
        time: toText(rule?.time),
        day: toText(rule?.day),
        price: toNumber(rule?.price, 0),
      }))
      .filter((rule) => rule.type && rule.price > 0);
  }

  if (typeof value === 'string') {
    try {
      return toPricingRules(JSON.parse(value), fallback);
    } catch (_) {
      return fallback;
    }
  }

  return fallback;
}

function generateSlotTemplate({ startHour = 6, endHour = 22, intervalMinutes = 60, basePrice = 500, peakStartHour, peakEndHour, peakPrice, weekendPrice }) {
  const slots = [];
  const startMinute = Math.max(0, Math.min(23, Number(startHour))) * 60;
  const endMinute = Math.max(0, Math.min(24, Number(endHour))) * 60;
  const step = Math.max(15, Number(intervalMinutes) || 60);

  function labelFor(minute) {
    const hour24 = Math.floor(minute / 60);
    const minuteValue = minute % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour24 + 11) % 12) + 1;
    return `${String(hour12).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')} ${period}`;
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

function buildFacilityPayload(source = [], existing = {}) {
  const facility = {
    ...existing,
    name: toText(source.name, existing.name),
    type: toText(source.type, existing.type),
    location: toText(source.location, existing.location),
    venue: toText(source.venue, existing.venue),
    distance: toText(source.distance, existing.distance),
    rating: toNumber(source.rating, existing.rating ?? 0),
    reviewsCount: toNumber(source.reviewsCount, existing.reviewsCount ?? 0),
    pricePerHour: toNumber(source.pricePerHour, existing.pricePerHour ?? 0),
    unit: toText(source.unit, existing.unit || 'hr'),
    priceRange: toText(source.priceRange, existing.priceRange),
    image: toText(source.image, existing.image),
    description: toText(source.description, existing.description),
    phone: toText(source.phone, existing.phone),
    openHours: toText(source.openHours, existing.openHours),
    status: toStatus(source.status, existing.status || 'ACTIVE'),
    pricingRules: toPricingRules(source.pricingRules, existing.pricingRules || []),
    amenities: toList(source.amenities, existing.amenities || []),
    features: toList(source.features, existing.features || []),
    tags: toList(source.tags, existing.tags || []),
    gallery: toList(source.gallery, existing.gallery || []),
    battleModes: Array.isArray(source.battleModes) ? source.battleModes : existing.battleModes || [],
    slotTemplate: Array.isArray(source.slotTemplate) ? source.slotTemplate : existing.slotTemplate || [],
    availableSports: toList(source.availableSports, existing.availableSports || []),
  };

  if (!facility.name || !facility.type || !facility.location || !facility.venue) {
    throw new Error('name, type, location, and venue are required');
  }

  if (!facility.image) {
    facility.image = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200';
  }

  return facility;
}

function parseDistanceValue(distance = '') {
  const match = /(\d+(?:\.\d+)?)/.exec(String(distance));
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function normalizeDate(input) {
  if (!input) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function availabilityScopeKey(facilityId, bookingDate) {
  return `gamehub:facility:${facilityId}:date:${bookingDate}`;
}

async function bookedSlotSetForDate(facilityId, bookingDate) {
  if (!supportsGamehubPersistence()) {
    return new Set(
      GAMEHUB_BOOKINGS
        .filter((booking) => booking.facilityId === facilityId && booking.bookingDate === bookingDate && booking.status === 'CONFIRMED')
        .map((booking) => booking.slotLabel)
    );
  }

  const start = new Date(`${bookingDate}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const bookings = await prisma.gamehubBooking.findMany({
    where: {
      facilityId,
      status: 'CONFIRMED',
      bookingDate: { gte: start, lt: end },
    },
    select: { slotLabel: true },
  });

  return new Set(bookings.map((booking) => booking.slotLabel));
}

async function listFacilitiesFromStore() {
  if (!supportsGamehubPersistence()) {
    return FACILITIES.map((facility) => ({
      ...facility,
      status: FACILITY_STATUSES.has(facility.status) ? facility.status : 'ACTIVE',
      pricingRules: Array.isArray(facility.pricingRules) ? facility.pricingRules : [],
    }));
  }

  const rows = await prisma.gamehubFacility.findMany({
    include: {
      _count: { select: { reviews: true } },
      partner: { select: { id: true, name: true, email: true } },
    },
  });

  return rows.map((row) => hydrateFacilityFromRecord(row));
}

async function getSlotAvailability({ facilityId, bookingDate, slots = [], userId }) {
  const redis = await ensureRedisConnected();
  const scope = availabilityScopeKey(facilityId, bookingDate);
  const bookedSet = await bookedSlotSetForDate(facilityId, bookingDate);
  const blockedInfo = await blockedInfoForDate(facilityId, bookingDate);

  const availability = [];
  for (const slot of slots) {
    const slotLabel = String(slot.label || '').trim();
    if (!slotLabel) continue;

    if (blockedInfo.allDayBlocked || blockedInfo.blockedLabels.has(slotLabel)) {
      availability.push({
        label: slotLabel,
        status: 'BLOCKED',
        lockedByCurrentUser: false,
      });
      continue;
    }

    if (bookedSet.has(slotLabel)) {
      availability.push({
        label: slotLabel,
        status: 'BOOKED',
        lockedByCurrentUser: false,
      });
      continue;
    }

    const lockOwner = await redis.get(`lock:${scope}:seat:${slotLabel}`);

    if (lockOwner) {
      availability.push({
        label: slotLabel,
        status: 'LOCKED',
        lockedByCurrentUser: Boolean(userId && userId === lockOwner),
      });
      continue;
    }

    availability.push({
      label: slotLabel,
      status: 'AVAILABLE',
      lockedByCurrentUser: false,
    });
  }

  return availability;
}

function resolveIdempotencyKey(req) {
  return req.get('idempotency-key') || req.body.idempotencyKey || null;
}

router.post('/facilities/slot-template/generate', authenticateToken, requireAdminOrPartner, (req, res) => {
  try {
    const {
      startHour = 6,
      endHour = 22,
      intervalMinutes = 60,
      basePrice = 500,
      peakStartHour,
      peakEndHour,
      peakPrice,
      weekendPrice,
    } = req.body || {};

    const slotTemplate = generateSlotTemplate({
      startHour,
      endHour,
      intervalMinutes,
      basePrice,
      peakStartHour,
      peakEndHour,
      peakPrice,
      weekendPrice,
    });

    return res.json({
      message: 'Slot template generated successfully',
      data: slotTemplate,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/facilities/manage/list', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const {
      city,
      type,
      status,
      search,
      minRating,
      maxPrice,
      sortBy = 'distance',
      sortOrder = 'asc',
      page = 1,
      limit = 24,
    } = req.query;

    let facilities = await listFacilitiesFromStore();
    if (!isAdminUser(req.user)) {
      facilities = facilities.filter((item) => String(item.partnerId || '') === String(req.user.id));
    }

    if (city) {
      const normalized = String(city).toLowerCase();
      facilities = facilities.filter(
        (item) => item.location.toLowerCase().includes(normalized) || item.venue.toLowerCase().includes(normalized)
      );
    }

    if (type && type !== 'All') {
      facilities = facilities.filter((item) => item.type === type);
    }

    if (status && status !== 'All') {
      facilities = facilities.filter((item) => item.status === String(status).toUpperCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      facilities = facilities.filter(
        (item) => item.name.toLowerCase().includes(q) || item.venue.toLowerCase().includes(q) || item.location.toLowerCase().includes(q)
      );
    }

    if (minRating !== undefined) {
      const threshold = Number(minRating);
      if (Number.isFinite(threshold)) {
        facilities = facilities.filter((item) => Number(item.rating) >= threshold);
      }
    }

    if (maxPrice !== undefined) {
      const threshold = Number(maxPrice);
      if (Number.isFinite(threshold)) {
        facilities = facilities.filter((item) => Number(item.pricePerHour) <= threshold);
      }
    }

    const isAsc = String(sortOrder).toLowerCase() !== 'desc';
    facilities.sort((a, b) => {
      if (sortBy === 'rating') {
        return isAsc ? a.rating - b.rating : b.rating - a.rating;
      }

      if (sortBy === 'price') {
        return isAsc ? a.pricePerHour - b.pricePerHour : b.pricePerHour - a.pricePerHour;
      }

      if (sortBy === 'reviews') {
        return isAsc ? a.reviewsCount - b.reviewsCount : b.reviewsCount - a.reviewsCount;
      }

      const distanceA = parseDistanceValue(a.distance);
      const distanceB = parseDistanceValue(b.distance);
      return isAsc ? distanceA - distanceB : distanceB - distanceA;
    });

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 24));
    const total = facilities.length;
    const pagedFacilities = facilities.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    return res.json({
      message: 'Success',
      data: pagedFacilities,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/facilities', async (req, res) => {
  try {
    const {
      city,
      type,
      status,
      search,
      minRating,
      maxPrice,
      sortBy = 'distance',
      sortOrder = 'asc',
      page = 1,
      limit = 24,
    } = req.query;

    let facilities = await listFacilitiesFromStore();

    if (city) {
      const normalized = String(city).toLowerCase();
      facilities = facilities.filter(
        (item) => item.location.toLowerCase().includes(normalized) || item.venue.toLowerCase().includes(normalized)
      );
    }

    if (type && type !== 'All') {
      facilities = facilities.filter((item) => item.type === type);
    }

    if (status && status !== 'All') {
      facilities = facilities.filter((item) => item.status === String(status).toUpperCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      facilities = facilities.filter(
        (item) => item.name.toLowerCase().includes(q) || item.venue.toLowerCase().includes(q) || item.location.toLowerCase().includes(q)
      );
    }

    if (minRating !== undefined) {
      const threshold = Number(minRating);
      if (Number.isFinite(threshold)) {
        facilities = facilities.filter((item) => Number(item.rating) >= threshold);
      }
    }

    if (maxPrice !== undefined) {
      const threshold = Number(maxPrice);
      if (Number.isFinite(threshold)) {
        facilities = facilities.filter((item) => Number(item.pricePerHour) <= threshold);
      }
    }

    const isAsc = String(sortOrder).toLowerCase() !== 'desc';
    facilities.sort((a, b) => {
      if (sortBy === 'rating') {
        return isAsc ? a.rating - b.rating : b.rating - a.rating;
      }

      if (sortBy === 'price') {
        return isAsc ? a.pricePerHour - b.pricePerHour : b.pricePerHour - a.pricePerHour;
      }

      if (sortBy === 'reviews') {
        return isAsc ? a.reviewsCount - b.reviewsCount : b.reviewsCount - a.reviewsCount;
      }

      const distanceA = parseDistanceValue(a.distance);
      const distanceB = parseDistanceValue(b.distance);
      return isAsc ? distanceA - distanceB : distanceB - distanceA;
    });

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 24));
    const total = facilities.length;
    const pagedFacilities = facilities.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    return res.json({
      message: 'Success',
      data: pagedFacilities,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/facilities/:id', async (req, res) => {
  try {
    const facility = await findFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const reviews = await listFacilityReviews(facility.id);

    return res.json({
      message: 'Success',
      data: {
        ...facility,
        reviews,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/facilities/:id/reviews', async (req, res) => {
  try {
    const facility = await findFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const reviews = await listFacilityReviews(facility.id);

    return res.json({ message: 'Success', data: reviews });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/facilities/:id/availability', async (req, res) => {
  try {
    const facility = await findFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const bookingDate = normalizeDate(req.query.date);
    if (!bookingDate) return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });

    const userId = req.query.userId ? String(req.query.userId) : undefined;
    const slots = await getSlotAvailability({
      facilityId: facility.id,
      bookingDate,
      slots: facility.slotTemplate || [],
      userId,
    });

    return res.json({
      message: 'Success',
      data: {
        facilityId: facility.id,
        bookingDate,
        slots,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/facilities/:id/calendar', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const facility = await findFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    if (!hasFacilityManagementAccess(req.user, facility)) {
      return res.status(403).json({ error: 'You do not have permission to manage this facility' });
    }

    const month = String(req.query.month || '').trim();
    if (!month) {
      return res.status(400).json({ error: 'month is required in YYYY-MM format' });
    }

    const [bookings, blocks] = await Promise.all([
      listFacilityBookingsByMonth({ facilityId: facility.id, month }),
      listFacilityBlocksByMonth({ facilityId: facility.id, month }),
    ]);

    const byDate = new Map();

    for (const booking of bookings) {
      const key = booking.bookingDate;
      const current = byDate.get(key) || { date: key, bookingCount: 0, blockedCount: 0, bookings: [], blocks: [] };
      current.bookingCount += 1;
      current.bookings.push({
        id: booking.id,
        slotLabel: booking.slotLabel,
        status: booking.status,
      });
      byDate.set(key, current);
    }

    for (const block of blocks) {
      const key = block.blockDate;
      const current = byDate.get(key) || { date: key, bookingCount: 0, blockedCount: 0, bookings: [], blocks: [] };
      current.blockedCount += 1;
      current.blocks.push({
        id: block.id,
        slotLabel: block.slotLabel,
        reason: block.reason,
        createdAt: block.createdAt,
      });
      byDate.set(key, current);
    }

    const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      message: 'Success',
      data: {
        facilityId: facility.id,
        month,
        days,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/facilities/:id/block-slots', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const facility = await findFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    if (!hasFacilityManagementAccess(req.user, facility)) {
      return res.status(403).json({ error: 'You do not have permission to manage this facility' });
    }

    const { date, slotLabels = [], reason = '' } = req.body || {};
    const blockDate = normalizeDate(date);
    if (!blockDate) return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });

    const labels = Array.isArray(slotLabels) ? slotLabels : [];
    const normalizedLabels = [...new Set(labels.map((item) => String(item || '').trim()).filter(Boolean))];
    const effectiveLabels = normalizedLabels.length ? normalizedLabels : ['*'];

    const createdBlocks = [];
    if (supportsGamehubPersistence()) {
      const dayStart = new Date(`${blockDate}T00:00:00.000Z`);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

      const existingRows = await prisma.gamehubBlockedSlot.findMany({
        where: {
          facilityId: facility.id,
          blockDate: { gte: dayStart, lt: dayEnd },
        },
        select: { slotLabel: true },
      });
      const existingLabels = new Set(existingRows.map((row) => row.slotLabel));

      for (const label of effectiveLabels) {
        if (existingLabels.has(label)) continue;

        const row = await prisma.gamehubBlockedSlot.create({
          data: {
            facilityId: facility.id,
            blockDate: dayStart,
            slotLabel: label,
            reason: String(reason || '').trim() || 'Blocked by admin',
            createdByUserId: req.user.id,
          },
        });

        createdBlocks.push({
          id: row.id,
          facilityId: row.facilityId,
          blockDate: row.blockDate.toISOString().slice(0, 10),
          slotLabel: row.slotLabel,
          reason: row.reason,
          createdAt: row.createdAt.toISOString(),
          createdByUserId: row.createdByUserId || null,
        });
      }
    } else {
      for (const label of effectiveLabels) {
        const exists = GAMEHUB_BLOCKED_SLOTS.find(
          (item) => item.facilityId === facility.id && item.blockDate === blockDate && item.slotLabel === label
        );
        if (exists) continue;

        const block = {
          id: `ghblk-${randomUUID()}`,
          facilityId: facility.id,
          blockDate,
          slotLabel: label,
          reason: String(reason || '').trim() || 'Blocked by admin',
          createdAt: new Date().toISOString(),
          createdByUserId: req.user.id,
        };
        GAMEHUB_BLOCKED_SLOTS.push(block);
        createdBlocks.push(block);
      }
    }

    return res.status(201).json({
      message: 'Slots blocked successfully',
      data: {
        facilityId: facility.id,
        blockDate,
        createdCount: createdBlocks.length,
        blocks: createdBlocks,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/facilities/:id/block-slots/:blockId', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const facility = await findFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    if (!hasFacilityManagementAccess(req.user, facility)) {
      return res.status(403).json({ error: 'You do not have permission to manage this facility' });
    }

    let deletedBlock = null;
    if (supportsGamehubPersistence()) {
      const target = await prisma.gamehubBlockedSlot.findFirst({
        where: {
          id: req.params.blockId,
          facilityId: facility.id,
        },
      });

      if (!target) {
        return res.status(404).json({ error: 'Blocked slot entry not found' });
      }

      await prisma.gamehubBlockedSlot.delete({ where: { id: target.id } });
      deletedBlock = {
        id: target.id,
        facilityId: target.facilityId,
        blockDate: target.blockDate.toISOString().slice(0, 10),
        slotLabel: target.slotLabel,
        reason: target.reason,
        createdAt: target.createdAt.toISOString(),
        createdByUserId: target.createdByUserId || null,
      };
    } else {
      const blockIndex = GAMEHUB_BLOCKED_SLOTS.findIndex(
        (item) => item.id === req.params.blockId && item.facilityId === facility.id
      );

      if (blockIndex === -1) {
        return res.status(404).json({ error: 'Blocked slot entry not found' });
      }

      [deletedBlock] = GAMEHUB_BLOCKED_SLOTS.splice(blockIndex, 1);
    }

    return res.json({
      message: 'Blocked slot removed successfully',
      data: deletedBlock,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/bookings/lock', authenticateToken, async (req, res) => {
  try {
    const { facilityId, slotLabel, date } = req.body;
    const bookingDate = normalizeDate(date);
    const userId = req.user.id;

    if (!facilityId || !slotLabel || !bookingDate) {
      return res.status(400).json({ error: 'facilityId, slotLabel, and date are required' });
    }

    const facility = await findFacilityById(facilityId);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const hasSlot = (facility.slotTemplate || []).some((slot) => String(slot.label).trim() === String(slotLabel).trim());
    if (!hasSlot) return res.status(400).json({ error: 'Invalid slot label for this facility' });

    const normalizedSlot = String(slotLabel).trim();
    const blockedInfo = await blockedInfoForDate(facilityId, bookingDate);
    if (blockedInfo.allDayBlocked || blockedInfo.blockedLabels.has(normalizedSlot)) {
      return res.status(409).json({ error: `Slot ${normalizedSlot} is blocked by admin` });
    }

    const alreadyBooked = (await bookedSlotSetForDate(facilityId, bookingDate)).has(normalizedSlot);
    if (alreadyBooked) {
      return res.status(409).json({ error: `Slot ${normalizedSlot} is already booked` });
    }

    const lockResult = await lockSeats({
      scopeKey: availabilityScopeKey(facilityId, bookingDate),
      userId,
      seatNumbers: [normalizedSlot],
      ttlSeconds: 300,
    });

    return res.status(201).json({
      message: 'Slot locked successfully',
      data: {
        facilityId,
        bookingDate,
        slotLabel: normalizedSlot,
        expiresIn: lockResult.ttlSeconds,
      },
    });
  } catch (error) {
    if (error instanceof SeatLockError) {
      return res.status(409).json({ error: error.message, details: error.details });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.post('/bookings/release', authenticateToken, async (req, res) => {
  try {
    const { facilityId, slotLabel, date } = req.body;
    const bookingDate = normalizeDate(date);
    const userId = req.user.id;

    if (!facilityId || !slotLabel || !bookingDate) {
      return res.status(400).json({ error: 'facilityId, slotLabel, and date are required' });
    }

    const result = await releaseSeats({
      scopeKey: availabilityScopeKey(facilityId, bookingDate),
      userId,
      seatNumbers: [String(slotLabel).trim()],
      onlyIfOwned: true,
    });

    return res.json({
      message: 'Slot lock released',
      data: {
        facilityId,
        bookingDate,
        slotLabel: String(slotLabel).trim(),
        releasedCount: result.releasedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/bookings/confirm', authenticateToken, async (req, res) => {
  const { facilityId, slotLabel, date, paymentMethod = 'MOCK' } = req.body;
  const bookingDate = normalizeDate(date);
  const userId = req.user.id;
  const idempotencyKey = resolveIdempotencyKey(req);

  if (!facilityId || !slotLabel || !bookingDate) {
    return res.status(400).json({ error: 'facilityId, slotLabel, and date are required' });
  }

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'idempotency-key header (or idempotencyKey body) is required' });
  }

  const facility = await findFacilityById(facilityId);
  if (!facility) return res.status(404).json({ error: 'Facility not found' });

  const normalizedSlot = String(slotLabel).trim();
  const hasSlot = (facility.slotTemplate || []).some((slot) => String(slot.label).trim() === normalizedSlot);
  if (!hasSlot) return res.status(400).json({ error: 'Invalid slot label for this facility' });

  const blockedInfo = await blockedInfoForDate(facilityId, bookingDate);
  if (blockedInfo.allDayBlocked || blockedInfo.blockedLabels.has(normalizedSlot)) {
    return res.status(409).json({ error: `Slot ${normalizedSlot} is blocked by admin` });
  }

  const idempotency = await beginIdempotentRequest({
    scope: `gamehub-confirm:${facilityId}:${bookingDate}`,
    userId,
    idempotencyKey,
  });

  if (idempotency.state === 'replay') {
    return res.status(200).json(idempotency.cachedResponse);
  }

  if (idempotency.state === 'in-progress') {
    return res.status(409).json({ error: 'A booking request with this idempotency key is already in progress' });
  }

  try {
    const alreadyBooked = (await bookedSlotSetForDate(facilityId, bookingDate)).has(normalizedSlot);
    if (alreadyBooked) {
      await clearIdempotentRequest({ redisKey: idempotency.redisKey });
      return res.status(409).json({ error: `Slot ${normalizedSlot} is already booked` });
    }

    await assertLockOwnership({
      scopeKey: availabilityScopeKey(facilityId, bookingDate),
      userId,
      seatNumbers: [normalizedSlot],
    });

    const booking = {
      id: `ghb-${randomUUID()}`,
      facilityId,
      userId,
      bookingDate,
      slotLabel: normalizedSlot,
      totalAmount: Number(facility.pricePerHour || 0),
      currency: 'INR',
      status: 'CONFIRMED',
      payment: {
        id: `ghp-${randomUUID()}`,
        method: String(paymentMethod).toUpperCase(),
        status: 'SUCCESS',
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      },
      createdAt: new Date().toISOString(),
    };

    const createdBooking = await createBookingRecord(booking);

    await releaseSeats({
      scopeKey: availabilityScopeKey(facilityId, bookingDate),
      userId,
      seatNumbers: [normalizedSlot],
      onlyIfOwned: true,
    });

    const responsePayload = {
      message: 'GameHub booking confirmed successfully',
      data: createdBooking,
    };

    await completeIdempotentRequest({
      redisKey: idempotency.redisKey,
      responsePayload,
    });

    return res.status(201).json(responsePayload);
  } catch (error) {
    await clearIdempotentRequest({ redisKey: idempotency.redisKey });

    if (error instanceof SeatLockError) {
      return res.status(409).json({ error: error.message, details: error.details });
    }

    return res.status(500).json({ error: error.message });
  }
});

router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { facilityId, date } = req.query;

    let bookingDate;
    if (date) {
      bookingDate = normalizeDate(date);
      if (!bookingDate) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
    }

    const bookings = await listUserBookings({ userId, facilityId, bookingDate });

    return res.json({ message: 'Success', data: bookings });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/facilities', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const requestedPartnerId = req.body?.partnerId;
    const partnerId = isAdminUser(req.user)
      ? await resolvePartnerIdOrNull(requestedPartnerId)
      : req.user.id;

    const facility = buildFacilityPayload(req.body, {
      id: `fac-${randomUUID()}`,
      reviewsCount: 0,
      distance: '0 km away',
      status: 'ACTIVE',
      pricePerHour: 0,
      unit: 'hr',
      pricingRules: [],
      features: [],
      amenities: [],
      tags: [],
      gallery: [],
      battleModes: [],
      slotTemplate: [],
      partnerId,
    });
    facility.partnerId = partnerId;

    if (supportsGamehubPersistence()) {
      await prisma.gamehubFacility.create({
        data: {
          id: facility.id,
          name: facility.name,
          type: facility.type,
          location: facility.location,
          venue: facility.venue,
          distance: facility.distance,
          rating: facility.rating,
          reviewsCount: facility.reviewsCount,
          pricePerHour: facility.pricePerHour,
          unit: facility.unit,
          priceRange: facility.priceRange,
          image: facility.image,
          description: facility.description,
          phone: facility.phone,
          openHours: facility.openHours,
          status: facility.status,
          pricingRules: stringifyJsonArray(facility.pricingRules),
          amenities: stringifyJsonArray(facility.amenities),
          features: stringifyJsonArray(facility.features),
          tags: stringifyJsonArray(facility.tags),
          gallery: stringifyJsonArray(facility.gallery),
          battleModes: stringifyJsonArray(facility.battleModes),
          slotTemplate: stringifyJsonArray(facility.slotTemplate),
          partnerId: facility.partnerId || null,
        },
      });
    } else {
      FACILITIES.unshift(facility);
    }

    return res.status(201).json({
      message: 'Facility created successfully',
      data: facility,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.patch('/facilities/:id', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const existingFacility = await findFacilityById(req.params.id);
    if (!existingFacility) return res.status(404).json({ error: 'Facility not found' });
    if (!hasFacilityManagementAccess(req.user, existingFacility)) {
      return res.status(403).json({ error: 'You do not have permission to manage this facility' });
    }

    const updatedFacility = buildFacilityPayload(req.body, existingFacility);
    if (isAdminUser(req.user) && req.body?.partnerId !== undefined) {
      updatedFacility.partnerId = await resolvePartnerIdOrNull(req.body.partnerId);
    }

    if (supportsGamehubPersistence()) {
      await prisma.gamehubFacility.update({
        where: { id: req.params.id },
        data: {
          name: updatedFacility.name,
          type: updatedFacility.type,
          location: updatedFacility.location,
          venue: updatedFacility.venue,
          distance: updatedFacility.distance,
          rating: updatedFacility.rating,
          reviewsCount: updatedFacility.reviewsCount,
          pricePerHour: updatedFacility.pricePerHour,
          unit: updatedFacility.unit,
          priceRange: updatedFacility.priceRange,
          image: updatedFacility.image,
          description: updatedFacility.description,
          phone: updatedFacility.phone,
          openHours: updatedFacility.openHours,
          status: updatedFacility.status,
          pricingRules: stringifyJsonArray(updatedFacility.pricingRules),
          amenities: stringifyJsonArray(updatedFacility.amenities),
          features: stringifyJsonArray(updatedFacility.features),
          tags: stringifyJsonArray(updatedFacility.tags),
          gallery: stringifyJsonArray(updatedFacility.gallery),
          battleModes: stringifyJsonArray(updatedFacility.battleModes),
          slotTemplate: stringifyJsonArray(updatedFacility.slotTemplate),
          partnerId: updatedFacility.partnerId || null,
        },
      });
    } else {
      const facilityIndex = FACILITIES.findIndex((item) => item.id === req.params.id);
      FACILITIES[facilityIndex] = updatedFacility;
    }

    return res.json({
      message: 'Facility updated successfully',
      data: updatedFacility,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.patch('/facilities/:id/assign-partner', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const facility = await findFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const partnerId = await resolvePartnerIdOrNull(req.body?.partnerId);

    if (supportsGamehubPersistence()) {
      const updated = await prisma.gamehubFacility.update({
        where: { id: req.params.id },
        data: { partnerId },
        include: {
          _count: { select: { reviews: true } },
          partner: { select: { id: true, name: true, email: true } },
        },
      });
      return res.json({
        message: 'Facility partner assignment updated',
        data: hydrateFacilityFromRecord(updated),
      });
    }

    const facilityIndex = FACILITIES.findIndex((item) => item.id === req.params.id);
    if (facilityIndex === -1) return res.status(404).json({ error: 'Facility not found' });
    FACILITIES[facilityIndex] = { ...FACILITIES[facilityIndex], partnerId: partnerId || null };

    return res.json({
      message: 'Facility partner assignment updated',
      data: FACILITIES[facilityIndex],
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/facilities/:id', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const deletedFacility = await findFacilityById(req.params.id);
    if (!deletedFacility) return res.status(404).json({ error: 'Facility not found' });
    if (!hasFacilityManagementAccess(req.user, deletedFacility)) {
      return res.status(403).json({ error: 'You do not have permission to manage this facility' });
    }

    if (supportsGamehubPersistence()) {
      await prisma.gamehubFacility.delete({ where: { id: req.params.id } });
    } else {
      const facilityIndex = FACILITIES.findIndex((item) => item.id === req.params.id);
      FACILITIES.splice(facilityIndex, 1);
      delete REVIEWS_BY_FACILITY[deletedFacility.id];
    }

    return res.json({
      message: 'Facility deleted successfully',
      data: deletedFacility,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
