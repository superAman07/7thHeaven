import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type ProductFilterParams = {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    collectionSlug?: string;
    gender?: string;
    sort?: string;
    onSale?: boolean;
    minPrice?: number;
    maxPrice?: number; 
};

export async function getProducts(params: ProductFilterParams) {
    const { page = 1, limit = 10, search, category, collectionSlug, gender, sort, onSale, minPrice, maxPrice } = params;
    const skip = (page - 1) * limit;

    const genderMap: Record<string, string> = {
        'Men': 'Male',
        'Women': 'Female',
        'Unisex': 'Unisex',
        'Male': 'Male',
        'Female': 'Female'
    };

    let genderFilter: any = {};
    if (gender) {
        const genders = gender.split(',')
            .map(g => genderMap[g.trim()] || g.trim())
            .filter(Boolean);
            
        if (genders.length > 0) {
             genderFilter = { genderTags: { hasSome: genders as any } };
        }
    }

    let categoryFilter: any = {};
    if (collectionSlug) {
        categoryFilter = {
            category: {
                collection: {
                    slug: collectionSlug
                }
            }
        };
    } 
    else if (category) {
        if (category.includes(',')) {
             categoryFilter = { categoryId: { in: category.split(',') } };
        } else {
             categoryFilter = {
                OR: [
                    { category: { slug: category } },
                    { categoryId: category }
                ]
             };
        }
    }

    let priceFilter: any = {};
    if (minPrice !== undefined || maxPrice !== undefined) {
         priceFilter = {
             variants: {
                 some: {
                     price: {
                         gte: minPrice || 0,
                         lte: maxPrice || 999999
                     }
                 }
             }
         };
    }

    const where: Prisma.ProductWhereInput = {
        AND: [
            { isArchived: false },
            search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            } : {},
            categoryFilter,
            genderFilter,
            priceFilter,
            onSale ? { discountPercentage: { gt: 0 } } : {},
        ],
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'asc' };
    if (sort === 'price_asc') orderBy = { variants: { _count: 'desc' } };
    if (sort === 'price_asc') {
    }
    
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const products = await prisma.product.findMany({
        where,
        include: {
            category: true,
            variants: true,
            reviews: { select: { rating: true } }
        },
        orderBy,
        skip,
        take: limit,
    });

    const total = await prisma.product.count({ where });

    const formattedProducts = products.map(p => ({
        ...p,
        category: p.category,
        discountPercentage: p.discountPercentage?.toNumber() || 0,
        variants: p.variants.map(v => ({ ...v, price: v.price.toNumber() })),
        ratingsAvg: p.reviews.length > 0
            ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
            : 0,
        reviews: [], // FIX: Return empty array instead of undefined to match PublicProduct type
    }));

    if (sort === 'price_asc') {
        formattedProducts.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    } else if (sort === 'price_desc') {
        formattedProducts.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
    }

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

export async function getProductById(productId: string) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            category: true,
            variants: { orderBy: { price: 'asc' } },
            reviews: {
                select: {
                    id: true,
                    rating: true, 
                    createdAt: true,
                }
            }
        }
    });

    if (!product) {
        return null;
    }

    const p = product as any;

    const formattedProduct = {
        ...product,
        discountPercentage: product.discountPercentage?.toNumber() || 0,
        variants: p.variants.map((v: any) => ({ ...v, price: v.price.toNumber() })),
        ratingsAvg: p.reviews.length > 0
            ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / p.reviews.length
            : 0,
        reviews: p.reviews.map((r: any) => ({
            ...r,
        }))
    };

    return formattedProduct;
}

export async function getCategories(collectionSlug?: string) { 
    const whereClause: any = {};
    
    if (collectionSlug) {
        whereClause.collection = { slug: collectionSlug };
    }

    return await prisma.category.findMany({
        where: whereClause,
        include: {
            _count: {
                select: { products: true }
            },
            collection: { select: { name: true, slug: true } }
        },
        orderBy: { name: 'asc' }
    });
}