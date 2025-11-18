'use client'
import React, { useEffect, useState } from 'react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  productName: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex,
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center "
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full h-full flex items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 group"
          aria-label="Close lightbox"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center border border-yellow-400/30 group-hover:border-yellow-400/60">
            <svg
              className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </button>

        {/* Image Counter */}
        <div className="absolute top-6 left-6 z-50">
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-yellow-400/30">
            <p className="text-white text-sm font-medium">
              <span className="text-yellow-400">{currentIndex + 1}</span> / {images.length}
            </p>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative w-full max-h-[85vh] flex items-center justify-center">
          <img
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 group z-40"
                aria-label="Previous image"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-yellow-400/20 transition-all duration-200 flex items-center justify-center border border-yellow-400/30 group-hover:border-yellow-400/60 group-hover:shadow-lg group-hover:shadow-yellow-400/20">
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7 text-yellow-400 group-hover:text-yellow-300 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 group z-40"
                aria-label="Next image"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-yellow-400/20 transition-all duration-200 flex items-center justify-center border border-yellow-400/30 group-hover:border-yellow-400/60 group-hover:shadow-lg group-hover:shadow-yellow-400/20">
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7 text-yellow-400 group-hover:text-yellow-300 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip at Bottom */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className="flex gap-2 px-4 max-w-2xl overflow-x-auto bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/20">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all duration-200 border-2 ${
                  currentIndex === idx
                    ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20 scale-105'
                    : 'border-yellow-400/30 hover:border-yellow-400/60 opacity-70 hover:opacity-100'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              >
                <img
                  src={img || "/placeholder.svg"}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Hints */}
        <div className="absolute bottom-24 md:bottom-6 right-4 md:right-auto md:left-4 text-xs text-white/60">
          <p className="text-center">← / → Navigate | Esc Close</p>
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;
