import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define schema for incoming request body
const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })).min(1),
  shippingDetails: z.object({
    fullName: z.string(),
    phone: z.string(),
    email: z.string().email(),
    fullAddress: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string(),
  }),
  mlmOptIn: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Validate and parse request body
        const body = await req.json();
        const validation = orderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request body', details: validation.error }, { status: 400 });
        }
        const { items, shippingDetails, mlmOptIn } = validation.data;

        // 3. Fetch product prices from DB and calculate totalAmount securely
        const productIds = items.map(item => item.productId);
        const productsFromDb = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { variants: true }
        });

        let subtotal = 0; // FIX 1: Use `subtotal`
        const orderItemsData = items.map(item => {
            const product = productsFromDb.find(p => p.id === item.productId);
            if (!product || !product.variants || product.variants.length === 0) {
                throw new Error(`Product with ID ${item.productId} not found or has no variants.`);
            }
            
            const price = product.variants[0].price;
            // FIX 2: Convert Decimal to number for calculation
            subtotal += price.toNumber() * item.quantity; 
            
            return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: price.toNumber(),
            };
        });

        // 4. Create Prisma transaction to create Order and OrderItems
        const newOrder = await prisma.order.create({
            data: {
                userId,
                subtotal: subtotal, // FIX 1: Use `subtotal`
                discount: 0, // Initialize other financial fields
                netAmountPaid: 0,
                paymentStatus: 'PENDING',
                shippingAddress: shippingDetails as any,
                mlmOptInRequested: mlmOptIn || false,
                items: orderItemsData, // FIX 3: Pass array directly to Json field
            },
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                fullName: shippingDetails.fullName,
                phone: shippingDetails.phone,
                fullAddress: shippingDetails.fullAddress,
                city: shippingDetails.city,
                state: shippingDetails.state,
                pincode: shippingDetails.pincode,
                country: shippingDetails.country
            }
        });

        // 5. Return success response
        return NextResponse.json({ 
            success: true, 
            orderId: newOrder.id, 
            totalAmount: newOrder.subtotal // FIX 1 & 3: Return `subtotal`
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}