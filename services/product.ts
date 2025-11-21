import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type ProductFilterParams = {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    gender?: string;
    sort?: string;
    onSale?: boolean;
};

export async function getProducts(params: ProductFilterParams) {
    const { page = 1, limit = 10, search, category, gender, sort, onSale } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
        AND: [
            search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            } : {},
            category ? { category: { slug: category } } : {},
            gender ? { genderTags: { has: gender as any } } : {},
            onSale ? { discountPercentage: { gt: 0 } } : {},
        ],
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };

    const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                variants: true,
                reviews: { select: { rating: true } }
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map(p => ({
        ...p,
        discountPercentage: p.discountPercentage?.toNumber() || 0,
        variants: p.variants.map(v => ({ ...v, price: v.price.toNumber() })),
        ratingsAvg: p.reviews.length > 0
            ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
            : 0,
        reviews: [], // FIX: Return empty array instead of undefined to match PublicProduct type
    }));

    return {
        data: formattedProducts,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    };
}

export async function getCategories() {
    return await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    });
}