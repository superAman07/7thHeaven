
'use client';

import React from "react";
import { Clock, Diamond, FlaskConical } from 'lucide-react';

/**
 * PREMIUM THEME COLORS:
 * - Gold: #BF953F
 * - Black: #1A1A1A
 * - White: #FFFFFF
 */

type Feature = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  extraClass?: string;
};

type Props = {
  features?: Feature[];
};

const defaultFeatures: Feature[] = [
  {
    id: "f1",
    title: "Long Lasting & Effective",
    subtitle: "Premium fragrance longevity that lingers gracefully from dawn until dusk.",
    icon: <Clock className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />,
  },
  {
    id: "f2",
    title: "Luxury at Exclusive Price",
    subtitle: "Direct-to-consumer value, bringing high-end perfumery to your doorstep.",
    icon: <Diamond className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />,
  },
  {
    id: "f3",
    title: "Best Fragrance Oils",
    subtitle: "Made in Bharat excellence, utilizing rare extracts and pure essential oils.",
    icon: <FlaskConical className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />,
    extraClass: "lg:border-r-0",
  },
];

export default function FeatureSectionPage({ features = defaultFeatures }: Props) {
  return (
      <div className="bg-[#fcfaf7] py-20 lg:py-32 overflow-hidden w-full relative z-10 transition-colors duration-500">
      {/* Premium Font Definitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:wght@100..900&display=swap');
      `}} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {features.map((feat, index) => (
            <div 
              key={feat.id} 
              className={`
                group relative flex flex-col items-center text-center p-8 md:p-12 transition-all duration-500
                border-b md:border-b-0 border-[#BF953F]/10
                ${index !== features.length - 1 ? 'md:border-r' : ''}
                hover:bg-[#ffffff] hover:shadow-[0_10px_40px_-10px_rgba(191,149,63,0.1)] z-0 hover:z-10
              `}
            >
              {/* Icon Container - FIXED: Used bg-[#ffffff] to bypass global .bg-white !important rule */}
              <div className="mb-8 relative transition-transform duration-500 group-hover:-translate-y-2">
                <div className="w-20 h-20 rounded-full flex items-center justify-center border border-[#BF953F]/20 bg-[#ffffff] text-[#BF953F] group-hover:bg-[#BF953F] group-hover:text-[#ffffff] group-hover:border-[#BF953F] transition-all duration-500 shadow-sm">
                   <div className="transform group-hover:scale-110 transition-transform duration-500">
                     {feat.icon}
                   </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-center space-y-4 max-w-sm">
                <h3 className="text-2xl font-[Playfair_Display] font-medium text-[#1A1A1A] group-hover:text-[#BF953F] transition-colors duration-300">
                  {feat.title}
                </h3>
                
                {/* Decorative short line */}
                <div className="w-8 h-[1px] bg-[#BF953F]/40 group-hover:w-16 group-hover:bg-[#BF953F] transition-all duration-500"></div>
                
                {feat.subtitle && (
                  <p className="font-[Montserrat] text-[#4A4A4A] text-sm leading-7 tracking-wide group-hover:text-[#1A1A1A] transition-colors duration-300">
                    {feat.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}