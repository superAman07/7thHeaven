'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const MOBILE_BREAKPOINT = 991;

export default function NavBar() {
    const [isSticky, setSticky] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();

    const [user, setUser] = useState(null);
    const router = useRouter();

    const mobileMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/v1/auth/me');
                if (res.data.success) {
                    setUser(res.data.user);
                }
            } catch (error) {
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/auth/logout');
            setUser(null);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    useEffect(() => {
        const onScroll = () => {
            setSticky(window.scrollY > 300);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > MOBILE_BREAKPOINT && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [isMobileOpen]);

    useEffect(() => {
        const body = document.body;
        if (isMobileOpen) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
        return () => {
            body.style.overflow = '';
        };
    }, [isMobileOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMobileOpen) setIsMobileOpen(false);
        };
        const onMouseDown = (e: MouseEvent) => {
            if (!isMobileOpen) return;
            const el = mobileMenuRef.current;
            if (el && !el.contains(e.target as Node)) setIsMobileOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onMouseDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onMouseDown);
        };
    }, [isMobileOpen]);

    const toggleSearch = () => setSearchOpen((s) => !s);
    const toggleMobile = () => setIsMobileOpen((s) => !s);

    const links = [
        { href: '/', label: 'Home' },
        { href: '/collections/perfumes', label: 'Collections' },
        { href: '/collections/perfumes?gender=Female', label: 'Women' },
        { href: '/collections/perfumes?gender=Male', label: 'Men' },
        { href: '/collections/perfumes?gender=Unisex', label: 'Unisex' },
        { href: '/collections/perfumes?sort=newest', label: 'NEW ARRIVALS' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact Us' },
    ];

    return (
        <>
            <header className={`header header-transparent header-sticky ${isSticky ? 'is-sticky' : ''}`}>
                <div className="header-top bg-dark">
                    <div className="container-fluid pl-75 pr-75 pl-lg-15 pr-lg-15 pl-md-15 pr-md-15 pl-sm-15 pr-sm-15 pl-xs-15 pr-xs-15">
                        <div className="row align-items-center">
                            <div className="col-xl-6 col-lg-4 d-flex flex-wrap justify-content-lg-start justify-content-center align-items-center">
                                <div className="header-top-links color-white">
                                    <div className="logo">
                                        <Link href="/"><img src="/assets/images/logo.png" alt="logo" style={{ height: '35px' }} /></Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-8">
                                <div className="ht-right d-flex justify-content-lg-end justify-content-center align-items-center">


                                    <div className="header-search">
                                        <button onClick={toggleSearch} className={`header-search-toggle color-white ${isSearchOpen ? 'open' : ''}`}>
                                            <i className={`fa ${isSearchOpen ? 'fa-times' : 'fa-search'}`} />
                                        </button>
                                        <div className="header-search-form" style={{ display: isSearchOpen ? 'block' : 'none' }}>
                                            <form action="#">
                                                <input type="text" placeholder="Type and hit enter" />
                                                <button><i className="fa fa-search" /></button>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="header-cart color-white">
                                        <a href="/cart"><i className="fa fa-shopping-cart"></i> <span>{cartCount}</span></a>
                                        {/* Cart Dropdown */}
                                        <div className="header-cart-dropdown">
                                            {cartItems.length === 0 ? (
                                                <div className="text-center p-3">
                                                    <p>Your cart is empty.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <ul className="cart-items">
                                                        {cartItems.map((item) => {
                                                            // Calculate price logic
                                                            const price = item.selectedVariant?.price || item.variants?.[0]?.price || 0;
                                                            const discount = item.discountPercentage || 0;
                                                            const finalPrice = price * (1 - discount / 100);

                                                            return (
                                                                <li key={item.id} className='single-cart-item'>
                                                                    <div className="cart-img">
                                                                        <a href={`/products/${item.slug}`}>
                                                                            <img
                                                                                src={item.images?.[0] || '/assets/images/product/default.jpg'}
                                                                                alt={item.name}
                                                                            />
                                                                        </a>
                                                                    </div>
                                                                    <div className="cart-content">
                                                                        <h4 className="product-name"><a href={`/products/${item.slug}`}>{item.name}</a></h4>
                                                                        {item.selectedVariant && (
                                                                            <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '3px' }}>
                                                                                Size: {item.selectedVariant.size}ml
                                                                            </span>
                                                                        )}
                                                                        <div className="d-flex align-items-center mb-1" style={{ gap: '6px' }}>
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                                                                                }}
                                                                                style={{ 
                                                                                    width: '20px', height: '20px', lineHeight: '18px', textAlign: 'center', 
                                                                                    border: '1px solid #ddd', background: '#fff', borderRadius: '50%', 
                                                                                    fontSize: '12px', cursor: 'pointer', color: '#333', padding: 0
                                                                                }}
                                                                            >-</button>
                                                                            
                                                                            <span className="product-quantity" style={{ fontSize: '14px', fontWeight: '600' }}>{item.quantity}</span>
                                                                            
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    const variant = item.variants?.find(v => v.id === item.selectedVariant?.id);
                                                                                    const maxStock = variant?.stock ?? 0;

                                                                                    if (item.quantity >= maxStock) { 
                                                                                        if (maxStock === 0) {
                                                                                            alert("Sorry, this item is currently out of stock.");
                                                                                        } else {
                                                                                            alert(`Sorry, we only have ${maxStock} unit(s) available in stock.`);
                                                                                        }
                                                                                        return;
                                                                                    }
                                                                                    updateQuantity(item.id, item.quantity + 1);
                                                                                }}
                                                                                style={{ 
                                                                                    width: '20px', height: '20px', lineHeight: '18px', textAlign: 'center', 
                                                                                    border: '1px solid #ddd', background: '#fff', borderRadius: '50%', 
                                                                                    fontSize: '12px', cursor: 'pointer', color: '#333', padding: 0
                                                                                }}
                                                                            >+</button>
                                                                            
                                                                        </div>
                                                                        <span className="product-price"> Rs. {finalPrice.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="cart-item-remove">
                                                                        <a title="Remove" href="">
                                                                            <i
                                                                                className="fa fa-trash"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    removeFromCart(item.id);
                                                                                }}
                                                                                style={{ cursor: 'pointer' }}
                                                                            ></i>
                                                                        </a>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                    <div className="cart-total">
                                                        <h5>Total:<span className="float-right">Rs. {cartTotal.toFixed(2)}</span></h5>
                                                    </div>
                                                    <div className="cart-btn">
                                                        <a href="/cart">View Cart</a>
                                                        <a href="/cart/checkout">Checkout</a>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ul className="ht-us-menu color-white d-flex">
                                        <li>
                                            <a><i className="fa fa-user-circle-o" /></a>
                                            <ul className="ht-dropdown right">
                                                <li><a href="/my-account">My Account</a></li>
                                                <li><a href="/wishlist">My Wish List</a></li>
                                                {user && <li><a href="/my-account?tab=notifications">Notifications</a></li>}
                                                {user ? (
                                                    <li><a href="/" onClick={handleLogout}>Logout</a></li>
                                                ) : ( 
                                                <li><a href="/login">Sign In</a></li>
                                            )}
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-bottom menu-right bg-light">
                    <div className="container-fluid pl-75 pr-75 pl-lg-15 pr-lg-15 pl-md-15 pr-md-15 pl-sm-15 pr-sm-15 pl-xs-15 pr-xs-15">
                        <div className="row align-items-center">
                            <div className="col-lg-12 col-md-12 col-12 order-lg-2 order-md-2 order-3 d-flex justify-content-center">
                                <nav className="main-menu color-black">
                                    <ul>
                                        {links.map((l) => (
                                            <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </div>

                        {/* MOBILE: hamburger + mobile-menu container */}
                        <div className="row">
                            <div className="col-12 d-flex d-lg-none align-items-center justify-content-end">
                                <div className={`mobile-menu ${isMobileOpen ? 'open' : ''}`} style={{ width: '100%' }}>
                                    <div className="mean-bar" style={{ position: 'relative' }}>
                                        <button
                                            type="button"
                                            className="meanmenu-reveal"
                                            aria-expanded={isMobileOpen}
                                            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                                            onClick={() => setIsMobileOpen((s) => !s)}
                                            style={{
                                                position: 'absolute',
                                                right: 0,
                                                background: 'transparent',
                                                border: 0,
                                                padding: 6,
                                                zIndex: 9999,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <span
                                                className="menu-bar"
                                                aria-hidden="true"
                                                style={{ display: isMobileOpen ? 'none' : 'block' }}
                                            />
                                            <span
                                                className="menu-close"
                                                aria-hidden="true"
                                                style={{ display: isMobileOpen ? 'block' : 'none' }}
                                            />
                                        </button>

                                        <nav className="mean-nav" aria-hidden={!isMobileOpen}>
                                            <ul style={{ display: isMobileOpen ? 'block' : 'none' }}>
                                                {links.map((l) => (
                                                    <li key={l.label}>
                                                        <Link href={l.href} onClick={() => setIsMobileOpen(false)}>
                                                            {l.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </header>
        </>
    );
}
