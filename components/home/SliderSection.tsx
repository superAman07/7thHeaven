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
        /* --- UTILITIES --- */
        .hero-overlay-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* Professional Gradient Overlay: Darker on left for text readability */
            background: linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%);
            z-index: 1; /* Above video */
        }

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
            background: #B6902E; 
            border-color: #B6902E;
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
        
        /* --- HERO TEXT OVERLAY --- */
        .hero-text-overlay {
            position: relative;
            z-index: 10;
            padding: 20px 0;
        }
        
        /* Brand Tag: Regal & Engraved */
        .hero-text-overlay h2 {
            font-family: 'Cinzel', serif !important;
            /* Note: .text-gradient-gold handles color */
            font-size: 13px; 
            font-weight: 700;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 12px;
            text-shadow: none; 
            display: inline-block;
        }

        /* Main Headline: Editorial & Elegant */
        .hero-text-overlay h1 {
            font-family: 'Cormorant Garamond', serif !important;
            font-style: italic;
            color: #fff !important;
            font-size: 76px; /* Increased size for impact */
            font-weight: 500;
            line-height: 1.05;
            margin-top: 5px;
            margin-bottom: 25px;
            text-shadow: none; /* Removed shadow thanks to overlay */
        }

        /* Subtitle: Sentence Case = More Expensive Feel */
        .hero-text-overlay h3 {
            font-family: 'Montserrat', sans-serif !important;
            color: #e0e0e0 !important;
            font-size: 16px; 
            font-weight: 400;
            line-height: 1.6;
            margin-bottom: 45px;
            max-width: 500px;
            /* Removed uppercase text-transform */
        }

        /* --- GRADIENT BUTTON --- */
        .hero-btn {
            font-family: 'Montserrat', sans-serif !important;
            display: inline-block;
            background: linear-gradient(90deg, #B6902E, #D6B869, #B6902E);
            background-size: 200% auto;
            color: #fff;
            padding: 18px 45px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-radius: 0;
            transition: all 0.3s ease;
            border: 2px solid #B6902E; 
            text-decoration: none;
        }

        .hero-btn:hover {
            background-color: transparent;
            background-image: linear-gradient(90deg, #B6902E, #D6B869, #B6902E);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            border-image-source: linear-gradient(90deg, #B6902E, #D6B869, #B6902E);
            border-image-slice: 1;
            animation: shineGold 3s linear infinite;
            box-shadow: 0 5px 15px rgba(182, 144, 46, 0.2); 
        }

        @keyframes shineGold {
            to { background-position: 200% center; }
        }

        .text-gradient-gold {
          background: linear-gradient(
            to right, 
            #B6902E 0%, 
            #D6B869 25%, 
            #E9DDBC 50%, 
            #D6B869 75%, 
            #B6902E 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent !important;
          background-size: 200% auto;
          animation: shineGold 3s linear infinite;
          display: inline-block;
        }

        @media (max-width: 991px) {
            .hero-text-overlay h1 { font-size: 55px; }
        }
        @media (max-width: 767px) {
            .hero-text-overlay h1 { font-size: 40px; }
            .hero-text-overlay h3 { font-size: 13px; max-width: 100%; }
            .hero-text-overlay { text-align: left; } /* Keep aligned left on mobile for luxury look */
            
            .hero-btn {
                padding: 14px 30px;
                font-size: 11px;
                letter-spacing: 1px;
                width: auto; /* Prevent full width stretching */
                white-space: nowrap; /* Prevent text wrapping */
            }
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
          
          <div className="hero-overlay-layer"></div>
          
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="row">
              <div className="col-lg-8 col-md-10 col-12">
                <div className="hero-text-overlay text-start">
                  <h2 className="text-gradient-gold">Made In Bharat</h2>
                  <h1>The Scent <br className="d-md-none" /> of Success</h1>
                  <h3>Premium, long-lasting fragrances crafted with the world's rarest oils.</h3>
                  <a href="/collections/perfumes" className="hero-btn">Shop The Collection</a>
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