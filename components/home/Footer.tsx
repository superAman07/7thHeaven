"use client";

import React, { useState } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import Link from "next/link";
import type { GlobalSettings } from "@/lib/site-content";

type LinkItem = { label: string; href: string };

type Props = {
  settings?: GlobalSettings;  
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
  { label: "Track Order", href: "/track-order" },
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
  settings,
  aboutText = "Experience the essence of 'Make in Bharat' luxury. The Celsius Collection offers premium, long-lasting fragrances crafted with the world's best oils—luxury within reach.",
  quickLinks = defaultQuickLinks,
  collectionLinks = defaultCollectionLinks,
  contact = {
    address: "Celsius HQ, Business Bay, India",
    phone: "+91 98765 43210",
    email: "support@celsius.com",
  },
  copyrightOwner = "Celsius",
  logoSrc = "/assets/images/logo.png",
}: Props) {

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const displayAddress = settings?.supportAddress || contact.address;
  const displayPhone = settings?.supportPhone || contact.phone;
  const displayEmail = settings?.supportEmail || contact.email;
  const displaySiteName = settings?.siteName || copyrightOwner;
  const displayLogo = settings?.logoUrl || logoSrc;

  return (
    <>
      <footer className="footer-section section bg-dark">
        <div className="footer-top section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-45 pb-lg-25 pb-md-15 pb-sm-5 pb-xs-0">
          <div className="container">
            <div className="row row-25">            
              
              <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
                <div className="footer-logo w-full! flex! justify-center! md:justify-start!">
                    <Link href="/">
                        <img 
                            src="/celsius-logo.png" 
                            alt="7th Heaven" 
                            className="w-full! max-w-[220px]! object-contain! h-auto!" 
                        />
                    </Link>
                </div>
            </div>

              <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
                <h4 
                  className="title d-flex justify-content-between align-items-center cursor-pointer md:cursor-default" 
                  onClick={() => toggleSection('quick')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="text">Quick Links</span>
                  <span className="d-md-none text-[#E6B422]">{openSection === 'quick' ? '−' : '+'}</span>
                </h4>
                <ul className={`ft-menu ${openSection === 'quick' ? '' : 'd-none d-md-block'}`}>
                  {quickLinks.map((l, i) => (
                    <li key={i}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
                <h4 
                  className="title d-flex justify-content-between align-items-center cursor-pointer md:cursor-default"
                  onClick={() => toggleSection('collections')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="text">Collections</span>
                  <span className="d-md-none text-[#E6B422]">{openSection === 'collections' ? '−' : '+'}</span>
                </h4>
                <ul className={`ft-menu ${openSection === 'collections' ? '' : 'd-none d-md-block'}`}>
                  {collectionLinks.map((l, i) => (
                    <li key={i}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-widget col-lg-3 col-md-6 col-sm-6 col-12 mb-40 mb-xs-35">
                 <h4 
                  className="title d-flex justify-content-between align-items-center cursor-pointer md:cursor-default"
                  onClick={() => toggleSection('contact')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="text">Contact Us</span>
                  <span className="d-md-none text-[#E6B422]">{openSection === 'contact' ? '−' : '+'}</span>
                </h4>
                <ul className={`address ${openSection === 'contact' ? '' : 'd-none d-md-block'}`}>
                  <li>
                    <i className="fa fa-home" />
                    <span>{displayAddress}</span>
                  </li>
                  <li>
                    <i className="fa fa-phone" />
                    <span>
                      <a href={`tel:${displayPhone}`}>{displayPhone}</a>
                    </span>
                  </li>
                  <li>
                    <i className="fa fa-envelope-o" />
                    <span>
                      <a href={`mailto:${displayEmail}`}>{displayEmail}</a>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom section">
          <div className="container ft-border pt-40 pb-40 pt-xs-20 pb-xs-20">
            <div className="row justify-content-between align-items-center">
              <div className="col-lg-6 col-md-6 col-sm-8">
                <div className="copyright text-start">
                  <p>
                    Copyright &copy; {new Date().getFullYear()}{" "}
                    <a href="#">{displaySiteName}</a>. <span className="d-none d-sm-inline">All rights reserved.</span>
                  </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-4">
                <div className="footer-payment w-full! flex! justify-center! md:justify-end! mt-4! md:mt-0!">
                    <div className="payment-icons flex! items-center! gap-4! text-[24px]! text-[#888]!">
                        <i className="fa fa-cc-visa hover:text-white! transition-colors!" title="Visa"></i>
                        <i className="fa fa-cc-mastercard hover:text-white! transition-colors!" title="MasterCard"></i>
                        <i className="fa fa-cc-amex hover:text-white! transition-colors!" title="Amex"></i>
                        <i className="fa fa-cc-paypal hover:text-white! transition-colors!" title="PayPal"></i>
                        <i className="fa fa-credit-card hover:text-white! transition-colors!" title="UPI / Others"></i>
                    </div>
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