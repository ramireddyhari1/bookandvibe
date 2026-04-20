const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { creditPartnerWallet } = require('../services/wallet.service');
const { notifyBookingSuccess } = require('../services/notification.service');

// ─── Initialize Razorpay Instance ────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function computeEventBookingSummary(event, quantity, items = []) {
  if (!event) throw new Error('Event not found');

  const normalizedItems = Array.isArray(items) ? items : [];
  const tiersById = new Map(Array.isArray(event.tiers) ? event.tiers.map((tier) => [tier.id, tier]) : []);

  let totalQty = Math.max(parseInt(quantity, 10) || 0, 0);
  let subtotal = 0;
  let bookingItems = [];

  if (normalizedItems.length > 0) {
    totalQty = 0;

    bookingItems = normalizedItems.map((item) => {
      const itemQty = Math.max(parseInt(item.quantity, 10) || 0, 0);
      if (itemQty <= 0) {
        throw new Error('Each tier item needs a valid quantity');
      }

      const tier = tiersById.get(item.tierId);
      if (!tier) throw new Error(`Tier ${item.tierId} not found`);
      if (tier.available < itemQty) {
        throw new Error(`Only ${tier.available} ${tier.name} tickets available`);
      }

      totalQty += itemQty;
      subtotal += roundCurrency(tier.price * itemQty);

      return {
        quantity: itemQty,
        price: tier.price,
        tierId: item.tierId,
      };
    });
  } else {
    if (totalQty <= 0) {
      throw new Error('At least one ticket is required');
    }

    subtotal = roundCurrency((Number(event.price) || 0) * totalQty);
  }

  if (totalQty <= 0) {
    throw new Error('At least one ticket is required');
  }

  const taxPercent = Number(event.taxPercent) || 0;
  const taxAmount = subtotal > 0 && taxPercent > 0 ? roundCurrency((subtotal * taxPercent) / 100) : 0;

  const feeValue = Number(event.platformFeeValue) || 0;
  const platformFeeAmount = subtotal > 0 && feeValue > 0
    ? (event.platformFeeType === 'FIXED'
        ? roundCurrency(feeValue)
        : roundCurrency((subtotal * feeValue) / 100))
    : 0;

  const totalAmount = roundCurrency(subtotal + taxAmount + platformFeeAmount);

  return {
    totalQty,
    subtotal: roundCurrency(subtotal),
    taxAmount,
    platformFeeAmount,
    totalAmount,
    bookingItems,
  };
}

function computeGamehubBookingAmount(facility) {
  return roundCurrency(Number(facility?.pricePerHour) || 0);
}

// ─── Coupon Helper ────────────────────────────────────────────────────────
async function calculateCouponDiscount(couponCode, orderAmount, userId, applicableTo) {
  if (!couponCode || orderAmount <= 0) return { discountAmount: 0, coupon: null };

  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode.toUpperCase().trim() }
  });

  if (!coupon || !coupon.isActive) return { discountAmount: 0, coupon: null, error: 'Invalid or inactive promo code' };
  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) return { discountAmount: 0, coupon: null, error: 'Promo code has expired' };
  if (coupon.applicableTo !== 'ALL' && applicableTo !== 'ALL' && coupon.applicableTo !== applicableTo) return { discountAmount: 0, coupon: null, error: 'Promo code not applicable' };
  if (orderAmount < coupon.minOrderAmount) return { discountAmount: 0, coupon: null, error: `Minimum order amount of ₹${coupon.minOrderAmount} required` };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { discountAmount: 0, coupon: null, error: 'Usage limit reached' };

  if (coupon.perUserLimit > 0) {
      const [eventBookings, gamehubBookings] = await Promise.all([
         prisma.booking.count({ where: { userId, couponCode: coupon.code, status: { not: 'CANCELLED' } } }),
         prisma.gamehubBooking.count({ where: { userId, couponCode: coupon.code, status: { not: 'CANCELLED' } } })
      ]);
      if (eventBookings + gamehubBookings >= coupon.perUserLimit) return { discountAmount: 0, coupon: null, error: 'User usage limit reached' };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'PERCENT') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
  } else {
      discountAmount = coupon.discountValue;
  }
  discountAmount = Math.min(discountAmount, orderAmount);
  discountAmount = Math.round((discountAmount + Number.EPSILON) * 100) / 100;

  return { discountAmount, coupon };
}

