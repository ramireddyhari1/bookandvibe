const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { sendMail } = require('../lib/mailer');
const { validate, registerSchema, loginSchema } = require('../middleware/validator');

function handleAuthRouteError(res, err, fallbackMessage) {
  const message = String(err?.message || '');
  const isDbUnavailable = message.includes("Can't reach database server") || message.includes('P1001');

  if (isDbUnavailable) {
    return res.status(503).json({
      code: 'DB_UNAVAILABLE',
      error: 'Login service is temporarily unavailable. Please try again in a moment.',
    });
  }

  console.error('[auth.routes] Unexpected error:', err);
  return res.status(500).json({
    code: 'AUTH_INTERNAL_ERROR',
    error: fallbackMessage,
  });
}

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      }
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    sendMail({
      to: newUser.email,
      subject: 'Welcome to Book & Vibe',
      text: `Hi ${newUser.name}, your account is ready on Book & Vibe.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>Welcome to Book & Vibe</h2>
          <p>Hi ${newUser.name}, your account is ready.</p>
          <p>You can now explore events, book tickets, and manage your profile.</p>
        </div>
      `,
    }).catch((mailError) => {
      console.warn('Welcome email skipped:', mailError.message);
    });

    res.status(201).json({ 
      message: 'Registration successful', 
      token, 
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } 
    });
  } catch (err) {
    return handleAuthRouteError(res, err, 'Registration failed. Please try again later.');
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        partnerType: user.partnerType || null,
        eventHostId: user.eventHostId || null
      } 
    });
  } catch (err) {
    return handleAuthRouteError(res, err, 'Login failed. Please try again later.');
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      include: {
        gamehubFacilities: {
          select: { id: true, name: true }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        partnerType: user.partnerType || null,
        eventHostId: user.eventHostId || null,
        managedFacilities: user.gamehubFacilities || []
      } 
    });
  } catch (err) {
    return handleAuthRouteError(res, err, 'Unable to fetch user profile. Please try again later.');
  }
});

module.exports = router;
