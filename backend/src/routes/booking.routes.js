const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  SeatLockError,
  assertLockOwnership,
  lockSeats,
  normalizeSeatNumbers,
  releaseSeats,
} = require('../services/seatLock.service');
const {
  beginIdempotentRequest,
  clearIdempotentRequest,
  completeIdempotentRequest,
} = require('../services/idempotency.service');
const { validate, seatLockSchema, bookingConfirmSchema } = require('../middleware/validator');
const { emitSeatStateUpdate } = require('../lib/realtime');

function rowLabelToIndex(rowLabel) {
  let index = 0;
  for (const char of rowLabel) {
    index = (index * 26) + (char.charCodeAt(0) - 64);
  }
  return index;
}

function isValidSeatCode(seatCode, maxRows, seatsPerRow) {
  const match = /^([A-Z]+)(\d+)$/.exec(seatCode);
  if (!match) return false;

  const rowIndex = rowLabelToIndex(match[1]);
  const seatIndex = parseInt(match[2], 10);

  if (!Number.isInteger(rowIndex) || !Number.isInteger(seatIndex)) {
    return false;
  }

  if (maxRows && rowIndex > maxRows) {
    return false;
  }

  if (seatsPerRow && seatIndex > seatsPerRow) {
    return false;
  }

  return seatIndex > 0;
}

function extractBookedSeatSet(bookings) {
  const booked = new Set();
  for (const booking of bookings) {
    if (!booking.seatNumbers) continue;
    try {
      const seats = JSON.parse(booking.seatNumbers);
      if (Array.isArray(seats)) {
        for (const seat of seats) {
          booked.add(String(seat).toUpperCase());
        }
      }
    } catch (_) {
      // Ignore malformed historical seat payloads.
    }
  }
  return booked;
}

function idempotencyKeyFromRequest(req) {
  return req.get('idempotency-key') || req.body.idempotencyKey || null;
}

async function getHydratedSeatBooking(bookingId) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      event: { select: { id: true, title: true, date: true, venue: true } },
      show: { select: { id: true, showDate: true, startTime: true, endTime: true } },
      payment: true,
      bookingSeats: {
        include: {
          showSeat: { select: { id: true, seatCode: true, section: true, price: true } },
        },
      },
    },
  });
}

