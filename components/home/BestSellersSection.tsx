import React from 'react';
import prisma from '@/lib/prisma';
import ProductSectionPage from './ProductSection';
import { PublicProduct } from '../HeroPage';

async function getBestSellers(): Promise<PublicProduct[]> {
    const productsFromDb = await prisma.product.findMany({
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
            id: true,
            name: true,
            images: true,
            isNewArrival: true,
            discountPercentage: true,
            variants: {
                select: { price: true },
                orderBy: { price: 'asc' }
            },
            category: { select: { slug: true } }
        }
    }).then(productsFromDb => productsFromDb.map(p => ({
        ...p,
        discountPercentage: p.discountPercentage ? p.discountPercentage.toNumber() : null,
        variants: p.variants.map(v => ({
            price: v.price.toNumber()
        }))
    })));
    return productsFromDb;
}

export default async function BestSellersSection() {
    const products = await getBestSellers();
    // This server component fetches the data and passes it to the client component.
    return <ProductSectionPage products={products} />;
}