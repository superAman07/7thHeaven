'use client';

import React from 'react';

const SliderSection = () => {
  return (
    <>
      <style jsx global>{`
        /* --- HERO CONTAINER --- */
        .hero-section {
            position: relative;
            overflow: hidden; /* Prevents content from escaping */
            margin-bottom: 40px;
        }

        .hero-item {
            position: relative;
            min-height: 650px;
            display: flex;
            align-items: center;
            background-image: url('/assets/images/bg-hero.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }

        /* Dark Gradient Overlay */
        .hero-overlay-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.8) 100%);
            z-index: 1;
        }
        
        /* --- TEXT OVERLAY --- */
        .hero-text-overlay {
            position: relative;
            z-index: 10;
            padding: 20px 0;
            text-align: center;
        }
        
        /* Entry Animations (Run Once) */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Brand Tag */
        .hero-text-overlay h2 {
            font-family: 'Cinzel', serif !important;
            font-size: 14px; 
            font-weight: 700;
            letter-spacing: 5px;
            text-transform: uppercase;
            margin-bottom: 20px;
            display: inline-block;
            
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
            animation-delay: 0.2s;
        }

        /* Main Headline */
        .hero-text-overlay h1 {
            font-family: 'Cormorant Garamond', serif !important;
            font-style: italic;
            color: #fff !important;
            font-size: 80px; 
            font-weight: 500;
            line-height: 1.1;
            margin-bottom: 30px;
            text-shadow: 0 10px 30px rgba(0,0,0,0.3);
            
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
            animation-delay: 0.4s;
        }

        /* Subtitle */
        .hero-text-overlay h3 {
            font-family: 'Montserrat', sans-serif !important;
            color: #f0f0f0 !important;
            font-size: 16px; 
            font-weight: 400;
            line-height: 1.8;
            margin-bottom: 50px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
            animation-delay: 0.6s;
        }

        /* --- BUTTON --- */
        .hero-btn {
            font-family: 'Montserrat', sans-serif !important;
            display: inline-block;
            background: linear-gradient(90deg, #B6902E, #D6B869, #B6902E);
            background-size: 200% auto;
            color: #fff;
            padding: 18px 50px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            border-radius: 0;
            transition: all 0.3s ease;
            border: 2px solid #B6902E; 
            text-decoration: none;
            margin-top: 88px;
            
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
            animation-delay: 0.8s;
        }

        .hero-btn:hover {
            background: transparent;
            color: #D6B869;
            border-color: #D6B869;
            box-shadow: 0 0 20px rgba(182, 144, 46, 0.4);
            transform: translateY(-2px);
        }

        .text-gradient-gold {
          background: linear-gradient(to right, #B6902E, #E9DDBC, #B6902E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: shineGold 3s linear infinite;
        }

        @keyframes shineGold {
            to { background-position: 200% center; }
        }

        @media (max-width: 991px) {
            .hero-text-overlay h1 { font-size: 60px; }
        }
        @media (max-width: 767px) {
            .hero-item { min-height: 500px; }
            .hero-text-overlay h1 { font-size: 44px; margin-bottom: 20px; }
            .hero-text-overlay h3 { font-size: 14px; max-width: 90%; margin-bottom: 35px; }
            .hero-btn {
                padding: 15px 35px;
                font-size: 11px;
                letter-spacing: 2px;
            }
        }
      `}</style>
      
      <div className="hero-section section position-relative">
        <div className="hero-item">
          
          <div className="hero-overlay-layer"></div>
          
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="row justify-content-center">
              <div className="col-lg-10 col-12">
                <div className="hero-text-overlay">
                  
                  <h2 className="text-gradient-gold">Made In Bharat</h2>
                  
                  <h1>The Scent <br className="d-md-none" /> of Success</h1>
                  
                  <h3>Premium, long-lasting fragrances crafted with the world's rarest oils.</h3>
                  
                  <a href="/collections/perfumes" className="hero-btn">Shop The Collection</a>

                </div>
              </div>
            </div>
          </div>

        </div> 
      </div> 
    </> 
  ); 
} 
export default SliderSection;