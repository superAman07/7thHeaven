import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const trackSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    phone: z.string().min(10, "Valid phone number is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = trackSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { orderId, phone } = validation.data;

        // Find order that matches BOTH ID and Phone (via User)
        // We search for the order, and verify the associated user has the matching phone
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                user: {
                    phone: phone
                }
            },
            select: {
                id: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
                subtotal: true,
                items: true, // This is the JSON field
                shippingAddress: true,
            }
        });

        if (!order) {
            return NextResponse.json({ 
                success: false, 
                error: "Order not found. Please check your Order ID and Phone Number." 
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error("Track Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}