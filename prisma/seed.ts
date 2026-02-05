import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } // Crucial for AWS RDS
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await hash('dsjnfdnsksjdin', 12);
  const adminEmail = 'admin@7thheaven.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: password,
      isAdmin: true,
      is7thHeaven: true,
    },
    create: {
      email: adminEmail,
      fullName: 'Admin User',
      phone: '+919999999999',
      passwordHash: password,
      isAdmin: true,
      is7thHeaven: true,
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