const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clear existing data
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.bookingItem.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.tier.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@bookandvibe.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  const partner = await prisma.user.create({
    data: {
      name: 'Event Partner',
      email: 'partner@example.com',
      password: hashedPassword,
      role: 'PARTNER',
      status: 'ACTIVE',
      partnerType: 'EVENT_HOST'
    }
  });

  const venuePartner = await prisma.user.create({
    data: {
      name: 'Venue Partner',
      email: 'venue@example.com',
      password: hashedPassword,
      role: 'PARTNER',
      status: 'ACTIVE',
      partnerType: 'VENUE_OWNER'
    }
  });

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE'
    }
  });

  // 3. Create Events
  const eventsData = [
    {
      title: 'Dil Se - DSP Special Telugu Jamming',
      description: 'A specially curated live set focusing on the vibrant sounds of Devi Sri Prasad featuring the EIRA band.',
      category: 'MUSIC',
      location: 'Hyderabad',
      venue: 'Throwback, Kavuri Hills',
      date: new Date('2026-04-19T19:00:00Z'),
      time: '07:00 PM',
      price: 349,
      totalSlots: 150,
      image: 'https://d3pmsbscv4kwdi.cloudfront.net/events/1775570542079-384f5959f4eefd59.jpg'
    },
    {
      title: 'Diljit Dosanjh - Dil-Luminati Tour',
      description: 'The historic Dil-Luminati tour brings the biggest Punjabi pop sensation to Hyderabad. Prepare for an unforgettable, high-energy night!',
      category: 'MUSIC',
      location: 'Hyderabad',
      venue: 'GMR Arena, Hyderabad',
      date: new Date('2026-11-15T19:00:00Z'),
      time: '07:00 PM',
      price: 3999,
      totalSlots: 5000,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg/640px-Diljit_Dosanjh_at_the_launch_of_his_new_film_Super_Singh_%281%29_%28cropped%29.jpg'
    },
    {
      title: 'Zomato Feeding India ft. Dua Lipa',
      description: 'Zomato District presents Dua Lipa live in Mumbai for the Feeding India Concert. An electrifying night of international pop hits for a great cause.',
      category: 'MUSIC',
      location: 'Mumbai',
      venue: 'MMRDA Grounds, BKC',
      date: new Date('2026-11-30T18:00:00Z'),
      time: '06:00 PM',
      price: 4500,
      totalSlots: 10000,
      image: 'https://i.scdn.co/image/ab6761610000e5ebd42a27db3286b58553da8858'
    },
    {
      title: 'Coldplay: Music Of The Spheres World Tour',
      description: 'The record-breaking stadium tour arrives in India. Experience Coldplay\'s breathtaking audiovisual spectacle featuring all your favorite anthems.',
      category: 'MUSIC',
      location: 'Mumbai',
      venue: 'DY Patil Stadium, Navi Mumbai',
      date: new Date('2026-01-18T18:00:00Z'),
      time: '06:00 PM',
      price: 8000,
      totalSlots: 20000,
      image: 'https://i.scdn.co/image/ab6761610000e5eb989ed05e1f0570cc4726c2d3'
    },
    {
      title: 'Karan Aujla - It Was All A Dream',
      description: 'The breakout Punjabi hip-hop star brings his massive arena tour to Bengaluru. Get ready for unmatched swagger and chart-topping hits.',
      category: 'MUSIC',
      location: 'Bangalore',
      venue: 'Bhartiya City, Bengaluru',
      date: new Date('2026-12-07T19:00:00Z'),
      time: '07:00 PM',
      price: 2999,
      totalSlots: 8000,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Karan_Aujla_2021.jpg/640px-Karan_Aujla_2021.jpg'
    },
    {
      title: 'Sunburn Arena ft. Alan Walker',
      description: 'The global EDM sensation Alan Walker brings his WalkerWorld tour to Kochi for a mind-blowing electronic music experience.',
      category: 'MUSIC',
      location: 'Kochi',
      venue: 'Kochi International Marina',
      date: new Date('2026-10-04T17:00:00Z'),
      time: '05:00 PM',
      price: 2000,
      totalSlots: 3000,
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Alan_Walker_%2842416801991%29.jpg/640px-Alan_Walker_%2842416801991%29.jpg'
    }
  ];

  for (const event of eventsData) {
    const newEvent = await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        venue: event.venue,
        date: event.date,
        time: event.time,
        price: event.price,
        totalSlots: event.totalSlots,
        availableSlots: event.totalSlots,
        images: JSON.stringify([event.image]),
        partnerId: partner.id,
        featured: true,
        status: 'ACTIVE',
        isPublished: true,
        publishedAt: new Date(),
        tiers: {
          create: [
            { name: 'Platinum', price: event.price * 2, quantity: Math.floor(event.totalSlots * 0.1), available: Math.floor(event.totalSlots * 0.1), color: 'rose' },
            { name: 'Gold', price: event.price * 1.5, quantity: Math.floor(event.totalSlots * 0.3), available: Math.floor(event.totalSlots * 0.3), color: 'amber' },
            { name: 'Silver', price: event.price, quantity: Math.floor(event.totalSlots * 0.6), available: Math.floor(event.totalSlots * 0.6), color: 'slate' }
          ]
        }
      }
    });
    console.log(`✅ Created event: ${newEvent.title}`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
