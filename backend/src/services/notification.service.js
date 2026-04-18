const prisma = require('../lib/prisma');

/**
 * Creates a notification for a single user
 */
async function createNotification(userId, { title, message, type = 'GENERAL' }, tx = null) {
  const db = tx || prisma;
  return db.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });
}

/**
 * Notifies all users with role 'ADMIN'
 */
async function notifyAdmins({ title, message, type = 'GENERAL' }, tx = null) {
  const db = tx || prisma;
  const admins = await db.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  if (!admins.length) return [];

  return db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title,
      message,
      type,
    })),
  });
}

/**
 * Notifies the partner of an event and all admins about a new booking
 */
async function notifyBookingSuccess({ partnerId, eventTitle, buyerName, amount, bookingId }, tx = null) {
  const title = "New Ticket Purchase! 🎟️";
  const message = `${buyerName} bought tickets for "${eventTitle}" (Amount: INR ${amount}). Booking ID: #${bookingId.slice(0, 8)}`;

  const notifications = [];

  // Notify Partner
  if (partnerId) {
    notifications.push(
      createNotification(partnerId, { title, message, type: 'BOOKING' }, tx)
    );
  }

  // Notify Admins
  notifications.push(
    notifyAdmins({ title, message, type: 'BOOKING' }, tx)
  );

  return Promise.all(notifications);
}

module.exports = {
  createNotification,
  notifyAdmins,
  notifyBookingSuccess,
};
