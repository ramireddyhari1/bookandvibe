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
      status: 'ACTIVE'
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
      title: 'Global Tech Summit 2026',
      description: 'The biggest networking event for developers and tech enthusiasts.',
      category: 'WORKSHOP',
      location: 'Bangalore',
      venue: 'Pragati Maidan',
      date: new Date('2026-06-15T09:00:00Z'),
      time: '09:00 AM',
      price: 999,
      totalSlots: 1000,
      image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c9f5'
    },
    {
      title: 'Retro Music Night',
      description: 'Experience the 80s and 90s hits with live performances.',
      category: 'MUSIC',
      location: 'Mumbai',
      venue: 'DY Patil Stadium',
      date: new Date('2026-05-20T18:00:00Z'),
      time: '06:00 PM',
      price: 1499,
      totalSlots: 5000,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'
    },
    {
      title: 'Laughter Riot: Solo Special',
      description: 'A night filled with laughter and hilarious observations.',
      category: 'COMEDY',
      location: 'Delhi',
      venue: 'Siri Fort Auditorium',
      date: new Date('2026-04-25T19:30:00Z'),
      time: '07:30 PM',
      price: 499,
      totalSlots: 800,
      image: 'https://images.unsplash.com/photo-1514525253361-bee8a48790c3'
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
