import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken, verifyToken } from '@/lib/auth';
import { z } from 'zod';

const cartItemSyncSchema = z.array(
    z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1),
    })
);

function formatCartForClient(cart: any) {
    if (!cart || !cart.items) return [];
    return cart.items.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.variants[0]?.price.toNumber() || 0,
        discountPercentage: item.product.discountPercentage?.toNumber() || 0,
        images: item.product.images,
        quantity: item.quantity,
        variants: item.product.variants.map((v: any) => ({
            price: v.price.toNumber(),
            size: v.size,
            id: v.id
        })),
        category: item.product.category
    }));
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                variants: { orderBy: { price: 'asc' } },
                                reviews: { select: { id: true } },
                            },
                        },
                    },
                    orderBy: { product: { name: 'asc' } }
                },
            },
        });

        if (!cart) {
            return NextResponse.json({ cartItems: [] });
        }

        return NextResponse.json({ cartItems: formatCartForClient(cart) });
    } catch (error) {
        console.error('GET /api/cart Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { cartItems } = body;

        if (!Array.isArray(cartItems)) {
            return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
        }

        // 1. Find or create the cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        // 2. DEDUPLICATE ITEMS: Merge duplicates by summing quantities
        // This fixes the "Unique constraint failed" error
        const mergedItems = new Map<string, number>();
        
        for (const item of cartItems) {
            if (!item.productId) continue;
            const currentQty = mergedItems.get(item.productId) || 0;
            mergedItems.set(item.productId, currentQty + item.quantity);
        }

        // Convert map back to array for Prisma
        const finalCartItems = Array.from(mergedItems.entries()).map(([productId, quantity]) => ({
            cartId: cart.id,
            productId,
            quantity
        }));

        // 3. FAST SYNC: Delete all old items and insert merged items
        await prisma.$transaction([
            prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            }),
            prisma.cartItem.createMany({
                data: finalCartItems,
            }),
        ]);

        // 4. Fetch the final updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                variants: { orderBy: { price: 'asc' } },
                                reviews: { select: { id: true } },
                            },
                        },
                    },
                    orderBy: { product: { name: 'asc' } }
                },
            },
        });

        if (!updatedCart) {
             return NextResponse.json({ cartItems: [] });
        }

        return NextResponse.json({ cartItems: formatCartForClient(updatedCart) });

    } catch (error) {
        console.error('POST /api/cart Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}