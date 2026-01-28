'use client';

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { ProductCard } from './ProductCard';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PublicProduct } from '../HeroPage';
import ProductQuickViewModal from './QuickViewModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function MobileProductCarousel({ products, onQuickView }: { products: PublicProduct[], onQuickView: (p: any) => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };
    const currentProduct = products[currentIndex];
    // Auto-preload next image
    useEffect(() => {
        const nextIndex = (currentIndex + 1) % products.length;
        const img = new Image();
        if(products[nextIndex]?.images?.[0]) {
            img.src = products[nextIndex].images[0];
        }
    }, [currentIndex, products]);
    return (
        <div className="relative w-full pb-4 px-1">
            <button 
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 text-gray-600 hover:text-black transition-colors"
                aria-label="Previous Product"
            >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-gray-100/50">
                     <ChevronLeft className="w-5 h-5 ml-[-2px]" />
                </div>
            </button>
            <div className="w-[88%] mx-auto transition-opacity duration-300 ease-in-out">
                <ProductCard 
                    product={currentProduct} 
                    onQuickView={onQuickView}
                />
            </div>
            <button 
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 text-gray-600 hover:text-black transition-colors"
                aria-label="Next Product"
            >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-gray-100/50">
                    <ChevronRight className="w-5 h-5 mr-[-2px]" />
                </div>
            </button>
        </div>
    );
}

function NextArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-product-arrow next-arrow`}
      style={{ ...style, display: "flex" }} 
      onClick={onClick}
    >
      <ChevronRight className="w-5 h-5 text-white" />
    </div>
  );
}

function PrevArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-product-arrow prev-arrow`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <ChevronLeft className="w-5 h-5 text-white" />
    </div>
  );
}

const desktopSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: false,
    responsive: [
        {
            breakpoint: 1199,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                arrows: true,
            }
        },
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 3000,
                pauseOnHover: true,
            }
        }
    ]
};

