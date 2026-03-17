import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserIdFromToken } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/orders/track:
 *   post:
 *     summary: Track Order
 *     description: Track an order using Order ID. Phone or Email is optional if the user is logged in.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order details found
 *       400:
 *         description: Verification details required (if not logged in) or invalid request
 *       404:
 *         description: Order not found
 */

const trackSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = trackSchema.safeParse(body);

        if (!validation.success) {
            const msg = validation.error.issues[0].message;
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        let { orderId, phone, email } = validation.data;

        if (email === '') email = undefined;
        if (phone === '') phone = undefined;
        const userId = await getUserIdFromToken(req);
        if (!userId && !phone && !email) {
            return NextResponse.json({ 
                error: "Either Phone Number or Email is required for tracking, unless you are logged in." 
            }, { status: 400 });
        }

        const where: any = {
            id: { endsWith: orderId.trim() },
        };

        if (userId && !phone && !email) {
            where.userId = userId;
        } else {
            if (phone) {
                where.user = { phone: phone.trim() };
            } else if (email) {
                where.user = { email: email.trim() };
            }
        }

        // Find match
        const order = await prisma.order.findFirst({
            where,
            select: {
                id: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
                subtotal: true,
                discount: true,
                netAmountPaid: true,
                items: true,
                shippingAddress: true,
                awb: true,
                courierUrl: true,
                shippedAt: true,
                // Include user name for display if needed
                user: {
                    select: {
                        fullName: true,
                        phone: true,
                        email: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({
                success: false,
                error: "Order not found. Please check your verification details."
            }, { status: 404 });
        }

        // Inject computed values if necessary (e.g. orderId for frontend display)
        const responseOrder = {
            ...order,
            orderId: order.id, // Ensure frontend gets 'orderId' as key if it expects it
        };

        return NextResponse.json({ success: true, order: responseOrder });

    } catch (error) {
        console.error("Track Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}