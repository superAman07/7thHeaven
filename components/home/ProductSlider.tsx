'use client';

import React from 'react';
import Slider from 'react-slick';
import { ProductCard } from './ProductCard';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PublicProduct } from '../HeroPage';

function NextArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-product-arrow next-arrow`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    />
  );
}

function PrevArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-product-arrow prev-arrow`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    />
  );
}

const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: false,
    responsive: [
        {
            breakpoint: 1199,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: true,
                autoplay: false,
            }
        },
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 3000,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 3000,
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 3000,
            }
        }
    ]
};

export default function ProductSlider({ products }: { products: PublicProduct[] }) {
    const handleQuickView = (p: any) => {
        console.log("Open Modal", p.id);
    };

    return (
        <div className="slider-container px-2 relative">
            <style jsx global>{`
                /* Target our specific custom class to override global style.css */
                .slider-container .slick-slider .custom-product-arrow {
                    position: absolute !important;
                    top: 50% !important;             /* Vertically Center */
                    transform: translateY(-50%) !important;
                    margin-top: 0 !important;        /* Reset the -55px from global css */
                    
                    width: 50px !important;
                    height: 50px !important;
                    background: #000000 !important;  /* Solid Black */
                    border-radius: 50% !important;
                    z-index: 20 !important;
                    
                    /* Flex center for the arrow icon */
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    opacity: 0; /* Hidden by default for cleaner look */
                }

                /* Show on Hover */
                .slider-container:hover .custom-product-arrow {
                    opacity: 1;
                }

                /* Disable opacity hide on mobile/tablet if needed, but we hid arrows there anyway */

                .slider-container .slick-slider .custom-product-arrow:hover {
                    background: #1a1a1a !important;
                    box-shadow: 0 6px 15px rgba(0,0,0,0.3);
                }

                /* Styling the pseudo element (the arrow icon itself) */
                .slider-container .slick-slider .custom-product-arrow:before {
                    font-size: 24px !important;
                    color: #ffffff !important;
                    opacity: 1 !important;
                    line-height: 1 !important;
                }

                /* Positioning: Equal spacing from the container edges */
                .slider-container .slick-slider .prev-arrow {
                    left: -60px !important; /* Move outside to the left */
                }

                .slider-container .slick-slider .next-arrow {
                    right: -60px !important; /* Move outside to the right */
                }

                /* Fallback for smaller PC screens where -60px might hit the screen edge */
                @media (max-width: 1350px) {
                    .slider-container .slick-slider .prev-arrow {
                        left: -20px !important;
                    }
                    .slider-container .slick-slider .next-arrow {
                        right: -20px !important;
                    }
                }
            `}</style>
            <Slider {...settings}>
                {products.map((product) => (
                    <div key={product.id} className="px-2 pb-8"> 
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