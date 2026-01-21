'use client';

import React, { useState, useEffect } from 'react';
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
    slidesToScroll: 4,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: false,
    responsive: [
        {
            breakpoint: 1199,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                arrows: true,
                autoplay: false,
            }
        },
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 3000,
                pauseOnHover: true,
                pauseOnFocus: true,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 3000,
                pauseOnHover: true, // ADDED
                pauseOnFocus: true,
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                autoplay: false,
                infinite: true,
                swipe: true,
                swipeToSlide: true,
                touchThreshold: 10,
            }
        }
    ]
};

export default function ProductSlider({ products }: { products: PublicProduct[] }) {
    const handleQuickView = (p: any) => {
        console.log("Open Modal", p.id);
    };

    return (
        <div className="slider-container relative">
            <style jsx global>{`
                .slider-container .slick-slide > div {
                    padding: 0 8px;
                }
                
                @media (max-width: 640px) {
                    .slider-container {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    .slider-container .slick-slide > div {
                        padding: 0 !important;
                    }
                    .slider-container .slick-list {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
                    
                .slider-container .slick-slider .custom-product-arrow {
                    position: absolute !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    margin-top: 0 !important;
                    
                    width: 50px !important;
                    height: 50px !important;
                    background: #000000 !important;
                    border-radius: 50% !important;
                    z-index: 20 !important;
                    
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    opacity: 1 !important; /* CHANGED: Always visible on desktop */
                    cursor: pointer;
                }
                @media (max-width: 991px) {
                    .slider-container .slick-slider .custom-product-arrow {
                        display: none !important;
                    }
                }

                @media (min-width: 992px) {
                    .slider-container .slick-slider .custom-product-arrow {
                        opacity: 0;
                    }
                    .slider-container:hover .custom-product-arrow {
                        opacity: 1;
                    }
                }

                .slider-container .slick-slider .custom-product-arrow:before {
                    font-size: 24px !important;
                    color: #ffffff !important;
                    opacity: 1 !important;
                    line-height: 1 !important;
                }

                .slider-container .slick-slider .prev-arrow {
                    left: -60px !important;
                }

                .slider-container .slick-slider .next-arrow {
                    right: -60px !important;
                }

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
                    <div key={product.id} className=" pb-8"> 
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