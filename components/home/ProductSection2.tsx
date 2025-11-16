'use client'

import React, { useMemo, useState } from "react";
import Slider, { CustomArrowProps } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PublicProduct } from "../HeroPage";

type TabsPayload = {
  products: PublicProduct[];
  onsale: PublicProduct[];
  feature: PublicProduct[];
};

// const sampleProduct = (
//   id: string,
//   title: string,
//   price: number,
//   oldPrice: number | null = null,
//   image = "assets/images/product/shop.webp",
//   sticker = "New",
//   discount = "-10%"
// ): Product => ({
//   id,
//   title,
//   image,
//   sticker,
//   discount,
//   price,
//   oldPrice,
// });

// const defaultTabs: TabsPayload = {
//   products: [
//     sampleProduct("p1", "White Shave Brush", 110, 130),
//     sampleProduct("p2", "White Shave Brux", 130),
//     sampleProduct("p3", "White Shave Bruz", 130),
//     sampleProduct("p4", "White Shave Bruk", 115),
//     sampleProduct("p5", "White Shave Brush", 130),
//     sampleProduct("p6", "White Shave Brug", 70, 100),
//     sampleProduct("p7", "White Shave Bruc", 70),
//     sampleProduct("p8", "White Shave Brusb", 90),
//     sampleProduct("p9", "White Shave Brusb", 90),
//     sampleProduct("p10", "White Shave Brusb", 90),
//     sampleProduct("p11", "White Shave Brusb", 90),
//   ],
//   onsale: [
//     sampleProduct("o1", "White Shave Brush", 130),
//     sampleProduct("o2", "White Shave Brug", 70, 100),
//     sampleProduct("o3", "White Shave Bruc", 70),
//     sampleProduct("o4", "White Shave Brusb", 90),
//     sampleProduct("o5", "White Shave Brusb", 90),
//     sampleProduct("o6", "White Shave Brusb", 90),
//     sampleProduct("o7", "White Shave Brusb", 90),
//     sampleProduct("o8", "White Shave Brusb", 90),
//   ],
//   feature: [
//     sampleProduct("f1", "White Shave Brush (F)", 110, 130),
//     sampleProduct("f2", "White Shave Brux (F)", 130),
//     sampleProduct("f3", "White Shave Bruz (F)", 130),
//     sampleProduct("f4", "White Shave Brusb (F)", 90),
//     sampleProduct("f5", "White Shave Brusb (F)", 90),
//     sampleProduct("f6", "White Shave Brusb (F)", 90),
//     sampleProduct("f7", "White Shave Brusb (F)", 90),
//     sampleProduct("f8", "White Shave Brusb (F)", 90),
//   ],
// };

// type Props = {
//   tabs?: TabsPayload;
//   defaultActiveTab?: "products" | "onsale" | "feature";
// };
type Props = {
  tabs: TabsPayload; // It's no longer optional
  defaultActiveTab?: "products" | "onsale" | "feature";
};

// Helper to get the lowest price
const getLowestPrice = (variants: PublicProduct['variants']) => {
  if (!variants || variants.length === 0) return 0;
  return variants[0].price;
};

export default function ProductSection2({
  tabs,
  defaultActiveTab = "products",
}: Props) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const sliderSettings = useMemo(
    () => ({
      slidesToShow: 4,
      slidesToScroll: 1,
      infinite: true,
      rows: 2,
      arrows: false,
      dots: true,
      responsive: [
        {
          breakpoint: 1199,
          settings: { slidesToShow: 3 },
        },
        {
          breakpoint: 992,
          settings: { slidesToShow: 2 },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 2, arrows: false, autoplay: true },
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1, arrows: false, autoplay: true },
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

  // hide dots when items count <= slidesToShow * 1 (rows handled by slick)
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

    return (
      <div key={product.id} className="col-12" style={{ padding: 6 }}>
        <div className="single-product mb-30">
          <div className="product-img">
            <a href={`/collections/${product.category.slug}/${product.id}`}>
              <img
                src={product.images[0] || 'assets/images/product/shop.webp'}
                alt={product.name}
                style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
              />
            </a>

            {discount > 0 && <span className="descount-sticker">-{discount}%</span>}
            {product.isNewArrival && <span className="sticker">New</span>}

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
            <h3><a href={`/collections/${product.category.slug}/${product.id}`}>{product.name}</a></h3>

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
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("products");
                    }}
                    className={activeTab === "products" ? "active" : undefined}
                    aria-current={activeTab === "products" ? "true" : "false"}
                  >
                    New Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("onsale");
                    }}
                    className={activeTab === "onsale" ? "active" : undefined}
                    aria-current={activeTab === "onsale" ? "true" : "false"}
                  >
                    OnSale
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("feature");
                    }}
                    className={activeTab === "feature" ? "active" : undefined}
                    aria-current={activeTab === "feature" ? "true" : "false"}
                  >
                    Feature Products
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Slider Section */}
        <div className="row">
          <div className="col-12">
            <div className="tab-content">
              {/* only render the active tab's slider to keep DOM small */}
              <div
                className={`tab-pane fade ${activeTab === "products" ? "show active" : ""
                  }`}
                id="products"
              >
                <div className="product-slider tf-element-carousel" data-slick-options>
                  <Slider {...finalSliderSettings}>
                    {activeProducts.map(renderProduct)}
                  </Slider>
                </div>
              </div>

              <div
                className={`tab-pane fade ${activeTab === "onsale" ? "show active" : ""}`}
                id="onsale"
              >
                <div className="product-slider tf-element-carousel" data-slick-options>
                  <Slider {...finalSliderSettings}>
                    {activeProducts.map(renderProduct)}
                  </Slider>
                </div>
              </div>

              <div
                className={`tab-pane fade ${activeTab === "feature" ? "show active" : ""}`}
                id="featureproducts"
              >
                <div className="product-slider tf-element-carousel" data-slick-options>
                  <Slider {...finalSliderSettings}>
                    {activeProducts.map(renderProduct)}
                  </Slider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* end container */}
    </div>
  );
}
