const prisma = require('./src/lib/prisma');
const { FACILITIES } = require('./src/data/gamehub.data');

async function seedGamehub() {
  console.log('🌱 Seeding GameHub facilities...');

  // 1. Clear existing data (Optional, but good for clean seed)
  // await prisma.gamehubReview.deleteMany({});
  // await prisma.gamehubBooking.deleteMany({});
  // await prisma.gamehubBlockedSlot.deleteMany({});
  // await prisma.gamehubFacility.deleteMany({});

  for (const facility of FACILITIES) {
    const data = {
      id: facility.id,
      name: facility.name,
      type: facility.type,
      location: facility.location,
      venue: facility.venue,
      distance: facility.distance || '0 km away',
      rating: facility.rating || 0,
      reviewsCount: facility.reviewsCount || 0,
      pricePerHour: facility.pricePerHour || 0,
      unit: facility.unit || 'hr',
      image: facility.image,
      description: facility.description || '',
      phone: facility.phone || '',
      openHours: facility.openHours || '',
      status: facility.status || 'ACTIVE',
      pricingRules: JSON.stringify(facility.pricingRules || []),
      amenities: JSON.stringify(facility.amenities || []),
      features: JSON.stringify(facility.features || []),
      tags: JSON.stringify(facility.tags || []),
      gallery: JSON.stringify(facility.gallery || []),
      battleModes: JSON.stringify(facility.battleModes || []),
      slotTemplate: JSON.stringify(facility.slotTemplate || []),
      availableSports: JSON.stringify(facility.availableSports || []),
    };

    try {
      await prisma.gamehubFacility.upsert({
        where: { id: facility.id },
        update: data,
        create: data,
      });
      console.log(`✅ Seeded facility: ${facility.name}`);
    } catch (err) {
      console.error(`❌ Failed to seed facility ${facility.name}:`, err.message);
    }
  }

  console.log('✅ GameHub seeding completed!');
}

seedGamehub()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
