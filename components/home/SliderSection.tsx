'use client';

import React from 'react';

const SliderSection = () => {
  return (
    <>
      <style jsx global>{`
        @media (max-width: 767px) {
            .hero-item {
                min-height: 70dvh !important; /* Forces taller height on mobile */
                height: 70dvh !important;
            }
            .hero-text-overlay {
                padding-top: 20px;
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