import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOrderStatusUpdate } from '@/lib/email';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, paymentStatus } = body;

        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'RETURNED'];

        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const dataToUpdate: any = {};
        if (status) dataToUpdate.status = status;
        if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: dataToUpdate,
            include: { user: true }
        });

        // Send email notification for status updates
        if (status && updatedOrder.shippingAddress) {
            const shippingAddr = updatedOrder.shippingAddress as any;
            const customerEmail = shippingAddr.email || updatedOrder.user?.email;
            const customerName = shippingAddr.fullName || updatedOrder.user?.fullName || 'Customer';

            if (customerEmail) {
                sendOrderStatusUpdate(customerEmail, {
                    orderId: updatedOrder.id,
                    customerName,
                    status,
                    message: getStatusMessage(status)
                }).catch(err => console.error('Status email error:', err));
            }
        }

        if (paymentStatus === 'REFUNDED') {
            await prisma.notification.create({
                data: {
                    userId: updatedOrder.userId,
                    title: `Refund Processed #${updatedOrder.id.slice(-6).toUpperCase()}`,
                    body: "Your refund has been processed successfully. It should reflect in your account shortly.",
                    type: 'ORDER_UPDATE'
                }
            });
        }

        return NextResponse.json({ success: true, data: updatedOrder });

    } catch (error) {
        console.error('Update Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
        PROCESSING: 'Your order is being prepared and will be shipped soon.',
        SHIPPED: 'Great news! Your order has been shipped and is on its way to you.',
        DELIVERED: 'Your order has been delivered. We hope you love your purchase!',
        CANCELLED: 'Your order has been cancelled. If you have any questions, please contact support.',
        REFUNDED: 'Your refund has been processed. It should reflect in your account within 5-7 business days.',
        RETURNED: 'We have received your returned items. Your refund will be processed shortly.'
    };
    return messages[status] || `Your order status has been updated to: ${status}`;
}