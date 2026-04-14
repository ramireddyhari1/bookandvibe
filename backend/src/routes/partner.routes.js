const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdmin, requireAdminOrPartner } = require('../middleware/auth');

// ─── Partner Stats (Dashboard) ───────────────────────────────────────────────
router.get('/dashboard-stats', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const partnerId = req.user.id;

    // 1. Get User Facilities
    const facilities = await prisma.gamehubFacility.findMany({
      where: { partnerId },
      select: { id: true, name: true }
    });

    const facilityIds = facilities.map(f => f.id);

    // 2. Get Bookings Count (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeBookings = await prisma.gamehubBooking.count({
      where: {
        facilityId: { in: facilityIds },
        bookingDate: { gte: thirtyDaysAgo },
        status: 'CONFIRMED'
      }
    });

    // 3. Get Wallet Info
    let wallet = await prisma.wallet.findUnique({
      where: { userId: partnerId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    // 4. Create Wallet if not exists (Lazy Load)
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: partnerId, balance: 0, totalEarnings: 0 },
        include: { transactions: true }
      });
    }

    return res.json({
      success: true,
      data: {
        totalRevenue: wallet.totalEarnings,
        currentBalance: wallet.balance,
        activeBookings,
        facilityCount: facilities.length,
        recentTransactions: wallet.transactions
      }
    });
  } catch (error) {
    console.error('Partner Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Event Host Stats (Dashboard) ────────────────────────────────────────────
router.get('/event-stats', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const partnerId = req.user.id;

    // 1. Get partner's events
    const events = await prisma.event.findMany({
      where: { partnerId },
      select: { id: true, title: true, status: true }
    });

    const eventIds = events.map(e => e.id);
    const liveEventsCount = events.filter(e => e.status === 'ACTIVE').length;

    // 2. Get total tickets sold across all partner events
    const ticketsSold = await prisma.booking.count({
      where: {
        eventId: { in: eventIds },
        status: { in: ['CONFIRMED', 'USED'] }
      }
    });

    // 3. Get total ticket revenue
    const ticketRevenue = await prisma.booking.aggregate({
      where: {
        eventId: { in: eventIds },
        status: { in: ['CONFIRMED', 'USED'] }
      },
      _sum: { totalAmount: true }
    });

    // 4. Get Wallet Info
    let wallet = await prisma.wallet.findUnique({
      where: { userId: partnerId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: partnerId, balance: 0, totalEarnings: 0 },
        include: { transactions: true }
      });
    }

    return res.json({
      success: true,
      data: {
        totalRevenue: ticketRevenue._sum.totalAmount || wallet.totalEarnings || 0,
        currentBalance: wallet.balance,
        ticketsSold,
        liveEventsCount,
        totalEvents: events.length,
        recentTransactions: wallet.transactions
      }
    });
  } catch (error) {
    console.error('Event Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Partner's Own Events List ───────────────────────────────────────────────
router.get('/my-events', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const events = await prisma.event.findMany({
      where: { partnerId },
      include: {
        tiers: true,
        _count: { select: { bookings: true, reviews: true } }
      },
      orderBy: { date: 'desc' }
    });

    return res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Partner's Own Venue Bookings List ──────────────────────────────────────────
router.get('/venue-bookings', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { status, search } = req.query;

    const where = {
      facility: { partnerId }
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.user = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

    const bookings = await prisma.gamehubBooking.findMany({
      where,
      include: {
        facility: { select: { name: true, venue: true, pricePerHour: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { bookingDate: 'desc' }
    });

    return res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Venue Bookings Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Wallet & Transactions ───────────────────────────────────────────────────
router.get('/wallet', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const partnerId = req.user.id;
    let wallet = await prisma.wallet.findUnique({
      where: { userId: partnerId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: partnerId },
        include: { transactions: true }
      });
    }

    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Payout Request ──────────────────────────────────────────────────────────
router.post('/payouts', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payout amount' });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: partnerId } });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Use transaction to ensure consistency
    const [payout, updatedWallet] = await prisma.$transaction([
      prisma.payout.create({
        data: {
          userId: partnerId,
          amount,
          bankDetails: JSON.stringify(bankDetails),
          status: 'PENDING'
        }
      }),
      prisma.wallet.update({
        where: { userId: partnerId },
        data: {
          balance: { decrement: amount }
        }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -amount,
          type: 'PAYOUT',
          description: `Payout request for ₹${amount}`
        }
      })
    ]);

    res.json({ success: true, data: payout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Event Specific Insights ────────────────────────────────────────────────
router.get('/manage/events/:id/insights', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const eventId = req.params.id;
    const partnerId = req.user.id;

    // 1. Verify Ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tiers: true,
        _count: { select: { bookings: true } }
      }
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (String(event.partnerId) !== String(partnerId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 2. Aggregate Booking Stats
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      where: { eventId },
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    // 3. Summarize Entries
    const confirmedCount = stats.find(s => s.status === 'CONFIRMED')?._count.id || 0;
    const usedCount = stats.find(s => s.status === 'USED')?._count.id || 0;
    const totalSold = confirmedCount + usedCount;

    // 4. Summarize Revenue
    const totalRevenue = stats
      .filter(s => ['CONFIRMED', 'USED'].includes(s.status))
      .reduce((sum, s) => sum + (s._sum.totalAmount || 0), 0);

    // 5. Tier Breakdown
    const tierBreakdown = await Promise.all(event.tiers.map(async (tier) => {
      const tierStats = await prisma.bookingItem.aggregate({
        where: { 
          tierId: tier.id,
          booking: { status: { in: ['CONFIRMED', 'USED'] } }
        },
        _sum: { quantity: true, price: true }
      });
      
      return {
        id: tier.id,
        name: tier.name,
        sold: tierStats._sum.quantity || 0,
        total: tier.quantity,
        revenue: (tierStats._sum.quantity || 0) * tier.price, // More accurate than sum(price) if price changed
        color: tier.color
      };
    }));

    return res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          images: event.images
        },
        revenue: totalRevenue,
        entries: {
          totalSold,
          checkedIn: usedCount,
          pending: confirmedCount
        },
        tiers: tierBreakdown
      }
    });
  } catch (error) {
    console.error('Event Insights Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Ticket Verification & Check-in ──────────────────────────────────────────
router.post('/verify-ticket', authenticateToken, requireAdminOrPartner, async (req, res) => {
  try {
    const { ticketCode } = req.body;
    const partnerId = req.user.id;

    if (!ticketCode) {
      return res.status(400).json({ error: 'Ticket code is required' });
    }

    // 1. Try to find an Event Booking
    const eventBooking = await prisma.booking.findFirst({
      where: { qrCode: ticketCode },
      include: {
        event: { select: { id: true, title: true, partnerId: true, venue: true, date: true } },
        user: { select: { name: true, email: true } }
      }
    });

    if (eventBooking) {
      // Verify Ownership
      if (String(eventBooking.event.partnerId) !== String(partnerId)) {
        return res.status(403).json({ error: 'This ticket does not belong to your events.' });
      }

      // Check Status
      if (eventBooking.status === 'USED') {
        return res.status(400).json({ error: 'This ticket has already been used for check-in.' });
      }
      if (eventBooking.status === 'CANCELLED') {
        return res.status(400).json({ error: 'This booking has been cancelled.' });
      }

      // Mark as USED
      const updatedBooking = await prisma.booking.update({
        where: { id: eventBooking.id },
        data: { status: 'USED' }
      });

      return res.json({
        success: true,
        message: 'Ticket verified successfully',
        data: {
          type: 'EVENT',
          bookingId: eventBooking.id,
          userName: eventBooking.user.name,
          title: eventBooking.event.title,
          venue: eventBooking.event.venue,
          date: eventBooking.event.date,
          status: 'USED'
        }
      });
    }

    // 2. Try to find a Gamehub Booking (using ID as ticket code if QR is missing)
    const gamehubBooking = await prisma.gamehubBooking.findFirst({
      where: { 
        OR: [
          { id: ticketCode },
          { transactionId: ticketCode }
        ]
      },
      include: {
        facility: { select: { id: true, name: true, partnerId: true, venue: true } },
        user: { select: { name: true, email: true } }
      }
    });

    if (gamehubBooking) {
      // Verify Ownership
      if (String(gamehubBooking.facility.partnerId) !== String(partnerId)) {
        return res.status(403).json({ error: 'This booking does not belong to your facility.' });
      }

      // Check Status
      if (gamehubBooking.status === 'USED') {
        return res.status(400).json({ error: 'This booking has already been used.' });
      }

      // Mark as USED
      const updatedBooking = await prisma.gamehubBooking.update({
        where: { id: gamehubBooking.id },
        data: { status: 'USED' }
      });

      return res.json({
        success: true,
        message: 'Booking verified successfully',
        data: {
          type: 'VENUE',
          bookingId: gamehubBooking.id,
          userName: gamehubBooking.user.name,
          title: gamehubBooking.facility.name,
          venue: gamehubBooking.facility.venue,
          date: gamehubBooking.bookingDate,
          status: 'USED'
        }
      });
    }

    return res.status(404).json({ error: 'Invalid or unrecognized ticket code' });
  } catch (error) {
    console.error('Verify Ticket Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ADMIN: List All Payout Requests ──────────────────────────────────────────
router.get('/all-payouts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: payouts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── ADMIN: Update Payout Status ──────────────────────────────────────────────
router.patch('/payouts/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (!['PROCESSING', 'COMPLETED', 'FAILED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payout status' });
    }

    const payout = await prisma.payout.update({
      where: { id },
      data: { 
        status, 
        transactionId: transactionId || undefined 
      },
      include: { user: true }
    });

    // If failed, refund the wallet
    if (status === 'FAILED') {
      const wallet = await prisma.wallet.findUnique({ where: { userId: payout.userId } });
      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: payout.amount } }
        });
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: payout.amount,
            type: 'REFUND',
            description: `Refund for failed payout #${id.slice(0, 8)}`
          }
        });
      }
    }

    res.json({ success: true, data: payout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
