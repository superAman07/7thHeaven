'use client'

import React from "react";
import type { HomeAboutSection } from "@/lib/site-content";

type Props = {
  data?: HomeAboutSection;
  image?: string; 
  paragraphs?: string[];
};

const defaultParagraphs = [
  `Celsius is not just a perfume; it’s a statement of Indian luxury. Proudly crafted under the "Make in Bharat" initiative, we challenge the global narrative by proving that world-class luxury doesn't have to come from abroad.`,
  `Our perfumers source the finest essential oils from across the globe—the same oils used by expensive designer labels—but we blend and bottle them right here. The result? A fragrance that contains 2-3x more perfume oil than standard brands, ensuring a scent that lasts through your longest days.`,
  `Why pay for a celebrity endorsement or a fancy Italian bottle when you can pay for the product itself? With Celsius by 7th Heaven, you are buying direct luxury. Earn rewards, build your collection, and experience the scent of success.`,
];

export default function AboutUsAreaSection({
  data,
  image,
  paragraphs
}: Props) {

  const displayImage = data?.image || image || "/assets/images/product/bwebp.webp";
  const displayAlt = data?.imageAlt || "Celsius Luxury";
  const displayLink = data?.buttonLink || "/about";
  const displayTitle = data?.displayTitle || "The Celsius Story";
  const displayTexts = data?.paragraphs || paragraphs || [
      "Celsius is not just a perfume; it’s a statement of Indian luxury.",
      "Proudly crafted under the 'Make in Bharat' initiative."
  ];
  return (
    <>
      <div className="about-us-area section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-12"> 
              <div className="about-us-img-wrapper mb-30 mb-xs-15">
                <div className="about-us-image img-full">
                  <a href={displayLink} className="block relative">
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500"></div>
                   <img src={displayImage} alt={displayAlt} className="transform group-hover:scale-105 transition-transform duration-700" />
                  </a>
                </div>
              </div> 
            </div>

            <div className="col-lg-6 col-12">
              <div className="about-us-content">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-6 relative inline-block">
                {displayTitle}
                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-[#B6902E]"></span>
              </h2>

              {/* Dynamic Paragraphs */}
              <div className="text-gray-600 leading-relaxed text-lg">
                {displayTexts.map((p, i) => (
                  <p key={i} className="mb-6 last:mb-0">
                    {p}
                  </p>
                ))}
              </div>

              {data?.showButton && (
                 <a href={data.buttonLink} className="inline-block mt-8 text-[#B6902E] font-bold uppercase tracking-widest text-sm hover:text-[#8a6d3b] transition-colors border-b-2 border-[#B6902E] pb-1">
                   {data.buttonText} <i className="fa fa-long-arrow-right ml-2"></i>
                 </a>
              )}
              </div> 
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
