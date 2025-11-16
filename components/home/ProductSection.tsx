'use client'
import React from "react";
import { PublicProduct } from "../HeroPage";
import Link from "next/link";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { NoProductsPlaceholder } from "./NoProductsPlaceholder";

type Product = {
  id: string;
  title: string;
  image: string;
  sticker: string | null;
  price: number;
  oldPrice: number | null;
  description: string;
};

const getLowestPrice = (variants: PublicProduct['variants']) => {
  if (!variants || variants.length === 0) return 0;
  return variants[0].price;
};

export default function ProductSectionPage({ products }: { products: PublicProduct[] }) {
  return (
    <>
      <div className="shop-section section pt-90 pt-lg-70 pt-md-60 pt-sm-50 pt-xs-45 pb-70 pb-lg-50 pb-md-40 pb-sm-60 pb-xs-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 order-lg-2 order-1">
              <div className="row">
                <div className="col-12">
                  <div className="shop-banner-title text-center">
                    <h2>
                      SELECT & TRY FROM <br /> OUR BEST SELLERS
                    </h2>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="shop-product">
                    <div id="myTabContent-2" className="tab-content">
                      {/* GRID VIEW */}
                      <div id="grid" className="tab-pane fade active show">
                        <div className="product-grid-view">
                          <div className="row">
                            {!products ? (
                              Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            ) : products.length === 0 ? (
                              <NoProductsPlaceholder />
                            ) : (products.map((product) => (
                              <div
                                key={product.id}
                                className="col-lg-3 col-md-6 col-sm-6"
                              >
                                {/* Single Product Start */}
                                <div className="single-product mb-30">
                                  <div className="product-img">
                                    <Link href={`/collections/${product.category.slug}/${product.id}`}>
                                      <img src={product.images[0] || '/assets/images/product/shop.webp'} alt={product.name} />
                                    </Link>
                                    {product.isNewArrival && <span className="sticker">New Arrival</span>}
                                    {product.discountPercentage && product.discountPercentage > 0 && <span className="descount-sticker">-{product.discountPercentage}%</span>}

                                    <div className="product-action d-flex justify-content-between">
                                      <a className="product-btn" href="#">
                                        Add to Cart
                                      </a>
                                      <ul className="d-flex">
                                        <li>
                                          <a
                                            href="#quick-view-modal-container"
                                            data-bs-toggle="modal"
                                            title="Quick View"
                                          >
                                            <i className="fa fa-eye"></i>
                                          </a>
                                        </li>
                                        <li>
                                          <a href="#">
                                            <i className="fa fa-heart-o"></i>
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
                                    <h3><Link href={`/collections/${product.category.slug}/${product.id}`}>{product.name}</Link></h3>
                                    <h4 className="price">
                                      <span className="new">Rs. {getLowestPrice(product.variants).toFixed(2)}</span>
                                    </h4>
                                  </div>
                                </div>
                                {/* Single Product End */}
                              </div>
                            ))
                            )}
                          </div>

                          <br />
                          <center>
                            <a href="" className="btn">
                              <span>View More</span>
                            </a>
                          </center>
                        </div>
                      </div>

                      {/* LIST VIEW */}
                      <div id="list" className="tab-pane fade">
                        <div className="product-list-view">
                          {products.map((product) => (
                            <div
                              key={`list-${product.id}`}
                              className="product-list-item mb-40"
                            >
                              <div className="row align-items-center">
                                <div className="col-md-4 col-sm-6">
                                  <div className="single-product">
                                    <div className="product-img mb-0 mb-xs-25">
                                      <Link href={`/collections/${product.category.slug}/${product.id}`}>
                                        <img src={product.images[0] || '/assets/images/product/shop.webp'} alt={product.name} />
                                      </Link>
                                      {product.isNewArrival && <span className="sticker">New Arrival</span>}
                                      {product.discountPercentage && product.discountPercentage > 0 && <span className="descount-sticker">-{product.discountPercentage}%</span>}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-8 col-sm-6">
                                  <div className="product-content-shop-list">
                                    <div className="product-content">
                                      <h3><Link href={`/collections/${product.category.slug}/${product.id}`}>{product.name}</Link></h3>
                                      <h4 className="price">
                                        <span className="new">Rs. {getLowestPrice(product.variants).toFixed(2)}</span>
                                      </h4>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
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
    </>
  );
}
