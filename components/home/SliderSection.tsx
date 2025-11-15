'use client';

import React from 'react';
import Slider from 'react-slick';
import Image from 'next/image'; 

const PrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} custom-arrow prev-arrow`}
      style={{ ...style }}
      onClick={onClick}
    >
      Previous
    </button>
  );
};

const NextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} custom-arrow next-arrow`}
      style={{ ...style }}
      onClick={onClick}
    >
      Next
    </button>
  );
};


const SliderSection = () => {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          autoplay: true,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
          arrows: false,
          autoplay: true,
        },
      },
    ],
  };

  return (
    <>
      {/* This CSS is now more specific and will correctly align the custom arrows */}
      <style jsx global>{`
        .hero-section .slick-arrow.custom-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          background: transparent;
          border: none;
          color: #333;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 18px;
          font-weight: 600;
          text-transform: uppercase;
          cursor: pointer;
          padding: 24px 12px;
        }
        .hero-section .slick-arrow.custom-arrow:hover {
            color: #ddb040;
        }
        .hero-section .slick-arrow.prev-arrow {
          left: 40px;
        }
        .hero-section .slick-arrow.next-arrow {
          right: 20px;
        }
      `}</style>
      <div className="hero-section section position-relative">
        <Slider {...settings} className="tf-element-carousel slider-nav">
          {/* Hero Item 1 */}
          <div className="hero-item">
            <Image
              src="/assets/images/product/o.webp"
              alt="New Cosmetics"
              layout="fill"
              objectFit="cover"
              priority={true}
            />
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="hero-content-2 color-1 center">
                    <h2>view our</h2>
                    <h1>New Cosmetics</h1>
                    <h3>Products now</h3>
                    <a href="shop.html">shop now</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Item 2 */}
          <div className="hero-item">
            <Image
              src="/assets/images/product/b.jpg"
              alt="Women's Hair Products"
              layout="fill"
              objectFit="cover"
            />
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="hero-content-2 color-2">
                    <h2>view our</h2>
                    <h1>Women's hair</h1>
                    <h3>Products now</h3>
                    <a href="shop.html">shop now</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Slider>
      </div>
    </>
  );
};

export default SliderSection;