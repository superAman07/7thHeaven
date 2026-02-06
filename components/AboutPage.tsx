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
    const aboutContent = settings?.aboutContent || `
        Welcome to ${companyName}, where passion meets perfection in every bottle.
        
        Founded with a vision to bring the world's finest fragrances to discerning individuals, we have curated an exceptional collection of premium perfumes that transcend ordinary scents.
        
        Our journey began with a simple belief: that everyone deserves to experience the transformative power of a truly exceptional fragrance. Each perfume in our collection is carefully selected for its unique character, superior quality, and ability to evoke emotions and memories.
        
        We source our fragrances from renowned perfumers around the globe, ensuring that every bottle meets our exacting standards of excellence. From timeless classics to contemporary masterpieces, our collection offers something for every taste and occasion.
        
        At ${companyName}, we don't just sell perfumes – we help you discover your signature scent. Our expert team is dedicated to guiding you through the fascinating world of fragrances, helping you find the perfect match for your personality and style.
        
        Thank you for choosing ${companyName}. We invite you to explore our collection and embark on a sensory journey that will leave a lasting impression.
    `;
    const aboutImage = settings?.aboutImage || '/images/about-default.jpg';

    if (loading) {
        return (
            <div className="min-h-screen! flex! items-center! justify-center! bg-gray-50!">
                <div className="text-center!">
                    <div className="w-12! h-12! border-4! border-[#ddb040]! border-t-transparent! rounded-full! animate-spin! mx-auto! mb-4!"></div>
                    <p className="text-gray-500! font-medium!">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="main-wrapper">
            {/* Page Banner */}
            <div 
                className="page-banner-section section min-h-[35vh]! lg:min-h-[45vh]! flex! items-end! pb-[20px]!" 
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
                                    <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                                        <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                                        <li className="text-white/80">About Us</li>
                                    </ul>
                                </div>

                                {/* Title: Bottom-Right */}
                                <div className="order-1 order-md-2 text-center text-md-end">
                                    <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                        About Us
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="about-section section" style={{ padding: '80px 0' }}>
                <div className="container">
                    <div className="row align-items-center">
                        {/* Image Section */}
                        <div className="col-lg-6 col-12 mb-5 mb-lg-0">
                            <div 
                                style={{ 
                                    position: 'relative',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                                }}
                            >
                                {/* Decorative Border */}
                                <div 
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        left: '-10px',
                                        right: '10px',
                                        bottom: '10px',
                                        border: '3px solid #C9A227',
                                        borderRadius: '20px',
                                        zIndex: 0
                                    }}
                                ></div>
                                
                                <img 
                                    src={aboutImage}
                                    alt="About Celsius"
                                    style={{
                                        width: '100%',
                                        height: '500px',
                                        objectFit: 'cover',
                                        position: 'relative',
                                        zIndex: 1,
                                        borderRadius: '20px'
                                    }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800';
                                    }}
                                />
                                
                                {/* Badge */}
                                <div 
                                    style={{
                                        position: 'absolute',
                                        bottom: '30px',
                                        right: '-20px',
                                        background: 'linear-gradient(135deg, #C9A227, #B8860B)',
                                        color: 'white',
                                        padding: '20px 30px',
                                        borderRadius: '15px',
                                        boxShadow: '0 10px 30px rgba(201, 162, 39, 0.4)',
                                        zIndex: 2,
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1 }}>100%</div>
                                    <div style={{ fontSize: '12px', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Authentic</div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="col-lg-6 col-12">
                            <div style={{ paddingLeft: '30px' }} className="ps-lg-5">
                                {/* Section Tag */}
                                <div 
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: 'rgba(201, 162, 39, 0.1)',
                                        padding: '8px 16px',
                                        borderRadius: '30px',
                                        marginBottom: '20px'
                                    }}
                                >
                                    <span style={{ width: '8px', height: '8px', background: '#C9A227', borderRadius: '50%' }}></span>
                                    <span style={{ color: '#C9A227', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>About {companyName}</span>
                                </div>

                                <h2 
                                    style={{ 
                                        fontSize: '42px', 
                                        fontWeight: '700', 
                                        color: '#fff',
                                        marginBottom: '25px',
                                        lineHeight: '1.2'
                                    }}
                                >
                                    {aboutTitle}
                                </h2>

                                <div 
                                    style={{ 
                                        color: '#aaa', 
                                        fontSize: '15px', 
                                        lineHeight: '1.8',
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {aboutContent}
                                </div>

                                {/* Features */}
                                <div className="row mt-4">
                                    <div className="col-6">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa fa-check" style={{ color: 'white', fontSize: '18px' }}></i>
                                            </div>
                                            <span style={{ fontWeight: '600', color: '#fff' }}>Premium Quality</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa fa-truck" style={{ color: 'white', fontSize: '18px' }}></i>
                                            </div>
                                            <span style={{ fontWeight: '600', color: '#fff' }}>Fast Delivery</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa fa-shield" style={{ color: 'white', fontSize: '18px' }}></i>
                                            </div>
                                            <span style={{ fontWeight: '600', color: '#fff' }}>100% Authentic</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa fa-heart" style={{ color: 'white', fontSize: '18px' }}></i>
                                            </div>
                                            <span style={{ fontWeight: '600', color: '#fff' }}>Customer Love</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <Link 
                                    href="/collections/perfumes"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: 'linear-gradient(135deg, #C9A227, #B8860B)',
                                        color: 'white',
                                        padding: '15px 35px',
                                        borderRadius: '50px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginTop: '20px',
                                        textDecoration: 'none',
                                        boxShadow: '0 10px 30px rgba(201, 162, 39, 0.3)',
                                        transition: 'transform 0.3s, box-shadow 0.3s'
                                    }}
                                    className="hover:scale-105!"
                                >
                                    Explore Collection
                                    <i className="fa fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div style={{ background: 'linear-gradient(135deg, #1a1511 0%, #0d0b09 100%)', padding: '60px 0' }}>
                <div className="container">
                    <div className="row text-center">
                        <div className="col-6 col-md-3 mb-4 mb-md-0">
                            <div style={{ color: '#C9A227', fontSize: '42px', fontWeight: '700' }}>500+</div>
                            <div style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Products</div>
                        </div>
                        <div className="col-6 col-md-3 mb-4 mb-md-0">
                            <div style={{ color: '#C9A227', fontSize: '42px', fontWeight: '700' }}>10K+</div>
                            <div style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Happy Customers</div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div style={{ color: '#C9A227', fontSize: '42px', fontWeight: '700' }}>50+</div>
                            <div style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Brands</div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div style={{ color: '#C9A227', fontSize: '42px', fontWeight: '700' }}>4.8★</div>
                            <div style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Customer Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div style={{ padding: '80px 0', background: '#0d0b09' }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#fff' }}>Why Choose {companyName}?</h2>
                        <p style={{ color: '#aaa', maxWidth: '600px', margin: '15px auto 0' }}>
                            We're committed to bringing you the finest fragrances with unmatched quality and service.
                        </p>
                    </div>

                    <div className="row">
                        {[
                            { icon: 'fa-diamond', title: 'Premium Selection', desc: 'Curated collection of authentic luxury fragrances from top brands worldwide.' },
                            { icon: 'fa-lock', title: 'Secure Shopping', desc: 'Your transactions are protected with advanced encryption technology.' },
                            { icon: 'fa-certificate', title: 'Quality Assured', desc: 'Every product is verified for authenticity before dispatch.' },
                            { icon: 'fa-headphones', title: '24/7 Support', desc: 'Our expert team is always ready to assist you with any queries.' }
                        ].map((item, idx) => (
                            <div key={idx} className="col-md-6 col-lg-3 mb-4">
                                <div 
                                    style={{
                                        background: '#1a1511',
                                        padding: '30px 25px',
                                        borderRadius: '16px',
                                        textAlign: 'center',
                                        height: '100%',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.3s, box-shadow 0.3s'
                                    }}
                                    className="hover:scale-105!"
                                >
                                    <div 
                                        style={{
                                            width: '70px',
                                            height: '70px',
                                            background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(184, 134, 11, 0.1))',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 20px'
                                        }}
                                    >
                                        <i className={`fa ${item.icon}`} style={{ fontSize: '28px', color: '#C9A227' }}></i>
                                    </div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#fff',marginBottom: '10px' }}>{item.title}</h4>
                                    <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}