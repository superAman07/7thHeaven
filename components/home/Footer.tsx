"use client";

import React, { useState } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import Link from "next/link";
import type { GlobalSettings } from "@/lib/site-content";
import { SiteSettings } from "@/lib/site-settings";

type LinkItem = { label: string; href: string };

type Props = {
  settings?: SiteSettings | null; 
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

export default function FooterPage({
  settings,
  aboutText = "",
  quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/policies/legal_privacy" },
    { label: "Terms & Conditions", href: "/policies/legal_terms" },
    { label: "Refund Policy", href: "/policies/legal_refund" },
    { label: "Shipping Policy", href: "/policies/legal_shipping" },
  ],
  collectionLinks = [
    { label: "Perfumes", href: "/collections/perfumes" },
    { label: "Tatva Series", href: "/collections/tatva-series" },
    { label: "Corporate Collection", href: "/collections/corporate-collection" },
    { label: "Skyline Series", href: "/collections/skyline-series" },
    { label: "Gift Sets", href: "/collections/gift-sets" },
  ],
  contact = {
    address: "",
    phone: "",
    email: "",
  },
  copyrightOwner = "Celsius",
  logoSrc = "/assets/images/logo.png",
}: Props) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };
  const displayPhone = settings?.phone || '';
  const displayEmail = settings?.email || '';
  const displaySiteName = settings?.companyName || copyrightOwner;
  const displayFooterText = settings?.footerText; // New footer text if you want to use it
  
  // Use social links from settings if available
  const instagram = settings?.instagram;
  const facebook = settings?.facebook;
  const twitter = settings?.twitter;
  const youtube = settings?.youtube;
  return (
    <>
      <footer className="footer-section section bg-dark">
        <div className="footer-top section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-45 pb-lg-25 pb-md-15 pb-sm-5 pb-xs-0">
          <div className="container">
                        <div className="row row-25">              
              {/* Column 1: Logo + About + Social */}
              <div className="footer-widget col-lg-3 col-md-12 col-sm-12 col-12 mb-40 mb-xs-35">
                <div className="footer-logo w-full! flex! justify-center! lg:justify-start! mb-3!">
                    <Link href="/">
                        <img 
                            src={settings?.logoUrl || "/celsius-logo.png"} 
                            alt="7th Heaven" 
                            className="w-full! max-w-[200px]! object-contain! h-auto!"
                        />
                    </Link>
                </div>
                <p className="d-none d-lg-block" style={{ color: '#999', fontSize: '13px', lineHeight: '1.7', marginTop: '10px' }}>
                  {aboutText}
                </p>
                {/* Social Icons */}
                <div className="d-none d-lg-flex" style={{ gap: '12px', marginTop: '15px' }}>
                  {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#999', fontSize: '16px' }}><i className="fa fa-instagram"></i></a>}
                  {facebook && <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#999', fontSize: '16px' }}><i className="fa fa-facebook"></i></a>}
                  {twitter && <a href={twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#999', fontSize: '16px' }}><i className="fa fa-twitter"></i></a>}
                  {youtube && <a href={youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#999', fontSize: '16px' }}><i className="fa fa-youtube-play"></i></a>}
                </div>
              </div>

              {/* Column 2: Quick Links (Policies) */}
              <div className="footer-widget col-lg-3 col-md-4 col-sm-6 col-12 mb-40 mb-xs-35">
                <h4 
                  className="title d-flex justify-content-between align-items-center cursor-pointer md:cursor-default" 
                  onClick={() => toggleSection('quick')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="text">Quick Links</span>
                  <span className="d-md-none text-[#E6B422]">{openSection === 'quick' ? '−' : '+'}</span>
                </h4>
                <ul className={`ft-menu list-none pl-0 ${openSection === 'quick' ? '' : 'd-none d-md-block'}`}>
                  {quickLinks.map((l, i) => (
                    <li key={i}>
                      <Link href={l.href} className="text-sm">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Collections & Categories */}
              <div className="footer-widget col-lg-3 col-md-4 col-sm-6 col-12 mb-40 mb-xs-35">
                <h4 
                  className="title d-flex justify-content-between align-items-center cursor-pointer md:cursor-default"
                  onClick={() => toggleSection('collections')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="text">Collections</span>
                  <span className="d-md-none text-[#E6B422]">{openSection === 'collections' ? '−' : '+'}</span>
                </h4>
                <ul className={`ft-menu list-none pl-0 ${openSection === 'collections' ? '' : 'd-none d-md-block'}`}>
                  {collectionLinks.map((l, i) => (
                    <li key={i}>
                      <Link href={l.href} className="text-sm">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Customer Care */}
              <div className="footer-widget col-lg-3 col-md-4 col-sm-6 col-12 mb-40 mb-xs-35">
                <h4 
                  className="title d-flex justify-content-between align-items-center cursor-pointer md:cursor-default"
                  onClick={() => toggleSection('care')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="text">Customer Care</span>
                  <span className="d-md-none text-[#E6B422]">{openSection === 'care' ? '−' : '+'}</span>
                </h4>
                <ul className={`ft-menu list-none pl-0 ${openSection === 'care' ? '' : 'd-none d-md-block'}`}>
                  <li><Link href="/contact" className="text-sm">Contact Us</Link></li>
                  <li><Link href="/track-order" className="text-sm">Track Order</Link></li>
                  <li><Link href="/my-account" className="text-sm">My Account</Link></li>
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
                    {/* Use dynamic Footer Text if available, else default */}
                    {displayFooterText ? (
                        displayFooterText
                    ) : (
                        <>Copyright &copy; {new Date().getFullYear()} <a href="#">www.celsiuspop.com</a>. <span className="d-none d-sm-inline">All rights reserved.</span></>
                    )}
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
