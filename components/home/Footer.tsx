// FooterPage.tsx
'use client'

import React from "react";
import ScrollToTopButton from "./ScrollToTopButton";

type LinkItem = { label: string; href?: string };
type Props = {
  aboutHtml?: string; // optional HTML string for about text
  infoLinks?: LinkItem[];
  serviceLinks?: LinkItem[];
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  copyrightOwner?: string;
  logoSrc?: string;
  logoHeight?: number;
};

const defaultInfoLinks: LinkItem[] = [
  { label: "Home", href: "#" },
  { label: "About", href: "#" },
  { label: "Shop", href: "#" },
  { label: "Men’s Perfumes", href: "#" },
  { label: "Women’s Perfumes", href: "#" },
  { label: "Unisex Perfumes", href: "#" },
  { label: "New Arrivals", href: "#" },
  { label: "Contact", href: "#" },
];

const defaultServiceLinks: LinkItem[] = [
  { label: "FAQ's", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Returns Policy", href: "#" },
  { label: "Refund Policy", href: "#" },
  { label: "Terms and Condition", href: "#" },
];

export default function FooterPage({
  aboutHtml = `Celsius Perfume Shop brings you premium fragrances from top global brands.
Discover long-lasting perfumes, luxury collections, and exclusive signature scents designed for every personality.`,
  infoLinks = defaultInfoLinks,
  serviceLinks = defaultServiceLinks,
  contact = {
    address: "xxxxxxxxxxxxxxx",
    phone: "000000000000",
    email: "ooooooooo.com",
  },
  copyrightOwner = "Theface",
  logoSrc = "assets/images/logo.png",
  logoHeight = 30,
}: Props) {
  return (
    <>
    <footer className="footer-section section bg-dark">
      {/* Footer Top start */}
      <div className="footer-top section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-45 pb-lg-25 pb-md-15 pb-sm-5 pb-xs-0">
        <div className="container">
          <div className="row row-25">
            {/* Footer Widget start */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">About Celsius</span>
              </h4>
              <p dangerouslySetInnerHTML={{ __html: aboutHtml }} />
            </div>
            {/* Footer Widget end */}

            {/* Footer Widget start */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">Information</span>
              </h4>
              <ul className="ft-menu">
                {infoLinks.map((l, i) => (
                  <li key={i}>
                    <a href={l.href ?? "#"}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Footer Widget end */}

            {/* Footer Widget start */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">Our Services</span>
              </h4>
              <ul className="ft-menu">
                {serviceLinks.map((l, i) => (
                  <li key={i}>
                    <a href={l.href ?? "#"}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Footer Widget end */}

            {/* Footer Widget start */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">Contact us</span>
              </h4>
              <ul className="address">
                <li>
                  <i className="fa fa-home" />
                  <span>{contact.address}</span>
                </li>
                <li>
                  <i className="fa fa-phone" />
                  <span>
                    <a href="#">{contact.phone}</a>
                  </span>
                </li>
                <li>
                  <i className="fa fa-envelope-o" />
                  <span>
                    <a href="#">{contact.email}</a>
                  </span>
                </li>
              </ul>
            </div>
            {/* Footer Widget end */}
          </div>
        </div>
      </div>
      {/* Footer Top end */}

      {/* Footer bottom start */}
      <div className="footer-bottom section">
        <div className="container ft-border pt-40 pb-40 pt-xs-20 pb-xs-20">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6 col-md-6 col-sm-8">
              <div className="copyright text-start">
                <p>
                  Copyright &copy;{new Date().getFullYear()}{" "}
                  <a href="#">{copyrightOwner}</a>. All rights reserved.
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-4">
              <div className="footer-logo text-end">
                <a href="index.html">
                  <img src={logoSrc} alt="logo" style={{ height: logoHeight }} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <ScrollToTopButton mode="start" />
    </>
  );
}
