
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, reason } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }

        // 1. Fetch the order to verify ownership and status
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, userId: true, status: true }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== userId) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // 2. Check if Cancellable
        // User rule: "Basically before delivered user can anytime cancel"
        const nonCancellableStatuses = ['DELIVERED', 'CANCELLED', 'FAILED', 'REFUNDED', 'RETURNED'];
        if (nonCancellableStatuses.includes(order.status.toUpperCase())) {
            return NextResponse.json({ success: false, error: `Cannot cancel order with status: ${order.status}` }, { status: 400 });
        }

        // 3. Update Status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CANCELLED'
            }
        });

        // 4. Create Notification for User
        await prisma.notification.create({
            data: {
                userId: userId,
                title: `Order Cancelled #${orderId.slice(-6).toUpperCase()}`,
                body: "Your order has been cancelled successfully. If you have paid online, the refund will be initiated within 24-48 hours.",
                type: 'ORDER_UPDATE'
            }
        });

        // TODO: Notify Admin (Email or Admin Notification Table)
        // console.log(`[ADMIN NOTIFY] Order ${orderId} cancelled by user ${userId}. Reason: ${reason}`);

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully. Refund initiated.',
            order: updatedOrder
        });

    } catch (error: any) {
        console.error('Cancel Order Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
