import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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