'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios'; // <--- ADDED THIS

export interface PublicProduct {
    id: string;
    name: string;
    slug: string;
    images: string[];
    variants?: { id: string; price: any; size: string; stock?: number }[];
    selectedVariant?: { id: string; price: any; size: string; stock?: number };
    discountPercentage?: number;
    stock?: number;
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const deduplicateItems = (items: CartItem[]): CartItem[] => {
        const itemMap = new Map<string, CartItem>();
        items.forEach(item => {
            if (itemMap.has(item.id)) {
                const existing = itemMap.get(item.id)!;
                itemMap.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
            } else {
                itemMap.set(item.id, item);
            }
        });
        return Array.from(itemMap.values());
    };

    // 1. Initialize Cart (Load Local + Fetch Server)
    useEffect(() => {
        const initializeCart = async () => {
            let localItems: CartItem[] = [];
            
            // Load Local Storage
            try {
                const storedCart = localStorage.getItem('CelciusCart');
                if (storedCart) {
                    const parsed = JSON.parse(storedCart);
                    if (Array.isArray(parsed)) {
                        localItems = deduplicateItems(parsed);
                    }
                }
            } catch (error) {
                console.error("Failed to parse cart from localStorage", error);
            }

            // Load Server Cart
            try {
                const res = await axios.get('/api/v1/cart', { withCredentials: true });
                
                if (res.data && Array.isArray(res.data.cartItems)) {
                    setIsLoggedIn(true);
                    const serverItems: CartItem[] = res.data.cartItems;

                    // FIX: Deduplicate server items to prevent "Duplicate Key" errors
                    const uniqueServerItems = deduplicateItems(serverItems);

                    if (uniqueServerItems.length > 0) {
                        setCartItems(uniqueServerItems);
                    } else {
                        if (localItems.length > 0) {
                            setCartItems(localItems); 
                        } else {
                            setCartItems([]);
                        }
                    }
                } else {
                    setIsLoggedIn(false);
                    setCartItems(localItems);
                }
            } catch (error) {
                // If 401 or error, assume guest
                setIsLoggedIn(false);
                setCartItems(localItems);
            }
            
            setIsLoaded(true);
        };

        initializeCart();
    }, []);

    // 2. Save to LocalStorage on change
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('CelciusCart', JSON.stringify(cartItems));
    }, [cartItems, isLoaded]);

    // 3. Add to Cart (Optimistic + API)
    const addToCart = useCallback(async(product: PublicProduct, quantity: number) => {
        setCartItems(prevItems => {
            const uniqueCartId = product.selectedVariant 
                ? `${product.id}-${product.selectedVariant.id}` 
                : product.id;

            const maxStock = product.selectedVariant?.stock ?? product.stock ?? 0;

            // Calculate current quantity including "ghost" items
            const currentTotalQty = prevItems
                .filter(item => 
                    item.id === uniqueCartId || 
                    (item.originalProductId === product.id && (!item.selectedVariant || item.selectedVariant.id === product.selectedVariant?.id))
                )
                .reduce((sum, item) => sum + item.quantity, 0);

            if (currentTotalQty + quantity > maxStock) {
                if (maxStock === 0) {
                    alert("Sorry, this item is currently out of stock.");
                } else {
                    alert(`Sorry, you cannot add more. Only ${maxStock} unit(s) available.`);
                }
                return prevItems;
            }

            const existingItemIndex = prevItems.findIndex(item => item.id === uniqueCartId);

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            } else {
                return [...prevItems, { 
                    ...product, 
                    id: uniqueCartId, 
                    originalProductId: product.id, 
                    quantity 
                }];
            }
        });

        if (isLoggedIn) {
            try {
                await axios.post('/api/v1/cart', {
                    productId: product.id,
                    variantId: product.selectedVariant?.id,
                    quantity: quantity
                });
            } catch (error) { console.error("Add to cart failed", error); }
        }
    }, [isLoggedIn]);

    // 4. Remove from Cart
    const removeFromCart = useCallback(async (cartItemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));

        if (isLoggedIn) {
            try {
                await axios.delete('/api/v1/cart', { data: { productId: cartItemId } });
            } catch (error) { console.error("Remove failed", error); }
        }
    }, [isLoggedIn]);
    
    // 5. Update Quantity
    const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }

        const item = cartItems.find(i => i.id === cartItemId);
        if (!item) return;

        setCartItems(prevItems =>
            prevItems.map(i => i.id === cartItemId ? { ...i, quantity } : i)
        );

        if (isLoggedIn) {
            try {
                await axios.put('/api/v1/cart', {
                    productId: item.originalProductId || item.id,
                    variantId: item.selectedVariant?.id,
                    quantity: quantity
                });
            } catch (error) { console.error("Update quantity failed", error); }
        }
    }, [cartItems, isLoggedIn, removeFromCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('CelciusCart');
        }
    }, []);

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const cartTotal = cartItems.reduce((total, item) => { 
        const price = item.selectedVariant?.price || item.variants?.[0]?.price || item.price || 0;
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
        cartCount,
        cartTotal,
        isLoggedIn,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};