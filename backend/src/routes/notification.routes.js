const express = require('express');
const router = express.Router();
const { sendMail } = require('../lib/mailer');

// POST /api/notifications/send - Send notification
router.post('/send', async (req, res) => {
  try {
    const { to, subject, message, html } = req.body;

    const result = await sendMail({
      to,
      subject,
      text: message,
      html,
    });

    res.json({
      message: result.skipped ? 'Mail sending skipped' : 'Mail sent successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/notifications - List notifications for user
router.get('/', (req, res) => {
  // TODO: Fetch notifications for authenticated user
  res.json({ message: 'List notifications', data: [] });
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', (req, res) => {
  // TODO: Mark notification as read
  res.json({ message: `Notification ${req.params.id} marked as read` });
});

module.exports = router;
