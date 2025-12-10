import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        variantId: z.string().optional(),
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

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const productIds = new Set<string>();
        orders.forEach(order => {
            const items = order.items as any[];
            if (Array.isArray(items)) {
                items.forEach(item => {
                    if (item.productId) productIds.add(item.productId);
                });
            }
        });

        const products = await prisma.product.findMany({
            where: { id: { in: Array.from(productIds) } },
            select: {
                id: true,
                name: true,
                images: true,
                genderTags: true,
                category: {
                    select: { name: true }
                }
            }
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        const enrichedOrders = orders.map(order => {
            const items = (order.items as any[]).map((item: any) => ({
                ...item,
                product: productMap.get(item.productId) || null
            }));
            return { ...order, items };
        });

        return NextResponse.json({ success: true, orders: enrichedOrders });

    } catch (error) {
        console.error('Fetch User Orders Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = orderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request body', details: validation.error }, { status: 400 });
        }
        const { items, shippingDetails, mlmOptIn } = validation.data;
        let userId = await getUserIdFromToken(req);

        if (!userId) {
            let user = await prisma.user.findUnique({
                where: { phone: shippingDetails.phone }
            });

            if (!user && shippingDetails.email) {
                user = await prisma.user.findUnique({
                    where: { email: shippingDetails.email }
                });
            }

            if (user) {
                userId = user.id;
            } else {
                const newUser = await prisma.user.create({
                    data: {
                        fullName: shippingDetails.fullName,
                        phone: shippingDetails.phone,
                        email: shippingDetails.email,
                        fullAddress: shippingDetails.fullAddress,
                        city: shippingDetails.city,
                        state: shippingDetails.state,
                        pincode: shippingDetails.pincode,
                        country: shippingDetails.country,
                        passwordHash: null,
                    }
                });
                userId = newUser.id;
            }
        }
    
        const productIds = items.map(item => item.productId);
        const productsFromDb = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { variants: true }
        });

        let subtotal = 0;
        const orderItemsData = items.map(item => {
            const product = productsFromDb.find(p => p.id === item.productId);
            
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }
            let selectedVariant;
            if (item.variantId) {
                selectedVariant = product.variants.find(v => v.id === item.variantId);
            }

            if (!selectedVariant) {
                if (product.variants.length > 0) {
                    console.warn(`No variantId provided for product ${product.name}. Defaulting to first variant.`);
                    selectedVariant = product.variants[0];
                } else {
                    throw new Error(`Product ${product.name} has no variants available.`);
                }
            }

            const basePrice = selectedVariant.price.toNumber();
            const discountPercentage = product.discountPercentage ? product.discountPercentage.toNumber() : 0;
            
            const price = basePrice * (1 - discountPercentage / 100);
            subtotal += price * item.quantity;

            return {
                productId: item.productId,
                variantId: selectedVariant.id,
                name: product.name,
                size: selectedVariant.size, 
                image: product.images[0] || '',
                quantity: item.quantity,
                priceAtPurchase: price,
            };
        });

        const newOrder = await prisma.order.create({
            data: {
                userId: userId!,
                subtotal: subtotal,
                discount: 0,
                netAmountPaid: 0,
                paymentStatus: 'PENDING',
                shippingAddress: shippingDetails as any,
                mlmOptInRequested: mlmOptIn || false,
                items: orderItemsData,
            },
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                fullAddress: shippingDetails.fullAddress,
                city: shippingDetails.city,
                state: shippingDetails.state,
                pincode: shippingDetails.pincode,
                country: shippingDetails.country
            }
        });

        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            totalAmount: newOrder.subtotal 
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}