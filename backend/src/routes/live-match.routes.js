const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { getSocketServer } = require('../lib/realtime');

// Initialize or get a live match for a booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookingId, sportType } = req.body;
    
    // Check if booking exists and belongs to user
    const booking = await prisma.gamehubBooking.findUnique({
      where: { id: bookingId },
      include: { facility: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to start match for this booking' });
    }

    // Check if live match already exists
    let liveMatch = await prisma.liveMatch.findUnique({
      where: { bookingId }
    });

    if (!liveMatch) {
      liveMatch = await prisma.liveMatch.create({
        data: {
          bookingId,
          facilityId: booking.facilityId,
          sportType: sportType || booking.facility.type,
          scoreData: JSON.stringify({}),
          status: 'LIVE'
        }
      });
    }

    res.json({
      ...liveMatch,
      scoreData: JSON.parse(liveMatch.scoreData)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update score
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { scoreData, status } = req.body;

    const liveMatch = await prisma.liveMatch.findUnique({
      where: { id },
      include: { booking: true }
    });

    if (!liveMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (liveMatch.booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this match' });
    }

    const updatedMatch = await prisma.liveMatch.update({
      where: { id },
      data: {
        scoreData: typeof scoreData === 'object' ? JSON.stringify(scoreData) : scoreData,
        status: status || liveMatch.status
      }
    });

    // Emit socket event to the facility room
    const ioServer = getSocketServer();
    if (ioServer) {
      ioServer.to(`live-match:${liveMatch.facilityId}`).emit('live-match:update', {
        matchId: id,
        facilityId: liveMatch.facilityId,
        scoreData: typeof scoreData === 'string' ? JSON.parse(scoreData) : scoreData,
        status: status || liveMatch.status
      });
    }

    res.json({
      ...updatedMatch,
      scoreData: typeof updatedMatch.scoreData === 'string' ? JSON.parse(updatedMatch.scoreData) : updatedMatch.scoreData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active matches for a facility
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    const matches = await prisma.liveMatch.findMany({
      where: { 
        facilityId,
        status: 'LIVE'
      },
      include: {
        booking: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.json(matches.map(m => ({
      ...m,
      scoreData: JSON.parse(m.scoreData)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recently finished matches for a facility
router.get('/history/facility/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    const matches = await prisma.liveMatch.findMany({
      where: { 
        facilityId,
        status: 'FINISHED'
      },
      include: {
        booking: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json(matches.map(m => ({
      ...m,
      scoreData: JSON.parse(m.scoreData)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get global leaderboard (Cricket focus for now)
router.get('/leaderboard', async (req, res) => {
  try {
    const matches = await prisma.liveMatch.findMany({
      where: { 
        status: 'FINISHED',
        sportType: 'Cricket'
      },
      include: {
        booking: {
          select: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Aggregate by user
    const userStats = {};
    matches.forEach(m => {
      const user = m.booking.user;
      const score = JSON.parse(m.scoreData);
      if (!userStats[user.id]) {
        userStats[user.id] = { 
          id: user.id, 
          name: user.name, 
          totalRuns: 0, 
          totalWickets: 0, 
          matchesPlayed: 0 
        };
      }
      userStats[user.id].totalRuns += (score.runs || 0);
      userStats[user.id].totalWickets += (score.wickets || 0);
      userStats[user.id].matchesPlayed += 1;
    });

    const leaderboard = Object.values(userStats)
      .sort((a, b) => b.totalRuns - a.totalRuns)
      .slice(0, 20);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
