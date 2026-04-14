const prisma = require('../src/lib/prisma');
const { creditPartnerWallet } = require('../src/services/wallet.service');

async function main() {
  console.log('--- Starting Partner Earnings Backfill ---');

  // 1. Process Event Bookings
  console.log('\nProcessing Event Bookings...');
  const eventBookings = await prisma.booking.findMany({
    where: { 
      status: { in: ['CONFIRMED', 'USED'] } 
    },
    include: {
      event: { select: { id: true, title: true, partnerId: true } }
    }
  });

  console.log(`Found ${eventBookings.length} successful event bookings.`);
  let eventSuccess = 0;
  let eventSkipped = 0;

  for (const booking of eventBookings) {
    try {
      await prisma.$transaction(async (tx) => {
        // Check if already credited
        const existingTx = await tx.walletTransaction.findFirst({
          where: { referenceId: booking.id }
        });

        if (existingTx) {
          eventSkipped++;
          return;
        }

        // Credit wallet
        const eventTitle = booking.event.title || 'Event Entrance';
        await creditPartnerWallet(
          tx,
          booking.event.partnerId,
          booking.totalAmount,
          `Earning: ${eventTitle} (Backfill #${booking.id.slice(0, 8)})`,
          booking.id
        );
        eventSuccess++;
      });
    } catch (err) {
      console.error(`Failed to process event booking ${booking.id}:`, err.message);
    }
  }
  console.log(`Event Bookings: ${eventSuccess} credited, ${eventSkipped} already processed.`);

  // 2. Process GameHub Bookings
  console.log('\nProcessing GameHub Bookings...');
  const gamehubBookings = await prisma.gamehubBooking.findMany({
    where: { status: 'CONFIRMED' },
    include: {
      facility: { select: { id: true, name: true, partnerId: true } }
    }
  });

  console.log(`Found ${gamehubBookings.length} successful GameHub bookings.`);
  let ghSuccess = 0;
  let ghSkipped = 0;

  for (const booking of gamehubBookings) {
    if (!booking.facility.partnerId) {
      ghSkipped++;
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Check if already credited
        const existingTx = await tx.walletTransaction.findFirst({
          where: { referenceId: booking.id }
        });

        if (existingTx) {
          ghSkipped++;
          return;
        }

        // Credit wallet
        await creditPartnerWallet(
          tx,
          booking.facility.partnerId,
          booking.totalAmount,
          `Venue Earning: ${booking.facility.name} (Backfill Slot: ${booking.slotLabel})`,
          booking.id
        );
        ghSuccess++;
      });
    } catch (err) {
      console.error(`Failed to process GameHub booking ${booking.id}:`, err.message);
    }
  }
  console.log(`GameHub Bookings: ${ghSuccess} credited, ${ghSkipped} skipped (non-partner or already processed).`);

  console.log('\n--- Backfill Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
