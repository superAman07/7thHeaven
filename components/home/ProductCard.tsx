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
    const { addToCart } = useCart();
    const router = useRouter();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [isAdding, setIsAdding] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );

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

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!selectedVariant) return;

        setIsAdding(true);
        addToCart({
            ...product,
            selectedVariant: selectedVariant,
            price: selectedVariant.price
        }, 1);

        setTimeout(() => {
            setIsAdding(false);
        }, 2000);
    };

    const handleQuickBuy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!selectedVariant) return;
        
        addToCart({
            ...product,
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
                    padding: 8px 35px 8px 15px; /* Extra right padding for arrow */
                    font-size: 13px;
                    font-weight: 500;
                    color: #333;
                    background-color: #fff;
                    border: 1px solid #e5e5e5;
                    border-radius: 0; /* Sharp edges for professional look */
                    cursor: pointer;
                    
                    /* Remove default browser arrow */
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    
                    /* Custom Arrow Icon */
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    background-size: 14px;
                    
                    transition: all 0.3s ease;
                }

                /* Hover State */
                .product-size-select select:hover {
                    border-color: #ddb040; /* Golden border on hover */
                }

                /* Focus State (Removes blue outline) */
                .product-size-select select:focus {
                    outline: none;
                    border-color: #ddb040;
                    box-shadow: 0 0 0 1px #ddb040; /* Subtle golden glow */
                }
                .price-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin: 5px 0 10px;
                }
                .price-new {
                    color: #ddb040;
                    font-weight: 700;
                    font-size: 26px;
                }
                .price-old {
                    color: #888;
                    text-decoration: line-through; /* Adds the cut */
                    font-size: 22px;
                    font-weight: 400;
                }

                /* Quick Buy Button */
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
                    background-color: #ddb040;
                    color: #fff;
                }
            `}</style>

            <div className="col-12" style={{ padding: '0 15px' }}>
                <div className="single-product mb-30">
                    <div className="product-img">
                        <Link href={`/products/${product.slug}`}>
                            <img 
                                src={product.images[0] || '/assets/images/product/shop.webp'} 
                                alt={product.name} 
                                style={{ aspectRatio: '1 / 1', objectFit: 'cover', width: '100%' }} 
                            />
                        </Link>
                        
                        {product.isNewArrival && <span className="sticker">New</span>}
                        {priceData.discount > 0 && <span className="descount-sticker">-{priceData.discount}%</span>}
                        
                        <div className="product-action d-flex justify-content-between">
                            <a
                                className="product-btn"
                                onClick={handleAddToCart}
                                style={{ cursor: 'pointer' }}
                            >
                                {isAdding ? 'Added!' : 'Add to Cart'}
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

                        {/* <div className="ratting">
                            {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fa ${i < (product.ratingsAvg || 0) ? 'fa-star' : 'fa-star-o'}`}></i>
                            ))}
                        </div> */}

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
                                            {v.size} {/[a-zA-Z]/.test(v.size) ? '' : 'ml'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div style={{ height: '39px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#777', margin: '10px 0' }}>
                                {selectedVariant?.size} {/[a-zA-Z]/.test(selectedVariant?.size || '') ? '' : 'ml'}
                            </div>
                        )}

                        <h4 className="price-box">
                            <span className="price-new">Rs. {priceData.current.toFixed(2)}</span>
                            {priceData.discount > 0 && (
                                <span className="price-old">Rs. {priceData.old.toFixed(2)}</span>
                            )}
                        </h4>
                        <button className="quick-buy-btn" onClick={handleQuickBuy}>
                            Quick Buy
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};