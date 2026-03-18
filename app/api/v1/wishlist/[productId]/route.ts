import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Removed from wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist not found
 *       500:
 *         description: Internal Server Error
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = await params;

        const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
        }

        await prisma.wishlistItem.delete({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Removed from wishlist' });

    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ success: true, message: 'Item already removed' });
        }
        console.error('Wishlist DELETE Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error'
        }, { status: 500 });
    }
}