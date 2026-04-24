const prisma = require('./src/lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@bookandvibe.com' },
    update: { password: hashedPassword, role: 'ADMIN', status: 'ACTIVE' },
    create: {
      name: 'System Admin',
      email: 'admin@bookandvibe.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log('Admin user verified/updated:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
