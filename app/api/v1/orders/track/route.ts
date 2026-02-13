import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * @swagger
 * /api/v1/orders/track:
 *   post:
 *     summary: Track Order
 *     description: Track an order using Order ID (Full or Last 8 chars) and either Phone or Email.
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
 *       404:
 *         description: Order not found
 */

const trackSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
}).refine(data => data.phone || data.email, {
    message: "Either Phone Number or Email is required for verification",
    path: ["phone"], // Error path
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = trackSchema.safeParse(body);

        if (!validation.success) {
            // Return specific error message
            const msg = validation.error.issues[0].message;
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        const { orderId, phone, email } = validation.data;

        // Build search conditions
        const where: any = {
            // Support partial search (last 8 chars) OR full ID
            // "endsWith" works for both cases perfectly
            id: { endsWith: orderId.trim() },
        };

        // Add user verification condition (Phone OR Email)
        if (phone) {
            where.user = { phone: phone.trim() };
        } else if (email) {
            where.user = { email: email.trim() };
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