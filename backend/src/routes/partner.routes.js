const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdminOrPartner } = require('../middleware/auth');

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

module.exports = router;
