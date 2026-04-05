const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

// GET /api/users - List all users (with search, filters)
router.get('/', async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const where = {};

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

// GET /api/users/:id - Get user profile with stats
router.get('/:id', async (req, res) => {
  try {
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
router.put('/:id', async (req, res) => {
  try {
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
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['USER', 'PARTNER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });
    res.json({ message: 'Role updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/status - Suspend/activate user (Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ message: 'Status updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