// ─── POST /api/payments/initiate ─────────────────────────────────────────────
// Creates a real Razorpay order and returns order details to frontend
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { currency = 'INR', eventId, facilityId, quantity = 1, items = [], couponCode, notes = {} } = req.body;

    if (!eventId && !facilityId) {
      return res.status(400).json({ error: 'eventId or facilityId is required' });
    }

    let resolvedAmount = 0;
    let resolvedNotes = { ...notes };

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { tiers: true },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const summary = computeEventBookingSummary(event, quantity, items);
      resolvedAmount = summary.totalAmount;
      resolvedNotes = {
        ...resolvedNotes,
        eventId,
        quantity: String(summary.totalQty),
      };
    } else {
      const facility = await prisma.gamehubFacility.findUnique({
        where: { id: facilityId },
        select: { id: true, name: true, pricePerHour: true },
      });

      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      resolvedAmount = computeGamehubBookingAmount(facility);
      resolvedNotes = {
        ...resolvedNotes,
        facilityId,
      };
    }

    if (resolvedAmount <= 0) {
      return res.status(400).json({ error: 'A valid amount is required' });
    }

    if (couponCode) {
      const { discountAmount, error } = await calculateCouponDiscount(couponCode, resolvedAmount, req.user.id, eventId ? 'EVENTS' : 'GAMEHUB');
      if (error) return res.status(400).json({ error });
      resolvedAmount = Math.max(0, resolvedAmount - discountAmount);
      resolvedNotes.couponCode = couponCode;
      resolvedNotes.discountAmount = discountAmount;
    }

    const options = {
      amount: Math.round(resolvedAmount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      notes: {
        userId: req.user.id,
        eventId: eventId || '',
        facilityId: facilityId || '',
        ...resolvedNotes,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      message: 'Razorpay order created',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('[Razorpay] Order creation failed:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// ─── POST /api/payments/verify ───────────────────────────────────────────────
// Verifies the Razorpay payment signature using HMAC SHA256
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification parameters' });
    }

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      res.json({
        message: 'Payment verified successfully',
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          verified: true,
        },
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }
  } catch (error) {
    console.error('[Razorpay] Verification failed:', error);
    res.status(500).json({ error: 'Payment verification error' });
  }
});

// ─── POST /api/payments/confirm-booking ──────────────────────────────────────
// Verifies Razorpay signature, then creates the booking + payment records in DB
// Used by the event booking flow
router.post('/confirm-booking', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      quantity,
      couponCode,
      items = [],
    } = req.body;

    const userId = req.user.id;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tiers: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const summary = computeEventBookingSummary(event, quantity, items);
    
    let discountAmount = 0;
    if (couponCode) {
      const couponCheck = await calculateCouponDiscount(couponCode, summary.totalAmount, userId, 'EVENTS');
      if (couponCheck.error) return res.status(400).json({ error: couponCheck.error });
      discountAmount = couponCheck.discountAmount;
    }

    const finalAmount = Math.max(0, summary.totalAmount - discountAmount);
    const isFreeBooking = finalAmount <= 0;

    if (!isFreeBooking) {
      // 1. Verify Razorpay signature
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment verification parameters' });
      }

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
      }
    }

    // 2. Create booking + payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const liveEvent = await tx.event.findUnique({
        where: { id: eventId },
        include: { tiers: true },
      });
      if (!liveEvent) throw new Error('Event not found');

      const liveSummary = computeEventBookingSummary(liveEvent, quantity, items);

      if (liveSummary.bookingItems.length > 0) {
        for (const item of liveSummary.bookingItems) {
          await tx.tier.update({
            where: { id: item.tierId },
            data: { available: { decrement: item.quantity } },
          });
        }
      }

      // Deduct event slots
      await tx.event.update({
        where: { id: eventId },
        data: { availableSlots: { decrement: liveSummary.totalQty } },
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          quantity: liveSummary.totalQty,
          totalAmount: finalAmount,
          status: 'CONFIRMED',
          qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          couponCode: couponCode ? couponCode.toUpperCase() : null,
          discount: discountAmount,
          userId,
          eventId,
          ...(liveSummary.bookingItems.length > 0
            ? { items: { create: liveSummary.bookingItems } }
            : {}),
        },
        include: { items: { include: { tier: true } } },
      });

      const freePaymentId = `FREE-${booking.id}`;

      // 3. Create payment record with payment details
      const payment = await tx.payment.create({
        data: {
          amount: finalAmount,
          method: isFreeBooking ? 'FREE' : 'RAZORPAY',
          transactionId: isFreeBooking ? freePaymentId : razorpay_payment_id,
          status: 'SUCCESS',
          bookingId: booking.id,
        },
      });

      // Update coupon optionally
      if (couponCode && discountAmount > 0) {
        const updatedCoupon = await tx.coupon.update({
          where: { code: couponCode.toUpperCase().trim() },
          data: { usedCount: { increment: 1 } }
        });

        // Strict limit verification after atomic increment
        if (updatedCoupon.usageLimit !== null && updatedCoupon.usedCount > updatedCoupon.usageLimit) {
          throw new Error('This promo code has reached its maximum usage limit');
        }
      }

      // 4. Credit Partner Wallet
      const eventTitle = liveEvent.title || 'Event Entrance';
      await creditPartnerWallet(
        tx,
        liveEvent.partnerId,
        finalAmount,
        `Earning from: ${eventTitle} (Booking #${booking.id.slice(0, 8)})`,
        booking.id
      );

      return booking;
    });

    // Notify Partner & Admins
    const eventObj = await prisma.event.findUnique({ where: { id: eventId }, select: { title: true, partnerId: true } });
    await notifyBookingSuccess({
      partnerId: eventObj?.partnerId,
      eventTitle: eventObj?.title || 'Event',
      buyerName: req.user.name || 'A customer',
      amount: summary.totalAmount,
      bookingId: result.id,
    });

    res.status(201).json({ message: 'Booking confirmed! 🎉', data: result });
  } catch (error) {
    console.error('[Razorpay] confirm-booking failed:', error);
    res.status(400).json({ error: error.message });
  }
});

