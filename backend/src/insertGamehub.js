const prisma = require('./lib/prisma');

async function main() {
  console.log('🏟️  Seeding GameHub Facilities...');

  const facilities = [
    {
      name: 'Grand Slam Cricket Nets',
      type: 'Cricket Nets',
      location: 'Ameerpet, Hyderabad',
      venue: 'Sr Nagar X Roads, Ameerpet',
      distance: '1.8 km away',
      rating: 4.6,
      reviewsCount: 75,
      pricePerHour: 450,
      unit: 'hr',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200',
      description: 'Affordable high-quality cricket nets with multiple pitches and basic gear support.',
      phone: '+91 98765 43214',
      openHours: '6:30 AM - 10:30 PM',
      status: 'ACTIVE',
      amenities: JSON.stringify(['Parking', 'Water', 'Locker']),
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200',
        'https://images.unsplash.com/photo-1540324155970-14e422f01f2f?q=80&w=1200',
      ]),
      slotTemplate: JSON.stringify([
        { label: '04:00 PM', isBooked: false },
        { label: '05:00 PM', isBooked: false },
        { label: '06:00 PM', isBooked: true },
      ]),
    },
    {
      name: 'Power Play Turf',
      type: 'Football Turf',
      location: 'Madhapur, Hyderabad',
      venue: 'Opp. Cyber Pillars, Madhapur',
      distance: '0.9 km away',
      rating: 4.8,
      reviewsCount: 156,
      pricePerHour: 1500,
      unit: 'hr',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200',
      description: 'Premium synthetic turf in the heart of the IT corridor. Ideal for corporate matches.',
      phone: '+91 98765 43215',
      openHours: '24 Hours',
      status: 'ACTIVE',
      amenities: JSON.stringify(['Parking', 'Floodlights', 'Changing Room', 'Washrooms', 'First Aid']),
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200',
        'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=1200',
      ]),
      slotTemplate: JSON.stringify([
        { label: '07:00 PM', isBooked: true },
        { label: '08:00 PM', isBooked: false },
        { label: '09:00 PM', isBooked: false },
      ]),
    },
    {
      name: 'Master Blaster Nets',
      type: 'Cricket Nets',
      location: 'Whitefield, Bangalore',
      venue: 'Near ITPL Gate, Whitefield',
      distance: '2.5 km away',
      rating: 4.7,
      reviewsCount: 92,
      pricePerHour: 550,
      unit: 'hr',
      image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1200',
      description: 'Indoor and outdoor cricket nets with advanced tracking for professional practice.',
      phone: '+91 98765 43216',
      openHours: '5:00 AM - 11:00 PM',
      status: 'ACTIVE',
      amenities: JSON.stringify(['Parking', 'Equipment Rental', 'Coaching', 'Cafeteria']),
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1200',
      ]),
      slotTemplate: JSON.stringify([
        { label: '06:00 AM', isBooked: true },
        { label: '07:00 AM', isBooked: false },
        { label: '08:00 AM', isBooked: false },
      ]),
    },
    {
      name: 'Thunder Turf 7v7',
      type: 'Football Turf',
      location: 'Indiranagar, Bangalore',
      venue: '12th Main Road, Indiranagar',
      distance: '1.2 km away',
      rating: 4.9,
      reviewsCount: 210,
      pricePerHour: 1800,
      unit: 'hr',
      image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=1200',
      description: 'Largest 7v7 turf in Indiranagar with premium shock-absorption technology.',
      phone: '+91 98765 43217',
      openHours: '6:00 AM - 12:00 AM',
      status: 'ACTIVE',
      amenities: JSON.stringify(['Parking', 'Floodlights', 'Dugouts', 'Changing Rooms', 'Showers']),
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=1200',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200',
      ]),
      slotTemplate: JSON.stringify([
        { label: '08:00 PM', isBooked: true },
        { label: '09:00 PM', isBooked: true },
        { label: '10:00 PM', isBooked: false },
      ]),
    },
    {
      name: 'Victory Cricket Academy',
      type: 'Cricket Nets',
      location: 'Vijayawada',
      venue: 'Benz Circle, Vijayawada',
      distance: '0.5 km away',
      rating: 4.8,
      reviewsCount: 110,
      pricePerHour: 400,
      unit: 'hr',
      image: 'https://images.unsplash.com/photo-1540324155970-14e422f01f2f?q=80&w=1200',
      description: 'Top-tier cricket academy with professional nets and expert coaching available.',
      phone: '+91 98765 43218',
      openHours: '6:00 AM - 9:00 PM',
      status: 'ACTIVE',
      amenities: JSON.stringify(['Parking', 'Water', 'Coaching', 'Equipment']),
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1540324155970-14e422f01f2f?q=80&w=1200',
      ]),
      slotTemplate: JSON.stringify([
        { label: '04:00 PM', isBooked: false },
        { label: '05:00 PM', isBooked: true },
      ]),
    },
    {
      name: 'Royal Cricket Nets',
      type: 'Cricket Nets',
      location: 'Vijayawada',
      venue: 'Kanuru, Vijayawada',
      distance: '3.2 km away',
      rating: 4.5,
      reviewsCount: 64,
      pricePerHour: 350,
      unit: 'hr',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200',
      description: 'Excellent practice facilities for all age groups. Quiet environment.',
      phone: '+91 98765 43219',
      openHours: '5:00 AM - 8:00 PM',
      status: 'ACTIVE',
      amenities: JSON.stringify(['Parking', 'Drinking Water']),
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200',
      ]),
      slotTemplate: JSON.stringify([
        { label: '07:00 AM', isBooked: false },
        { label: '08:00 AM', isBooked: false },
      ]),
    },
    {
      name: 'Stadium View Nets',
      type: 'Cricket Nets',
      location: 'Vijayawada',
      venue: 'MG Road, Vijayawada',
      distance: '1.5 km away',
      rating: 4.7,
      reviewsCount: 88,
      pricePerHour: 500,
      unit: 'hr',
      image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1200',
      description: 'Modern nets with high-quality flooring and floodlights for late practice sessions.',
      phone: '+91 98765 43220',
      openHours: '6:00 AM - 11:00 PM',
      status: 'ACTIVE',
      amenities: JSON.stringify(['Floodlights', 'Parking', 'Washrooms', 'First Aid']),
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1200',
      ]),
      slotTemplate: JSON.stringify([
        { label: '06:00 PM', isBooked: true },
        { label: '07:00 PM', isBooked: false },
      ]),
    },
  ];

  for (const facility of facilities) {
    const created = await prisma.gamehubFacility.create({
      data: facility,
    });
    console.log(`✅ Created facility: ${created.name}`);
  }

  console.log('✅ GameHub seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.dir(e, { depth: null });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
