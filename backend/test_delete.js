const prisma = require('./src/lib/prisma');

async function testDelete() {
  const event = await prisma.event.findFirst();
  if (!event) {
    console.log("No events to delete");
    return;
  }
  
  try {
    await prisma.$transaction(async (tx) => {
      await tx.bookingItem.deleteMany({ where: { booking: { eventId: event.id } } });
      await tx.bookingSeat.deleteMany({ where: { booking: { eventId: event.id } } });
      await tx.payment.deleteMany({ where: { booking: { eventId: event.id } } });
      await tx.booking.deleteMany({ where: { eventId: event.id } });
      await tx.review.deleteMany({ where: { eventId: event.id } });
      
      await tx.event.delete({ where: { id: event.id } });
    });
    console.log("Delete successful!");
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

testDelete().catch(console.error).finally(() => prisma.$disconnect());
