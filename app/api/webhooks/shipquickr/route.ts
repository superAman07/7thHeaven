import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/webhooks/shipquickr:
 *   post:
 *     summary: Shipquickr Webhook
 *     description: Receives order status updates and AWB tracking info from Shipquickr
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - event
 *             properties:
 *               orderId:
 *                 type: string
 *               event:
 *                 type: string
 *               awb:
 *                 type: string
 *               courierUrl:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error processing webhook
 */
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

        // Always attempt to pull AWB and Courier URL from the payload, regardless of the event type, 
        // as Shipquickr might attach it in status updates as well.
        const { orderId, awb, courierUrl, status } = payload;

        // Build the update object. Add fields only if they are present in the payload.
        const updateData: any = {};

        if (awb) {
            updateData.awb = awb;
        }

        if (courierUrl) {
            updateData.courierUrl = courierUrl;
        }
        
        if (payload.event === 'order_shipped' && !status) {
             // If it's the shipped event, ensure the status is manifested if they didn't provide one
             updateData.status = 'MANIFESTED';
             updateData.shippedAt = new Date();
             
             if (!awb) {
                 return NextResponse.json({ error: "Missing AWB tracking data for order_shipped event" }, { status: 400 });
             }
        }

        if (status) {
             // Shipquickr sends clean lowercase ENUM strings: 
             // 'manifested', 'in_transit', 'out_for_delivery', 'delivered', 'rto', etc.
             // Let's uppercase it so it looks clean in the CelsiusPop Database.
             updateData.status = status.toUpperCase();
        }

        // Only update if there is actually data to attach.
        if (Object.keys(updateData).length > 0) {
            await prisma.order.update({
                where: { id: orderId },
                data: updateData
            });

            console.log(`[Webhook] Processed Event '${payload.event}' for Order ${orderId}. Updated fields: ${Object.keys(updateData).join(', ')}`);
        } else {
             console.log(`[Webhook] Event '${payload.event}' for Order ${orderId} contained no updates for the DB.`);
        }

        return NextResponse.json({ success: true, message: "Webhook processed" }, { status: 200 });

    } catch (error) {
        console.error('[Shipquickr Webhook Error]:', error);
        return NextResponse.json(
            { error: "Internal Server Error processing webhook" }, 
            { status: 500 }
        );
    }
}


// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

// export async function POST(req: NextRequest) {
//     try {
//         const payload = await req.json();

//         // Ensure we actually have an orderId to work with
//         if (!payload.orderId) {
//              return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
//         }

//         // 1. Check if the order exists in our local DB
//         const existingOrder = await prisma.order.findUnique({
//             where: { id: payload.orderId }
//         });

//         if (!existingOrder) {
//             return NextResponse.json({ error: "Order not found in CelsiusPop" }, { status: 404 });
//         }


//         // ==============================================================================
//         // EVENT 1: Initial Shipment Creation (From Checkout)
//         // ==============================================================================
//         if (payload.event === 'order_shipped') {
//             const { orderId, awb, courierUrl } = payload;

//             if (!awb) {
//                 return NextResponse.json({ error: "Missing AWB tracking data" }, { status: 400 });
//             }

//             await prisma.order.update({
//                 where: { id: orderId },
//                 data: {
//                     status: 'MANIFESTED',
//                     awb: awb,
//                     courierUrl: courierUrl || null,
//                     shippedAt: new Date()
//                 }
//             });

//             console.log(`[Webhook] Success: Order ${orderId} marked as SHIPPED with Tracking: ${awb}`);
//             return NextResponse.json({ success: true, message: "Webhook processed" }, { status: 200 });
//         }

//         // ==============================================================================
//         // EVENT 2: Continuous Live Status Updates (In Transit, Delivered, etc.)
//         // ==============================================================================
//         else if (payload.event === 'order_status_update') {
//             const { orderId, status } = payload;

//             if (!status) {
//                 return NextResponse.json({ error: "Missing new status string" }, { status: 400 });
//             }

//             // Shipquickr sends clean lowercase ENUM strings: 
//             // 'manifested', 'in_transit', 'out_for_delivery', 'delivered', 'rto', etc.
//             // Let's uppercase it so it looks clean in the CelsiusPop Database.
//             const formattedStatus = status.toUpperCase();

//             await prisma.order.update({
//                 where: { id: orderId },
//                 data: {
//                     status: formattedStatus
//                 }
//             });

//             console.log(`[Webhook] Live Update: Order ${orderId} is now ${formattedStatus}`);
//             return NextResponse.json({ success: true, message: "Status updated successfully" }, { status: 200 });
//         }

//         // ==============================================================================
//         // EVENT 3: Unhandled Events
//         // ==============================================================================
//         return NextResponse.json({ success: true, message: "Ignored unactionable event" }, { status: 200 });

//     } catch (error) {
//         console.error('[Shipquickr Webhook Error]:', error);
//         return NextResponse.json(
//             { error: "Internal Server Error processing webhook" }, 
//             { status: 500 }
//         );
//     }
// }
