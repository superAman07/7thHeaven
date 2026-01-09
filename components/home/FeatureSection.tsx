'use client'

import React from "react";

type Feature = {
  id: string;
  title: string;
  subtitle?: string;
  iconClass?: string; // e.g. "fa-truck fa" or "fa fa-undo"
  extraClass?: string; // for cases like "br-0"
};

type Props = {
  features?: Feature[];
};

// FIX: Updated features according to client requirements (Removed Returns, Added Luxury & Quality)
const defaultFeatures: Feature[] = [
  {
    id: "f1",
    title: "Long Lasting & Effective",
    subtitle: "Premium fragrance longevity",
    iconClass: "fa fa-clock-o", // Represents time/duration
  },
  {
    id: "f2",
    title: "Luxury at Exclusive Price",
    subtitle: "Direct-to-consumer value",
    iconClass: "fa fa-diamond", // Represents luxury
  },
  {
    id: "f3",
    title: "Best Fragrance Oils",
    subtitle: "Made in Bharat excellence",
    iconClass: "fa fa-flask", // Represents oils/ingredients
    extraClass: "br-0",
  },
];

export default function FeatureSectionPage({ features = defaultFeatures }: Props) {
  return (
    <div className="feature-section section pt-100 pt-md-75 pt-sm-60 pt-xs-50">
      <div className="container">
        <div className="row">
          {features.map((feat) => (
            <div key={feat.id} className="col-lg-4 col-md-6 col-sm-6">
              {/* Single Feature Start */}
              <div className={`single-feature feature-style-2 mb-30 ${feat.extraClass ?? ""}`}>
                <div className="icon">
                  <i className={feat.iconClass ?? ""} />
                </div>
                <div className="content">
                  <h2>{feat.title}</h2>
                  {feat.subtitle && <p>{feat.subtitle}</p>}
                </div>
              </div>
              {/* Single Feature End */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}