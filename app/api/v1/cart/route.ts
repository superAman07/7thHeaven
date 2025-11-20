import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const cartItemSyncSchema = z.array(
    z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1),
    })
);

const formatCartForClient = (dbCart: any) => {
    if (!dbCart || !dbCart.items) {
        return [];
    }
    return dbCart.items.map((item: any) => ({
        ...item.product,
        price: item.product.variants[0]?.price.toNumber(),
        discountPercentage: item.product.discountPercentage?.toNumber(),
        ratingsAvg: item.product.ratingsAvg?.toNumber(),
        variants: item.product.variants.map((v: any) => ({
            ...v,
            price: v.price.toNumber()
        })),
        quantity: item.quantity,
    }));
};

const getAuthToken = (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        // Filter out string "null" or "undefined" which might be sent by client
        if (token === 'null' || token === 'undefined') return null;
        return token;
    }

    const cookieToken = req.cookies.get('session_token')?.value;
    return cookieToken || null;
};

export async function GET(req: NextRequest) {
    try {
        const token = getAuthToken(req);

        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userCart = await prisma.cart.findUnique({
            where: { userId: user.id },
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
                    orderBy: {
                        product: {
                            name: 'asc'
                        }
                    }
                },
            },
        });

        const clientCartItems = formatCartForClient(userCart);
        return NextResponse.json({ cartItems: clientCartItems });

    } catch (error) {
        console.error('GET /api/cart Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = getAuthToken(req);

        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const clientItems = cartItemSyncSchema.parse(body.cartItems);

        const updatedCart = await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.upsert({
                where: { userId: user.id },
                create: { userId: user.id },
                update: {},
            });

            const clientProductIds = clientItems.map(item => item.productId);

            await tx.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: { notIn: clientProductIds },
                },
            });

            for (const item of clientItems) {
                await tx.cartItem.upsert({
                    where: {
                        cartId_productId: {
                            cartId: cart.id,
                            productId: item.productId,
                        },
                    },
                    create: {
                        cartId: cart.id,
                        productId: item.productId,
                        quantity: item.quantity,
                    },
                    update: {
                        quantity: item.quantity,
                    },
                });
            }

            return tx.cart.findUnique({
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
                        orderBy: {
                            product: {
                                name: 'asc'
                            }
                        }
                    },
                },
            });
        });

        const clientCartItems = formatCartForClient(updatedCart);
        return NextResponse.json({ cartItems: clientCartItems });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid cart data', details: error }, { status: 400 });
        }
        console.error('POST /api/cart Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}