'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

// NEW: Define the shape of product data needed for the popup
export interface WishlistProduct {
    id: string;
    name: string;
    image: string;
    slug: string;
}

interface WishlistContextType {
    wishlistItems: string[];
    toggleWishlist: (product: WishlistProduct) => Promise<void>; // Updated signature
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
            // Remove logic (Simple toast is enough for removal)
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
                    {/* Product Image */}
                    <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                    </div>
                    
                    {/* Text Content */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#333' }}>Added to Wishlist</h6>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.name}
                        </p>
                    </div>
                    
                    {/* View Button */}
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
                setWishlistItems(prev => prev.filter(id => id !== productId)); // Revert
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