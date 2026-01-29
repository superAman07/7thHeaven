require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('🚀 Starting Migration: Neon -> AWS RDS');

  const neonUrl = process.env.DATABASE_URL;
  const awsUrl = process.env.AWS_DATABASE_URL;

  if (!neonUrl) throw new Error("Missing DATABASE_URL");
  if (!awsUrl) throw new Error("Missing AWS_DATABASE_URL");

  // PHASE 1: READ FROM NEON
  // We initialize with empty object {} to avoid the bug
  console.log('📥 Reading data from Neon DB...');
  const db1 = new PrismaClient({}); 
  
  const users = await db1.user.findMany();
  const categories = await db1.category.findMany();
  const products = await db1.product.findMany();
  const variants = await db1.productVariant.findMany();
  const orders = await db1.order.findMany();
  const settings = await db1.mLMSettings.findMany();
  
  await db1.$disconnect();
  console.log(`✅ Loaded ${users.length} users, ${products.length} products.`);

  // PHASE 2: WRITE TO AWS
  console.log('📤 Writing to AWS DB...');
  
  // SWAP URL
  process.env.DATABASE_URL = awsUrl;
  
  // Initialize new client with the NEW env var
  const db2 = new PrismaClient({});

  try {
    // 1. Users
    for (const item of users) {
      if (!await db2.user.findUnique({ where: { id: item.id } })) {
        await db2.user.create({ data: item });
      }
    }
    
    // 2. Categories
    for (const item of categories) {
      if (!await db2.category.findUnique({ where: { id: item.id } })) {
        await db2.category.create({ data: item });
      }
    }

    // 3. Products
    for (const item of products) {
      if (!await db2.product.findUnique({ where: { id: item.id } })) {
        await db2.product.create({ data: item });
      }
    }

    // 4. Variants
    for (const item of variants) {
      if (!await db2.productVariant.findUnique({ where: { id: item.id } })) {
        await db2.productVariant.create({ data: item });
      }
    }

    // 5. Orders
    for (const item of orders) {
      if (!await db2.order.findUnique({ where: { id: item.id } })) {
        await db2.order.create({ data: item });
      }
    }

    // 6. Settings
    for (const item of settings) {
      if (!await db2.mLMSettings.findUnique({ where: { id: item.id } })) {
        await db2.mLMSettings.create({ data: item });
      }
    }

    console.log('🎉 MIGRATION COMPLETE!');

  } finally {
    await db2.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });