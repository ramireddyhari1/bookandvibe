const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

// POST /api/payments/initiate - Create a mock payment order
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, eventId, currency = 'INR' } = req.body;

    // Simulate Razorpay order creation
    const mockOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      amount: Math.round(parseFloat(amount) * 100), // amount in paise
      currency,
      status: 'created',
      eventId,
      receipt: `rcpt_${Date.now()}`,
    };

    res.json({ message: 'Payment order created', data: mockOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payments/verify - Verify payment (mock: always succeeds)
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Mock verification — in production, verify Razorpay signature
    const isValid = true;

    if (isValid) {
      res.json({
        message: 'Payment verified successfully',
        data: { orderId, paymentId, verified: true }
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payments/webhook - Mock webhook handler
router.post('/webhook', (req, res) => {
  console.log('Payment webhook received:', req.body);
  res.json({ status: 'ok' });
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
