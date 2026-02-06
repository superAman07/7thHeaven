import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Get Wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of wishlist items
 *   post:
 *     summary: Add to Wishlist
 *     tags:
 *       - Wishlist
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
 *     responses:
 *       200:
 *         description: Added to wishlist
 *       400:
 *         description: Already in wishlist
 */

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                images: true,
                                variants: {
                                    take: 1,
                                    select: { price: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({ success: true, items: wishlist?.items || [] });
    } catch (error) {
        console.error('Wishlist GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId } });
        }

        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId
                }
            }
        });

        if (existingItem) {
            return NextResponse.json({ success: true, message: 'Already in wishlist' });
        }

        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId
            }
        });

        return NextResponse.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.error('Wishlist POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}