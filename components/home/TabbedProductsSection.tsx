import React from 'react';
import prisma from '@/lib/prisma';
import ProductSection2 from './ProductSection2';
import { PublicProduct } from '../HeroPage';
import Link from 'next/link';

async function getProductsForTabs(): Promise<{
    newArrivals: PublicProduct[];
    onSaleProducts: PublicProduct[];
    featuredProducts: PublicProduct[];
    allProducts: PublicProduct[];
}> {
    const productsFromDb = await prisma.product.findMany({
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
            id: true,
            name: true,
            // slug: true,
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
                select: { id: true, price: true, size: true },
                orderBy: { price: 'asc' }
            },
            reviews: {
                select: { id: true }
            }
        }
    }).then(products => products.map(p => ({
        ...p,
        discountPercentage: p.discountPercentage ? p.discountPercentage.toNumber() : null,
        variants: p.variants.map(v => ({
            ...v,
            price: v.price.toNumber()
        }))
    })));

    const newArrivals = productsFromDb.filter(p => p.isNewArrival);
    const onSaleProducts = productsFromDb.filter(p => p.discountPercentage && p.discountPercentage > 0);
    const featuredProducts = [...productsFromDb].reverse().slice(0, 8);

    return { newArrivals, onSaleProducts, featuredProducts, allProducts: productsFromDb };
}

export default async function TabbedProductsSection() {
    const { newArrivals, onSaleProducts, featuredProducts, allProducts } = await getProductsForTabs();

    return (
        <>
            <ProductSection2
                tabs={{
                    products: newArrivals,
                    onsale: onSaleProducts,
                    feature: featuredProducts,
                }}
            />
            {allProducts.length > 0 && (
                <div className="row">
                    <div className="col-12 text-center mt-20 mb-40">
                        <Link href="/collections" className="btn btn-dark">
                            Explore All Products
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}