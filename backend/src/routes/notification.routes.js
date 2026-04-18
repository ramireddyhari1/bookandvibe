const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { sendMail } = require('../lib/mailer');

// GET /api/notifications - List notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50
    });
    res.json({ message: 'Success', data: notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    res.json({ message: 'Success', data: { count } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications/send - Send mail notification (existing)
router.post('/send', async (req, res) => {
  try {
    const { to, subject, message, html } = req.body;
    const result = await sendMail({ to, subject, text: message, html });
    res.json({ message: result.skipped ? 'Mail sending skipped' : 'Mail sent successfully', data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

