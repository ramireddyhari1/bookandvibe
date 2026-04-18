const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get the default configuration data if none exists
const getDefaultConfig = () => ({
  banners: JSON.stringify([
    {
      id: "event-banner",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074",
      title: "THE VIBE.",
      subtitle: "Discover concerts, events & experiences near you",
      buttonText: "Explore Events",
      buttonLink: "/events"
    },
    {
      id: "gamehub-banner",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000",
      title: "THE GAME.",
      subtitle: "Book turfs, play matches & compete locally",
      buttonText: "Explore GameHub",
      buttonLink: "/gamehub"
    }
  ]),
  footerText: "Book & Vibe helps you discover experiences at the best value in your city. From headline events to game nights, every booking is designed to feel seamless, reliable and worth sharing.",
  socialLinks: JSON.stringify([
    { platform: "Facebook", url: "https://facebook.com" },
    { platform: "Twitter", url: "https://twitter.com" },
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "YouTube", url: "https://youtube.com" }
  ])
});

// GET /api/config/website
// Fetch or initialize the global website configuration
router.get('/website', async (req, res) => {
  try {
    let config = await prisma.websiteConfig.findUnique({
      where: { id: "global" }
    });

    if (!config) {
      config = await prisma.websiteConfig.create({
        data: {
          id: "global",
          ...getDefaultConfig()
        }
      });
    }

    res.json({
      success: true,
      data: {
        banners: JSON.parse(config.banners),
        footerText: config.footerText,
        socialLinks: JSON.parse(config.socialLinks)
      }
    });
  } catch (error) {
    console.error("Fetch Website Config Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch website config" });
  }
});

// PUT /api/config/website
// Update the global website configuration
router.put('/website', async (req, res) => {
  try {
    const { banners, footerText, socialLinks } = req.body;

    // Check if exists first because upsert might be better, but we know front-end logic will initialize first if missing
    const config = await prisma.websiteConfig.upsert({
      where: { id: "global" },
      update: {
        banners: JSON.stringify(banners),
        footerText,
        socialLinks: JSON.stringify(socialLinks)
      },
      create: {
        id: "global",
        banners: banners ? JSON.stringify(banners) : getDefaultConfig().banners,
        footerText: footerText || getDefaultConfig().footerText,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : getDefaultConfig().socialLinks
      }
    });

    res.json({
      success: true,
      message: "Website configuration updated successfully",
      data: {
        banners: JSON.parse(config.banners),
        footerText: config.footerText,
        socialLinks: JSON.parse(config.socialLinks)
      }
    });
  } catch (error) {
    console.error("Update Website Config Error:", error);
    res.status(500).json({ success: false, message: "Failed to update website config" });
  }
});

// GET /api/config/activity
// Aggregates recent platform activity from users, events, bookings, and payments
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Fetch recent data from multiple tables in parallel
    const [recentUsers, recentEvents, recentBookings, recentPayments] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, role: true, createdAt: true }
      }),
      prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, title: true, status: true, isPublished: true, createdAt: true }
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true, status: true, totalAmount: true, createdAt: true,
          user: { select: { name: true } },
          event: { select: { title: true } }
        }
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true, amount: true, status: true, method: true, createdAt: true,
          booking: {
            select: {
              user: { select: { name: true } },
              event: { select: { title: true } }
            }
          }
        }
      })
    ]);

    // Transform into a unified activity feed
    const activities = [];

    for (const user of recentUsers) {
      const isPartner = user.role === 'PARTNER';
      activities.push({
        type: isPartner ? 'partner_joined' : 'user_registered',
        text: isPartner ? `Partner '${user.name}' onboarded` : `New user ${user.name} registered`,
        createdAt: user.createdAt,
      });
    }

    for (const event of recentEvents) {
      if (event.isPublished) {
        activities.push({
          type: 'event_published',
          text: `Event '${event.title}' published`,
          createdAt: event.createdAt,
        });
      } else {
        activities.push({
          type: 'event_created',
          text: `Event '${event.title}' created as draft`,
          createdAt: event.createdAt,
        });
      }
    }

    for (const booking of recentBookings) {
      const userName = booking.user?.name || 'User';
      const eventTitle = booking.event?.title || 'Event';
      activities.push({
        type: 'booking',
        text: `${userName} booked '${eventTitle}' for INR ${booking.totalAmount?.toLocaleString('en-IN')}`,
        createdAt: booking.createdAt,
      });
    }

    for (const payment of recentPayments) {
      if (payment.status === 'SUCCESS') {
        activities.push({
          type: 'payment',
          text: `Payment INR ${payment.amount?.toLocaleString('en-IN')} received`,
          createdAt: payment.createdAt,
        });
      }
    }

    // Sort all activities by time (newest first) and take the top N
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const feed = activities.slice(0, limit);

    res.json({ success: true, data: feed });
  } catch (error) {
    console.error("Activity Feed Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity feed" });
  }
});

module.exports = router;
