'use client'

import React, { useMemo, useState } from "react";
import Slider, { CustomArrowProps } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Product = {
  id: string;
  title: string;
  image: string;
  sticker?: string | null;
  discount?: string | null;
  price: number;
  oldPrice?: number | null;
};

type TabsPayload = {
  products: Product[];
  onsale: Product[];
  feature: Product[];
};

const sampleProduct = (
  id: string,
  title: string,
  price: number,
  oldPrice: number | null = null,
  image = "assets/images/product/shop.webp",
  sticker = "New",
  discount = "-10%"
): Product => ({
  id,
  title,
  image,
  sticker,
  discount,
  price,
  oldPrice,
});

const defaultTabs: TabsPayload = {
  products: [
    sampleProduct("p1", "White Shave Brush", 110, 130),
    sampleProduct("p2", "White Shave Brux", 130),
    sampleProduct("p3", "White Shave Bruz", 130),
    sampleProduct("p4", "White Shave Bruk", 115),
    sampleProduct("p5", "White Shave Brush", 130),
    sampleProduct("p6", "White Shave Brug", 70, 100),
    sampleProduct("p7", "White Shave Bruc", 70),
    sampleProduct("p8", "White Shave Brusb", 90),
    sampleProduct("p9", "White Shave Brusb", 90),
    sampleProduct("p10", "White Shave Brusb", 90),
    sampleProduct("p11", "White Shave Brusb", 90),
  ],
  onsale: [
    sampleProduct("o1", "White Shave Brush", 130),
    sampleProduct("o2", "White Shave Brug", 70, 100),
    sampleProduct("o3", "White Shave Bruc", 70),
    sampleProduct("o4", "White Shave Brusb", 90),
    sampleProduct("o5", "White Shave Brusb", 90),
    sampleProduct("o6", "White Shave Brusb", 90),
    sampleProduct("o7", "White Shave Brusb", 90),
    sampleProduct("o8", "White Shave Brusb", 90),
  ],
  feature: [
    sampleProduct("f1", "White Shave Brush (F)", 110, 130),
    sampleProduct("f2", "White Shave Brux (F)", 130),
    sampleProduct("f3", "White Shave Bruz (F)", 130),
    sampleProduct("f4", "White Shave Brusb (F)", 90),
    sampleProduct("f5", "White Shave Brusb (F)", 90),
    sampleProduct("f6", "White Shave Brusb (F)", 90),
    sampleProduct("f7", "White Shave Brusb (F)", 90),
    sampleProduct("f8", "White Shave Brusb (F)", 90),
  ],
};

type Props = {
  tabs?: TabsPayload;
  defaultActiveTab?: "products" | "onsale" | "feature";
};

export default function ProductSection2({
  tabs = defaultTabs,
  defaultActiveTab = "products",
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "products" | "onsale" | "feature"
  >(defaultActiveTab);

  const sliderSettings = useMemo(
    () => ({
      slidesToShow: 4,
      slidesToScroll: 1,
      infinite: true,
      rows: 2, // two rows per slide (like your original)
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
      // keep accessibility on
      accessibility: true,
      // prevent ugly lazy layout changes
      adaptiveHeight: false,
      // speed roughly matches original
      speed: 800,
    }),
    []
  );

  const activeProducts = useMemo<Product[]>(() => {
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

  const renderProduct = (product: Product) => (
    <div key={product.id} className="col-12" style={{ padding: 6 }}>
      <div className="single-product mb-30">
        <div className="product-img">
          <a href="#">
            {/* image scaled to keep consistent UI with ProductSectionPage */}
            <img
              src={product.image}
              alt={product.title}
              style={{
                width: "100%",
                height: 220,
                objectFit: "cover",
                display: "block",
              }}
            />
          </a>

          {product.discount && (
            <span className="descount-sticker">{product.discount}</span>
          )}
          {product.sticker && <span className="sticker">{product.sticker}</span>}

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

          <div className="ratting">
            <i className="fa fa-star" />
            <i className="fa fa-star" />
            <i className="fa fa-star" />
            <i className="fa fa-star" />
            <i className="fa fa-star" />
          </div>

          <h4 className="price">
            <span className="new">Rs.{product.price.toFixed(2)}</span>
            {product.oldPrice != null && (
              <span className="old">Rs.{product.oldPrice.toFixed(2)}</span>
            )}
          </h4>
        </div>
      </div>
    </div>
  );

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
                className={`tab-pane fade ${
                  activeTab === "products" ? "show active" : ""
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
