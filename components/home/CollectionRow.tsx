import React from 'react';
import { getProducts } from '@/services/product';
import ProductSlider from './ProductSlider';
import Link from 'next/link';

type Props = {
    title: string;
    categorySlug: string; // The slug to fetch (e.g., 'skyline-series')
    bgClass?: string; // Optional background color
};

export default async function CollectionRow({ title, categorySlug, bgClass = "bg-white" }: Props) {
    // 1. Fetch products for this specific collection
    const result = await getProducts({ 
        category: categorySlug, 
        limit: 20 // Fetch enough to cover the large collections like Skyline
    });

    const products = result.data || [];

    // If no products found for this category (e.g., admin hasn't created it yet),
    // we return null so the section doesn't show empty.
    if (products.length === 0) return null;

    return (
        <section className={`w-full py-16 md:py-24 ${bgClass}`}>
            <div className="container mx-auto px-4 sm:px-6">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-wide uppercase mb-4" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                        {title}
                    </h2>
                    {/* Gold Separator Line */}
                    <div className="h-1 w-24 bg-[#D6B869] mx-auto rounded-full"></div>
                </div>

                {/* Products Slider */}
                <div className="w-full">
                    {/* passing data to a Client Component for React-Slick */}
                    <ProductSlider products={products as any[]} /> 
                </div>

                {/* View All Button */}
                <div className="mt-10 text-center">
                    <Link 
                        href={`/collections/${categorySlug}`}
                        className="inline-block px-8 py-3 border border-[#D6B869] text-[#1A1A1A] hover:bg-[#D6B869] hover:text-white transition-colors duration-300 uppercase tracking-widest text-sm font-semibold"
                    >
                        View Collection
                    </Link>
                </div>
            </div>
        </section>
    );
}