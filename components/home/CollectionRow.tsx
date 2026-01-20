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
        <section className={`shop-section section pt-90 pt-lg-70 pt-md-60 pt-sm-50 pt-xs-45 pb-70 pb-lg-50 pb-md-40 pb-sm-60 pb-xs-50 ${bgClass}`}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12 order-lg-2 order-1">
                        <div className="row">
                            <div className="col-12">
                                <div className="shop-banner-title text-center mb-10 section-header-gold">
                                    <h2 className="text-uppercase">{title}</h2>
                                    <div className="gold-separator"></div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="shop-product">
                                    <div className="tab-content">
                                        <div className="tab-pane fade active show">
                                            <div className="product-slider tf-element-carousel">
                                                <ProductSlider products={products as any[]} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* View All Button */}
                <div className="row">
                    <div className="col-12 text-center mt-40">
                        <Link 
                            href={`/collections/${categorySlug}`}
                            className="btn"
                        >
                            <span>View Collection</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}