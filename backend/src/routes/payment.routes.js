const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { creditPartnerWallet } = require('../services/wallet.service');

// ─── Initialize Razorpay Instance ────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── POST /api/payments/initiate ─────────────────────────────────────────────
// Creates a real Razorpay order and returns order details to frontend
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', eventId, facilityId, notes = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'A valid amount is required' });
    }

    const options = {
      amount: Math.round(parseFloat(amount) * 100), // Razorpay expects amount in paise
      currency,
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      notes: {
        ...notes,
        userId: req.user.id,
        eventId: eventId || '',
        facilityId: facilityId || '',
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
      totalAmount,
      items = [],
    } = req.body;

    const userId = req.user.id;

    // 1. Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    // 2. Create booking + payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { tiers: true },
      });
      if (!event) throw new Error('Event not found');

      let totalQty = parseInt(quantity) || 0;
      let bookingItems = [];

      // If tier items are provided, validate and use them
      if (items.length > 0) {
        totalQty = items.reduce((sum, i) => sum + parseInt(i.quantity), 0);

        for (const item of items) {
          const tier = event.tiers.find((t) => t.id === item.tierId);
          if (!tier) throw new Error(`Tier ${item.tierId} not found`);
          if (tier.available < parseInt(item.quantity)) {
            throw new Error(`Only ${tier.available} ${tier.name} tickets available`);
          }
        }

        // Deduct tier availability
        for (const item of items) {
          await tx.tier.update({
            where: { id: item.tierId },
            data: { available: { decrement: parseInt(item.quantity) } },
          });
        }

        bookingItems = items.map((item) => {
          const tier = event.tiers.find((t) => t.id === item.tierId);
          return {
            quantity: parseInt(item.quantity),
            price: tier.price,
            tierId: item.tierId,
          };
        });
      }

      // Deduct event slots
      await tx.event.update({
        where: { id: eventId },
        data: { availableSlots: { decrement: totalQty } },
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          quantity: totalQty,
          totalAmount: parseFloat(totalAmount),
          status: 'CONFIRMED',
          qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          userId,
          eventId,
          ...(bookingItems.length > 0
            ? { items: { create: bookingItems } }
            : {}),
        },
        include: { items: { include: { tier: true } } },
      });

      // 3. Create payment record with Razorpay details
      const payment = await tx.payment.create({
        data: {
          amount: parseFloat(totalAmount),
          method: 'RAZORPAY',
          transactionId: razorpay_payment_id,
          status: 'SUCCESS',
          bookingId: booking.id,
        },
      });

      // 4. Credit Partner Wallet
      const eventTitle = event.title || 'Event Entrance';
      await creditPartnerWallet(
        tx,
        event.partnerId,
        parseFloat(totalAmount),
        `Earning from: ${eventTitle} (Booking #${booking.id.slice(0, 8)})`,
        booking.id
      );

      return booking;
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
      totalAmount,
      meta = {},
    } = req.body;

    const userId = req.user.id;

    // 1. Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    // 2. Create gamehub booking
    const booking = await prisma.$transaction(async (tx) => {
      const facility = await tx.gamehubFacility.findUnique({
        where: { id: facilityId },
        select: { id: true, name: true, partnerId: true }
      });

      if (!facility) throw new Error('Facility not found');

      const createdBooking = await tx.gamehubBooking.create({
        data: {
          bookingDate: new Date(date),
          slotLabel,
          totalAmount: parseFloat(totalAmount),
          currency: 'INR',
          status: 'CONFIRMED',
          paymentMethod: 'RAZORPAY',
          paymentStatus: 'SUCCESS',
          transactionId: razorpay_payment_id,
          userId,
          facilityId,
        },
      });

      // Credit Partner Wallet
      if (facility.partnerId) {
        await creditPartnerWallet(
          tx,
          facility.partnerId,
          parseFloat(totalAmount),
          `Venue Earning: ${facility.name} (Slot: ${slotLabel})`,
          createdBooking.id
        );
      }

      return createdBooking;
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
