const dotenv = require('dotenv');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma/default');

dotenv.config({ override: true });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password123@127.0.0.1:5433/book_and_vibe';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
