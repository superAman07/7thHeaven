import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        // Ensure we actually have an orderId to work with
        if (!payload.orderId) {
             return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
        }

        // 1. Check if the order exists in our local DB
        const existingOrder = await prisma.order.findUnique({
            where: { id: payload.orderId }
        });

        if (!existingOrder) {
            return NextResponse.json({ error: "Order not found in CelsiusPop" }, { status: 404 });
        }


        // ==============================================================================
        // EVENT 1: Initial Shipment Creation (From Checkout)
        // ==============================================================================
        if (payload.event === 'order_shipped') {
            const { orderId, awb, courierUrl } = payload;

            if (!awb) {
                return NextResponse.json({ error: "Missing AWB tracking data" }, { status: 400 });
            }

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'MANIFESTED',
                    awb: awb,
                    courierUrl: courierUrl || null,
                    shippedAt: new Date()
                }
            });

            console.log(`[Webhook] Success: Order ${orderId} marked as SHIPPED with Tracking: ${awb}`);
            return NextResponse.json({ success: true, message: "Webhook processed" }, { status: 200 });
        }

        // ==============================================================================
        // EVENT 2: Continuous Live Status Updates (In Transit, Delivered, etc.)
        // ==============================================================================
        else if (payload.event === 'order_status_update') {
            const { orderId, status } = payload;

            if (!status) {
                return NextResponse.json({ error: "Missing new status string" }, { status: 400 });
            }

            // Shipquickr sends clean lowercase ENUM strings: 
            // 'manifested', 'in_transit', 'out_for_delivery', 'delivered', 'rto', etc.
            // Let's uppercase it so it looks clean in the CelsiusPop Database.
            const formattedStatus = status.toUpperCase();

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: formattedStatus
                }
            });

            console.log(`[Webhook] Live Update: Order ${orderId} is now ${formattedStatus}`);
            return NextResponse.json({ success: true, message: "Status updated successfully" }, { status: 200 });
        }

        // ==============================================================================
        // EVENT 3: Unhandled Events
        // ==============================================================================
        return NextResponse.json({ success: true, message: "Ignored unactionable event" }, { status: 200 });

    } catch (error) {
        console.error('[Shipquickr Webhook Error]:', error);
        return NextResponse.json(
            { error: "Internal Server Error processing webhook" }, 
            { status: 500 }
        );
    }
}
