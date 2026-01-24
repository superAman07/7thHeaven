import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // 1. Authorization Check (Optional: If you only want Members to see this)
        const userId = await getUserIdFromToken(req);
        if (!userId) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch the Price Limit from Settings
        const settings = await prisma.mLMSettings.findFirst();
        const maxPrice = settings?.maxClubProductPrice ? Number(settings.maxClubProductPrice) : 4000;

        // 3. Fetch Products under this price cap
        const products = await prisma.product.findMany({
            where: {
                isArchived: false,
                inStock: true,
                variants: {
                    some: {
                        price: {
                            lte: maxPrice // Less than or equal to Max Price
                        }
                    }
                }
            },
            take: 12, // Show top 12
            orderBy: { createdAt: 'desc' },
            include: {
                variants: {
                    orderBy: { price: 'asc' },
                    take: 1
                },
                category: true
            }
        });

        // 4. Format Response
        const formattedProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            image: p.images[0] || '',
            category: p.category.name,
            price: Number(p.variants[0]?.price || 0),
            discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : 0
        }));

        return NextResponse.json({ 
            success: true, 
            maxPriceLimit: maxPrice,
            products: formattedProducts 
        });

    } catch (error) {
        console.error('Fetch Club Products Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}