import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
        });

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