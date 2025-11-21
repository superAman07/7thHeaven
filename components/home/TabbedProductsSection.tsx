import React from 'react';
import ProductSection2 from './ProductSection2';
import { PublicProduct } from '../HeroPage';
import Link from 'next/link';
import { getProducts } from '@/services/product';

async function getProductsForTabs(): Promise<{
    newArrivals: PublicProduct[];
    onSaleProducts: PublicProduct[];
    featuredProducts: PublicProduct[];
    allProducts: PublicProduct[];
}> {
    // Fetch all required data in parallel
    const [newArrivalsResult, onSaleProductsResult, featuredProductsResult] = await Promise.all([
        getProducts({ limit: 8, sort: 'newest' }),
        getProducts({ limit: 8, onSale: true }),
        getProducts({ limit: 8, sort: 'name_asc' })
    ]);

    const newArrivals = newArrivalsResult.data as unknown as PublicProduct[];
    const onSaleProducts = onSaleProductsResult.data as unknown as PublicProduct[];
    const featuredProducts = featuredProductsResult.data as unknown as PublicProduct[];

    // Restore allProducts: Combine lists to ensure the "Explore" button check works
    // We use a Map to remove duplicates
    const allProductsMap = new Map();
    [...newArrivals, ...onSaleProducts, ...featuredProducts].forEach(p => allProductsMap.set(p.id, p));
    const allProducts = Array.from(allProductsMap.values()) as PublicProduct[];

    return { 
        newArrivals, 
        onSaleProducts, 
        featuredProducts, 
        allProducts 
    };
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