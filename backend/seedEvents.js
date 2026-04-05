const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find or create a partner user to own the events
  let partner = await prisma.user.findFirst({ where: { role: 'PARTNER' } });
  
  if (!partner) {
     partner = await prisma.user.create({
       data: {
         name: "IndulgeOut Official",
         email: "experiences@indulgeout.com",
         password: "securepassword123", 
         role: "PARTNER"
       }
     });
  }

  const events = [
    {
      title: "Neon Paint & Sip Party",
      description: "Unleash your creativity under UV lights with friends and drinks! All painting materials will be provided.",
      category: "WORKSHOP",
      location: "Downtown",
      venue: "The Canvas Room",
      date: new Date(Date.now() + 86400000 * 3), // 3 days from now
      time: "19:00",
      price: 49.99,
      totalSlots: 30,
      availableSlots: 15,
      images: JSON.stringify(["https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1000"]),
      status: "APPROVED",
      featured: true,
      partnerId: partner.id
    },
    {
      title: "Weekend Singles Mixer",
      description: "Meet exciting new people in a relaxed, fun environment with curated icebreakers.",
      category: "NIGHTLIFE",
      location: "Skyline Lounge",
      venue: "Rooftop Bar",
      date: new Date(Date.now() + 86400000 * 5),
      time: "20:30",
      price: 25.00,
      totalSlots: 100,
      availableSlots: 80,
      images: JSON.stringify(["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000"]),
      status: "APPROVED",
      featured: true,
      partnerId: partner.id
    },
    {
      title: "Sip & Sculpt Clay Workshop",
      description: "Learn the basics of pottery while enjoying your favorite drinks. Take your creation home!",
      category: "WORKSHOP",
      location: "Creative Arts Center",
      venue: "Main Studio",
      date: new Date(Date.now() + 86400000 * 7),
      time: "18:00",
      price: 55.00,
      totalSlots: 20,
      availableSlots: 5,
      images: JSON.stringify(["https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000"]),
      status: "APPROVED",
      featured: false,
      partnerId: partner.id
    },
    {
      title: "Sunset Kayaking Adventure",
      description: "Enjoy a peaceful kayaking trip during the beautiful golden hour. No prior experience needed.",
      category: "ADVENTURE",
      location: "Riverfront",
      venue: "Water Sports Club",
      date: new Date(Date.now() + 86400000 * 10),
      time: "17:30",
      price: 35.00,
      totalSlots: 15,
      availableSlots: 14,
      images: JSON.stringify(["https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000"]),
      status: "APPROVED",
      featured: true,
      partnerId: partner.id
    }
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }

  console.log("Successfully seeded IndulgeOut offline events!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
