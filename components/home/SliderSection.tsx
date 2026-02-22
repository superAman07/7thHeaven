'use client';

import React, { useState, useEffect, useCallback } from 'react';

const SLIDE_INTERVAL = 6000;

const SliderSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 2;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, [currentSlide, goToSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }, [currentSlide, goToSlide, totalSlides]);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

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
            .hero-slide-1 .hero-text-overlay {
                margin-top: 65vh !important;
            }
            .hero-slide-2 .hero-text-overlay {
                margin-top: 50vh !important;
            }
        }
        @media (min-width: 768px) {
            div[style*="flex-direction: column"] {
                flex-direction: row !important;
            }
        }

        /* ===== SLIDER ENGINE ===== */
        .hero-slider-wrapper {
          position: relative !important;
          overflow: hidden !important;
          height: 100vh !important;
          height: 100dvh !important;
        }
        .hero-slide {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 0 !important;
          visibility: hidden !important;
          transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out !important;
          pointer-events: none !important;
          z-index: 1 !important;
        }
        .hero-slide.active {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          position: relative !important;
          z-index: 2 !important;
        }

        /* ===== SLIDE BACKGROUNDS ===== */
        .hero-slide-1::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/assets/images/bg-hero.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          animation: slowZoom 20s ease-in-out infinite alternate;
          z-index: 0;
        }
        .hero-slide-2::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/assets/images/hero/hero-7th-heaven.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          animation: slowZoom 20s ease-in-out infinite alternate;
          z-index: 0;
        }

        /* ===== NAVIGATION: Gucci-style bottom-right ===== */
        .slider-nav-container {
          position: absolute;
          bottom: 30px;
          right: 40px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        @media (max-width: 767px) {
          .slider-nav-container {
            bottom: 20px;
            right: 20px;
            gap: 12px;
          }
        }
        .slider-dot {
          width: 32px;
          height: 2px;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          transition: all 0.4s ease;
          padding: 0;
        }
        .slider-dot.active {
          background: #D4AF37;
          width: 48px;
        }
        .slider-dot:hover {
          background: rgba(255,255,255,0.6);
        }
        .slider-arrow-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.6);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
        }
        .slider-arrow-btn:hover {
          border-color: #D4AF37;
          color: #D4AF37;
        }
        @media (max-width: 767px) {
          .slider-arrow-btn {
            width: 30px;
            height: 30px;
            font-size: 10px;
          }
        }

        /* ===== 7TH HEAVEN SLIDE ANIMATIONS ===== */
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(212,175,55,0.3); }
          50% { text-shadow: 0 0 30px rgba(212,175,55,0.8), 0 0 60px rgba(212,175,55,0.3); }
        }
        .floating-element {
          position: absolute;
          animation: floatUp linear infinite;
          pointer-events: none;
          z-index: 5;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #D4AF37 0%, #FFE088 25%, #D4AF37 50%, #FFE088 75%, #D4AF37 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div
        className="hero-section section position-relative hero-slider-wrapper"
      >

        {/* ========== SLIDE 1: Luxury Collection (Existing) ========== */}
        <div className={`hero-item min-h-screen h-screen hero-slide hero-slide-1 ${currentSlide === 0 ? 'active' : ''}`}>
          <div className="hero-overlay-layer"></div>
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="row justify-content-center">
              <div className="col-lg-10 col-12">
                <div className="hero-text-overlay d-flex flex-column align-items-center justify-content-end text-center"
                    style={{
                        marginTop: '55vh',
                        minHeight: '200px',
                        paddingBottom: '60px',
                        position: 'relative'
                    }}>

                  <div className="d-none d-md-block mb-3 animate-fade-in-up">
                      <span className="d-inline-block px-3 py-1 border-start border-end border-white text-white text-uppercase tracking-[4px]" style={{ fontSize: '10px', letterSpacing: '4px' }}>
                          Signature Collection
                      </span>
                  </div>

                  <h1 className="text-center mb-3"
                      style={{
                          fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                          fontWeight: '800',
                          color: 'white',
                          lineHeight: '1.1',
                          letterSpacing: '-1px',
                          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          whiteSpace: 'nowrap',
                          width: '100%'
                      }}>
                    The Symbol of <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#D4AF37' }}>Luxury</span>
                  </h1>

                  <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '20px',
                      width: '100%',
                      marginTop: '20px'
                  }}>
                    {/* BUTTON 1: "Shop Collection" → NOW GLASSMORPHIC (swapped) */}
                    <a
                      href="/collections"
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
                      Shop Collection
                    </a>

                    {/* BUTTON 2: "7th Heaven" → NOW WHITE SOLID (swapped) */}
                    <a
                      href="/7th-heaven"
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
                          border: '1px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span>7th Heaven</span>
                      <i className="fa fa-star" style={{ fontSize: '10px', color: '#D4AF37' }}></i>
                    </a>

                  </div>

                  {/* Bottom Scroll Indicator */}
                  <div className="position-absolute bottom-0 start-50 translate-middle-x d-none d-md-flex flex-column align-items-center" style={{ paddingBottom: '20px', opacity: 0.7 }}>
                      <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #D4AF37, transparent)' }}></div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== SLIDE 2: 7th Heaven Scheme ========== */}
        <div className={`hero-item min-h-screen h-screen hero-slide hero-slide-2 ${currentSlide === 1 ? 'active' : ''}`}>
          <div className="hero-overlay-layer"></div>

          {/* Floating Animated Elements (coins & stars) */}
          {currentSlide === 1 && (
            <>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="floating-element"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    bottom: '-30px',
                    animationDuration: `${4 + Math.random() * 6}s`,
                    animationDelay: `${Math.random() * 3}s`,
                    fontSize: `${14 + Math.random() * 14}px`,
                    color: '#D4AF37',
                    opacity: 0.6,
                  }}
                >
                  {i % 3 === 0 ? '💰' : i % 3 === 1 ? '⭐' : '✨'}
                </div>
              ))}
            </>
          )}

          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="row justify-content-center">
              <div className="col-lg-10 col-12">
                <div className="hero-text-overlay d-flex flex-column align-items-center justify-content-end text-center"
                    style={{
                        marginTop: '45vh',
                        minHeight: '200px',
                        paddingBottom: '60px',
                        position: 'relative'
                    }}>

                  {/* Exclusive Badge */}
                  <div className="mb-3">
                    <span
                      className="d-inline-block px-4 py-1 text-uppercase"
                      style={{
                        fontSize: '10px',
                        letterSpacing: '5px',
                        color: '#D4AF37',
                        border: '1px solid rgba(212,175,55,0.4)',
                        background: 'rgba(212,175,55,0.08)',
                      }}
                    >
                      ★ Exclusive Program ★
                    </span>
                  </div>

                  {/* Title with shimmer */}
                  <h1
                    className="text-center mb-2 shimmer-text"
                    style={{
                      fontSize: 'clamp(1.8rem, 5vw, 4rem)',
                      fontWeight: '800',
                      lineHeight: '1.1',
                      letterSpacing: '-1px',
                    }}
                  >
                    7th Heaven Club
                  </h1>

                  {/* Subtitle */}
                  <p
                    className="text-center mb-4"
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                      maxWidth: '500px',
                      lineHeight: '1.6',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Shop. Refer. Earn Rewards.<br />
                    <span style={{ color: '#D4AF37', fontWeight: '600' }}>
                      Unlock 7 Levels of Exclusive Luxury Rewards
                    </span>
                  </p>

                  {/* Reward Highlights - Mobile friendly */}
                  <div
                    className="d-flex justify-content-center mb-4"
                    style={{ gap: '24px', flexWrap: 'wrap' }}
                  >
                    {[
                      { icon: '🛍️', label: 'Shop & Join' },
                      { icon: '🤝', label: 'Refer Friends' },
                      { icon: '🏆', label: 'Earn Rewards' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="text-center"
                        style={{ minWidth: '80px' }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</div>
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            fontWeight: '600',
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <a
                    href="/7th-heaven"
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(90deg, #B6902E, #D6B869, #B6902E)',
                      backgroundSize: '200% auto',
                      color: '#fff',
                      padding: '14px 40px',
                      borderRadius: '0px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      letterSpacing: '3px',
                      fontSize: '12px',
                      minWidth: '240px',
                      textAlign: 'center',
                      border: '2px solid #B6902E',
                      display: 'inline-block',
                      animation: 'pulseGlow 2s ease-in-out infinite',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#D6B869';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(182,144,46,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, #B6902E, #D6B869, #B6902E)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Explore 7th Heaven
                  </a>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== NAVIGATION: Gucci-style bottom-right ========== */}
        <div className="slider-nav-container">
          <button className="slider-arrow-btn" onClick={prevSlide} aria-label="Previous slide">
            <i className="fa fa-chevron-left"></i>
          </button>
          {[...Array(totalSlides)].map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${currentSlide === i ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <button className="slider-arrow-btn" onClick={nextSlide} aria-label="Next slide">
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>

      </div>
    </>
  );
};

export default SliderSection;


// 'use client';

// import React from 'react';

// const SliderSection = () => {
//   return (
//     <>
//       <style jsx global>{`
//         @media (max-width: 767px) {
//             .hero-item {
//                 min-height: 100dvh !important;
//                 height: 100dvh !important;
//             }
//             .hero-text-overlay {
//                 padding-top: 20px;
//             }
//         }
//         @media (min-width: 768px) {
//             .hero-text-overlay {
//                 margin-top: 70vh !important;
//             }
//         }
//         @media (min-width: 768px) {
//             div[style*="flex-direction: column"] {
//                 flex-direction: row !important;
//             }
//         }
//       `}</style>
//       <div className="hero-section section position-relative">
//         <div className="hero-item min-h-screen h-screen">
          
//           <div className="hero-overlay-layer"></div>
          
//           <div className="container" style={{ position: 'relative', zIndex: 10 }}>
//             <div className="row justify-content-center">
//               <div className="col-lg-10 col-12">
//                 <div className="hero-text-overlay d-flex flex-column align-items-center justify-content-end text-center" 
//                     style={{ 
//                         marginTop: '60vh',
//                         minHeight: '200px',
//                         paddingBottom: '80px',
//                         position: 'relative'
//                     }}>
                  
//                   <div className="d-none d-md-block mb-3 animate-fade-in-up">
//                       <span className="d-inline-block px-3 py-1 border-start border-end border-white text-white text-uppercase tracking-[4px]" style={{ fontSize: '10px', letterSpacing: '4px' }}>
//                           Signature Collection
//                       </span>
//                   </div>

//                   <h1 className="text-center mb-3" 
//                       style={{ 
//                           fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
//                           fontWeight: '800', 
//                           color: 'white',
//                           lineHeight: '1.1',
//                           letterSpacing: '-1px',
//                           textShadow: '0 4px 20px rgba(0,0,0,0.5)',
//                           whiteSpace: 'nowrap',
//                           width: '100%' 
//                       }}>
//                     The Symbol of <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#D4AF37' }}>Luxury</span>
//                   </h1>
//                   <div 
//                     style={{ 
//                         display: 'flex', 
//                         flexDirection: 'column', 
//                         alignItems: 'center', 
//                         justifyContent: 'center', 
//                         gap: '20px', 
//                         width: '100%',
//                         marginTop: '20px'
//                     }}
//                   > 
//                     <a 
//                       href="/collections" 
//                       style={{ 
//                           position: 'relative',
//                           overflow: 'hidden',
//                           backgroundColor: 'white',
//                           color: 'black',
//                           padding: '12px 30px',
//                           borderRadius: '0px',
//                           fontWeight: 'bold',
//                           textTransform: 'uppercase',
//                           textDecoration: 'none',
//                           transition: 'all 0.3s ease',
//                           letterSpacing: '3px',
//                           fontSize: '11px',
//                           minWidth: '220px',
//                           textAlign: 'center',
//                           boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
//                           border: '1px solid white'
//                       }}
//                       onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
//                       onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
//                     >
//                       Shop Collection
//                     </a>
                    
//                     <a 
//                       href="/7th-heaven" 
//                       style={{ 
//                           position: 'relative',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '10px',
//                           padding: '12px 30px',
//                           borderRadius: '0px',
//                           color: 'white',
//                           fontWeight: 'bold',
//                           textTransform: 'uppercase',
//                           textDecoration: 'none',
//                           transition: 'all 0.3s ease',
//                           letterSpacing: '3px',
//                           fontSize: '11px',
//                           minWidth: '220px',
//                           backgroundColor: 'rgba(0,0,0,0.4)',
//                           backdropFilter: 'blur(10px)',
//                           border: '1px solid rgba(255,255,255,0.2)'
//                       }}
//                       onMouseEnter={(e) => {
//                           e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
//                           e.currentTarget.style.borderColor = '#D4AF37';
//                       }}
//                       onMouseLeave={(e) => {
//                           e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
//                           e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
//                       }}
//                     >
//                       <span>7th Heaven</span>
//                       <i className="fa fa-star" style={{ fontSize: '10px', color: '#D4AF37' }}></i>
//                     </a>

//                   </div>

//                   {/* Bottom Scroll Indicator (Decorative) */}
//                   <div className="position-absolute bottom-0 start-50 translate-middle-x d-none d-md-flex flex-column align-items-center" style={{ paddingBottom: '20px', opacity: 0.7 }}>
//                       <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #D4AF37, transparent)' }}></div>
//                   </div>

//                 </div>
//               </div>
//             </div>
//           </div>

//         </div> 
//       </div> 
//     </>
//   ); 
// } 
// export default SliderSection;