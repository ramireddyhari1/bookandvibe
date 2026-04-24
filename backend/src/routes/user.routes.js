const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdmin, requireAdminOrPartner } = require('../middleware/auth');

// GET /api/users - List all users (with search, filters)
router.get('/', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const where = {};

    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole === 'PARTNER') {
      where.id = req.user.id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'All') where.role = role;
    if (status && status !== 'All') where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          role: true, status: true, createdAt: true,
          _count: { select: { bookings: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Compute total spent per user
    const usersWithSpent = await Promise.all(
      users.map(async (u) => {
        const spent = await prisma.booking.aggregate({
          where: { userId: u.id, status: 'CONFIRMED' },
          _sum: { totalAmount: true }
        });
        return { ...u, totalSpent: spent._sum.totalAmount || 0 };
      })
    );

    res.json({
      message: 'Success',
      data: usersWithSpent,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/partners - List partner accounts for admin management
router.get('/partners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const where = { role: 'PARTNER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'All') where.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [partners, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          partnerType: true,
          eventHostId: true,
          gamehubFacilities: {
            select: { id: true, name: true }
          },
          createdAt: true,
        },
        skip,
        take: parseInt(limit, 10),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      message: 'Success',
      data: partners,
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

// POST /api/users/partners - Create partner account (admin only)
router.post('/partners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, status = 'ACTIVE', partnerType, eventHostId, facilityId } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();

    if (!normalizedName || !normalizedEmail || !String(password || '').trim()) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(String(status).toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    // If no partnerType provided, derive it from assignments for backward compatibility
    let derivedType = partnerType ? String(partnerType).toUpperCase() : null;
    if (!derivedType) {
      if (eventHostId) derivedType = 'EVENT_HOST';
      else if (facilityId) derivedType = 'VENUE_OWNER';
    }

    const created = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone ? String(phone) : null,
        role: 'PARTNER',
        status: String(status).toUpperCase(),
        partnerType: derivedType,
        eventHostId: eventHostId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        partnerType: true,
        eventHostId: true,
        createdAt: true,
      },
    });

    if (facilityId) {
      await prisma.gamehubFacility.update({
        where: { id: facilityId },
        data: { partnerId: created.id }
      });
    }

    return res.status(201).json({ message: 'Partner created successfully', data: created });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Get user profile with stats
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'ADMIN' && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ error: 'You do not have permission to view this user' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        role: true, status: true, createdAt: true,
        bookings: {
          include: { event: { select: { title: true, date: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: { select: { bookings: true, reviews: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Success', data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'ADMIN' && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ error: 'You do not have permission to update this user' });
    }

    const { name, phone, avatar } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone, avatar },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true }
    });
    res.json({ message: 'Profile updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/role - Update user role (Admin)
router.patch('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body || {};
    const normalizedRole = String(role || '').toUpperCase();

    if (!['USER', 'PARTNER'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Role can only be USER or PARTNER from this endpoint' });
    }

    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (String(target.role || '').toUpperCase() === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot modify role of another admin user' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: normalizedRole }
    });
    res.json({ message: 'Role updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/status - Suspend/activate user (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const normalizedStatus = String(status || '').toUpperCase();

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(normalizedStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (String(target.role || '').toUpperCase() === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot modify status of admin user from this endpoint' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: normalizedStatus }
    });
    res.json({ message: 'Status updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
