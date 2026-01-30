'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { PublicProduct } from '../HeroPage';
import { usePathname } from 'next/navigation';
const MOBILE_BREAKPOINT = 991;

export default function NavBar() {
    const [isSticky, setSticky] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();

    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<PublicProduct[]>([]); 
    const [showSuggestions, setShowSuggestions] = useState(false); 

    // 1. Scroll Detection for Shrinking Animation
    useEffect(() => {
        const onScroll = () => {
            setSticky(window.scrollY > 50);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // 2. Click Outside Logic
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

    // 3. Live Search Logic (Mocked)
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
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) setSearchTerm(query);
    }, [searchParams]);
    // 5. Check Auth
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/v1/auth/me');
                if (res.data.success) {
                    setUser(res.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            }
        };
        checkAuth();
    }, [pathname]);
    // 6. Lock body scroll when mobile menu open
    useEffect(() => {
        const body = document.body;
        if (isMobileOpen) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
        return () => { body.style.overflow = ''; };
    }, [isMobileOpen]);
    // 7. Close mobile menu on resize
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > MOBILE_BREAKPOINT && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [isMobileOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setSearchOpen(false);
        setShowSuggestions(false);
        router.push(`/collections/perfumes?search=${encodeURIComponent(searchTerm)}`);
    };

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

    const toggleSearch = () => setSearchOpen((s) => !s);
    const toggleMobile = () => setIsMobileOpen((s) => !s);

    const links = [
        { href: '/', label: 'Home' },
        { href: '/collections/perfumes', label: 'Collections' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact Us' },
        { href: '/7th-heaven', label: '7th Heaven Club' },
    ];

    return (
        <>
            {/* Header Main Container */}
            <header 
                className={`!fixed !top-0 !left-0 !right-0 !z-[1000] !transition-all !duration-500 !ease-in-out ${
                    isSticky 
                        ? '!bg-white/80 !backdrop-blur-xl !shadow-lg !h-[80px]' 
                        : '!bg-transparent !h-[140px] md:!h-[160px]'
                }`}
            >
                <div className="!container !mx-auto !h-full !px-4 md:!px-8">
                    <div className="!relative !flex !items-center !justify-between !h-full">
                        
                        {/* --- DESKTOP: LEFT SECTION (Nav Links) --- */}
                        <nav className="!hidden lg:!flex !flex-1 !items-center !gap-6">
                            {links.map((l) => (
                                <a 
                                    key={l.label}
                                    href={l.href}
                                    className={`!text-[13px] !font-semibold !uppercase !tracking-widest !transition-colors !duration-300 hover:!text-[#D4AF37] ${
                                        l.label === '7th Heaven Club' 
                                            ? '!text-[#D4AF37]' 
                                            : isSticky ? '!text-gray-800' : '!text-white'
                                    }`}
                                >
                                    {l.label}
                                </a>
                            ))}
                        </nav>

                        {/* --- MOBILE: LEFT SECTION (Hamburger) --- */}
                        <div className="lg:!hidden !flex-1 !flex !items-center">
                            <a href="/cart" className={`!text-xl hover:!text-[#D4AF37] !transition-colors !relative ${isSticky ? '!text-gray-800' : '!text-white'}`}>
                                <i className="fa fa-shopping-bag"></i>
                                {cartCount > 0 && (
                                    <span className="!absolute !-top-2 !-right-3 !bg-[#D4AF37] !text-white !text-[10px] !font-bold !w-4 !h-4 !rounded-full !flex !items-center !justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </a>
                        </div>

                        {/* --- CENTER SECTION (LOGO) --- */}
                        <div className="!absolute !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !z-50">
                            <a href="/" className="!block">
                                <img 
                                    src="/celsius-logo.png" 
                                    alt="logo" 
                                    className={`!transition-all !duration-500 !object-contain ${isSticky ? '!h-[50px] md:!h-[60px]' : '!h-[90px] md:!h-[120px]'}`}
                                />
                            </a>
                        </div>
                        <div className="!hidden lg:!flex !flex-1 !items-center !justify-end !gap-2 md:!gap-4">
                            
                            {/* Search */}
                            <div className="!relative" ref={searchRef}>
                                <button 
                                    onClick={toggleSearch} 
                                    className={`!text-xl hover:!text-[#D4AF37] !transition-colors ${isSticky ? '!text-gray-800' : '!text-white'}`}
                                >
                                    <i className={`fa ${isSearchOpen ? 'fa-times' : 'fa-search'}`}></i>
                                </button>
                                {/* Search Dropdown */}
                                <div className={`!absolute !right-0 !top-full !mt-4 !w-[280px] md:!w-[350px] !bg-white !shadow-2xl !rounded-xl !border !border-gray-100 !transition-all !duration-300 !origin-top-right ${isSearchOpen ? '!opacity-100 !scale-100 !visible' : '!opacity-0 !scale-95 !invisible'}`}>
                                    <div className="!p-4">
                                        <form onSubmit={handleSearch} className="!relative">
                                            <input 
                                                type="text" 
                                                placeholder="Search perfumes..." 
                                                className="!w-full !pl-4 !pr-10 !py-2 !bg-gray-50 !border !border-gray-200 !rounded-full focus:!outline-none focus:!ring-2 focus:!ring-[#D4AF37] !text-sm"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <button type="submit" className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !text-gray-400 hover:!text-[#D4AF37]">
                                                <i className="fa fa-arrow-right"></i>
                                            </button>
                                        </form>
                                        {showSuggestions && (
                                            <div className="!mt-4 !max-h-[300px] !overflow-y-auto">
                                                {suggestions.map(p => (
                                                    <a key={p.id} href={`/products/${p.slug}`} className="!flex !items-center !gap-3 !p-2 hover:!bg-gray-50 !rounded-lg !transition-colors !no-underline">
                                                        <img src={p.images[0]} alt={p.name} className="!w-10 !h-10 !object-cover !rounded" />
                                                        <div>
                                                            <p className="!text-xs !font-bold !text-gray-800 !m-0">{p.name}</p>
                                                            <p className="!text-[10px] !text-gray-500 !m-0">Rs. {p.variants[0].price}</p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Cart */}
                            <div className="header-cart" style={{ position: 'relative' }}>
                                <a href="/cart" className={`!text-xl hover:!text-[#D4AF37] !transition-colors !relative ${isSticky ? '!text-gray-800' : '!text-white'}`}>
                                    <i className="fa fa-shopping-bag"></i>
                                    {cartCount > 0 && (
                                        <span className="!absolute !-top-2 !-right-3 !bg-[#D4AF37] !text-white !text-[10px] !font-bold !w-4 !h-4 !rounded-full !flex !items-center !justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </a>
                                <div className="header-cart-dropdown">
                                    {cartItems.length === 0 ? (
                                        <div className="!text-center !p-3">
                                            <p>Your cart is empty.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <ul className="cart-items">
                                                {cartItems.map((item) => {
                                                    const price = item.selectedVariant?.price || item.variants?.[0]?.price || 0;
                                                    const discount = item.discountPercentage || 0;
                                                    const finalPrice = price * (1 - discount / 100);
                                                    return (
                                                        <li key={item.id} className='single-cart-item'>
                                                            <div className="cart-img">
                                                                <a href={`/products/${item.slug}`}>
                                                                    <img src={item.images?.[0] || '/assets/images/product/default.jpg'} alt={item.name} />
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
                                                                        onClick={(e) => { e.preventDefault(); if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1); }}
                                                                        style={{ width: '20px', height: '20px', lineHeight: '18px', textAlign: 'center', border: '1px solid #ddd', background: '#fff', borderRadius: '50%', fontSize: '12px', cursor: 'pointer', color: '#333', padding: 0 }}
                                                                    >-</button>
                                                                    <span className="product-quantity" style={{ fontSize: '14px', fontWeight: '600' }}>{item.quantity}</span>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            const variant = item.variants?.find(v => v.id === item.selectedVariant?.id);
                                                                            const maxStock = variant?.stock ?? 0;
                                                                            if (item.quantity >= maxStock) { alert(maxStock === 0 ? "Out of stock" : `Only ${maxStock} available`); return; }
                                                                            updateQuantity(item.id, item.quantity + 1);
                                                                        }}
                                                                        style={{ width: '20px', height: '20px', lineHeight: '18px', textAlign: 'center', border: '1px solid #ddd', background: '#fff', borderRadius: '50%', fontSize: '12px', cursor: 'pointer', color: '#333', padding: 0 }}
                                                                    >+</button>
                                                                </div>
                                                                <span className="product-price"> Rs. {finalPrice.toFixed(2)}</span>
                                                            </div>
                                                            <div className="cart-item-remove">
                                                                <a title="Remove" href="" onClick={(e) => { e.preventDefault(); removeFromCart(item.id); }}>
                                                                    <i className="fa fa-trash" style={{ cursor: 'pointer' }}></i>
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
                            {/* Account */}
                            <div className="!relative group" style={{ display: 'flex', alignItems: 'center' }}>
                                <a className="!text-xl hover:!text-[#D4AF37] !transition-colors" style={{ cursor: 'pointer', color: isSticky ? '#1f2937' : '#ffffff' }}>
                                    <i className="fa fa-user"></i>
                                </a>
                                <div className="!absolute !right-0 !top-full !mt-2 !w-[180px] !bg-white !shadow-xl !py-2 !opacity-0 !invisible group-hover:!opacity-100 group-hover:!visible !transition-all !duration-200 !z-[100]">
                                    <a href="/my-account" className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-50">My Account</a>
                                    <a href="/wishlist" className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-50">My Wish List</a>
                                    {user && <a href="/my-account?tab=orders" className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-50">My Orders</a>}
                                    {user ? (
                                        <a href="/" onClick={handleLogout} className="!block !px-4 !py-2 !text-sm !text-red-500 hover:!bg-gray-50">Logout</a>
                                    ) : ( 
                                        <a href="/login" className="!block !px-4 !py-2 !text-sm !font-bold !text-[#D4AF37] hover:!bg-gray-50">Sign In</a>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* --- MOBILE: RIGHT SECTION (Hamburger Only) --- */}
                        <div className="lg:!hidden !flex-1 !flex !items-center !justify-end">
                            <button 
                                onClick={toggleMobile}
                                className={`!text-2xl !p-2 !transition-colors ${isSticky ? '!text-gray-800' : '!text-white'}`}
                            >
                                <i className="fa fa-bars"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            <div 
                className={`!fixed !inset-0 !bg-black/50 !z-[1001] !transition-opacity lg:!hidden ${isMobileOpen ? '!opacity-100 !visible' : '!opacity-0 !invisible'}`} 
                onClick={toggleMobile}
            ></div>

            {/* Mobile Drawer */}
            <div className={`!fixed !top-0 !right-0 !h-full !w-[280px] !bg-white !z-[1002] !transform !transition-transform !duration-300 lg:!hidden ${isMobileOpen ? '!translate-x-0' : '!translate-x-full'}`}>
                {/* Header */}
                <div className="!flex !items-center !justify-between !p-4 !border-b">
                    <img src="/celsius-logo.png" alt="logo" className="!h-10" />
                    <button onClick={toggleMobile} className="!text-2xl !text-gray-600">
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                
                {/* Search */}
                <div className="!p-4 !border-b">
                    <form onSubmit={handleSearch} className="!flex !gap-2">
                        <input 
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!flex-1 !px-3 !py-2 !border !border-gray-200 !rounded !text-sm"
                        />
                        <button type="submit" className="!px-3 !py-2 !bg-[#D4AF37] !text-white !rounded">
                            <i className="fa fa-search"></i>
                        </button>
                    </form>
                </div>
                
                {/* Nav Links */}
                <nav className="!p-4">
                    {links.map((l) => (
                        <a 
                            key={l.label}
                            href={l.href}
                            className={`!block !py-3 !text-sm !font-medium !border-b !border-gray-100 ${l.label === '7th Heaven Club' ? '!text-[#D4AF37]' : '!text-gray-700'}`}
                            onClick={toggleMobile}
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>
                
                {/* Account Links */}
                <div className="!p-4 !border-t">
                    <a href="/my-account" className="!flex !items-center !gap-3 !py-2 !text-sm !text-gray-700">
                        <i className="fa fa-user"></i> My Account
                    </a>
                    <a href="/wishlist" className="!flex !items-center !gap-3 !py-2 !text-sm !text-gray-700">
                        <i className="fa fa-heart"></i> My Wishlist
                    </a>
                    {user ? (
                        <button onClick={handleLogout} className="!flex !items-center !gap-3 !py-2 !text-sm !text-red-500 !w-full">
                            <i className="fa fa-sign-out"></i> Logout
                        </button>
                    ) : (
                        <a href="/login" className="!flex !items-center !gap-3 !py-2 !text-sm !font-bold !text-[#D4AF37]">
                            <i className="fa fa-sign-in"></i> Sign In
                        </a>
                    )}
                </div>
            </div>

        </>
    );
}
