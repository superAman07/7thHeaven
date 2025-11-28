'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface WishlistContextType {
    wishlistItems: string[]; // Stores Product IDs
    toggleWishlist: (productId: string) => Promise<void>;
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
                // We only store IDs for efficient checking
                const ids = res.data.items.map((item: any) => item.product.id);
                setWishlistItems(ids);
            }
        } catch (error) {
            // User might not be logged in, ignore error
        }
    };

    const toggleWishlist = async (productId: string) => {
        const isIn = wishlistItems.includes(productId);
        
        // Optimistic UI Update (Immediate feedback)
        if (isIn) {
            setWishlistItems(prev => prev.filter(id => id !== productId));
            toast.success('Removed from wishlist');
            try {
                await axios.delete(`/api/v1/wishlist/${productId}`);
            } catch (error) {
                setWishlistItems(prev => [...prev, productId]); // Revert on fail
                toast.error('Failed to remove');
            }
        } else {
            setWishlistItems(prev => [...prev, productId]);
            toast.success('Added to wishlist');
            try {
                await axios.post('/api/v1/wishlist', { productId });
            } catch (error: any) {
                setWishlistItems(prev => prev.filter(id => id !== productId)); // Revert on fail
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