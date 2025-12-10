'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface PublicProduct {
    id: string;
    name: string;
    slug: string;
    images: string[];
    variants?: { id: string; price: any; size: string }[];
    selectedVariant?: { id: string; price: any; size: string };
    discountPercentage?: number;
    [key: string]: any;
}

interface CartItem extends PublicProduct {
    quantity: number;
    originalProductId?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: PublicProduct, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    saveCart: () => Promise<void>;
    cartCount: number;
    cartTotal: number;
    isLoggedIn: boolean; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

const getLocalToken = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token === 'null' || token === 'undefined') return null;
        return token; 
    }
    return null;
};
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const syncCartWithServer = useCallback(async (items: CartItem[]) => {
        if (!isLoggedIn) return;

        try {
            const payload = items.map(item => ({
                productId: item.originalProductId || item.id,
                variantId: item.selectedVariant?.id,
                quantity: item.quantity
            }));

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            const token = getLocalToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            await fetch('/api/v1/cart', {
                method: 'POST',
                headers,
                body: JSON.stringify({ cartItems: payload }),
                credentials: 'include'
            });
        } catch (error) {
            console.error("Failed to sync cart with server", error);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const initializeCart = async () => {
            let localItems: CartItem[] = [];
            
            // 1. Load Local Storage Items
            try {
                const storedCart = localStorage.getItem('CelciusCart');
                if (storedCart) {
                    localItems = JSON.parse(storedCart);
                }
            } catch (error) {
                console.error("Failed to parse cart from localStorage", error);
            }

            try {
                const headers: HeadersInit = {};
                const token = getLocalToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch('/api/v1/cart', { headers, credentials: 'include' });

                if (res.ok) {
                    setIsLoggedIn(true);
                    
                    const data = await res.json();
                    const serverItems: CartItem[] = data.cartItems || [];

                    const mergedMap = new Map<string, CartItem>();
                    serverItems.forEach(item => mergedMap.set(item.id, item));
                    localItems.forEach(item => mergedMap.set(item.id, item)); // Local wins conflicts

                    const mergedItems = Array.from(mergedMap.values());
                    setCartItems(mergedItems);
                    
                    if (localItems.length > 0) {
                        // We can't use syncCartWithServer here because isLoggedIn state 
                        // might not have updated in the closure yet.
                        // So we trigger a manual sync or rely on the effect below.
                    }
                } else {
                    // FAIL: User is guest
                    setIsLoggedIn(false);
                    setCartItems(localItems);
                }
            } catch (error) {
                console.error("Error fetching server cart", error);
                setCartItems(localItems);
                setIsLoggedIn(false);
            }
            
            setIsLoaded(true);
        };

        initializeCart();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('CelciusCart', JSON.stringify(cartItems));
        if (isLoggedIn) {
            const timeoutId = setTimeout(() => {
                syncCartWithServer(cartItems);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [cartItems, isLoaded, isLoggedIn, syncCartWithServer]);

    const addToCart = useCallback((product: PublicProduct, quantity: number) => {
        let message = "Added to cart";
        setCartItems(prevItems => {
            const uniqueCartId = product.selectedVariant 
                ? `${product.id}-${product.selectedVariant.id}` 
                : product.id;

            const existingItemIndex = prevItems.findIndex(item => item.id === uniqueCartId);

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                message = "Cart updated";
                return newItems;
            }
            return [...prevItems, { 
                ...product, 
                id: uniqueCartId,
                originalProductId: product.id, 
                quantity 
            }];
        });
        toast.success(message);
    }, []);

   const removeFromCart = useCallback((cartItemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    }, []);

    const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === cartItemId ? { ...item, quantity } : item
                )
            );
        }
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cartItems');
        }
    }, []);

    const saveCart = async () => {
        if (isLoggedIn && cartItems.length > 0) {
            await syncCartWithServer(cartItems);
        }
    };

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const cartTotal = cartItems.reduce((total, item) => { 
        const price = item.selectedVariant?.price || item.variants?.[0]?.price || 0;
        const discount = item.discountPercentage || 0;
        const currentPrice = price * (1 - discount / 100);
        return total + currentPrice * item.quantity;
    }, 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveCart,
        cartCount,
        cartTotal,
        isLoggedIn,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};