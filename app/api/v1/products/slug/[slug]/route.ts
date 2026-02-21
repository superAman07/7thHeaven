import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * /api/v1/products/slug/{slug}:
 *   get:
 *     summary: Get Product by Slug
 *     description: Fetch detailed product info including variants and related products via URL slug.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "midnight-rose-perfume"
 *     responses:
 *       200:
 *         description: Product details + Related Products
 */

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const product = await prisma.product.findUnique({
            where: { 
                slug: slug 
            },
            include: {
                category: true,
                variants: {
                    orderBy: { price: 'asc' }
                },
                reviews: {
                    include: { user: { select: { fullName: true } } }, 
                    orderBy: { createdAt: 'desc' },
                    take: 5 
                },
            }
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const relatedProducts = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: {
                    not: product.id,
                },
                inStock: true
            },
            take: 6,
            include: {
                category: true,
                variants: {
                    orderBy: { price: 'asc' },
                    take: 1
                }
            }
        });

        const formatProduct = (p: any) => ({
            ...p,
            variants: p.variants.map((v: any) => ({
                ...v,
                price: Number(v.price),
                sellingPrice: v.sellingPrice ? Number(v.sellingPrice) : null,
                stock: Number(v.stock)
            })),
            discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : 0,
            ratingsAvg: p.ratingsAvg ? Number(p.ratingsAvg) : 0,
        });

        return NextResponse.json({ 
            success: true, 
            product: formatProduct(product),
            relatedProducts: relatedProducts.map(formatProduct)
        });

    } catch (error) {
        console.error('[API] Fetch Product by Slug Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}