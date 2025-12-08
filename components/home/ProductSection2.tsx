'use client'

import React, { useMemo, useState, useEffect } from "react";
import Slider, { CustomArrowProps } from "react-slick";
import { PublicProduct } from "../HeroPage";
import { NoProductsPlaceholder } from "./NoProductsPlaceholder";
import ProductQuickViewModal from "./QuickViewModal";
import { useCart } from "../CartContext";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";
import { ProductSection2Skeleton } from "./ProductSection2Skeleton";
import { ProductCard } from "./ProductCard";

type TabsPayload = {
  products: PublicProduct[];
  onsale: PublicProduct[];
  feature: PublicProduct[];
};

type Props = {
  tabs: TabsPayload;
  defaultActiveTab?: "products" | "onsale" | "feature";
};

const getLowestPrice = (variants: PublicProduct['variants']) => {
  if (!variants || variants.length === 0) return 0;
  return variants[0].price;
};

export default function ProductSection2({
  tabs,
  defaultActiveTab = "products",
}: Props) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenModal = (product: PublicProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (e: React.MouseEvent, product: PublicProduct) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingProductId(product.id);
    addToCart(product, 1);

    setTimeout(() => {
      setAddingProductId(null);
    }, 2000);
  };

  const sliderSettings = useMemo(
    () => ({
      slidesToShow: 4,
      slidesToScroll: 2,
      infinite: true,
      rows: 2,
      arrows: false,
      dots: true,
      responsive: [
        {
          breakpoint: 1199,
          settings: { slidesToShow: 3, rows: 2, slidesToScroll: 3 },
        },
      ],
      accessibility: true,
      adaptiveHeight: false,
      speed: 1000,
    }),
    []
  );

  const mobileSliderSettings = {
    dots: false,
    infinite: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    rows: 1
  };

  const activeProducts = useMemo<PublicProduct[]>(() => {
    if (activeTab === "products") return tabs.products;
    if (activeTab === "onsale") return tabs.onsale;
    return tabs.feature;
  }, [activeTab, tabs]);

  const mobileRows = useMemo(() => {
    if (!activeProducts.length) return [[], []];
    const mid = Math.ceil(activeProducts.length / 2);
    return [
      activeProducts.slice(0, mid),
      activeProducts.slice(mid)
    ];
  }, [activeProducts]);

  const shouldShowDots = activeProducts.length > 4;

  const finalSliderSettings = useMemo(
    () => ({
      ...sliderSettings,
      dots: shouldShowDots,
    }),
    [sliderSettings, shouldShowDots]
  );

  const renderProduct = (product: PublicProduct) => (
    <ProductCard 
        key={product.id} 
        product={product} 
        onQuickView={handleOpenModal} 
    />
  );

  if (!mounted) return <ProductSection2Skeleton />;
  return (
    <div className="product-section section pt-70 pt-lg-45 pt-md-40 pt-sm-30 pt-xs-15">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="shop-banner-title text-center mb-10">
              <h2> OUR New Arrival</h2>
              <div className="w-24 h-1 bg-[#ddb040] mx-auto mt-4"></div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="product-tab-menu mb-40 mb-xs-20">
              <ul className="nav">
                <li>
                  <button
                    className={activeTab === 'products' ? 'active' : ''}
                    onClick={() => setActiveTab('products')}
                    style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        color: activeTab === 'products' ? '#ddb040' : '#555',
                        borderBottom: activeTab === 'products' ? '2px solid #ddb040' : '2px solid transparent',
                        padding: '10px 20px',
                        transition: 'all 0.3s ease'
                    }}
                  >
                    New Arrivals
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === 'onsale' ? 'active' : ''}
                    onClick={() => setActiveTab('onsale')}
                    style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        color: activeTab === 'onsale' ? '#ddb040' : '#555',
                        borderBottom: activeTab === 'onsale' ? '2px solid #ddb040' : '2px solid transparent',
                        padding: '10px 20px',
                        transition: 'all 0.3s ease'
                    }}
                  >
                    On Sale
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === 'feature' ? 'active' : ''}
                    onClick={() => setActiveTab('feature')}
                    style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        color: activeTab === 'feature' ? '#ddb040' : '#555',
                        borderBottom: activeTab === 'feature' ? '2px solid #ddb040' : '2px solid transparent',
                        padding: '10px 20px',
                        transition: 'all 0.3s ease'
                    }}
                  >
                    Featured
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Slider Section */}
        <div className="row">
          <div className="col-12">
            <div className="tab-content">
              <div className="product-slider tf-element-carousel">
                {activeProducts.length === 0 ? (
                  <NoProductsPlaceholder message={`No ${activeTab} products available right now.`} />
                ) : (
                  <>
                    {isMobile ? (
                      <div className="mobile-sliders">
                        <div className="mb-4">
                           <Slider {...mobileSliderSettings}>
                              {mobileRows[0].map(renderProduct)}
                           </Slider>
                        </div>
                        <div>
                           <Slider {...mobileSliderSettings}>
                              {mobileRows[1].map(renderProduct)}
                           </Slider>
                        </div>
                      </div>
                    ) : (
                      <Slider {...finalSliderSettings}>
                        {activeProducts.map(renderProduct)}
                      </Slider>
                    )}
                  </>
                )}
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
