import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken, verifyToken } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get Cart Items
 *     description: Retrieves the current user's cart with details (images, variants, stock).
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart details
 *   post:
 *     summary: Add Item to Cart
 *     description: Adds a product (and optional variant) to the cart.
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: CUID of the product
 *               variantId:
 *                 type: string
 *                 description: (Optional) CUID of the specific variant (size/color)
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item added successfully and returns updated cart
 *   put:
 *     summary: Update Cart Quantity
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 description: New total quantity (must be > 0)
 *     responses:
 *       200:
 *         description: Cart updated
 *       400:
 *         description: Stock limit exceeded or invalid quantity
 *   delete:
 *     summary: Remove Item from Cart
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The 'productId' or 'productId-variantId' composite ID
 *     responses:
 *       200:
 *         description: Item removed
 */

const cartItemSyncSchema = z.array(
    z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1),
    })
);

function formatCartForClient(cart: any) {
    if (!cart || !cart.items) return [];
    return cart.items.map((item: any) => {
        const activeVariant = item.variant || item.product.variants[0];
        const isArchived = item.product.isArchived;
        const effectiveStock = isArchived ? 0 : (activeVariant?.stock || 0);

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
                stock: effectiveStock
            } : null,
            variants: item.product.variants.map((v: any) => ({
                id: v.id,
                price: v.price.toNumber(),
                size: v.size,
                stock: isArchived ? 0 : v.stock
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

        const productCheck = await prisma.product.findUnique({
            where: { id: productId },
            select: { isArchived: true, inStock: true }
        });
        if (productCheck && (productCheck.isArchived || !productCheck.inStock)) {
             return NextResponse.json({ error: 'Product is unavailable/out of stock' }, { status: 400 });
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

        if (quantity < 1) {
            return NextResponse.json({ error: 'Quantity cannot be less than 1' }, { status: 400 });
        }

        let availableStock = 0;
        let isArchived = false;

        if (variantId) {
            const variant = await prisma.productVariant.findUnique({
                where: { id: variantId },
                include: { product: { select: { isArchived: true } } }
            });
            if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
            availableStock = variant.stock;
            isArchived = variant.product.isArchived;
        } else {
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });
            if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            availableStock = product.stock;
            isArchived = product.isArchived;
        }

        if (isArchived) {
             return NextResponse.json({ 
                error: `This product is no longer available.`,
                maxStock: 0 
            }, { status: 400 });
        }

        if (quantity > availableStock) {
            return NextResponse.json({ 
                error: `Only ${availableStock} units available in stock.`,
                maxStock: availableStock 
            }, { status: 400 });
        }

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

        const item = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId,
                variantId: variantId || null
            }
        });

        if (item) {
            const res = await prisma.cartItem.update({
                where: { id: item.id },
                data: { quantity: quantity }
            });
            if (variantId) {
                await prisma.cartItem.deleteMany({
                    where: {
                        cartId: cart.id,
                        productId: productId,
                        variantId: null
                    }
                });
            }
            return NextResponse.json({ success: true , message: 'Cart updated', item: res });
        } else {
            return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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