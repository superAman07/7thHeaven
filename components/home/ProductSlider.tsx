'use client';

import React from 'react';
import Slider from 'react-slick';
import { ProductCard } from './ProductCard'; // Ensure you have this exported, or reuse from ProductSection2
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PublicProduct } from '../HeroPage';

const settings = {
    dots: true,
    infinite: false, // Don't loop infinitely if few items
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false, // Cleaner UI for luxury, swipe on mobile
    responsive: [
        {
            breakpoint: 1280,
            settings: {
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3, // Tablet
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2, // Large Phone
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 1, // Small Phone
                dots: true
            }
        }
    ]
};

export default function ProductSlider({ products }: { products: PublicProduct[] }) {
    // Quick Fix: ProductCard usually expects a specific prop signature.
    // We assume properties passed match or we adapt them here.

    const handleQuickView = (p: any) => {
        // Logic for modal if needed, or pass dummy function if ProductCard requires it
        console.log("Open Modal", p.id);
    };

    return (
        <div className="slider-container px-2">
            <Slider {...settings}>
                {products.map((product) => (
                    <div key={product.id} className="px-2 pb-8"> {/* Padding for gap and shadow clipping */}
                         <ProductCard 
                            product={product} 
                            onQuickView={handleQuickView}
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
}