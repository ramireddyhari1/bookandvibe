const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ─── GET /api/coupons - List all coupons (Admin) ────────────────────────────────────────────────────────────
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ message: 'Success', data: coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/coupons - Create a coupon (Admin) ────────────────────────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      applicableTo,
      expiresAt,
      isActive
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discount type, and discount value are required' });
    }

    const existingCode = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (existingCode) {
      return res.status(409).json({ error: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || '',
        discountType: discountType.toUpperCase(),
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount || 0),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: parseInt(perUserLimit || 1),
        applicableTo: applicableTo || 'ALL',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json({ message: 'Coupon created', data: coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /api/coupons/:id - Update a coupon (Admin) ────────────────────────────────────────────────────────────
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    const fields = [
      'code', 'description', 'discountType', 'discountValue',
      'minOrderAmount', 'maxDiscount', 'usageLimit', 'perUserLimit',
      'applicableTo', 'expiresAt', 'isActive'
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (field === 'code') updateData[field] = req.body[field].toUpperCase().trim();
        else if (field === 'expiresAt') updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
        else if (['discountValue', 'minOrderAmount', 'maxDiscount'].includes(field)) {
             updateData[field] = req.body[field] !== null ? parseFloat(req.body[field]) : null;
        }
        else if (['usageLimit', 'perUserLimit'].includes(field)) {
             updateData[field] = req.body[field] !== null ? parseInt(req.body[field]) : null;
        }
        else updateData[field] = req.body[field];
      }
    }

    if (updateData.code) {
        const existingCode = await prisma.coupon.findUnique({
          where: { code: updateData.code }
        });
        if (existingCode && existingCode.id !== id) {
            return res.status(409).json({ error: 'Coupon code already exists' });
        }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Coupon updated', data: coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DELETE /api/coupons/:id - Delete a coupon (Admin) ────────────────────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/coupons/validate - Validate a coupon code ────────────────────────────────────────────────────────────
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { code, orderAmount, applicableTo = 'ALL' } = req.body;
    const userId = req.user.id;

    if (!code || orderAmount === undefined) {
      return res.status(400).json({ error: 'Promo code and order amount are required' });
    }

    const parsedOrderAmount = parseFloat(orderAmount);
    if (parsedOrderAmount <= 0) {
      return res.status(400).json({ error: 'Order amount must be greater than zero' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: 'Promo code is not active' });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    if (coupon.applicableTo !== 'ALL' && applicableTo !== 'ALL' && coupon.applicableTo !== applicableTo) {
      return res.status(400).json({ error: `Promo code is only valid for ${coupon.applicableTo === 'EVENTS' ? 'event' : 'GameHub'} bookings` });
    }

    if (parsedOrderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    // Check user's past usage
    if (coupon.perUserLimit > 0) {
        const [eventBookings, gamehubBookings] = await Promise.all([
           prisma.booking.count({
              where: { userId, couponCode: coupon.code, status: { not: 'CANCELLED' } }
           }),
           prisma.gamehubBooking.count({
              where: { userId, couponCode: coupon.code, status: { not: 'CANCELLED' } }
           })
        ]);

        const totalUserUses = eventBookings + gamehubBookings;

        if (totalUserUses >= coupon.perUserLimit) {
          return res.status(400).json({ error: 'You have reached the maximum usage limit for this promo code' });
        }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
        discountAmount = (parsedOrderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }
    } else { // FIXED
        discountAmount = coupon.discountValue;
    }

    // Ensure discount isn't more than the order
    discountAmount = Math.min(discountAmount, parsedOrderAmount);
    
    // Round to 2 decimals
    discountAmount = Math.round((discountAmount + Number.EPSILON) * 100) / 100;

    res.json({
      message: 'Promo code applied successfully',
      data: {
        code: coupon.code,
        discountAmount,
        finalAmount: parsedOrderAmount - discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
