import React from 'react';
import { getProducts } from '@/services/product';
import ProductSlider from './ProductSlider';
import Link from 'next/link';
import { ComingSoonCard } from './ComingSoonCard';

type Props = {
    title: string;
    type?: 'CATEGORY' | 'COLLECTION';
    categorySlug?: string;
    collectionSlug?: string;
    bgClass?: string; 
};

export default async function CollectionRow({ title, type, categorySlug, collectionSlug, bgClass = "bg-white" }: Props) {
    let products: any[] = [];
    // SMART FETCHING 🧠
    if (type === 'COLLECTION' && collectionSlug) {
        // Fetch by Collection Slug
        const result = await getProducts({ collectionSlug: collectionSlug, limit: 12 });
        products = result.data || [];
    } else if (categorySlug) {
        // Fetch by Category Slug (Old way)
        const result = await getProducts({ category: categorySlug, limit: 12 });
        products = result.data || [];
    }
    const showComingSoon = products.length === 0;

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
                                                {showComingSoon ? (
                                                    <div className="row justify-content-center">
                                                        <ComingSoonCard collectionSlug={collectionSlug || categorySlug} />
                                                    </div>
                                                ) : (
                                                    <ProductSlider products={products as any[]} />
                                                )}
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