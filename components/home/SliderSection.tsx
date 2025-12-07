'use client';

import React, { useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image'; 

// Removed PrevArrow and NextArrow components as they are replaced by the Pause button

const SliderSection = () => {
  const sliderRef = useRef<Slider>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (isPlaying) {
      sliderRef.current?.slickPause();
    } else {
      sliderRef.current?.slickPlay();
    }
    setIsPlaying(!isPlaying);
  };

  const settings = {
    dots: true,
    arrows: false, // Disabled arrows completely
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false, // Disable hover pause to let the button control state
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          autoplay: true,
          arrows: false,
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
      <style jsx global>{`
        .hero-play-pause-btn {
            position: absolute;
            bottom: 40px;
            left: 50px;
            z-index: 20;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            outline: none;
        }
        .hero-play-pause-btn:hover {
            background: #ddb040;
            border-color: #ddb040;
            color: #fff;
            transform: scale(1.05);
        }
        @media (max-width: 767px) {
            .hero-play-pause-btn {
                bottom: 25px;
                left: 20px;
                width: 36px;
                height: 36px;
            }
        }
      `}</style>
      <div className="hero-section section position-relative">
        <Slider ref={sliderRef} {...settings} className="tf-element-carousel slider-nav">
          {/* ...existing code... */}
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
                    <a href="/collections/perfumes">shop now</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    <a href="/collections/perfumes">shop now</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Slider>

        <button 
            className="hero-play-pause-btn" 
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause Slider" : "Play Slider"}
        >
            {isPlaying ? (
                <i className="fa fa-pause" style={{ fontSize: '14px' }}></i>
            ) : (
                <i className="fa fa-play" style={{ fontSize: '14px', marginLeft: '3px' }}></i>
            )}
        </button>
      </div>
    </>
  );
}
export default SliderSection;