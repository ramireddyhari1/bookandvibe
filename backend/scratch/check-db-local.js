const dotenv = require('dotenv');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma/default');

dotenv.config({ path: '.env', override: true });

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password123@127.0.0.1:5433/book_and_vibe';
  console.log('Using connection string:', connectionString);

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const facilities = await prisma.gamehubFacility.findMany();
    console.log('Total facilities:', facilities.length);
    console.log('Facilities Data:', JSON.stringify(facilities, null, 2));
  } catch (err) {
    console.error('Error fetching facilities:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
