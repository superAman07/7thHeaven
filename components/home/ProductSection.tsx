// ProfuctSectionPage.jsx
import React from "react";

/**
 * ProfuctSectionPage
 * - Keeps all original classes/attributes (hover effects, data-bs-* attributes, etc.)
 * - Renders products from `products` prop (defaults to one example product)
 *
 * Usage:
 * <ProfuctSectionPage products={[ myProduct, ... ]} />
 */

type Product = {
  id: string;
  title: string;
  image: string;
  sticker: string | null;
  price: number;
  oldPrice: number | null;
  description: string;
};

const defaultProducts = [
  {
    id: "p1",
    title: "White Shave Brush",
    image: "assets/images/product/Sovaze_graphic_v3.webp",
    sticker: "New Arrival",
    price: 130.0,
    oldPrice: null,
    description:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  },
  {
    id: "p2",
    title: "White Shave Brush",
    image: "assets/images/product/Sovaze_graphic_v3.webp",
    sticker: "New Arrival",
    price: 130.0,
    oldPrice: null,
    description:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  },
  {
    id: "p3",
    title: "White Shave Brush",
    image: "assets/images/product/Sovaze_graphic_v3.webp",
    sticker: "New Arrival",
    price: 130.0,
    oldPrice: null,
    description:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  },
  {
    id: "p4",
    title: "White Shave Brush",
    image: "assets/images/product/Sovaze_graphic_v3.webp",
    sticker: "New Arrival",
    price: 130.0,
    oldPrice: null,
    description:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  },
];

export default function ProductSectionPage({ products = defaultProducts }: { products?: Product[] }) {
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
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className="col-lg-3 col-md-6 col-sm-6"
                              >
                                {/* Single Product Start */}
                                <div className="single-product mb-30">
                                  <div className="product-img">
                                    <a href="#">
                                      <img
                                        src={product.image}
                                        alt={product.title}
                                      />
                                    </a>

                                    {product.sticker && (
                                      <span className="sticker">
                                        {product.sticker}
                                      </span>
                                    )}

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
                                    <h3>
                                      <a href="#">{product.title}</a>
                                    </h3>

                                    <h4 className="price">
                                      <span className="new">
                                        Rs. {product.price.toFixed(2)}
                                      </span>
                                      {product.oldPrice && (
                                        <span className="old">
                                          Rs. {product.oldPrice.toFixed(2)}
                                        </span>
                                      )}
                                    </h4>
                                  </div>
                                </div>
                                {/* Single Product End */}
                              </div>
                            ))}
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
                                      <a href="#">
                                        <img
                                          src={product.image}
                                          alt={product.title}
                                        />
                                      </a>

                                      {product.sticker && (
                                        <span className="sticker">
                                          {product.sticker}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-8 col-sm-6">
                                  <div className="product-content-shop-list">
                                    <div className="product-content">
                                      <h3>
                                        <a href="#">{product.title}</a>
                                      </h3>
                                      <h4 className="price">
                                        <span className="new">
                                          Rs. {product.price.toFixed(2)}
                                        </span>
                                        {product.oldPrice && (
                                          <span className="old">
                                            Rs. {product.oldPrice.toFixed(2)}
                                          </span>
                                        )}
                                      </h4>

                                      {/* keep existing rating stars structure */}
                                      <div className="ratting">
                                        <i className="fa fa-star"></i>
                                        <i className="fa fa-star"></i>
                                        <i className="fa fa-star"></i>
                                        <i className="fa fa-star"></i>
                                        <i className="fa fa-star"></i>
                                      </div>

                                      <p>{product.description}</p>

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
