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
    return cart.items.map((item: any) => {
        // Use the specific variant saved in CartItem, OR fallback to first variant
        const activeVariant = item.variant || item.product.variants[0];

        return {
            id: activeVariant ? `${item.product.id}-${activeVariant.id}` : item.product.id,
            originalProductId: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: activeVariant ? activeVariant.price.toNumber() : 0,
            discountPercentage: item.product.discountPercentage?.toNumber() || 0,
            images: item.product.images,
            quantity: item.quantity,
            selectedVariant: activeVariant ? {
                id: activeVariant.id,
                price: activeVariant.price.toNumber(),
                size: activeVariant.size,
                stock: activeVariant.stock
            } : null,
            variants: item.product.variants.map((v: any) => ({
                id: v.id,
                price: v.price.toNumber(),
                size: v.size,
                stock: v.stock
            })),
            category: item.product.category
        };
    });
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
                        variant: true,
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
        
        const { productId, quantity, variantId } = body; 

        if (!productId || !quantity) {
             return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
        }

        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId,
                variantId: variantId || null
            }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId,
                    variantId: variantId || null,
                    quantity: quantity
                }
            });
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        variant: true,
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

export async function PUT(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { productId, quantity, variantId } = await req.json();

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

        // Find the specific item
        const item = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId,
                variantId: variantId || null
            }
        });

        if (item) {
            // Update to EXACT quantity
            await prisma.cartItem.update({
                where: { id: item.id },
                data: { quantity: quantity }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

// --- FIX THIS FUNCTION ---
export async function DELETE(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // FIX: Extract productId from body
        const body = await req.json();
        const { productId } = body; 

        let realProductId = productId;
        let realVariantId = undefined;

        if (productId && productId.includes('-')) {
            const parts = productId.split('-');
            if (parts.length >= 2) {
                realProductId = parts[0];
                realVariantId = parts[1];
            }
        }

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return NextResponse.json({ success: true });

        const whereClause: any = {
            cartId: cart.id,
            productId: realProductId,
        };

        if (realVariantId) {
            whereClause.OR = [
                { variantId: realVariantId },
                { variantId: null }
            ];
        } 

        await prisma.cartItem.deleteMany({
            where: whereClause
        });

        return NextResponse.json({ success: true, message: 'Item removed from cart.' });

    } catch (error) {
        console.error('DELETE /api/cart Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}