import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/v1/cart/validate:
 *   post:
 *     summary: Validate Cart Items
 *     description: |
 *       Validates a list of product IDs to check if they still exist, 
 *       are not archived, and are in stock. Use this before checkout 
 *       to ensure all cart items are still available for purchase.
 *       
 *       **Use Case:** Mobile app should call this on Cart Screen load and before checkout.
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of product IDs to validate
 *                 example: ["clk1234abcd", "clk5678efgh"]
 *     responses:
 *       200:
 *         description: Validation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 validItems:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Product IDs that are valid and available
 *                 invalidItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       reason:
 *                         type: string
 *                         enum: [DELETED, ARCHIVED, OUT_OF_STOCK]
 *                       message:
 *                         type: string
 *       400:
 *         description: Invalid request (missing or invalid productIds array)
 *       500:
 *         description: Server error during validation
 */

export async function POST(req: NextRequest) {
    try {
        const { productIds } = await req.json();
        
        if (!productIds || !Array.isArray(productIds)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Fetch all products with their availability status
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                name: true,
                isArchived: true,
                inStock: true,
                variants: {
                    select: { id: true, stock: true }
                }
            }
        });

        const productMap = new Map(products.map(p => [p.id, p]));
        
        const validationResults = productIds.map(productId => {
            const product = productMap.get(productId);
            
            if (!product) {
                return { productId, isValid: false, reason: 'DELETED', message: 'Product no longer exists' };
            }
            if (product.isArchived) {
                return { productId, isValid: false, reason: 'ARCHIVED', message: `"${product.name}" is no longer available` };
            }
            if (!product.inStock) {
                return { productId, isValid: false, reason: 'OUT_OF_STOCK', message: `"${product.name}" is out of stock` };
            }
            return { productId, isValid: true, product };
        });

        const invalidItems = validationResults.filter(r => !r.isValid);
        const validItems = validationResults.filter(r => r.isValid);

        return NextResponse.json({
            success: true,
            validItems: validItems.map(v => v.productId),
            invalidItems: invalidItems.map(i => ({
                productId: i.productId,
                reason: i.reason,
                message: i.message
            }))
        });
        
    } catch (error) {
        console.error('Cart Validation Error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}