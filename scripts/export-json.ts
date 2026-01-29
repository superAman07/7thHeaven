require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');

async function main() {
    console.log('📥 Exporting data from CURRENT DB...');

    // 1. Create the Pool and Adapter
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    // 2. Initialize Prisma with the adapter
    const prisma = new PrismaClient({ adapter });

    try {
        const data = {
            users: await prisma.user.findMany(),
            categories: await prisma.category.findMany(),
            products: await prisma.product.findMany(),
            variants: await prisma.productVariant.findMany(),
            orders: await prisma.order.findMany(),
            settings: await prisma.mLMSettings.findMany(),
            siteContent: await prisma.siteContent.findMany(),
        };

        fs.writeFileSync('backup-data.json', JSON.stringify(data, null, 2));
        console.log('✅ Data exported to "backup-data.json"');
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(console.error);
export { };