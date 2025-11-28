'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ... existing interfaces ...
export interface WishlistProduct {
    id: string;
    name: string;
    image: string;
    slug: string;
}

interface WishlistContextType {
    wishlistItems: string[];
    toggleWishlist: (product: WishlistProduct) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);

    useEffect(() => {
        fetchWishlistIds();
    }, []);

    const fetchWishlistIds = async () => {
        try {
            const res = await axios.get('/api/v1/wishlist');
            if (res.data.success) {
                const ids = res.data.items.map((item: any) => item.product.id);
                setWishlistItems(ids);
            }
        } catch (error) {
            // User might not be logged in
        }
    };

    const toggleWishlist = async (product: WishlistProduct) => {
        const productId = product.id;
        const isIn = wishlistItems.includes(productId);

        if (isIn) {
            setWishlistItems(prev => prev.filter(id => id !== productId));
            toast.error('Removed from wishlist');
            try {
                await axios.delete(`/api/v1/wishlist/${productId}`);
            } catch (error) {
                setWishlistItems(prev => [...prev, productId]);
                toast.error('Failed to remove');
            }
        } else {
            setWishlistItems(prev => [...prev, productId]);

            // Keep the toast transient (disappears after 4s)
            toast.custom((t) => (
                <div
                    style={{
                        opacity: t.visible ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        background: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        minWidth: '300px',
                        maxWidth: '350px',
                        borderLeft: '4px solid #ddb040',
                        pointerEvents: 'auto'
                    }}
                >
                    <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                        <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#333' }}>Added to Wishlist</h6>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.name}
                        </p>
                    </div>
                    <div>
                        <Link
                            href="/wishlist"
                            onClick={() => toast.dismiss(t.id)}
                            style={{
                                color: '#ddb040',
                                fontWeight: 600,
                                fontSize: '13px',
                                textDecoration: 'none',
                                border: '1px solid #ddb040',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                transition: '0.2s'
                            }}
                        >
                            View
                        </Link>
                    </div>
                </div>
            ), { position: 'bottom-left', duration: 4000 });

            try {
                await axios.post('/api/v1/wishlist', { productId });
            } catch (error: any) {
                setWishlistItems(prev => prev.filter(id => id !== productId));
                if (error.response?.status === 401) {
                    toast.error('Please login to use wishlist');
                } else {
                    toast.error('Failed to add');
                }
            }
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.includes(productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
            {children}

            {/* NEW: Persistent Floating Wishlist Button */}
            {wishlistItems.length > 0 && (
                <Link
                    href="/wishlist"
                    title="View Wishlist"
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '20px',
                        backgroundColor: '#fff',
                        color: '#ddb040',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        zIndex: 999,
                        border: '2px solid #ddb040',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <div style={{ position: 'relative' }}>
                        <i className="fa fa-heart" style={{ fontSize: '24px' }}></i>
                        <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                            {wishlistItems.length}
                        </span>
                    </div>
                </Link>
            )}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}