// GET /api/bookings - List user bookings (or all for admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const { status, page = 1, limit = 20 } = req.query;

    const where = isAdmin ? {} : { userId };
    if (status && status !== 'All') where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          event: { select: { id: true, title: true, date: true, venue: true, location: true, images: true } },
          show: { select: { id: true, showDate: true, startTime: true, endTime: true } },
          user: { select: { id: true, name: true, email: true, avatar: true } },
          payment: true,
          items: { include: { tier: true } },
          bookingSeats: {
            include: { showSeat: { select: { id: true, seatCode: true, section: true, price: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      message: 'Success',
      data: bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/manage/list - Admin/Partner scoped bookings for dashboard
router.get('/manage/list', authenticateToken, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const isAdmin = req.user.role === 'ADMIN';
    const userId = req.user.id;

    const where = isAdmin ? {} : { event: { partnerId: userId } };
    
    if (status && status !== 'All') where.status = status;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          event: { select: { id: true, title: true, date: true, venue: true, images: true } },
          show: { select: { id: true, showDate: true, startTime: true, endTime: true } },
          user: { select: { id: true, name: true, email: true } },
          payment: true,
          items: { include: { tier: true } },
          bookingSeats: {
            include: { showSeat: { select: { id: true, seatCode: true, section: true, price: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      message: 'Success',
      data: bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/all - Admin: list ALL bookings (SECURED)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status && status !== 'All') where.status = status;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          event: { select: { id: true, title: true, date: true, venue: true, images: true } },
          show: { select: { id: true, showDate: true, startTime: true, endTime: true } },
          user: { select: { id: true, name: true, email: true } },
          payment: true,
          items: { include: { tier: true } },
          bookingSeats: {
            include: { showSeat: { select: { id: true, seatCode: true, section: true, price: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      message: 'Success',
      data: bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/seat-locks - lock seats for the current user
router.post('/seat-locks', authenticateToken, validate(seatLockSchema), async (req, res) => {
  try {
    const { eventId, seatNumbers = [] } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const normalizedSeats = normalizeSeatNumbers(seatNumbers);
    if (!normalizedSeats.length) {
      return res.status(400).json({ error: 'At least one seat must be selected' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, seatRows: true, seatsPerRow: true, seatSelection: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.seatSelection) {
      return res.status(400).json({ error: 'Seat selection is disabled for this event' });
    }

    const invalidSeat = normalizedSeats.find(
      (seat) => !isValidSeatCode(seat, event.seatRows, event.seatsPerRow)
    );
    if (invalidSeat) {
      return res.status(400).json({ error: `Invalid seat code: ${invalidSeat}` });
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        eventId,
        status: { in: ['CONFIRMED', 'PENDING', 'USED'] },
      },
      select: { seatNumbers: true },
    });
    const bookedSeatSet = extractBookedSeatSet(existingBookings);

    const alreadyBookedSeat = normalizedSeats.find((seat) => bookedSeatSet.has(seat));
    if (alreadyBookedSeat) {
      return res.status(409).json({ error: `Seat ${alreadyBookedSeat} is already booked` });
    }

    const lockResult = await lockSeats({
      eventId,
      userId,
      seatNumbers: normalizedSeats,
    });

    emitSeatStateUpdate({
      scopeType: 'event',
      scopeId: eventId,
      seatNumbers: lockResult.seatNumbers,
      status: 'LOCKED',
      userId,
      meta: { expiresIn: lockResult.ttlSeconds },
    });

    res.status(201).json({
      message: 'Seats locked successfully',
      data: {
        eventId,
        seatNumbers: lockResult.seatNumbers,
        expiresIn: lockResult.ttlSeconds,
      },
    });
  } catch (error) {
    if (error instanceof SeatLockError) {
      return res.status(409).json({ error: error.message, details: error.details });
    }

    res.status(500).json({ error: error.message });
  }
});

// POST /api/bookings/seat-locks/release - release currently held seat locks
router.post('/seat-locks/release', authenticateToken, async (req, res) => {
  try {
    const { eventId, seatNumbers = [] } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const result = await releaseSeats({
      eventId,
      userId,
      seatNumbers,
      onlyIfOwned: true,
    });

    if (result.releasedCount > 0) {
      emitSeatStateUpdate({
        scopeType: 'event',
        scopeId: eventId,
        seatNumbers: result.seatNumbers,
        status: 'AVAILABLE',
        userId,
      });
    }

    res.json({
      message: 'Seat locks released',
      data: {
        eventId,
        releasedCount: result.releasedCount,
        seatNumbers: result.seatNumbers,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/bookings/seat-bookings/confirm - confirm locked seats after payment
router.post('/seat-bookings/confirm', authenticateToken, validate(bookingConfirmSchema), async (req, res) => {
  const { eventId, seatNumbers = [], totalAmount, paymentMethod = 'MOCK' } = req.body;
  const userId = req.user.id;
  const idempotencyKey = idempotencyKeyFromRequest(req);

  if (!eventId) {
    return res.status(400).json({ error: 'eventId is required' });
  }

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'idempotency-key header (or idempotencyKey body) is required' });
  }

  const normalizedSeats = normalizeSeatNumbers(seatNumbers);
  if (!normalizedSeats.length) {
    return res.status(400).json({ error: 'At least one seat must be selected' });
  }

  const idemState = await beginIdempotentRequest({
    scope: `event-seat-confirm:${eventId}`,
    userId,
    idempotencyKey,
  });

  if (idemState.state === 'replay') {
    return res.status(200).json({
      message: 'Seat booking already confirmed (idempotent replay)',
      data: idemState.cachedResponse,
      idempotentReplay: true,
    });
  }

  if (idemState.state === 'in-progress') {
    return res.status(409).json({ error: 'A request with this idempotency key is already in progress' });
  }

  try {
    await assertLockOwnership({ eventId, userId, seatNumbers: normalizedSeats });

    const booking = await prisma.$transaction(async (tx) => {
      // Serialize seat confirmations per event to prevent race conditions.
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;

      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: { id: true, price: true, availableSlots: true, seatRows: true, seatsPerRow: true, seatSelection: true },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (!event.seatSelection) {
        throw new Error('Seat selection is disabled for this event');
      }

      const invalidSeat = normalizedSeats.find(
        (seat) => !isValidSeatCode(seat, event.seatRows, event.seatsPerRow)
      );
      if (invalidSeat) {
        throw new Error(`Invalid seat code: ${invalidSeat}`);
      }

      const bookedRows = await tx.booking.findMany({
        where: {
          eventId,
          status: { in: ['CONFIRMED', 'PENDING', 'USED'] },
        },
        select: { seatNumbers: true },
      });
      const bookedSet = extractBookedSeatSet(bookedRows);
      const conflictingSeat = normalizedSeats.find((seat) => bookedSet.has(seat));

      if (conflictingSeat) {
        throw new Error(`Seat ${conflictingSeat} is already booked`);
      }

      if (event.availableSlots < normalizedSeats.length) {
        throw new Error('Not enough available seats');
      }

      const finalAmount = parseFloat(event.price) * normalizedSeats.length;
      
      // Verification log if client tried to send a different amount
      if (totalAmount && Math.abs(parseFloat(totalAmount) - finalAmount) > 0.01) {
        console.warn(`[Security] User ${userId} attempted to pay ${totalAmount} for seats costing ${finalAmount}`);
      }

      const createdBooking = await tx.booking.create({
        data: {
          quantity: normalizedSeats.length,
          totalAmount: finalAmount,
          status: 'CONFIRMED',
          seatNumbers: JSON.stringify(normalizedSeats),
          qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          userId,
          eventId,
        },
      });

      await tx.event.update({
        where: { id: eventId },
        data: {
          availableSlots: { decrement: normalizedSeats.length },
        },
      });

      await tx.payment.create({
        data: {
          amount: finalAmount,
          method: paymentMethod,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'SUCCESS',
          bookingId: createdBooking.id,
        },
      });

      return createdBooking;
    });

    await releaseSeats({
      eventId,
      userId,
      seatNumbers: normalizedSeats,
      onlyIfOwned: true,
    });

    emitSeatStateUpdate({
      scopeType: 'event',
      scopeId: eventId,
      seatNumbers: normalizedSeats,
      status: 'BOOKED',
      userId,
      meta: { bookingId: booking.id },
    });

    const hydratedBooking = await getHydratedSeatBooking(booking.id);
    await completeIdempotentRequest({
      redisKey: idemState.redisKey,
      responsePayload: hydratedBooking,
    });

    return res.status(201).json({
      message: 'Seat booking confirmed',
      data: hydratedBooking,
    });
  } catch (error) {
    await clearIdempotentRequest({ redisKey: idemState.redisKey });

    if (error instanceof SeatLockError) {
      return res.status(409).json({ error: error.message, details: error.details });
    }

    return res.status(400).json({ error: error.message });
  }
});

// POST /api/bookings/shows/:showId/seat-locks - lock seats in a specific show
router.post('/shows/:showId/seat-locks', authenticateToken, validate(seatLockSchema), async (req, res) => {
  try {
    const { showId } = req.params;
    const { seatNumbers = [] } = req.body;
    const userId = req.user.id;

    const normalizedSeats = normalizeSeatNumbers(seatNumbers);
    if (!normalizedSeats.length) {
      return res.status(400).json({ error: 'At least one seat must be selected' });
    }

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        seats: {
          where: { seatCode: { in: normalizedSeats } },
          select: { id: true, seatCode: true, status: true },
        },
      },
    });

    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }

    if (show.seats.length !== normalizedSeats.length) {
      return res.status(400).json({ error: 'One or more seat codes are not present in this show inventory' });
    }

    const unavailableSeat = show.seats.find((seat) => seat.status !== 'AVAILABLE');
    if (unavailableSeat) {
      return res.status(409).json({ error: `Seat ${unavailableSeat.seatCode} is not available` });
    }

    const lockResult = await lockSeats({
      scopeKey: `show:${showId}`,
      userId,
      seatNumbers: normalizedSeats,
    });

    emitSeatStateUpdate({
      scopeType: 'show',
      scopeId: showId,
      seatNumbers: lockResult.seatNumbers,
      status: 'LOCKED',
      userId,
      meta: { expiresIn: lockResult.ttlSeconds },
    });

    return res.status(201).json({
      message: 'Show seats locked successfully',
      data: {
        showId,
        seatNumbers: lockResult.seatNumbers,
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

// POST /api/bookings/shows/:showId/seat-locks/release - release show seat locks owned by current user
router.post('/shows/:showId/seat-locks/release', authenticateToken, async (req, res) => {
  try {
    const { showId } = req.params;
    const { seatNumbers = [] } = req.body;
    const userId = req.user.id;

    const result = await releaseSeats({
      scopeKey: `show:${showId}`,
      userId,
      seatNumbers,
      onlyIfOwned: true,
    });

    if (result.releasedCount > 0) {
      emitSeatStateUpdate({
        scopeType: 'show',
        scopeId: showId,
        seatNumbers: result.seatNumbers,
        status: 'AVAILABLE',
        userId,
      });
    }

    return res.json({
      message: 'Show seat locks released',
      data: {
        showId,
        releasedCount: result.releasedCount,
        seatNumbers: result.seatNumbers,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/bookings/shows/:showId/seat-bookings/confirm - confirm show seats after payment
router.post('/shows/:showId/seat-bookings/confirm', authenticateToken, validate(bookingConfirmSchema), async (req, res) => {
  const { showId } = req.params;
  const { seatNumbers = [], totalAmount, paymentMethod = 'RAZORPAY' } = req.body;
  const userId = req.user.id;
  const idempotencyKey = idempotencyKeyFromRequest(req);

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'idempotency-key header (or idempotencyKey body) is required' });
  }

  const normalizedSeats = normalizeSeatNumbers(seatNumbers);
  if (!normalizedSeats.length) {
    return res.status(400).json({ error: 'At least one seat must be selected' });
  }

  const idemState = await beginIdempotentRequest({
    scope: `show-seat-confirm:${showId}`,
    userId,
    idempotencyKey,
  });

  if (idemState.state === 'replay') {
    return res.status(200).json({
      message: 'Show seat booking already confirmed (idempotent replay)',
      data: idemState.cachedResponse,
      idempotentReplay: true,
    });
  }

  if (idemState.state === 'in-progress') {
    return res.status(409).json({ error: 'A request with this idempotency key is already in progress' });
  }

  try {
    await assertLockOwnership({
      scopeKey: `show:${showId}`,
      userId,
      seatNumbers: normalizedSeats,
    });

    const booking = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Show" WHERE id = ${showId} FOR UPDATE`;

      const show = await tx.show.findUnique({
        where: { id: showId },
        include: {
          event: { select: { id: true, price: true } },
          seats: {
            where: { seatCode: { in: normalizedSeats } },
            select: { id: true, seatCode: true, status: true, price: true },
          },
        },
      });

      if (!show) {
        throw new Error('Show not found');
      }

      if (show.seats.length !== normalizedSeats.length) {
        throw new Error('One or more seat codes are not present in this show inventory');
      }

      const unavailableSeat = show.seats.find((seat) => seat.status !== 'AVAILABLE');
      if (unavailableSeat) {
        throw new Error(`Seat ${unavailableSeat.seatCode} is no longer available`);
      }

      const finalAmount = show.seats.reduce((sum, seat) => sum + (seat.price || show.event.price || 0), 0);

      // Verification log if client tried to send a different amount
      if (totalAmount && Math.abs(parseFloat(totalAmount) - finalAmount) > 0.01) {
        console.warn(`[Security] User ${userId} attempted to pay ${totalAmount} for show seats costing ${finalAmount}`);
      }

      const createdBooking = await tx.booking.create({
        data: {
          quantity: normalizedSeats.length,
          totalAmount: finalAmount,
          status: 'CONFIRMED',
          qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          userId,
          eventId: show.event.id,
          showId,
        },
      });

      const updateResult = await tx.showSeat.updateMany({
        where: {
          id: { in: show.seats.map((seat) => seat.id) },
          status: 'AVAILABLE',
        },
        data: { status: 'BOOKED' },
      });

      if (updateResult.count !== show.seats.length) {
        throw new Error('One or more seats were booked concurrently');
      }

      await tx.bookingSeat.createMany({
        data: show.seats.map((seat) => ({
          bookingId: createdBooking.id,
          showSeatId: seat.id,
        })),
      });

      await tx.event.update({
        where: { id: show.event.id },
        data: {
          availableSlots: { decrement: normalizedSeats.length },
        },
      });

      await tx.payment.create({
        data: {
          amount: finalAmount,
          method: paymentMethod,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'SUCCESS',
          bookingId: createdBooking.id,
        },
      });

      return createdBooking;
    });

    await releaseSeats({
      scopeKey: `show:${showId}`,
      userId,
      seatNumbers: normalizedSeats,
      onlyIfOwned: true,
    });

    emitSeatStateUpdate({
      scopeType: 'show',
      scopeId: showId,
      seatNumbers: normalizedSeats,
      status: 'BOOKED',
      userId,
      meta: { bookingId: booking.id },
    });

    const hydratedBooking = await getHydratedSeatBooking(booking.id);
    await completeIdempotentRequest({
      redisKey: idemState.redisKey,
      responsePayload: hydratedBooking,
    });

    return res.status(201).json({
      message: 'Show seat booking confirmed',
      data: hydratedBooking,
    });
  } catch (error) {
    await clearIdempotentRequest({ redisKey: idemState.redisKey });

    if (error instanceof SeatLockError) {
      return res.status(409).json({ error: error.message, details: error.details });
    }

    return res.status(400).json({ error: error.message });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        show: true,
        user: { select: { name: true, email: true, phone: true } },
        payment: true,
        items: { include: { tier: true } },
        bookingSeats: {
          include: { showSeat: { select: { id: true, seatCode: true, section: true, price: true } } },
        },
      }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Success', data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings - Create booking with tier support
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, items = [], totalAmount, paymentMethod = 'RAZORPAY' } = req.body;
    // items: [{ tierId, quantity }]
    const userId = req.user.id;
    const totalQty = items.reduce((sum, i) => sum + parseInt(i.quantity), 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check event
      const event = await tx.event.findUnique({ where: { id: eventId }, include: { tiers: true } });
      if (!event) throw new Error('Event not found');

      // 2. Validate tier availability
      for (const item of items) {
        const tier = event.tiers.find(t => t.id === item.tierId);
        if (!tier) throw new Error(`Tier ${item.tierId} not found`);
        if (tier.available < parseInt(item.quantity)) {
          throw new Error(`Only ${tier.available} ${tier.name} tickets available`);
        }
      }

      // 3. Deduct availability
      for (const item of items) {
        await tx.tier.update({
          where: { id: item.tierId },
          data: { available: { decrement: parseInt(item.quantity) } }
        });
      }

      await tx.event.update({
        where: { id: eventId },
        data: { availableSlots: { decrement: totalQty } }
      });

      // 4. Create booking
      const booking = await tx.booking.create({
        data: {
          quantity: totalQty,
          totalAmount: parseFloat(totalAmount),
          qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          userId,
          eventId,
          items: {
            create: items.map(item => {
              const tier = event.tiers.find(t => t.id === item.tierId);
              return {
                quantity: parseInt(item.quantity),
                price: tier.price,
                tierId: item.tierId,
              };
            })
          }
        },
        include: { items: { include: { tier: true } } }
      });

      // 5. Create payment
      await tx.payment.create({
        data: {
          amount: parseFloat(totalAmount),
          method: paymentMethod,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: paymentMethod === 'RAZORPAY' ? 'PENDING' : 'SUCCESS',
          bookingId: booking.id
        }
      });

      return booking;
    });

    res.status(201).json({ message: 'Booking successful! 🎉', data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/cancel - Cancel a booking
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        bookingSeats: {
          include: { showSeat: { select: { seatCode: true } } },
        },
      }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'Already cancelled' });

    await prisma.$transaction(async (tx) => {
      // Restore tier availability
      for (const item of booking.items) {
        await tx.tier.update({
          where: { id: item.tierId },
          data: { available: { increment: item.quantity } }
        });
      }

      // Restore event slots
      await tx.event.update({
        where: { id: booking.eventId },
        data: { availableSlots: { increment: booking.quantity } }
      });

      // Restore show seat availability for show-based bookings
      if (booking.bookingSeats.length) {
        await tx.showSeat.updateMany({
          where: { id: { in: booking.bookingSeats.map((seat) => seat.showSeatId) } },
          data: { status: 'AVAILABLE' },
        });
      }

      // Update booking status
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' }
      });

      // Update payment status
      await tx.payment.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'REFUNDED' }
      });
    });

    if (booking.showId && booking.bookingSeats.length) {
      emitSeatStateUpdate({
        scopeType: 'show',
        scopeId: booking.showId,
        seatNumbers: booking.bookingSeats.map((seat) => seat.showSeat.seatCode),
        status: 'AVAILABLE',
        userId: req.user.id,
      });
    }

    res.json({ message: 'Booking cancelled and refund initiated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
