const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const facilities = await prisma.gamehubFacility.findMany();
  console.log(JSON.stringify(facilities, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
