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
        variants: { price: number }[];
    };
}

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
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
        const cartProduct = {
            ...product,
            variants: product.variants || []
        };
        addToCart(cartProduct, 1);
        toast.success('Added to cart');
    };

    if (loading) {
        return (
            <div className="text-center pt-100 pb-100">
                <div className="spinner-border text-warning" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div id="main-wrapper">
            {/* Page Banner Section Start */}
            <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="page-banner text-center">
                                <h1>Wishlist</h1>
                                <ul className="page-breadcrumb">
                                    <li><Link href="/">Home</Link></li>
                                    <li>Wishlist</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Page Banner Section End */}

            {/* Wishlist section start */}
            <div className="wishlist-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-70 pb-lg-50 pb-md-40 pb-sm-30 pb-xs-20">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {wishlistItems.length === 0 ? (
                                <div className="text-center">
                                    <h3>Your wishlist is empty.</h3>
                                    <p className="mb-4">Browse our collections to find products you love.</p>
                                    <Link href="/collections" className="btn btn-primary" style={{ backgroundColor: '#ddb040', borderColor: '#ddb040', color: '#fff' }}>
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="cart-table table-responsive mb-30">
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
                                                const price = product.variants?.[0]?.price || 0;

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
                                                        <td className="pro-price"><span>Rs. {price.toFixed(2)}</span></td>
                                                        <td className="pro-stock"><span className="in-stock">In Stock</span></td>
                                                        <td className="pro-addtocart">
                                                            <button
                                                                className="btn"
                                                                onClick={() => handleAddToCart(product)}
                                                                style={{ backgroundColor: '#333', color: '#fff', padding: '10px 20px' }}
                                                            >
                                                                Add to cart
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}