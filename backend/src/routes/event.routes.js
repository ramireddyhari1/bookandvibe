const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdmin, requireAdminOrPartner } = require('../middleware/auth');

const BOOKING_FORMATS = ['SEAT', 'TIER', 'HYBRID'];
const VISIBILITY_TYPES = ['PUBLIC', 'PRIVATE', 'INVITE_ONLY'];
const PLATFORM_FEE_TYPES = ['PERCENT', 'FIXED'];

function normalizeEnum(value, allowedValues, fallback) {
  const normalized = String(value || '').trim().toUpperCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function parseDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseImages(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((img) => String(img).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map((img) => String(img).trim()).filter(Boolean);
        }
      } catch (_) {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  return [];
}

function validatePublishReadiness(event, tiers) {
  const failures = [];
  const eventStartDateTime = event.date && event.time
    ? new Date(`${new Date(event.date).toISOString().slice(0, 10)}T${String(event.time).slice(0, 8)}`)
    : null;

  if (!event.title?.trim()) failures.push('Event title is required.');
  if (!event.description?.trim() || event.description.trim().length < 20) {
    failures.push('Event description must be at least 20 characters.');
  }
  if (!event.category?.trim()) failures.push('Event category is required.');
  if (!event.location?.trim()) failures.push('Event city/location is required.');
  if (!event.venue?.trim()) failures.push('Event venue is required.');
  if (!event.date) failures.push('Event date is required.');
  if (!event.time?.trim()) failures.push('Event time is required.');

  const imageList = parseImages(event.images);
  if (!imageList.length) failures.push('At least one event image is required.');

  if (event.bookingStartAt && event.bookingEndAt && event.bookingStartAt >= event.bookingEndAt) {
    failures.push('Booking start time must be before booking end time.');
  }

  if (event.bookingEndAt && eventStartDateTime && event.bookingEndAt > eventStartDateTime) {
    failures.push('Booking end time cannot be after event start time.');
  }

  if (event.taxPercent < 0 || event.taxPercent > 100) {
    failures.push('Tax percent must be between 0 and 100.');
  }

  if (event.platformFeeValue < 0) {
    failures.push('Platform fee value cannot be negative.');
  }

  if (event.platformFeeType === 'PERCENT' && event.platformFeeValue > 100) {
    failures.push('Platform fee percent must be between 0 and 100.');
  }

  if (!VISIBILITY_TYPES.includes(event.visibility)) {
    failures.push('Visibility value is invalid.');
  }

  if (event.visibility !== 'PUBLIC' && (!event.accessCode || event.accessCode.length < 4)) {
    failures.push('Access code with minimum 4 characters is required for private/invite events.');
  }

  if (!BOOKING_FORMATS.includes(event.bookingFormat)) {
    failures.push('Booking format must be SEAT, TIER, or HYBRID.');
  }

  const requiresSeatConfig = event.bookingFormat === 'SEAT' || event.bookingFormat === 'HYBRID';
  const requiresTierConfig = event.bookingFormat === 'TIER' || event.bookingFormat === 'HYBRID';

  if (requiresSeatConfig) {
    if (!event.totalSlots || event.totalSlots <= 0) {
      failures.push('Total slots must be greater than 0 for seat-based or hybrid events.');
    }
    if (!event.seatLayout?.trim()) {
      failures.push('Seat layout is required for seat-based or hybrid events.');
    }
    if (event.seatLayout !== 'openground') {
      if (!event.seatRows || event.seatRows <= 0) {
        failures.push('Seat rows must be greater than 0 for non-open-ground layouts.');
      }
      if (!event.seatsPerRow || event.seatsPerRow <= 0) {
        failures.push('Seats per row must be greater than 0 for non-open-ground layouts.');
      }
    }
  }

  if (requiresTierConfig) {
    if (!tiers.length) {
      failures.push('At least one ticket tier is required for tier-based or hybrid events.');
    }

    const invalidTier = tiers.find((tier) => {
      return !tier.name || tier.price <= 0 || tier.quantity <= 0;
    });

    if (invalidTier) {
      failures.push('Every tier must include valid name, price, and quantity.');
    }
  }

  const totalTierQuantity = tiers.reduce((sum, tier) => sum + (tier.quantity || 0), 0);
  if (requiresTierConfig && requiresSeatConfig && totalTierQuantity !== event.totalSlots) {
    failures.push('Total tier quantity must exactly match total slots for hybrid events.');
  }

  return {
    canPublish: failures.length === 0,
    failures,
  };
}

async function loadEventForValidation(eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      tiers: true,
    },
  });
  if (!event) return null;
  return event;
}

