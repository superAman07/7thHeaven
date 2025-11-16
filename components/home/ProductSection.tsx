'use client'; // This is now a client component

import React from "react";
import Link from "next/link";
import Slider from "react-slick";
import { PublicProduct } from "../HeroPage";
import { NoProductsPlaceholder } from "./NoProductsPlaceholder";

const getLowestPrice = (variants: PublicProduct['variants']) => {
  if (!variants || variants.length === 0) return 0;
  return variants[0].price;
};

// The component now receives products as a prop
export default function ProductSectionPage({ products }: { products: PublicProduct[] }) {

  const sliderSettings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: products.length > 4, // Only be infinite if there are enough products
    arrows: false,
    dots: true,
    responsive: [
      { breakpoint: 1199, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 2, arrows: false, autoplay: true } },
      { breakpoint: 575, settings: { slidesToShow: 1, arrows: false, autoplay: true } },
    ],
  };

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
                                    <Link href={`/collections/${product.category.slug}/${product.id}`}>
                                      <img src={product.images[0] || '/assets/images/product/shop.webp'} alt={product.name} />
                                    </Link>
                                    {product.isNewArrival && <span className="sticker">New Arrival</span>}
                                    {product.discountPercentage && product.discountPercentage > 0 && <span className="descount-sticker">-{product.discountPercentage}%</span>}
                                    <div className="product-action d-flex justify-content-between">
                                      <a className="product-btn" href="#">Add to Cart</a>
                                      <ul className="d-flex">
                                        <li><a href="#quick-view-modal-container" data-bs-toggle="modal" title="Quick View"><i className="fa fa-eye"></i></a></li>
                                        <li><a href="#"><i className="fa fa-heart-o"></i></a></li>
                                        <li><a href="#"><i className="fa fa-exchange"></i></a></li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="product-content">
                                    <h3><Link href={`/collections/${product.category.slug}/${product.id}`}>{product.name}</Link></h3>
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
    </div>
  );
}