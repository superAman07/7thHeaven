import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId } = await params;

        const order = await prisma.order.findFirst({
            where: {
                gatewayOrderId: transactionId,
                userId: userId, // Ensure the user can only check their own orders
            },
            select: {
                id: true,
                paymentStatus: true,
                subtotal: true,
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found or access denied.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error('Get Payment Status Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}