'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface SiteSettings {
    companyName: string;
    aboutTitle: string;
    aboutContent: string;
    aboutImage: string;
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
}

export default function AboutPageContent() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/v1/site-settings');
                if (res.data.success) {
                    setSettings(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Default content if not set in admin
    const companyName = settings?.companyName || 'Celsius';
    const aboutTitle = settings?.aboutTitle || 'Our Story';
    const rawContent = settings?.aboutContent || `Welcome to ${companyName}, where passion meets perfection in every bottle.
    
    Founded with a vision to bring the world's finest fragrances to discerning individuals, we have curated an exceptional collection of premium perfumes that transcend ordinary scents.
    
    Our journey began with a simple belief: that everyone deserves to experience the transformative power of a truly exceptional fragrance. Each perfume in our collection is carefully selected for its unique character, superior quality, and ability to evoke emotions and memories.`;
    
    const aboutImage = settings?.aboutImage || '/images/about-default.jpg';

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0b09]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#ddb040] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                </div>
            </div>
        );
    }

    return (
        <div id="main-wrapper" className="bg-[#0d0b09] min-h-screen">
            
            {/* --- KEEPING YOUR ORIGINAL BANNER --- */}
            <div 
                className="page-banner-section section min-h-[35vh] lg:min-h-[45vh] flex items-end pb-[20px]" 
                style={{ 
                    background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)',
                }}
            >
                <div className="container-fluid px-4 px-md-5">
                    <div className="row">
                        <div className="col-12 p-0">
                            <div className="page-banner w-100 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end">
                                
                                {/* Breadcrumbs: Bottom-Left */}
                                <div className="order-2 order-md-1 mt-2 mt-md-0">
                                    <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0" style={{ fontSize: '14px' }}>
                                        <li><Link href="/" className="hover:text-[#D4AF37] transition-colors text-white no-underline">Home</Link></li>
                                        <li className="text-white/80">About Us</li>
                                    </ul>
                                </div>

                                {/* Title: Bottom-Right */}
                                <div className="order-1 order-md-2 text-center text-md-end">
                                    <h1 className="text-white mb-0" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                        About Us
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* --- END ORIGINAL BANNER --- */}

            {/* --- NEW VERTICAL CONTENT SECTION --- */}
            <div className="about-section section py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* 1. HERO IMAGE (Top, Centered) */}
                    <div className="relative w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl mb-16 group mx-auto">
                         {/* Golden Border Frame */}
                        <div className="absolute inset-4 border border-[#C9A227]/30 rounded-xl z-20 pointer-events-none"></div>

                        <img 
                            src={aboutImage}
                            alt="About Us"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1200';
                            }}
                        />
                        {/* Gradient Overlay for Text Readability if needed */}
                        <div className="absolute inset-0 bg-linear-to-t from-[#0d0b09] via-transparent to-transparent opacity-80"></div>
                        
                        {/* Badge */}
                         <div className="absolute bottom-6 right-6 z-30 bg-black/40 backdrop-blur-md border border-[#C9A227]/30 px-6 py-3 rounded-xl text-white">
                             <div className="text-xs uppercase tracking-[2px] text-[#ddb040] font-bold">100% Authentic</div>
                             <div className="text-xl font-serif">Luxury Experience</div>
                         </div>
                    </div>

                    {/* 2. TEXT CONTENT (Below Image, Centered width) */}
                    <div className="max-w-3xl mx-auto">
                        
                        {/* Title & Divider */}
                        <div className="text-center mb-10">
                            <span className="text-[#ddb040] text-xs font-bold uppercase tracking-[4px] mb-3 block">Est. 2024</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                                {aboutTitle}
                            </h2>
                            <div className="w-16 h-1 bg-[#ddb040] mx-auto opacity-60"></div>
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-invert prose-lg text-gray-300 font-light leading-relaxed text-justify">
                             {/* Properly formatting dynamic content with newlines */}
                             {rawContent.split('\n').map((paragraph, index) => (
                                paragraph.trim() && (
                                    <p key={index} className="mb-6 whitespace-pre-line">
                                        {paragraph.trim()}
                                    </p>
                                )
                            ))}
                        </div>

                         {/* Signature */}
                        <div className="mt-12 text-center">
                            <img src="/images/signature.png" alt="" className="h-16 mx-auto opacity-50 mb-4 invert" style={{ display: 'none' }} /> {/* Place signature image here if available */}
                            <div className="text-[#ddb040] font-serif italic text-xl">The {companyName} Team</div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- STATS SECTION (Keep existing but align colors) --- */}
            <div className="py-20 bg-[#12100e] border-t border-white/5">
                <div className="container">
                    <div className="row text-center g-4">
                        {[
                            { val: '500+', label: 'Products' },
                            { val: '10K+', label: 'Happy Customers' },
                            { val: '50+', label: 'Brands' },
                            { val: '4.8★', label: 'Rating' },
                        ].map((item, idx) => (
                            <div key={idx} className="col-6 col-md-3">
                                <div className="text-4xl font-serif font-bold text-[#C9A227] mb-2">{item.val}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- WHY CHOOSE US (Keep existing) --- */}
            <div className="py-24 bg-[#0d0b09]">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold text-white mb-3">Why Choose {companyName}?</h2>
                        <p className="text-gray-500 max-w-lg mx-auto text-sm">Committed to finest fragrances and unmatched quality.</p>
                    </div>

                    <div className="row g-4">
                        {[
                            { icon: 'fa-diamond', title: 'Premium Selection', desc: 'Curated collection of authentic luxury fragrances.' },
                            { icon: 'fa-lock', title: 'Secure Shopping', desc: 'Transactions protected with advanced encryption.' },
                            { icon: 'fa-certificate', title: 'Quality Assured', desc: 'Every product verified for authenticity.' },
                            { icon: 'fa-headphones', title: '24/7 Support', desc: 'Expert team ready to assist you anytime.' }
                        ].map((item, idx) => (
                            <div key={idx} className="col-md-6 col-lg-3">
                                <div className="bg-[#151210] p-8 rounded-xl border border-white/5 hover:border-[#C9A227]/30 transition-all h-100 text-center group">
                                    <div className="w-14 h-14 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] text-xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                                        <i className={`fa ${item.icon}`}></i>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-3">{item.title}</h4>
                                    <p className="text-sm text-gray-400 m-0">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}