export default function ProductSlider({ products }: { products: PublicProduct[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile(); 
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const handleQuickView = (p: any) => {
        setSelectedProduct(p);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    if (!mounted) {
        return <div className="min-h-[400px]"></div>;
    }

    return (
        <div className="slider-container relative px-0 md:px-0">
            {isMobile ? (
                <MobileProductCarousel products={products} onQuickView={handleQuickView} />
            ) : (
                <>
                    <style jsx global>{`
                        .slider-container .slick-slide > div {
                            padding: 0 8px;
                        }
                        
                        .slider-container .slick-slider .custom-product-arrow {
                            position: absolute !important;
                            top: 50% !important;
                            transform: translateY(-50%) !important;
                            width: 40px !important;
                            height: 40px !important;
                            background: rgba(0,0,0,0.8) !important;
                            border-radius: 50% !important;
                            z-index: 20 !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            transition: all 0.3s ease;
                            opacity: 0; 
                            cursor: pointer;
                        }

                        .slider-container:hover .custom-product-arrow {
                            opacity: 1 !important;
                        }

                        .slider-container .slick-slider .custom-product-arrow:before {
                            display: none;
                        }

                        .slider-container .slick-slider .prev-arrow { left: -50px !important; }
                        .slider-container .slick-slider .next-arrow { right: -50px !important; }

                        @media (max-width: 1350px) {
                            .slider-container .slick-slider .prev-arrow { left: -20px !important; }
                            .slider-container .slick-slider .next-arrow { right: -20px !important; }
                        }
                    `}</style>
                    <Slider {...desktopSettings}>
                        {products.map((product) => (
                            <div key={product.id} className="pb-8"> 
                                <ProductCard 
                                    product={product} 
                                    onQuickView={handleQuickView}
                                />
                            </div>
                        ))}
                    </Slider>
                </>
            )}

            {selectedProduct && (
                <ProductQuickViewModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    productId={selectedProduct.id}
                />
            )}
        </div>
    );
}

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Slider from 'react-slick';
// import { ProductCard } from './ProductCard';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import { PublicProduct } from '../HeroPage';
// import ProductQuickViewModal from './QuickViewModal';


// function NextArrow(props: any) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={`${className} custom-product-arrow next-arrow`}
//       style={{ ...style, display: "flex" }}
//       onClick={onClick}
//     />
//   );
// }

// function PrevArrow(props: any) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={`${className} custom-product-arrow prev-arrow`}
//       style={{ ...style, display: "flex" }}
//       onClick={onClick}
//     />
//   );
// }

// const settings = {
//     dots: false,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 4,
//     slidesToScroll: 4,
//     arrows: true,
//     nextArrow: <NextArrow />,
//     prevArrow: <PrevArrow />,
//     autoplay: false,
//     responsive: [
//         {
//             breakpoint: 1199,
//             settings: {
//                 slidesToShow: 3,
//                 slidesToScroll: 3,
//                 arrows: true,
//                 autoplay: false,
//             }
//         },
//         {
//             breakpoint: 991,
//             settings: {
//                 slidesToShow: 2,
//                 slidesToScroll: 2,
//                 arrows: false,
//                 autoplay: true,
//                 autoplaySpeed: 3000,
//                 pauseOnHover: true,
//                 pauseOnFocus: true,
//             }
//         },
//         {
//             breakpoint: 768,
//             settings: {
//                 slidesToShow: 2,
//                 slidesToScroll: 2,
//                 arrows: false,
//                 autoplay: true,
//                 autoplaySpeed: 3000,
//                 pauseOnHover: true, // ADDED
//                 pauseOnFocus: true,
//             }
//         },
//         {
//             breakpoint: 640,
//             settings: {
//                 slidesToShow: 1,
//                 slidesToScroll: 1,
//                 arrows: false,
//                 autoplay: false,
//                 infinite: true,
//                 swipe: true,
//                 swipeToSlide: true,
//                 touchThreshold: 10,
//             }
//         }
//     ]
// };

// export default function ProductSlider({ products }: { products: PublicProduct[] }) {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
    
//     const handleQuickView = (p: any) => {
//         setSelectedProduct(p);
//         setIsModalOpen(true);
//     };
//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setSelectedProduct(null);
//     };

//     return (
//         <div className="slider-container relative">
//             <style jsx global>{`
//                 .slider-container .slick-slide > div {
//                     padding: 0 8px;
//                 }
                
//                 @media (max-width: 640px) {
//                     .slider-container {
//                         padding-left: 0 !important;
//                         padding-right: 0 !important;
//                     }
//                     .slider-container .slick-slide > div {
//                         padding: 0 !important;
//                     }
//                     .slider-container .slick-list {
//                         margin: 0 !important;
//                         padding: 0 !important;
//                     }
//                 }
                    
//                 .slider-container .slick-slider .custom-product-arrow {
//                     position: absolute !important;
//                     top: 50% !important;
//                     transform: translateY(-50%) !important;
//                     margin-top: 0 !important;
                    
//                     width: 50px !important;
//                     height: 50px !important;
//                     background: #000000 !important;
//                     border-radius: 50% !important;
//                     z-index: 20 !important;
                    
//                     display: flex !important;
//                     align-items: center !important;
//                     justify-content: center !important;
                    
//                     transition: all 0.3s ease;
//                     box-shadow: 0 4px 10px rgba(0,0,0,0.2);
//                     opacity: 1 !important; /* CHANGED: Always visible on desktop */
//                     cursor: pointer;
//                 }
//                 @media (max-width: 991px) {
//                     .slider-container .slick-slider .custom-product-arrow {
//                         display: none !important;
//                     }
//                 }

//                 @media (min-width: 992px) {
//                     .slider-container .slick-slider .custom-product-arrow {
//                         opacity: 0;
//                     }
//                     .slider-container:hover .custom-product-arrow {
//                         opacity: 1;
//                     }
//                 }

//                 .slider-container .slick-slider .custom-product-arrow:before {
//                     font-size: 24px !important;
//                     color: #ffffff !important;
//                     opacity: 1 !important;
//                     line-height: 1 !important;
//                 }

//                 .slider-container .slick-slider .prev-arrow {
//                     left: -60px !important;
//                 }

//                 .slider-container .slick-slider .next-arrow {
//                     right: -60px !important;
//                 }

//                 @media (max-width: 1350px) {
//                     .slider-container .slick-slider .prev-arrow {
//                         left: -20px !important;
//                     }
//                     .slider-container .slick-slider .next-arrow {
//                         right: -20px !important;
//                     }
//                 }
//             `}</style>
//             <Slider {...settings}>
//                 {products.map((product) => (
//                     <div key={product.id} className=" pb-8"> 
//                          <ProductCard 
//                             product={product} 
//                             onQuickView={handleQuickView}
//                         />
//                     </div>
//                 ))}
//             </Slider>
//             {selectedProduct && (
//                 <ProductQuickViewModal
//                     isOpen={isModalOpen}
//                     onClose={handleCloseModal}
//                     productId={selectedProduct.id}
//                 />
//             )}
//         </div>
//     );
// }