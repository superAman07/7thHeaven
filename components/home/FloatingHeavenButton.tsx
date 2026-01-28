'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FloatingHeavenButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px (past the hero)
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-[9999] transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[100%] opacity-0'
      }`}
    >
      <Link
        href="/7th-heaven"
        className="
          block
          bg-black/95 backdrop-blur-sm
          !text-[#f8d070]
          border-l border-t border-b border-[#ddb040]/50
          py-4 px-1
          rounded-lg
          shadow-[0_0_10px_rgba(221,176,64,0.3)]
          hover:shadow-[0_0_20px_rgba(221,176,64,0.6)]
          hover:border-[#ddb040]
          transition-all duration-300
          cursor-pointer
        "
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          fontFamily: 'inherit',
          textShadow: '0 0 1px rgba(248, 208, 112, 0.3)',
          color: '#f8d070' // Inline override to be 100% sure
        }}
      >
        <span className="font-semibold text-xs tracking-[0.2em] uppercase whitespace-nowrap !text-[#f8d070]">
          7th Heaven
        </span>
      </Link>
    </div>
  );
}