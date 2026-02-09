'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicProduct } from '../HeroPage';
import { useCart } from '../CartContext';
import { useWishlist } from '@/components/WishlistContext';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: PublicProduct;
    onQuickView: (product: PublicProduct) => void;
}

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
    const { addToCart, cartItems, removeFromCart } = useCart();
    const router = useRouter();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [isAdding, setIsAdding] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );

    const currentStock = selectedVariant?.stock ?? 0;
    const isGlobalOutOfStock = !product.inStock; 
    const isVariantOutOfStock = currentStock === 0;
    
    const isOutOfStock = isGlobalOutOfStock || isVariantOutOfStock;
    const isLowStock = !isGlobalOutOfStock && currentStock > 0 && currentStock <= 5;

    const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
    const cartItem = cartItems.find(item => 
        item.id === cartItemId || 
        (item.originalProductId === product.id && (!item.selectedVariant || item.selectedVariant.id === selectedVariant?.id))
    );
    const isInCart = !!cartItem;
    const priceData = useMemo(() => {
        if (!selectedVariant) return { current: 0, old: 0, discount: 0 };
        
        const originalPrice = selectedVariant.price;
        const discount = product.discountPercentage || 0;
        const discountedPrice = originalPrice * (1 - discount / 100);
        
        return { 
            current: discountedPrice, 
            old: originalPrice,
            discount: discount
        };
    }, [selectedVariant, product.discountPercentage]);

    const handleCartAction = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!selectedVariant || isOutOfStock) return;

        if (isInCart && cartItem) {
            removeFromCart(cartItem.id);
        } else {
            setIsAdding(true);
            addToCart({
                ...product,
                discountPercentage: product.discountPercentage ?? 0,
                selectedVariant: selectedVariant,
                price: selectedVariant.price
            }, 1);

            setTimeout(() => {
                setIsAdding(false);
            }, 2000);
        }
    };

    const handleQuickBuy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!selectedVariant || isOutOfStock) return;
        
        addToCart({
            ...product,
            discountPercentage: product.discountPercentage ?? 0,
            selectedVariant: selectedVariant,
            price: selectedVariant.price
        }, 1);

        setTimeout(() => {
            router.push('/cart/checkout');
        }, 100);
    };

    return (
        <>
            <style jsx>{`
                .product-size-select {
                    position: relative;
                    margin: 10px 0;
                }
                /* Custom Select Styling */
                .product-size-select select {
                    width: 100%;
                    padding: 8px 35px 8px 15px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #333;
                    background-color: #fff;
                    border: 1px solid #e5e5e5;
                    border-radius: 0;
                    cursor: pointer;
                    
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    background-size: 14px;
                    
                    transition: all 0.3s ease;
                }

                .product-size-select select:hover {
                    border-color: #ddb040;
                }

                .product-size-select select:focus {
                    outline: none;
                    border-color: #ddb040;
                    box-shadow: 0 0 0 1px #ddb040;
                }
                
                /* FIX 1: Professional Price Display with Proper Spacing */
                .price-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    margin: 8px 0 10px;
                    min-height: 60px; /* Consistent height regardless of content */
                }
                
                .price-new {
                    color: #B6902E;
                    font-weight: 700;
                    font-size: 20px; /* Reduced from 26px for better fit */
                    font-family: 'Montserrat', sans-serif; /* Professional sans-serif font */
                    letter-spacing: 0.5px;
                    line-height: 1.2;
                    white-space: nowrap; /* Prevent line breaks */
                }
                
                .price-old {
                    color: #888;
                    text-decoration: line-through;
                    font-size: 16px; /* Reduced from 22px */
                    font-weight: 400;
                    font-family: 'Montserrat', sans-serif; /* Professional sans-serif font */
                    letter-spacing: 0.3px;
                    line-height: 1.2;
                    white-space: nowrap;
                }

                .quick-buy-btn {
                    display: block;
                    width: 100%;
                    background-color: #333;
                    color: #fff;
                    text-align: center;
                    padding: 10px 0;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    border: none;
                    margin-top: 5px;
                    transition: all 0.3s ease;
                    letter-spacing: 1px;
                }
                .quick-buy-btn:hover {
                    background: linear-gradient(90deg, #B6902E, #D6B869, #B6902E);
                    background-size: 200% auto;
                    animation: shineGold 3s linear infinite;
                    color: #252525;
                }
                
                @keyframes shineGold {
                    to { background-position: 200% center; }
                }
                
                /* FIX 2: High-Contrast Discount Tag with Black Background */
                .descount-sticker-custom {
                    position: absolute;
                    left: 10px;
                    top: 10px;
                    background-color: #000000; /* Solid black background for maximum contrast */
                    color: #D6B869; /* Golden text */
                    border: 2px solid #D6B869; /* Golden border */
                    font-weight: 700;
                    text-align: center;
                    line-height: 24px;
                    padding: 2px 10px;
                    font-size: 13px;
                    text-transform: uppercase;
                    z-index: 2;
                    letter-spacing: 0.5px;
                    font-family: 'Montserrat', sans-serif;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* Shadow for depth */
                }
                
                .stock-sticker {
                    position: absolute;
                    right: 10px;
                    color: #e53935;
                    border: 2px solid #e53935;
                    background: rgba(255, 255, 255, 0.95); /* Slightly more opaque */
                    font-weight: 700;
                    text-align: center;
                    line-height: 24px;
                    padding: 2px 10px;
                    font-size: 11px;
                    text-transform: uppercase;
                    z-index: 2;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }
                
                .product-btn.disabled {
                    cursor: not-allowed;
                    pointer-events: none;
                }
                .quick-buy-btn:disabled {
                    background-color: #e0e0e0;
                    color: #999;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="col-12" style={{ padding: '0 15px' }}>
                <div className="single-product mb-30">
                    <div className="product-img transition-all duration-300 border border-[#ddb040]/20 group-hover:border-[#ddb040] group-hover:shadow-[0_0_15px_rgba(221,176,64,0.15)] rounded-lg overflow-hidden">
                        <Link href={`/products/${product.slug}`}>
                            <img 
                                src={product.images[0] || '/assets/images/product/shop.webp'} 
                                alt={product.name} 
                                style={{ aspectRatio: '1 / 1', objectFit: 'cover', width: '100%' }} 
                            />
                        </Link>
                        
                        {product.isNewArrival && <span className="sticker">New</span>}
                        {priceData.discount > 0 && (
                            <span className="descount-sticker-custom">
                                -{Math.round(priceData.discount)}%
                            </span>
                        )}
                        {isLowStock ? (
                            <span 
                                className="stock-sticker" 
                                style={{ 
                                    top: '10px',
                                    right: '10px',
                                    border: '1px solid #e53935',
                                    color: '#e53935',
                                    background: 'rgba(255,255,255,0.95)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Only {currentStock} Left
                            </span>
                        ) : product.isBestSeller ? (
                            <div 
                                className="absolute z-10 bg-[#E6B422] text-black text-[10px] font-bold uppercase tracking-widest shadow-md px-2 py-1 rounded-l-sm"
                                style={{
                                    top: '10px',
                                    right: '0px',
                                    border: 'none',
                                }}
                            >
                                Best Seller
                            </div>
                        ) : null}
                        
                        <div className="product-action d-flex justify-content-between">
                            <a
                                className={`product-btn ${isOutOfStock ? 'disabled' : ''}`}
                                onClick={handleCartAction}
                                style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', color: isInCart ? '#ddb040' : undefined }}
                            >
                                {isGlobalOutOfStock 
                                    ? 'not in stock' 
                                    : (isVariantOutOfStock ? 'Sold Out' : (isAdding ? 'Added!' : (isInCart ? 'Remove' : 'Add to Cart')))}
                            </a>
                            <ul className="d-flex">
                                <li>
                                    <a
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onQuickView(product);
                                        }}
                                        title="Quick View"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist({
                                                id: product.id,
                                                name: product.name,
                                                image: product.images[0] || '/assets/images/product/shop.webp',
                                                slug: product.slug
                                            });
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i
                                            className={`fa ${isInWishlist(product.id) ? 'fa-heart' : 'fa-heart-o'}`}
                                            style={{ color: isInWishlist(product.id) ? '#dc3545' : 'inherit' }}
                                        ></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="product-content">
                        <h3>
                            <Link href={`/products/${product.slug}`}>{product.name}</Link>
                        </h3>

                        {product.variants && product.variants.length > 1 ? (
                            <div className="product-size-select">
                                <select 
                                    id={`size-select-${product.id}`}
                                    name={`size-select-${product.id}`}
                                    value={selectedVariant?.id || ""}
                                    onChange={(e) => {
                                        const variant = product.variants.find(v => v.id === e.target.value);
                                        if (variant) setSelectedVariant(variant);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {product.variants.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div style={{ height: '38.57px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#777', margin: '10px 0' }}>
                                {selectedVariant?.size} {/[a-zA-Z]/.test(selectedVariant?.size || '') ? '' : 'ml'}
                            </div>
                        )}
                        
                        {/* FIXED: Professional price display */}
                        <div className="price-box">
                            <span className="price-new">₹{priceData.current.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            {priceData.discount > 0 && (
                                <span className="price-old">₹{priceData.old.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            )}
                        </div>
                        
                        <button 
                            className="quick-buy-btn" 
                            onClick={handleQuickBuy}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? 'Out of Stock' : 'Quick Buy'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};