// ─── POST /api/payments/confirm-gamehub ──────────────────────────────────────
// Verifies Razorpay signature, then creates the gamehub booking
router.post('/confirm-gamehub', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      facilityId,
      slotLabel,
      date,
      couponCode,
      meta = {},
    } = req.body;

    const userId = req.user.id;
    const facility = await prisma.gamehubFacility.findUnique({
      where: { id: facilityId },
      select: { id: true, name: true, partnerId: true, pricePerHour: true },
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const resolvedAmount = computeGamehubBookingAmount(facility);
    
    let discountAmount = 0;
    if (couponCode) {
      const couponCheck = await calculateCouponDiscount(couponCode, resolvedAmount, userId, 'GAMEHUB');
      if (couponCheck.error) return res.status(400).json({ error: couponCheck.error });
      discountAmount = couponCheck.discountAmount;
    }

    const finalAmount = Math.max(0, resolvedAmount - discountAmount);
    const isFreeBooking = finalAmount <= 0;

    if (!isFreeBooking) {
      // 1. Verify Razorpay signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
      }
    }

    // 2. Create gamehub booking
    const booking = await prisma.$transaction(async (tx) => {
      const liveFacility = await tx.gamehubFacility.findUnique({
        where: { id: facilityId },
        select: { id: true, name: true, partnerId: true, pricePerHour: true }
      });

      if (!liveFacility) throw new Error('Facility not found');

      const createdBooking = await tx.gamehubBooking.create({
        data: {
          bookingDate: new Date(date),
          slotLabel,
          totalAmount: finalAmount,
          currency: 'INR',
          status: 'CONFIRMED',
          couponCode: couponCode ? couponCode.toUpperCase() : null,
          discount: discountAmount,
          paymentMethod: isFreeBooking ? 'FREE' : 'RAZORPAY',
          paymentStatus: 'SUCCESS',
          transactionId: isFreeBooking ? `FREE-${Date.now()}` : razorpay_payment_id,
          userId,
          facilityId,
        },
      });

      if (couponCode && discountAmount > 0) {
        const updatedCoupon = await tx.coupon.update({
          where: { code: couponCode.toUpperCase().trim() },
          data: { usedCount: { increment: 1 } }
        });

        if (updatedCoupon.usageLimit !== null && updatedCoupon.usedCount > updatedCoupon.usageLimit) {
          throw new Error('This promo code has reached its maximum usage limit');
        }
      }

      // Credit Partner Wallet
      if (liveFacility.partnerId) {
        await creditPartnerWallet(
          tx,
          liveFacility.partnerId,
          finalAmount,
          `Venue Earning: ${liveFacility.name} (Slot: ${slotLabel})`,
          createdBooking.id
        );
      }

      return createdBooking;
    });

    // Notify Partner & Admins (GameHub Real Payment)
    await notifyBookingSuccess({
      partnerId: facility.partnerId,
      eventTitle: `Venue: ${facility.name || 'Facility'}`,
      buyerName: req.user.name || 'A customer',
      amount: resolvedAmount,
      bookingId: booking.id,
    });

    res.status(201).json({ message: 'GameHub booking confirmed! 🎉', data: booking });
  } catch (error) {
    console.error('[Razorpay] confirm-gamehub failed:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/payments/webhook - Razorpay webhook handler
router.post('/webhook', (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    console.log('[Razorpay] Webhook event:', req.body?.event);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Razorpay] Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/payments/history - User's payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        booking: { userId: req.user.id }
      },
      include: {
        booking: {
          include: {
            event: { select: { title: true, date: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ message: 'Success', data: payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
