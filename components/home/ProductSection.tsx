'use client';

import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { PublicProduct } from "../HeroPage";
import { NoProductsPlaceholder } from "./NoProductsPlaceholder";
import ProductQuickViewModal from "./QuickViewModal";
import { ProductCard } from "./ProductCard"; // Import the new component

export default function ProductSectionPage({ products }: { products: PublicProduct[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenModal = (product: PublicProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const sliderSettings = {
    dots: true,
    infinite: products.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: false,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1199,
        settings: { slidesToShow: 3, slidesToScroll: 3 }
      },
      {
        breakpoint: 991,
        settings: { slidesToShow: 2, slidesToScroll: 2 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: true, autoplay: true, dots: true }
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, autoplay: true, speed: 1500, dots: true }
      }
    ]
  };

  if (!mounted) return null;

  return (
    <div className="shop-section section pt-90 pt-lg-70 pt-md-60 pt-sm-50 pt-xs-45 pb-70 pb-lg-50 pb-md-40 pb-sm-60 pb-xs-50">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 order-lg-2 order-1">
            <div className="row">
              <div className="col-12">
                <div className="shop-banner-title text-center">
                  <h2>SELECT & TRY FROM <br /> OUR BEST SELLERS</h2>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="shop-product">
                  <div id="myTabContent-2" className="tab-content">
                    <div id="grid" className="tab-pane fade active show">
                      <div className="product-slider tf-element-carousel">
                        {products.length === 0 ? (
                          <NoProductsPlaceholder />
                        ) : (
                          <Slider {...sliderSettings}>
                            {products.map((product) => (
                              <ProductCard 
                                key={product.id} 
                                product={product} 
                                onQuickView={handleOpenModal} 
                              />
                            ))}
                          </Slider>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedProduct && (
        <ProductQuickViewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
        />
      )}
    </div>
  );
}