function isAdminUser(user) {
  return String(user?.role || '').toUpperCase() === 'ADMIN';
}

async function resolvePartnerIdOrThrow(partnerId) {
  const partner = await prisma.user.findUnique({
    where: { id: String(partnerId || '') },
    select: { id: true, role: true, status: true },
  });
  if (!partner) throw new Error('Partner not found');
  if (String(partner.role || '').toUpperCase() !== 'PARTNER') {
    throw new Error('Selected user is not a PARTNER');
  }
  if (String(partner.status || '').toUpperCase() !== 'ACTIVE') {
    throw new Error('Selected partner is not ACTIVE');
  }
  return partner.id;
}

async function loadEventForManagement(eventId) {
  return prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, partnerId: true },
  });
}

function hasEventManagementAccess(user, event) {
  if (!user || !event) return false;
  if (isAdminUser(user)) return true;
  return String(event.partnerId) === String(user.id);
}

// GET /api/events - List all events (with search, filters, pagination)
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const { search, category, city, minPrice, maxPrice, featured, sort, includeHidden, page = 1, limit = 20 } = req.query;
    
    const where = {};

    if (includeHidden !== 'true') {
      where.isPublished = true;
      where.status = 'ACTIVE';
      where.visibility = 'PUBLIC';
      
      // Hide past events for public users
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.date = { gte: today };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category && category !== 'ALL') where.category = category;
    if (city) where.location = { contains: city, mode: 'insensitive' };
    if (featured === 'true') where.featured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'date') orderBy = { date: 'asc' };
    if (sort === 'popular') orderBy = { bookings: { _count: 'desc' } };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          tiers: true,
          _count: { select: { bookings: true, reviews: true } }
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      message: 'Success',
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/search?q=term - Quick search for navbar
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ data: [] });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        status: 'ACTIVE',
        visibility: 'PUBLIC',
        date: { gte: today },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { venue: { contains: q, mode: 'insensitive' } },
        ]
      },
      select: { id: true, title: true, location: true, date: true, price: true, images: true, category: true },
      take: 6,
      orderBy: { date: 'asc' }
    });
    res.json({ data: events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/categories - Get categories with count
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.event.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/stats - Admin/Partner stats aggregation
router.get('/stats', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);
    const userId = req.user.id;

    const whereEvent = isAdmin ? {} : { partnerId: userId };
    const whereBooking = isAdmin ? {} : { event: { partnerId: userId } };
    const wherePayment = isAdmin ? {} : { booking: { event: { partnerId: userId } } };

    const [totalEvents, totalBookings, revenue, totalUsers] = await Promise.all([
      prisma.event.count({ where: whereEvent }),
      prisma.booking.count({ where: whereBooking }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { ...wherePayment, status: 'SUCCESS' }
      }),
      isAdmin ? prisma.user.count() : prisma.booking.groupBy({
        by: ['userId'],
        where: whereBooking,
      }).then(res => res.length)
    ]);

    res.json({
      data: {
        totalEvents,
        totalBookings,
        totalRevenue: revenue._sum.amount || 0,
        totalUsers: isAdmin ? totalUsers : totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/manage/list - Admin/Partner scoped event list for dashboard management
router.get('/manage/list', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const { search, category, city, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

    const where = {};
    if (!isAdminUser(req.user)) {
      where.partnerId = req.user.id;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category && category !== 'ALL') where.category = category;
    if (city) where.location = { contains: city, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'date') orderBy = { date: 'asc' };
    if (sort === 'popular') orderBy = { bookings: { _count: 'desc' } };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit, 10),
        include: {
          tiers: true,
          _count: { select: { bookings: true, reviews: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return res.json({
      message: 'Success',
      data: events,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/manage/:id - Admin/Partner scoped event detail for edit forms
router.get('/manage/:id', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, managedEvent)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        tiers: { orderBy: { price: 'desc' } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json({ message: 'Success', data: event });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/shows - Create a show with optional seat inventory
router.post('/:id/shows', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      showDate,
      startTime,
      endTime,
      venue,
      bookingStartAt,
      bookingEndAt,
      seats = [],
    } = req.body;

    if (!showDate || !startTime) {
      return res.status(400).json({ error: 'showDate and startTime are required' });
    }

    const event = await loadEventForManagement(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, event)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    const normalizedSeats = [...new Set((seats || [])
      .map((seat) => ({
        seatCode: String(seat.seatCode || '').trim().toUpperCase(),
        section: seat.section || null,
        price: seat.price !== undefined ? parseFloat(seat.price) : null,
      }))
      .filter((seat) => Boolean(seat.seatCode)))];

    const newShow = await prisma.show.create({
      data: {
        eventId,
        venue: venue || null,
        showDate: new Date(showDate),
        startTime,
        endTime: endTime || null,
        bookingStartAt: bookingStartAt ? new Date(bookingStartAt) : null,
        bookingEndAt: bookingEndAt ? new Date(bookingEndAt) : null,
        seats: normalizedSeats.length ? {
          create: normalizedSeats,
        } : undefined,
      },
      include: {
        seats: true,
      },
    });

    return res.status(201).json({ message: 'Show created successfully', data: newShow });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:id/shows - List shows with seat stats for an event
router.get('/:id/shows', async (req, res) => {
  try {
    const eventId = req.params.id;
    const shows = await prisma.show.findMany({
      where: { eventId },
      include: {
        seats: {
          select: { status: true },
        },
      },
      orderBy: { showDate: 'asc' },
    });

    const enriched = shows.map((show) => {
      const stats = show.seats.reduce((acc, seat) => {
        acc.total += 1;
        if (seat.status === 'AVAILABLE') acc.available += 1;
        if (seat.status === 'BOOKED') acc.booked += 1;
        if (seat.status === 'LOCKED') acc.locked += 1;
        return acc;
      }, { total: 0, available: 0, booked: 0, locked: 0 });

      return {
        ...show,
        seatStats: stats,
      };
    });

    return res.json({ message: 'Success', data: enriched });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/shows/:showId/seats - Seat inventory for a show
router.get('/shows/:showId/seats', async (req, res) => {
  try {
    const { showId } = req.params;
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        event: { select: { id: true, title: true } },
        seats: {
          orderBy: { seatCode: 'asc' },
        },
      },
    });

    if (!show) return res.status(404).json({ error: 'Show not found' });
    return res.json({ message: 'Success', data: show });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:id - Get event details with tiers & reviews
router.get('/:id', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const includeHidden = req.query.includeHidden === 'true';
    const accessCode = req.query.accessCode ? String(req.query.accessCode) : null;

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        tiers: { orderBy: { price: 'desc' } },
        partner: { select: { id: true, name: true, avatar: true } },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: { select: { bookings: true, reviews: true } }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (!includeHidden) {
      if (!event.isPublished || event.status !== 'ACTIVE') {
        return res.status(404).json({ error: 'Event not found' });
      }
      if (event.visibility !== 'PUBLIC' && event.accessCode !== accessCode) {
        return res.status(403).json({ error: 'Access code required for this event' });
      }
    }

    res.json({ message: 'Success', data: event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/events - Create event with tiers
router.post('/', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);
    const partnerAttemptedFeeEdit = !isAdmin && (
      req.body.taxPercent !== undefined ||
      req.body.platformFeeType !== undefined ||
      req.body.platformFeeValue !== undefined
    );
    if (partnerAttemptedFeeEdit) {
      return res.status(403).json({ error: 'Only admins can set tax and platform fee.' });
    }

    const requestedPartnerId = req.body.partnerId;
    const partnerId = isAdmin
      ? (requestedPartnerId ? await resolvePartnerIdOrThrow(requestedPartnerId) : req.user.id)
      : req.user.id;

    const bookingFormat = normalizeEnum(req.body.bookingFormat, BOOKING_FORMATS, 'HYBRID');
    const visibility = normalizeEnum(req.body.visibility, VISIBILITY_TYPES, 'PUBLIC');
    const platformFeeType = isAdmin
      ? normalizeEnum(req.body.platformFeeType, PLATFORM_FEE_TYPES, 'PERCENT')
      : 'PERCENT';
    const taxPercent = isAdmin ? (parseFloat(req.body.taxPercent) || 0) : 0;
    const platformFeeValue = isAdmin ? (parseFloat(req.body.platformFeeValue) || 0) : 0;
    const tiers = (req.body.tiers || []).map((tier) => ({
      name: String(tier.name || '').trim(),
      price: parseFloat(tier.price) || 0,
      quantity: parseInt(tier.quantity) || 0,
      description: tier.description || '',
      color: tier.color || 'rose',
    }));
    const totalSlots = parseInt(req.body.totalSlots) || tiers.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
    const minPrice = tiers.length > 0
      ? Math.min(...tiers.map(t => parseFloat(t.price) || 0))
      : parseFloat(req.body.price) || 0;
    const images = parseImages(req.body.images || req.body.image || '');
    const bookingStartAt = parseDateOrNull(req.body.bookingStartAt);
    const bookingEndAt = parseDateOrNull(req.body.bookingEndAt);
    const publishNow = Boolean(req.body.publishNow);

    const newEvent = await prisma.event.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        terms: req.body.terms || "",
        language: req.body.language || "English",
        ageLimit: req.body.ageLimit || "Entry allowed for all ages",
        ticketAgeLimit: req.body.ticketAgeLimit || "Ticket needed for all ages",
        layout: req.body.layout || "Indoor",
        seating: req.body.seatingPreference || (typeof req.body.seating === 'string' ? req.body.seating : "Seated"),
        kidsAllowed: req.body.kidsAllowed ?? true,
        petsAllowed: req.body.petsAllowed ?? false,
        category: req.body.category || 'MUSIC',
        bookingFormat,
        visibility,
        accessCode: visibility === 'PUBLIC' ? null : (req.body.accessCode || null),
        location: req.body.location,
        venue: req.body.venue,
        date: new Date(req.body.date),
        time: req.body.time,
        duration: req.body.duration || null,
        bookingStartAt,
        bookingEndAt,
        price: minPrice,
        currency: String(req.body.currency || 'INR').toUpperCase(),
        taxPercent,
        platformFeeType,
        platformFeeValue,
        totalSlots: parseInt(req.body.totalSlots) || parseInt(req.body.seatingConfig?.totalCapacity) || parseInt(req.body.seating?.totalCapacity) || totalSlots,
        availableSlots: parseInt(req.body.totalSlots) || parseInt(req.body.seatingConfig?.totalCapacity) || parseInt(req.body.seating?.totalCapacity) || totalSlots,
        images: JSON.stringify(images),
        seatLayout: req.body.seatingConfig?.seatLayout || req.body.seating?.seatLayout || req.body.seatLayout || 'standard',
        seatRows: parseInt(req.body.seatingConfig?.rows) || parseInt(req.body.seating?.rows) || null,
        seatsPerRow: parseInt(req.body.seatingConfig?.seatsPerRow) || parseInt(req.body.seating?.seatsPerRow) || null,
        numberedSeats: req.body.seatingConfig?.hasNumberedSeats ?? req.body.seating?.hasNumberedSeats ?? true,
        seatSelection: req.body.seatingConfig?.allowSeatSelection ?? req.body.seating?.allowSeatSelection ?? true,
        featured: req.body.featured || false,
        tags: JSON.stringify(req.body.tags || []),
        mapLink: req.body.mapLink || null,
        status: 'DRAFT',
        isPublished: false,
        partnerId: partnerId,
        tiers: tiers.length > 0 ? {
          create: tiers.map(tier => ({
            name: tier.name,
            price: parseFloat(tier.price),
            quantity: parseInt(tier.quantity),
            available: parseInt(tier.quantity),
            description: tier.description || '',
            color: tier.color || 'rose',
          }))
        } : undefined
      },
      include: { tiers: true }
    });

    if (publishNow) {
      const reloaded = await loadEventForValidation(newEvent.id);
      const check = validatePublishReadiness(reloaded, reloaded.tiers);
      if (!check.canPublish) {
        return res.status(422).json({
          error: 'Event saved as draft but failed publish validation',
          data: newEvent,
          validation: check,
        });
      }

      const published = await prisma.event.update({
        where: { id: newEvent.id },
        data: {
          status: 'ACTIVE',
          isPublished: true,
          publishedAt: new Date(),
        },
        include: { tiers: true },
      });

      return res.status(201).json({ message: 'Event created and published successfully', data: published });
    }

    res.status(201).json({ message: 'Event saved as draft', data: newEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);
    const partnerAttemptedFeeEdit = !isAdmin && (
      req.body.taxPercent !== undefined ||
      req.body.platformFeeType !== undefined ||
      req.body.platformFeeValue !== undefined
    );
    if (partnerAttemptedFeeEdit) {
      return res.status(403).json({ error: 'Only admins can edit tax and platform fee.' });
    }

    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, managedEvent)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    const updateData = {};
    const fields = [
      'title',
      'description',
      'terms',
      'category',
      'location',
      'venue',
      'time',
      'status',
      'featured',
      'accessCode',
      'currency',
      'mapLink',
      'duration',
      'language',
      'ageLimit',
      'ticketAgeLimit',
      'layout',
      'seating',
      'kidsAllowed',
      'petsAllowed',
    ];
    fields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

    if (req.body.date) updateData.date = new Date(req.body.date);
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.totalSlots) updateData.totalSlots = parseInt(req.body.totalSlots);
    if (req.body.bookingStartAt !== undefined) updateData.bookingStartAt = parseDateOrNull(req.body.bookingStartAt);
    if (req.body.bookingEndAt !== undefined) updateData.bookingEndAt = parseDateOrNull(req.body.bookingEndAt);
    if (req.body.bookingFormat) updateData.bookingFormat = normalizeEnum(req.body.bookingFormat, BOOKING_FORMATS, 'HYBRID');
    if (req.body.visibility) updateData.visibility = normalizeEnum(req.body.visibility, VISIBILITY_TYPES, 'PUBLIC');
    if (isAdmin && req.body.taxPercent !== undefined) updateData.taxPercent = parseFloat(req.body.taxPercent) || 0;
    if (isAdmin && req.body.platformFeeType) updateData.platformFeeType = normalizeEnum(req.body.platformFeeType, PLATFORM_FEE_TYPES, 'PERCENT');
    if (isAdmin && req.body.platformFeeValue !== undefined) updateData.platformFeeValue = parseFloat(req.body.platformFeeValue) || 0;
    if (req.body.images !== undefined || req.body.image !== undefined) {
      updateData.images = JSON.stringify(parseImages(req.body.images || req.body.image || ''));
    }
    if (req.body.tags !== undefined) {
      updateData.tags = JSON.stringify(req.body.tags || []);
    }

    const sCfg = (req.body.seatingConfig && typeof req.body.seatingConfig === 'object') 
      ? req.body.seatingConfig 
      : (req.body.seating && typeof req.body.seating === 'object' ? req.body.seating : null);

    if (sCfg) {
      updateData.seatLayout = sCfg.seatLayout || 'standard';
      updateData.seatRows = parseInt(sCfg.rows) || null;
      updateData.seatsPerRow = parseInt(sCfg.seatsPerRow) || null;
      updateData.numberedSeats = sCfg.hasNumberedSeats ?? true;
      updateData.seatSelection = sCfg.allowSeatSelection ?? true;

      // Map totalCapacity to totalSlots if we are in the seating config
      if (sCfg.totalCapacity && !req.body.totalSlots) {
        updateData.totalSlots = parseInt(sCfg.totalCapacity);
      }
    }

    if (req.body.seatingPreference) {
      updateData.seating = String(req.body.seatingPreference);
    } else if (req.body.seating && typeof req.body.seating === 'string') {
      updateData.seating = req.body.seating;
    } else if (sCfg) {
      // If it was an object, we must overwrite it with a default string to satisfy Prisma
      updateData.seating = "Seated";
    }

    if (isAdminUser(req.user) && req.body.partnerId !== undefined) {
      updateData.partnerId = await resolvePartnerIdOrThrow(req.body.partnerId);
    }

    if (updateData.visibility === 'PUBLIC') {
      updateData.accessCode = null;
    }

    if (req.body.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Use publish endpoint to activate an event.' });
    }

    let updated;
    if (Array.isArray(req.body.tiers)) {
      const normalizedTiers = req.body.tiers
        .map((tier) => ({
          name: String(tier.name || '').trim(),
          price: parseFloat(tier.price) || 0,
          quantity: parseInt(tier.quantity) || 0,
          description: tier.description || '',
          color: tier.color || 'rose',
        }))
        .filter((tier) => tier.name && tier.price > 0 && tier.quantity > 0);

      const totalTierQuantity = normalizedTiers.reduce((sum, tier) => sum + tier.quantity, 0);
      if (!updateData.totalSlots && updateData.bookingFormat !== 'SEAT') {
        updateData.totalSlots = totalTierQuantity;
      }
      if (!updateData.price && normalizedTiers.length > 0) {
        updateData.price = Math.min(...normalizedTiers.map((tier) => tier.price));
      }

      updated = await prisma.$transaction(async (tx) => {
        await tx.tier.deleteMany({ where: { eventId: req.params.id } });
        const event = await tx.event.update({
          where: { id: req.params.id },
          data: {
            ...updateData,
            tiers: normalizedTiers.length
              ? {
                  create: normalizedTiers.map((tier) => ({
                    ...tier,
                    available: tier.quantity,
                  })),
                }
              : undefined,
          },
          include: { tiers: true },
        });
        return event;
      });
    } else {
      updated = await prisma.event.update({
        where: { id: req.params.id },
        data: updateData,
        include: { tiers: true }
      });
    }

    res.json({ message: 'Event updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/assign-partner', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });

    const partnerId = await resolvePartnerIdOrThrow(req.body?.partnerId);
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { partnerId },
      include: {
        tiers: true,
        _count: { select: { bookings: true, reviews: true } },
        partner: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({ message: 'Event partner assignment updated', data: updated });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/events/:id/validate-publish - Validate event readiness
router.post('/:id/validate-publish', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, managedEvent)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    const event = await loadEventForValidation(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const validation = validatePublishReadiness(event, event.tiers);
    return res.json({ message: 'Validation complete', data: validation });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/publish - Admin publishes, Partner requests approval
router.post('/:id/publish', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const isAdmin = isAdminUser(req.user);
    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, managedEvent)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    const event = await loadEventForValidation(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const validation = validatePublishReadiness(event, event.tiers);
    if (!validation.canPublish) {
      return res.status(422).json({ error: 'Event is incomplete and cannot be published', data: validation });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        status: isAdmin ? 'ACTIVE' : 'PENDING',
        isPublished: isAdmin, // Only true if Admin publishes
        publishedAt: isAdmin ? new Date() : null,
      },
      include: { tiers: true },
    });

    return res.json({ 
      message: isAdmin ? 'Event published successfully' : 'Event submitted for approval', 
      data: updated 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/approve - Admin only approval
router.post('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    if (event.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending events can be approved' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return res.json({ message: 'Event approved and published', data: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/reject - Admin only rejection
router.post('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    if (event.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending events can be rejected' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        isPublished: false,
      },
    });

    return res.json({ message: 'Event rejected', data: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/unpublish - Move event back to draft
router.post('/:id/unpublish', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, managedEvent)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        status: 'DRAFT',
        isPublished: false,
        publishedAt: null,
      },
      include: { tiers: true },
    });

    return res.json({ message: 'Event moved to draft', data: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:id/attendees/export - Export event attendees to CSV
router.get('/:id/attendees/export', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, managedEvent)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId: req.params.id, status: 'CONFIRMED' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { tier: true } },
        payment: { select: { amount: true, method: true, transactionId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['Booking ID', 'Date', 'User Name', 'User Email', 'User Phone', 'Quantity', 'Amount', 'Payment Method', 'Transaction ID', 'Ticket Tiers'];
    const rows = bookings.map(b => {
      const tiersStr = b.items.map(i => `${i.quantity}x ${i.tier.name}`).join('; ');
      return [
        b.id,
        b.createdAt.toISOString(),
        `"${b.user?.name || ''}"`,
        `"${b.user?.email || ''}"`,
        `"${b.user?.phone || ''}"`,
        b.quantity,
        b.payment?.amount || b.totalAmount,
        b.payment?.method || '',
        `"${b.payment?.transactionId || ''}"`,
        `"${tiersStr}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees.csv"`);
    res.send(csvContent);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/events/:id - Delete event (cascades to tiers)
router.delete('/:id', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const managedEvent = await loadEventForManagement(req.params.id);
    if (!managedEvent) return res.status(404).json({ error: 'Event not found' });
    if (!hasEventManagementAccess(req.user, managedEvent)) {
      return res.status(403).json({ error: 'You do not have permission to manage this event' });
    }

    await prisma.$transaction(async (tx) => {
      // Manually delete related records that do not have onDelete: Cascade
      await tx.bookingItem.deleteMany({ where: { booking: { eventId: req.params.id } } });
      await tx.bookingSeat.deleteMany({ where: { booking: { eventId: req.params.id } } });
      await tx.payment.deleteMany({ where: { booking: { eventId: req.params.id } } });
      await tx.booking.deleteMany({ where: { eventId: req.params.id } });
      await tx.review.deleteMany({ where: { eventId: req.params.id } });
      
      // Finally, delete the event (this cascades to tiers and shows based on schema)
      await tx.event.delete({
        where: { id: req.params.id }
      });
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
