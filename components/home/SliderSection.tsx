'use client';

import React, { useState, useRef } from 'react';
import { Crown } from 'lucide-react'; 

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
            background: #E6B422; 
            border-color: #E6B422;
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
        
        /* --- NEW PROFESSIONAL FONT STYLES --- */
        .hero-text-overlay {
            position: relative;
            z-index: 10;
            padding: 20px 0;
        }
        
        /* Brand Tag: Regal & Engraved */
        .hero-text-overlay h2 {
            font-family: 'Cinzel', serif !important; /* Update: Luxury Brand Font */
            color: #E6B422 !important;
            font-size: 15px; 
            font-weight: 700;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 0;
            text-shadow: none; /* Removed muddy shadow for crisp look */
            display: inline-block;
        }

        /* Main Headline: Editorial & Elegant */
        .hero-text-overlay h1 {
            font-family: 'Cormorant Garamond', serif !important; /* Update: Classic Serif */
            font-style: italic;
            color: #fff !important;
            font-size: 70px;
            font-weight: 600;
            line-height: 1.1;
            margin-top: 15px;
            margin-bottom: 25px;
            text-shadow: 0 4px 15px rgba(0,0,0,0.5); /* Softer, premium shadow */
        }

        /* Subtitle: Modern & Clean */
        .hero-text-overlay h3 {
            font-family: 'Montserrat', sans-serif !important; /* Update: Clean Sans Serif */
            color: #e0e0e0 !important;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 45px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }

        .hero-btn {
            font-family: 'Montserrat', sans-serif !important; /* Consistent UI font */
            display: inline-block;
            background-color: #E6B422;
            color: #fff;
            padding: 18px 45px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-radius: 0;
            transition: all 0.3s ease;
            border: 1px solid #E6B422;
            text-decoration: none;
        }
        .hero-btn:hover {
            background-color: transparent;
            color: #E6B422;
        }

        @media (max-width: 991px) {
            .hero-text-overlay h1 { font-size: 55px; }
        }
        @media (max-width: 767px) {
            .hero-text-overlay h1 { font-size: 40px; }
            .hero-text-overlay h3 { font-size: 12px; }
            .hero-text-overlay { text-align: center; }
            .crown-header { justify-content: center; }
        }
      `}</style>
      <div className="hero-section section position-relative mb-10">
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
              <div className="col-lg-8 col-md-10 col-12">
                <div className="hero-text-overlay text-start">
                  
                  {/* CROWN HEADER */}
                  <div className="crown-header d-flex align-items-center gap-3 mb-3">
                    <Crown size={20} color="#E6B422" fill="#E6B422" />
                    <h2>CELSIUS Exclusive</h2>
                  </div>
                  
                  {/* NEW BRAND MESSAGING */}
                  <h1>Earn While You Shop... <br/> The Celsius Experience</h1>
                  <h3>Luxury. Longevity. Made in Bharat.</h3>
                  
                  <a href="/collections/perfumes" className="hero-btn">Shop Collection</a>
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