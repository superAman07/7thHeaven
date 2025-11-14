import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('admin123', 12);
  const adminEmail = 'admin@example.com';

  // Upsert the admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: password,
      isAdmin: true,
    },
    create: {
      email: adminEmail,
      fullName: 'Admin User',
      phone: '+10000000000', // Using a placeholder phone number
      passwordHash: password,
      isAdmin: true,
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });