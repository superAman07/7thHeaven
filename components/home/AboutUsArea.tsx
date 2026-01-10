'use client'

import React from "react";

type Props = {
  image?: string;
  imageAlt?: string;
  paragraphs?: string[];
  imageLink?: string;
};

const defaultParagraphs = [
  `Celsius is not just a perfume; it’s a statement of Indian luxury. Proudly crafted under the "Make in Bharat" initiative, we challenge the global narrative by proving that world-class luxury doesn't have to come from abroad.`,
  `Our perfumers source the finest essential oils from across the globe—the same oils used by expensive designer labels—but we blend and bottle them right here. The result? A fragrance that contains 2-3x more perfume oil than standard brands, ensuring a scent that lasts through your longest days.`,
  `Why pay for a celebrity endorsement or a fancy Italian bottle when you can pay for the product itself? With Celsius by 7th Heaven, you are buying direct luxury. Earn rewards, build your collection, and experience the scent of success.`,
];

export default function AboutUsAreaSection({
  image = "/assets/images/product/bwebp.webp",
  imageAlt = "Celsius Luxury Perfume",
  paragraphs = defaultParagraphs,
  imageLink = "/",
}: Props) {
  return (
    <>
      <div className="about-us-area section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-12"> 
              <div className="about-us-img-wrapper mb-30 mb-xs-15">
                <div className="about-us-image img-full">
                  <a href={imageLink}>
                    <img src={image} alt={imageAlt} />
                  </a>
                </div>
              </div> 
            </div>

            <div className="col-lg-6 col-12">
              <div className="about-us-content">
                {paragraphs.map((p, i) => (
                  <p key={i} className={i < paragraphs.length - 1 ? "mb-20" : undefined}>
                    {p}
                  </p>
                ))}
              </div> 
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
