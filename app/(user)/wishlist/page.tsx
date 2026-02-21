'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '@/components/CartContext';
import toast from 'react-hot-toast';

interface WishlistItem {
    product: {
        id: string;
        name: string;
        slug: string;
        images: string[];
        variants: { id: string; price: number; size: string; stock: number }[];
        discountPercentage?: number;
        inStock?: boolean;
    };
}

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingProductId, setAddingProductId] = useState<string | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get('/api/v1/wishlist');
            if (res.data.success) {
                setWishlistItems(res.data.items);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Could not load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            const res = await axios.delete(`/api/v1/wishlist/${productId}`);
            if (res.data.success) {
                setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleAddToCart = (product: any) => {
        if (addingProductId === product.id) return;
        
        setAddingProductId(product.id);
        
        const selectedVariant = product.variants?.[0] || null;
        
        const cartProduct = {
            ...product,
            variants: product.variants || [],
            selectedVariant: selectedVariant,
            stock: selectedVariant?.stock || 99,
            discountPercentage: product.discountPercentage ?? 0,
            price: selectedVariant?.price || 0
        };
        addToCart(cartProduct, 1);
        toast.success('Added to cart');
        setTimeout(() => setAddingProductId(null), 1000);
    };

    return (
        <div id="main-wrapper">
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
                                <div className="order-2 order-md-1 mt-2 mt-md-0">
                                    <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                                        <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                                        <li className="text-white/80">Wishlist</li>
                                    </ul>
                                </div>

                                <div className="order-1 order-md-2 text-center text-md-end">
                                    <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                        Wishlist
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wishlist section start */}
            <div className="wishlist-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-70 pb-lg-50 pb-md-40 pb-sm-30 pb-xs-20">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {loading ? (
                                <div className="text-center pt-100 pb-100">
                                    <div className="spinner-border text-warning" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            ) : wishlistItems.length === 0 ? (
                                <div className="text-center">
                                    <h3>Your wishlist is empty.</h3>
                                    <p className="mb-4">Browse our collections to find products you love.</p>
                                    <Link href="/collections" className="btn btn-primary" style={{ backgroundColor: '#ddb040', borderColor: '#ddb040', color: '#fff' }}>
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="cart-table table-responsive mb-30 d-none d-md-block">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th className="pro-thumbnail">Image</th>
                                                    <th className="pro-title">Product</th>
                                                    <th className="pro-price">Price</th>
                                                    <th className="pro-stock">Stock Status</th>
                                                    <th className="pro-addtocart">Add to cart</th>
                                                    <th className="pro-remove">Remove</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {wishlistItems.map((item) => {
                                                    const product = item.product;
                                                    const basePrice = Number(product.variants?.[0]?.price) || 0;
                                                    const sellingPrice = (product.variants?.[0] as any)?.sellingPrice;
                                                    const hasDiscount = sellingPrice != null && sellingPrice < basePrice;
                                                    const finalPrice = hasDiscount ? sellingPrice : basePrice;

                                                    return (
                                                        <tr key={product.id}>
                                                            <td className="pro-thumbnail">
                                                                <Link href={`/products/${product.slug}`}>
                                                                    <img
                                                                        src={product.images[0] || '/assets/images/product/default.jpg'}
                                                                        alt={product.name}
                                                                        style={{ width: '100px', objectFit: 'cover' }}
                                                                    />
                                                                </Link>
                                                            </td>
                                                            <td className="pro-title">
                                                                <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                                            </td>
                                                            <td className="pro-price">
                                                                <span style={{ color: '#B6902E', fontWeight: '600' }}>Rs. {finalPrice.toFixed(2)}</span>
                                                                {hasDiscount && (
                                                                    <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: '8px', fontSize: '14px' }}>
                                                                        Rs. {basePrice.toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="pro-stock"><span className="in-stock">In Stock</span></td>
                                                            <td className="pro-addtocart">
                                                                <button
                                                                    className="btn"
                                                                    onClick={() => handleAddToCart(product)}
                                                                    disabled={addingProductId === product.id}
                                                                >
                                                                    {addingProductId === product.id ? 'Adding...' : 'Add to cart'}
                                                                </button>
                                                            </td>
                                                            <td className="pro-remove">
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    <i className="fa fa-trash-o"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="d-block d-md-none">
                                        {wishlistItems.map((item) => {
                                            const product = item.product;
                                            const basePrice = Number(product.variants?.[0]?.price) || 0;
                                            const sellingPrice = (product.variants?.[0] as any)?.sellingPrice;
                                            const hasDiscount = sellingPrice != null && sellingPrice < basePrice;
                                            const finalPrice = hasDiscount ? sellingPrice : basePrice;

                                            return (
                                                <div 
                                                    key={product.id} 
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '15px', 
                                                        padding: '15px', 
                                                        borderBottom: '1px solid #eee',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {/* Image */}
                                                    <Link href={`/products/${product.slug}`} style={{ flexShrink: 0 }}>
                                                        <img
                                                            src={product.images[0] || '/assets/images/product/default.jpg'}
                                                            alt={product.name}
                                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    </Link>
                                                    
                                                    {/* Product Info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Link 
                                                            href={`/products/${product.slug}`} 
                                                            style={{ 
                                                                fontWeight: '600', 
                                                                color: '#333', 
                                                                textDecoration: 'none',
                                                                display: 'block',
                                                                marginBottom: '5px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <p style={{ margin: '0 0 8px 0', color: '#B6902E', fontWeight: '600', fontSize: '14px' }}>
                                                            Rs. {finalPrice.toFixed(2)}
                                                        </p>
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => handleAddToCart(product)}
                                                            style={{ 
                                                                backgroundColor: '#B6902E', 
                                                                color: '#fff', 
                                                                fontSize: '8px',
                                                                padding: '6px 15px',
                                                                border: 'none'
                                                            }}
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => removeFromWishlist(product.id)}
                                                        style={{ 
                                                            position: 'absolute',
                                                            top: '10px',
                                                            right: '10px',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#999',
                                                            cursor: 'pointer',
                                                            fontSize: '16px'
                                                        }}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}