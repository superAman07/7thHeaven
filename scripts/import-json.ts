require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');

async function main() {
    console.log('📤 Importing data to CURRENT DB...');

    if (!fs.existsSync('backup-data.json')) {
        throw new Error('backup-data.json not found!');
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL missing");

    // Configure Pool with SSL
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const raw = fs.readFileSync('backup-data.json');
        const data = JSON.parse(raw);

        // ----------------------------------------------------
        // 1. USERS (PASS 1: CREATE WITHOUT REFERRER)
        // ----------------------------------------------------
        console.log('📦 Migrating Users (Phase 1: Creation)...');
        for (const item of data.users) {
            if (!await prisma.user.findUnique({ where: { id: item.id } })) {
                // Remove referrerId for now to avoid FK error
                const { referrerId, ...userData } = item;
                await prisma.user.create({ data: userData });
            }
        }

        // ----------------------------------------------------
        // 2. USERS (PASS 2: CONNECT REFERRERS)
        // ----------------------------------------------------
        console.log('🔗 Connecting User Referrals (Phase 2)...');
        for (const item of data.users) {
            if (item.referrerId) {
                await prisma.user.update({
                    where: { id: item.id },
                    data: { referrerId: item.referrerId }
                });
            }
        }
        console.log(`✅ ${data.users.length} Users`);

        // ----------------------------------------------------
        // 3. CATEGORIES
        // ----------------------------------------------------
        for (const item of data.categories) {
            if (!await prisma.category.findUnique({ where: { id: item.id } })) {
                await prisma.category.create({ data: item });
            }
        }
        console.log(`✅ ${data.categories.length} Categories`);

        // ----------------------------------------------------
        // 4. PRODUCTS
        // ----------------------------------------------------
        for (const item of data.products) {
            if (!await prisma.product.findUnique({ where: { id: item.id } })) {
                await prisma.product.create({ data: item });
            }
        }
        console.log(`✅ ${data.products.length} Products`);

        // ----------------------------------------------------
        // 5. VARIANTS
        // ----------------------------------------------------
        for (const item of data.variants) {
            if (!await prisma.productVariant.findUnique({ where: { id: item.id } })) {
                await prisma.productVariant.create({ data: item });
            }
        }
        console.log(`✅ ${data.variants.length} Variants`);

        // ----------------------------------------------------
        // 6. ORDERS
        // ----------------------------------------------------
        for (const item of data.orders) {
            if (!await prisma.order.findUnique({ where: { id: item.id } })) {
                await prisma.order.create({ data: item });
            }
        }
        console.log(`✅ ${data.orders.length} Orders`);

        // ----------------------------------------------------
        // 7. SETTINGS
        // ----------------------------------------------------
        for (const item of data.settings) {
            if (!await prisma.mLMSettings.findUnique({ where: { id: item.id } })) {
                await prisma.mLMSettings.create({ data: item });
            }
        }
        console.log(`✅ ${data.settings.length} Settings`);

        // ----------------------------------------------------
        // 8. SITE CONTENT
        // ----------------------------------------------------
        if (data.siteContent) {
            for (const item of data.siteContent) {
                if (!await prisma.siteContent.findUnique({ where: { section: item.section } })) {
                    await prisma.siteContent.create({ data: item });
                }
            }
            console.log(`✅ ${data.siteContent.length} Site Content Blocks`);
        }

        console.log('🎉 RESTORE COMPLETE!');

    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(console.error);
export { };