import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [revenueResult, totalOrders, totalProducts, eliteMembers] = await prisma.$transaction([
            // 1. Sum of Revenue (Only PAID orders)
            prisma.order.aggregate({
                _sum: { subtotal: true },
                where: { paymentStatus: 'PAID' }
            }),
            // 2. Total Orders Count
            prisma.order.count(),
            // 3. Total Products Count
            prisma.product.count(),
            // 4. Elite Members Count
            prisma.user.count({
                where: { is7thHeaven: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                revenue: revenueResult._sum.subtotal || 0,
                orders: totalOrders,
                products: totalProducts,
                members: eliteMembers
            }
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}