'use client'

import React from "react";

type Props = {
  image?: string;
  imageAlt?: string;
  paragraphs?: string[];
  imageLink?: string;
};

const defaultParagraphs = [
  `Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?`,
  `Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo volup.`,
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu nisi ac mi malesuada vestibulum. Phasellus tempor nunc eleifend cursus molestie. Mauris lectus arcu, pellentesque at sodales sit amet, condimentum id nunc. Donec ornare mattis suscipit. Praesent fermentum accumsan vulputate.`,
];

export default function AboutUsAreaSection({
  image = "assets/images/product/bwebp.webp",
  imageAlt = "",
  paragraphs = defaultParagraphs,
  imageLink = "#",
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
