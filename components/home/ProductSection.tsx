'use client';

import React, { useState,useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import { PublicProduct } from "../HeroPage";
import { NoProductsPlaceholder } from "./NoProductsPlaceholder";
import ProductQuickViewModal from "./QuickViewModal";
import { useCart } from "../CartContext";
import { useWishlist } from "@/components/WishlistContext";

const getLowestPrice = (variants: PublicProduct['variants']) => {
  if (!variants || variants.length === 0) return 0;
  return variants[0].price;
};

export default function ProductSectionPage({ products }: { products: PublicProduct[] }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: PublicProduct) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingProductId(product.id);
    addToCart(product, 1);

    setTimeout(() => {
      setAddingProductId(null);
    }, 2000);
  };

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
    slidesToScroll: 2,
    arrows: false,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        // Increased to 768 to ensure all mobile devices are caught
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          autoplay: true,
          dots: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          autoplay: true,
          dots: true
        }
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
                              <div key={product.id} className="col-12" style={{ padding: '0 15px' }}>
                                <div className="single-product mb-30">
                                  <div className="product-img">
                                    <Link href={`/products/${product.slug}`}>
                                      <img src={product.images[0] || '/assets/images/product/shop.webp'} alt={product.name} style={{ aspectRatio: '1 / 1', objectFit: 'cover', width: '100%' }} />
                                    </Link>
                                    {product.isNewArrival && <span className="sticker">New Arrival</span>}
                                    <div className="product-action d-flex justify-content-between">
                                      <a
                                        className="product-btn"
                                        onClick={(e) => handleAddToCart(e, product)}
                                      >
                                        {addingProductId === product.id ? 'Added!' : 'Add to Cart'}
                                      </a>
                                      <ul className="d-flex">
                                        <li>
                                          <a
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
                                                image: product.images[0] || '/assets/images/product/shop.webp',
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
                                        </li>                                      </ul>
                                    </div>
                                  </div>
                                  <div className="product-content">
                                    <h3>
                                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                    </h3>
                                    <h4 className="price">
                                      <span className="new">Rs. {getLowestPrice(product.variants).toFixed(2)}</span>
                                    </h4>
                                  </div>
                                </div>
                              </div>
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