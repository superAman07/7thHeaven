'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';

const MOBILE_BREAKPOINT = 991;

export default function NavBar() {
    const [isSticky, setSticky] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { cartItems, removeFromCart, cartCount, cartTotal } = useCart();

    const mobileMenuRef = useRef<HTMLDivElement | null>(null);

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
        { href: '/collections', label: 'Collections' },
        { href: '/collections?gender=Women', label: 'Women' },
        { href: '/collections?gender=Men', label: 'Men' },
        { href: '/collections?gender=Unisex', label: 'Unisex' },
        { href: '/collections?sort=newest', label: 'NEW ARRIVALS' },
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
                                    <ul className="ht-us-menu color-white d-flex">
                                        <li>
                                            <a href="#"><i className="fa fa-user-circle-o" /></a>
                                            <ul className="ht-dropdown right">
                                                <li><a href="/my-account">My Account</a></li>
                                                <li><a href="/wishlist">My Wish List</a></li>
                                                <li><a href="/login">Sign In</a></li>
                                            </ul>
                                        </li>
                                    </ul>

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
                                        <div className="header-cart-dropdown">
                                            <ul className="cart-items">
                                                <li className="single-cart-item">
                                                    <div className="cart-img">
                                                        <a href="cart.html"><img src="/assets/images/cart/cart-1.jpg" alt="" /></a>
                                                    </div>
                                                    <div className="cart-content">
                                                        <h5 className="product-name"><a href="#">Dell Inspiron 24</a></h5>
                                                        <span className="product-quantity">1 ×</span>
                                                        <span className="product-price">$278.00</span>
                                                    </div>
                                                    <div className="cart-item-remove"><a title="Remove" href="#"><i className="fa fa-trash" /></a></div>
                                                </li>
                                                <li className="single-cart-item">
                                                    <div className="cart-img">
                                                        <a href="cart.html"><img src="/assets/images/cart/cart-2.jpg" alt="" /></a>
                                                    </div>
                                                    <div className="cart-content">
                                                        <h5 className="product-name"><a href="#">Lenovo Ideacentre 300</a></h5>
                                                        <span className="product-quantity">1 ×</span>
                                                        <span className="product-price">$23.39</span>
                                                    </div>
                                                    <div className="cart-item-remove"><a title="Remove" href="#"><i className="fa fa-trash" /></a></div>
                                                </li>
                                            </ul>
                                            <div className="cart-total">
                                                <h5>Subtotal :<span className="float-right">$39.79</span></h5>
                                                <h5>Eco Tax (-2.00) :<span className="float-right">$7.00</span></h5>
                                                <h5>VAT (20%) : <span className="float-right">$0.00</span></h5>
                                                <h5>Total : <span className="float-right">$46.79</span></h5>
                                            </div>
                                            <div className="cart-btn">
                                                <a href="cart.html">View Cart</a>
                                                <a href="checkout.html">checkout</a>
                                            </div>
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
                                                            const price = item.variants?.[0]?.price || 0;
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
                                                                        <span className="product-quantity">{item.quantity} x</span>
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
                                                        <a href="/cart" className="btn">View Cart</a>
                                                        <a href="/cart/checkout" className="btn">Checkout</a>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
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
                                                right: 8,
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
