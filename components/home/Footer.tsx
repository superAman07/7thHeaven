'use client'

import React from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import Link from "next/link";

type LinkItem = { label: string; href: string };
type Props = {
  aboutText?: string;
  quickLinks?: LinkItem[];
  collectionLinks?: LinkItem[];
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  copyrightOwner?: string;
  logoSrc?: string;
};

const defaultQuickLinks: LinkItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "My Account", href: "/my-account" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
];

const defaultCollectionLinks: LinkItem[] = [
  { label: "Men's Perfumes", href: "/collections/perfumes?gender=Male" },
  { label: "Women's Perfumes", href: "/collections/perfumes?gender=Female" },
  { label: "Unisex Perfumes", href: "/collections/perfumes?gender=Unisex" },
  { label: "New Arrivals", href: "/collections/perfumes?sort=newest" },
];

export default function FooterPage({
  aboutText = "7th Heaven brings you premium fragrances from top global brands. Discover long-lasting perfumes, luxury collections, and exclusive signature scents designed for every personality.",
  quickLinks = defaultQuickLinks,
  collectionLinks = defaultCollectionLinks,
  contact = {
    address: "123 Luxury Lane, Fragrance City, FC 45678",
    phone: "+91 98765 43210",
    email: "support@7thheaven.com",
  },
  copyrightOwner = "7th Heaven",
  logoSrc = "/assets/images/logo.png",
}: Props) {
  return (
    <>
    <footer className="footer-section section bg-dark">
      {/* Footer Top start */}
      <div className="footer-top section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-45 pb-lg-25 pb-md-15 pb-sm-5 pb-xs-0">
        <div className="container">
          <div className="row row-25">
            
            {/* Widget 1: About */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">About 7th Heaven</span>
              </h4>
              <p>{aboutText}</p>
            </div>

            {/* Widget 2: Quick Links */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">Quick Links</span>
              </h4>
              <ul className="ft-menu">
                {quickLinks.map((l, i) => (
                  <li key={i}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget 3: Collections */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">Collections</span>
              </h4>
              <ul className="ft-menu">
                {collectionLinks.map((l, i) => (
                  <li key={i}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget 4: Contact */}
            <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
              <h4 className="title">
                <span className="text">Contact Us</span>
              </h4>
              <ul className="address">
                <li>
                  <i className="fa fa-home" />
                  <span>{contact.address}</span>
                </li>
                <li>
                  <i className="fa fa-phone" />
                  <span>
                    <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                  </span>
                </li>
                <li>
                  <i className="fa fa-envelope-o" />
                  <span>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Top end */}

      {/* Footer Bottom start */}
      <div className="footer-bottom section">
        <div className="container ft-border pt-40 pb-40 pt-xs-20 pb-xs-20">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6 col-md-6 col-sm-8">
              <div className="copyright text-start">
                <p>
                  Copyright &copy; {new Date().getFullYear()}{" "}
                  <a href="#">{copyrightOwner}</a>. All rights reserved.
                </p>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-4">
              <div className="footer-logo text-end">
                <Link href="/">
                  <img src={logoSrc} alt="logo" style={{ height: 30 }} />
                </Link>
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