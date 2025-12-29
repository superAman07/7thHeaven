'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { PublicProduct } from '../HeroPage';

const MOBILE_BREAKPOINT = 991;

export default function NavBar() {
    const [isSticky, setSticky] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();

    const [user, setUser] = useState(null);
    const router = useRouter();

    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<PublicProduct[]>([]); 
    const [showSuggestions, setShowSuggestions] = useState(false); 

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) setSearchTerm(query);
    }, [searchParams]);

    // 1. Click Outside Logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 2. Live Search / Autocomplete Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                try {
                    const res = await axios.get(`/api/v1/products?search=${encodeURIComponent(searchTerm)}&limit=5`);
                    if (res.data.success) {
                        setSuggestions(res.data.data);
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("Search error", error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300); // Wait 300ms after typing stops

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        
        setSearchOpen(false);
        setShowSuggestions(false);
        router.push(`/collections/perfumes?search=${encodeURIComponent(searchTerm)}`);
    };

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
        { href: '/7th-heaven', label: '7th Heaven Club' },
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
                                    <div className="header-search relative" ref={searchRef}>
                                        <button 
                                            onClick={toggleSearch} 
                                            className={`header-search-toggle color-white ${isSearchOpen ? 'open' : ''} flex items-center justify-center`}
                                        >
                                            <i className={`fa ${isSearchOpen ? 'fa-times' : 'fa-search'}`} />
                                        </button>
                                        
                                        {/* UPDATED DROPDOWN CONTAINER */}
                                        <div className={`absolute right-0 top-full mt-5 w-[300px] md:w-[400px] bg-white shadow-2xl rounded z-50 border border-gray-100 transition-all duration-200 origin-top-right overflow-hidden ${isSearchOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                                            
                                            {/* Search Input Area */}
                                            <div className="p-4 border-b border-gray-100">
                                                <form onSubmit={handleSearch} className="relative">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search for perfumes..." 
                                                        className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        autoFocus={isSearchOpen}
                                                    />
                                                    <button 
                                                        type="submit" 
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                                                    >
                                                        <i className="fa fa-arrow-right text-lg" />
                                                    </button>
                                                </form>
                                                
                                                {!showSuggestions && searchTerm.length < 2 && (
                                                    <div className="mt-2 text-xs text-gray-400 px-1">
                                                        Press Enter to search
                                                    </div>
                                                )}
                                            </div>

                                            {/* LIVE SUGGESTIONS LIST - Forced List View */}
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white">
                                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider m-0">
                                                            Top Results
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex flex-col">
                                                        {suggestions.map(product => (
                                                            <Link 
                                                                key={product.id} 
                                                                href={`/products/${product.slug}`}
                                                                onClick={() => setSearchOpen(false)}
                                                                className="group flex items-center gap-4 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                                                style={{ display: 'flex', width: '100%', textDecoration: 'none' }}
                                                            >
                                                                {/* Thumbnail */}
                                                                <div 
                                                                    className="shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200"
                                                                    style={{ width: '48px', height: '48px' }}
                                                                >
                                                                    <img 
                                                                        src={product.images[0] || '/assets/images/product/default.jpg'} 
                                                                        alt={product.name} 
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    />
                                                                </div>
                                                                
                                                                {/* Details */}
                                                                <div className="flex-1 min-w-0 text-left">
                                                                    <h4 
                                                                        className="text-sm font-medium text-gray-900 truncate group-hover:text-[#D4AF37] transition-colors mb-1"
                                                                        style={{ margin: '0 0 4px 0', fontSize: '14px', lineHeight: '1.2' }}
                                                                    >
                                                                        {product.name}
                                                                    </h4>
                                                                    <p 
                                                                        className="text-xs text-gray-500 font-medium m-0"
                                                                        style={{ margin: 0, fontSize: '12px' }}
                                                                    >
                                                                        {product.variants && product.variants.length > 0 
                                                                            ? `Rs. ${product.variants[0].price}` 
                                                                            : 'Out of Stock'}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>

                                                    <button 
                                                        onClick={handleSearch}
                                                        className="w-full text-center py-3 text-xs text-[#D4AF37] font-bold hover:bg-gray-50 transition-colors uppercase tracking-wide"
                                                    >
                                                        View all results
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {!showSuggestions && searchTerm.length < 2 && (
                                                <div className="mt-2 text-xs text-gray-400 px-1">
                                                    Press Enter to search
                                                </div>
                                            )}
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
                                            <li key={l.label}>
                                                <Link 
                                                    href={l.href}
                                                    style={l.label === '7th Heaven Club' ? { color: '#D4AF37', fontWeight: 'bold' } : undefined}
                                                >
                                                    {l.label}
                                                </Link>
                                            </li>
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
                                                        <Link 
                                                            href={l.href} 
                                                            onClick={() => setIsMobileOpen(false)}
                                                            style={l.label === '7th Heaven Club' ? { color: '#D4AF37', fontWeight: 'bold' } : undefined}
                                                        >
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
