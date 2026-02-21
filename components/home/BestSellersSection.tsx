import React from 'react';
import prisma from '@/lib/prisma';
import ProductSectionPage from './ProductSection';
import { PublicProduct } from '../HeroPage';
import Link from 'next/link';

async function getBestSellers(): Promise<PublicProduct[]> {
    const productsFromDb = await prisma.product.findMany({
        where: { 
            inStock: true,
            isArchived: false
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            images: true,
            genderTags: true,
            inStock: true,
            ratingsAvg: true,
            createdAt: true,
            categoryId: true,
            isNewArrival: true,
            discountPercentage: true,
            category: {
                select: { name: true, slug: true }
            },
            variants: {
                select: { id: true, price: true, size: true , stock: true, sellingPrice: true },
                orderBy: { price: 'asc' }
            },
            reviews: {
                select: { id: true }
            }
        }
    }).then(productsFromDb => productsFromDb.map(p => ({
        ...p,
        discountPercentage: p.discountPercentage ? p.discountPercentage.toNumber() : null,
        variants: p.variants.map((v:any) => ({
            ...v,
            price: v.price.toNumber(),
            sellingPrice: v.sellingPrice ? v.sellingPrice.toNumber() : null
        }))
    })));
    return productsFromDb;
}

export default async function BestSellersSection() {
    const products = await getBestSellers();
    return <>
        <ProductSectionPage products={products} />
        {products.length > 0 && (
            <center className="mb-40">
                <Link href="/collections" className="btn">
                    <span>View All Best Sellers</span>
                </Link>
            </center>
        )}
    </>
}