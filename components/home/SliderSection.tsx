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
        @media (min-width: 768px) {
            div[style*="flex-direction: column"] {
                flex-direction: row !important;
            }
        }
      `}</style>
      <div className="hero-section section position-relative">
        <div className="hero-item min-h-screen h-screen">
          
          <div className="hero-overlay-layer"></div>
          
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="row justify-content-center">
              <div className="col-lg-10 col-12">
                <div className="hero-text-overlay d-flex flex-column align-items-center justify-content-end text-center" 
                    style={{ 
                        marginTop: '60vh',
                        minHeight: '200px',
                        paddingBottom: '80px',
                        position: 'relative'
                    }}>
                  
                  <div className="d-none d-md-block mb-3 animate-fade-in-up">
                      <span className="d-inline-block px-3 py-1 border-start border-end border-white text-white text-uppercase tracking-[4px]" style={{ fontSize: '10px', letterSpacing: '4px' }}>
                          Signature Collection
                      </span>
                  </div>

                  <h1 className="text-center mb-3" 
                      style={{ 
                          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                          fontWeight: '800', 
                          color: 'white', 
                          lineHeight: '1.1',
                          letterSpacing: '-1px',
                          textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                      }}>
                    The Symbol of <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#D4AF37' }}>Luxury</span>
                  </h1>
                  <div 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '20px', 
                        width: '100%',
                        marginTop: '20px'
                    }}
                  > 
                    <a 
                      href="/collections" 
                      style={{ 
                          position: 'relative',
                          overflow: 'hidden',
                          backgroundColor: 'white',
                          color: 'black',
                          padding: '12px 30px',
                          borderRadius: '0px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          letterSpacing: '3px',
                          fontSize: '11px',
                          minWidth: '220px',
                          textAlign: 'center',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                          border: '1px solid white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Shop Collection
                    </a>
                    
                    <a 
                      href="/7th-heaven" 
                      style={{ 
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          padding: '12px 30px',
                          borderRadius: '0px',
                          color: 'white',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          letterSpacing: '3px',
                          fontSize: '11px',
                          minWidth: '220px',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                      }}
                      onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.borderColor = '#D4AF37';
                      }}
                      onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }}
                    >
                      <span>7th Heaven</span>
                      <i className="fa fa-star" style={{ fontSize: '10px', color: '#D4AF37' }}></i>
                    </a>

                  </div>

                  {/* Bottom Scroll Indicator (Decorative) */}
                  <div className="position-absolute bottom-0 start-50 translate-middle-x d-none d-md-flex flex-column align-items-center" style={{ paddingBottom: '20px', opacity: 0.7 }}>
                      <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #D4AF37, transparent)' }}></div>
                  </div>

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