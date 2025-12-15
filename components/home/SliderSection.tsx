'use client';

import React, { useState, useRef } from 'react';

const SliderSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <style jsx global>{`
        .hero-play-pause-btn {
            position: absolute;
            bottom: 40px;
            left: 50px; /* Moved to right for better balance */
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
                right: 20px;
                width: 36px;
                height: 36px;
            }
        }
        .video-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
        }
        
        /* --- NEW TEXT STYLES --- */
        .hero-text-overlay {
            position: relative;
            z-index: 10;
            padding: 20px 0;
        }
        .hero-text-overlay h2 {
            color: #ddb040 !important;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 15px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        .hero-text-overlay h1 {
            color: #fff !important;
            font-size: 65px;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 20px;
            text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
        }
        .hero-text-overlay h3 {
            color: #f0f0f0 !important;
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 35px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        .hero-btn {
            display: inline-block;
            background-color: #ddb040;
            color: #fff;
            padding: 16px 40px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-radius: 0;
            transition: all 0.3s ease;
            border: 2px solid #ddb040;
            text-decoration: none;
        }
        .hero-btn:hover {
            background-color: transparent;
            color: #ddb040;
        }

        @media (max-width: 991px) {
            .hero-text-overlay h1 { font-size: 50px; }
        }
        @media (max-width: 767px) {
            .hero-text-overlay h1 { font-size: 36px; }
            .hero-text-overlay h3 { font-size: 18px; }
            .hero-text-overlay { text-align: center; } /* Center on mobile */
        }
      `}</style>
      <div className="hero-section section position-relative">
        {/* Added min-height and flex to center content vertically */}
        <div className="hero-item" style={{ minHeight: '650px', display: 'flex', alignItems: 'center' }}>
          <video 
              ref={videoRef}
              className="video-bg"
              src="/celsius-vid.mp4"
              loop
              muted
              playsInline
              autoPlay
          />
          
          <div className="container">
            <div className="row">
              {/* Left Aligned Column */}
              <div className="col-lg-7 col-md-9 col-12">
                <div className="hero-text-overlay text-start">
                  <h2>Exclusive Collection</h2>
                  <h1>Luxury Fragrances <br/> For Everyone</h1>
                  <h3>Discover your signature scent today.</h3>
                  <a href="/collections/perfumes" className="hero-btn">Shop Now</a>
                </div>
              </div>
            </div>
          </div>

          <button 
              className="hero-play-pause-btn" 
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
          >
              {isPlaying ? (
                  <i className="fa fa-pause" style={{ fontSize: '14px' }}></i>
              ) : (
                  <i className="fa fa-play" style={{ fontSize: '14px', marginLeft: '3px' }}></i> 
                )
              } 
          </button> 
        </div> 
      </div> 
    </> 
  ); 
} 
export default SliderSection;