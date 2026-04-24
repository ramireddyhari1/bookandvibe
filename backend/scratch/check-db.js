const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/prisma/default');

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:5432/bookmyvibe';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    console.log('Connecting to database on 5432/bookmyvibe...');
    await prisma.$connect();
    console.log('Connected successfully!');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

check();
