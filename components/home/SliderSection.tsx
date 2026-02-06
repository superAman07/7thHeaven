'use client';

import React from 'react';

const SliderSection = () => {
  return (
    <>
      <style jsx global>{`
        @media (max-width: 767px) {
            .hero-item {
                min-height: 100dvh !important;
                height: 100dvh !important;
            }
            .hero-text-overlay {
                padding-top: 20px;
            }
        }
        @media (min-width: 768px) {
            .hero-text-overlay {
                margin-top: 70vh !important; 
            }
        }
      `}</style>
      <div className="hero-section section position-relative">
        <div className="hero-item min-h-screen h-screen">
          
          <div className="hero-overlay-layer"></div>
          
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="row justify-content-center">
              <div className="col-lg-10 col-12">
                <div className="hero-text-overlay d-flex flex-column align-items-center justify-content-end" 
                  style={{ 
                      marginTop: '70vh', // Default (Mobile): Push 60% down
                      minHeight: '200px', // Ensure container has size
                      paddingBottom: '50px' // Add cushion from bottom
                  }}>
                <h1 className="text-center mb-0" 
                    style={{ 
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 'bold', 
                        color: 'white', 
                        lineHeight: '1',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                  The Symbol of Luxury
                </h1>
                
                <a 
                  href="/collections/perfumes" 
                  className="hero-btn mt-4" 
                  style={{ position: 'static', transform: 'none' }} 
                >
                  Shop The Collection
                </a>

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