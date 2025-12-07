'use client'

import React, { useMemo, useState } from "react";
import Slider, { CustomArrowProps } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PublicProduct } from "../HeroPage";
import { NoProductsPlaceholder } from "./NoProductsPlaceholder";
import ProductQuickViewModal from "./QuickViewModal";
import { useCart } from "../CartContext";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";

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
        {
          breakpoint: 992,
          settings: { slidesToShow: 2, rows: 2, slidesToScroll: 3 },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 1,slidesToScroll: 1, rows: 1, arrows: true, autoplay: true,dots: true },
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1,slidesToScroll: 1, rows: 1, arrows: true, autoplay: true,dots: true },
        },
      ],
      accessibility: true,
      adaptiveHeight: false,
      speed: 800,
    }),
    []
  );

  const activeProducts = useMemo<PublicProduct[]>(() => {
    if (activeTab === "products") return tabs.products;
    if (activeTab === "onsale") return tabs.onsale;
    return tabs.feature;
  }, [activeTab, tabs]);

  const shouldShowDots = activeProducts.length > 4;

  const finalSliderSettings = useMemo(
    () => ({
      ...sliderSettings,
      dots: shouldShowDots,
    }),
    [sliderSettings, shouldShowDots]
  );

  const renderProduct = (product: PublicProduct) => {
    const originalPrice = getLowestPrice(product.variants);
    const discount = product.discountPercentage || 0;
    const discountedPrice = originalPrice * (1 - discount / 100);

    const quickViewProduct = {
      id: product.id,
      name: product.name,
      images: product.images,
      reviews: { rating: product.ratingsAvg ?? 0, count: product.reviews.length },
      price: { current: discountedPrice, regular: originalPrice },
      description: product.description,
      categories: [product.category.name],
    };

    return (
      <div key={product.id} className="col-12" style={{ padding: 6 }}>
        <div className="single-product mb-30">
          <div className="product-img">
            <a href={`/products/${product.slug}`}>
              <img
                src={product.images[0] || 'assets/images/product/shop.webp'}
                alt={product.name}
                style={{ aspectRatio: '1 / 1', objectFit: 'cover', width: "100%", display: "block" }}
              />
            </a>

            {discount > 0 && <span className="descount-sticker">-{discount}%</span>}
            {product.isNewArrival && <span className="sticker">New</span>}

            <div className="product-action d-flex justify-content-between">
              <a
                href="#"
                className="product-btn"
                onClick={(e) => handleAddToCart(e, product)}
              >
                {addingProductId === product.id ? 'Added!' : 'Add to Cart'}
              </a>
              <ul className="d-flex">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenModal(product);
                    }}
                    title="Quick View"
                  >
                    <i className="fa fa-eye"></i>
                  </a>
                </li>
                <li>
                  <a
                    title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist({
                        id: product.id,
                        name: product.name,
                        image: product.images[0] || 'assets/images/product/shop.webp',
                        slug: product.slug
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <i
                      className={`fa ${isInWishlist(product.id) ? 'fa-heart' : 'fa-heart-o'}`}
                      style={{ color: isInWishlist(product.id) ? '#dc3545' : 'inherit' }}
                    ></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fa fa-exchange"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="product-content">
            <h3>
              <Link href={`/products/${product.slug}`}>{product.name}</Link>
            </h3>

            <div className="ratting">
              <i className="fa fa-star" />
              <i className="fa fa-star" />
              <i className="fa fa-star" />
              <i className="fa fa-star" />
              <i className="fa fa-star" />
            </div>

            <h4 className="price">
              <span className="new">Rs.{discountedPrice.toFixed(2)}</span>
              {discount > 0 && (
                <span className="old">Rs.{originalPrice.toFixed(2)}</span>
              )}
            </h4>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="product-section section pt-70 pt-lg-45 pt-md-40 pt-sm-30 pt-xs-15">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="shop-banner-title text-center">
              <h2> OUR New Arrival</h2>
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
                  >
                    New Products
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === 'onsale' ? 'active' : ''}
                    onClick={() => setActiveTab('onsale')}
                  >
                    OnSale
                  </button>
                </li>
                <li>
                  <button
                    className={activeTab === 'feature' ? 'active' : ''}
                    onClick={() => setActiveTab('feature')}
                  >
                    Feature Products
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
                  <Slider {...finalSliderSettings}>
                    {activeProducts.map(renderProduct)}
                  </Slider>
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
