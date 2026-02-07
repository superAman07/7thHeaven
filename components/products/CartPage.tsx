'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const CartPageComponent: React.FC = () => {
    // FIX: Removed 'saveCart' as it is no longer needed (updates are real-time)
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const router = useRouter();
    
    const [couponCode, setCouponCode] = useState('');
    const [unavailableItems, setUnavailableItems] = useState<Set<string>>(new Set());
    const [validating, setValidating] = useState(true);

    useEffect(() => {
        const validateCart = async () => {
            if (cartItems.length === 0) {
                setValidating(false);
                return;
            }
            
            const productIds = [...new Set(cartItems.map(item => 
                item.originalProductId || item.id.split('-')[0]
            ))];
            
            try {
                const res = await axios.post('/api/v1/cart/validate', { productIds });
                if (res.data.success && res.data.invalidItems?.length > 0) {
                    const invalidSet = new Set<string>(res.data.invalidItems.map((i: any) => i.productId));
                    setUnavailableItems(invalidSet);
                }
            } catch (err) {
                console.error('Validation failed', err);
            }
            setValidating(false);
        };
        
        validateCart();
    }, [cartItems]);


    const subTotal = cartTotal;
    const shippingCost = 0;
    const grandTotal = subTotal + shippingCost;

    const handleIncrement = (id: string) => {
        const item = cartItems.find(item => item.id === id);
        if (item) {
            // FIX: Robust stock checking logic
            const maxStock = item.selectedVariant?.stock ?? item.stock ?? 0;

            if (item.quantity >= maxStock) { 
                if (maxStock === 0) {
                    alert("Sorry, this item is currently out of stock.");
                } else {
                    alert(`Sorry, we only have ${maxStock} unit(s) available in stock.`);
                }
                return;
            }
            
            updateQuantity(id, item.quantity + 1);
        }
    };

    const handleDecrement = (id: string) => {
        const item = cartItems.find(item => item.id === id);
        if (item && item.quantity > 1) updateQuantity(id, item.quantity - 1);
    };

    const handleRemove = (id: string) => {
        // FIX: Just call context function. It handles API calls internally now.
        removeFromCart(id);
    };

    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        
        // Check for unavailable items
        if (unavailableItems.size > 0) {
            const confirmed = window.confirm(
                "Some items in your cart are no longer available. " +
                "They will be removed before checkout. Continue?"
            );
            if (confirmed) {
                // Remove unavailable items
                cartItems.forEach(item => {
                    const baseId = item.originalProductId || item.id.split('-')[0];
                    if (unavailableItems.has(baseId)) {
                        removeFromCart(item.id);
                    }
                });
                setTimeout(() => router.push('/cart/checkout'), 100);
            }
            return;
        }
        
        router.push('/cart/checkout');
    };

    return (
        <>
            {/* Page Banner Section Start */}
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
                                
                                {/* Breadcrumbs: Bottom-Left */}
                                <div className="order-2 order-md-1 mt-2 mt-md-0">
                                    <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                                        <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                                        <li className="text-white/80">Cart</li>
                                    </ul>
                                </div>

                                {/* Title: Bottom-Right */}
                                <div className="order-1 order-md-2 text-center text-md-end">
                                    <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                        Shopping Cart
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cart section start */}
            <div className="cart-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-70 pb-lg-50 pb-md-40 pb-sm-30 pb-xs-20">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {/* Desktop Cart Table */}
                            <div className="cart-table table-responsive mb-30 d-none d-md-block">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="pro-thumbnail">Image</th>
                                            <th className="pro-title">Product</th>
                                            <th className="pro-price">Price</th>
                                            <th className="pro-quantity">Quantity</th>
                                            <th className="pro-subtotal">Total</th>
                                            <th className="pro-remove">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map((item) => {
                                            const baseProductId = item.originalProductId || item.id.split('-')[0];
                                            const isUnavailable = unavailableItems.has(baseProductId);
                                            const price = item.selectedVariant?.price || item.variants?.[0]?.price || 0;
                                            const discount = item.discountPercentage || 0;
                                            const currentPrice = Math.round(price * (1 - discount / 100));

                                            return (
                                                <tr key={item.id}>
                                                    <td className="pro-thumbnail">
                                                        <Link href={`/products/${item.slug}`}>
                                                            <img src={item.images[0]} alt={item.name} />
                                                        </Link>
                                                    </td>
                                                    <td className="pro-title">
                                                        <Link href={`/products/${item.slug}`}>{item.name}</Link>
                                                        {isUnavailable && (
                                                            <span style={{
                                                                display: 'inline-block',
                                                                background: '#dc3545',
                                                                color: 'white',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                marginLeft: '8px',
                                                                fontWeight: '600'
                                                            }}>
                                                                UNAVAILABLE
                                                            </span>
                                                        )}
                                                        {item.selectedVariant && (
                                                            <div style={{ fontSize: '13px', color: '#777', marginTop: '4px' }}>
                                                                Size: {item.selectedVariant.size}ml
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="pro-price"><span>Rs.{currentPrice.toFixed(2)}</span></td>
                                                    <td className="pro-quantity">
                                                        <div className="pro-qty">
                                                            <span className="dec qtybtn cursor-pointer pt-1" onClick={() => handleDecrement(item.id)}>-</span>
                                                            <input type="text" value={item.quantity} readOnly />
                                                            <span className="inc qtybtn cursor-pointer pt-1" onClick={() => handleIncrement(item.id)}>+</span>
                                                        </div>
                                                    </td>
                                                    <td className="pro-subtotal"><span>Rs.{(currentPrice * item.quantity).toFixed(2)}</span></td>
                                                    <td className="pro-remove">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}><i className="fa fa-trash-o"></i></a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {cartItems.length === 0 && (
                                            <tr><td colSpan={6} className="text-center p-4">Your cart is empty. <Link href="/collections">Continue shopping</Link></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cart Cards */}
                            <div className="d-block d-md-none mb-30">
                                {cartItems.length === 0 ? (
                                    <div className="text-center p-4">
                                        Your cart is empty. <Link href="/collections">Continue shopping</Link>
                                    </div>
                                ) : (
                                    cartItems.map((item) => {
                                        const baseProductId = item.originalProductId || item.id.split('-')[0];
                                        const isUnavailable = unavailableItems.has(baseProductId);
                                        const price = item.selectedVariant?.price || item.variants?.[0]?.price || 0;
                                        const discount = item.discountPercentage || 0;
                                        const currentPrice = Math.round(price * (1 - discount / 100));

                                        return (
                                            <div 
                                                key={item.id} 
                                                style={{ 
                                                    display: 'flex', 
                                                    gap: '15px', 
                                                    padding: '15px', 
                                                    borderBottom: '1px solid #eee',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Image */}
                                                <Link href={`/products/${item.slug}`} style={{ flexShrink: 0 }}>
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.name}
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                </Link>
                                                
                                                {/* Product Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Link 
                                                        href={`/products/${item.slug}`} 
                                                        style={{ 
                                                            fontWeight: '600', 
                                                            color: '#333', 
                                                            textDecoration: 'none',
                                                            display: 'block',
                                                            marginBottom: '4px',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {item.name}
                                                        {isUnavailable && (
                                                            <span style={{
                                                                display: 'inline-block',
                                                                background: '#dc3545',
                                                                color: 'white',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '10px',
                                                                marginLeft: '6px',
                                                                fontWeight: '600',
                                                                verticalAlign: 'middle'
                                                            }}>
                                                                UNAVAILABLE
                                                            </span>
                                                        )}
                                                    </Link>
                                                    {item.selectedVariant && (
                                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#777' }}>
                                                            Size: {item.selectedVariant.size}ml
                                                        </p>
                                                    )}
                                                    <p style={{ margin: '0 0 8px 0', color: '#B6902E', fontWeight: '600', fontSize: '14px' }}>
                                                        Rs.{currentPrice.toFixed(2)}
                                                    </p>
                                                    
                                                    {/* Quantity Controls */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px'
                                                        }}>
                                                            <button 
                                                                onClick={() => handleDecrement(item.id)}
                                                                style={{ 
                                                                    width: '30px', 
                                                                    height: '30px', 
                                                                    border: 'none', 
                                                                    background: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '16px'
                                                                }}
                                                            >-</button>
                                                            <span style={{ padding: '0 10px', fontSize: '14px' }}>{item.quantity}</span>
                                                            <button 
                                                                onClick={() => handleIncrement(item.id)}
                                                                style={{ 
                                                                    width: '30px', 
                                                                    height: '30px', 
                                                                    border: 'none', 
                                                                    background: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '16px'
                                                                }}
                                                            >+</button>
                                                        </div>
                                                        <span style={{ fontSize: '13px', color: '#666' }}>
                                                            = Rs.{(currentPrice * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => handleRemove(item.id)}
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
                                    })
                                )}
                            </div>

                            <div className="row">
                                <div className="col-lg-6 col-12 mb-5">
                                    {/* Discount Coupon */}
                                    <div className="discount-coupon">
                                        <h4>Discount Coupon Code</h4>
                                        <form action="#">
                                            <div className="row">
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <button className="btn">Apply Code</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Cart Summary */}
                                <div className="col-lg-6 col-12 mb-30 d-flex">
                                    <div className="cart-summary">
                                        <div className="cart-summary-wrap">
                                            <h4>Cart Summary</h4>
                                            <p>Sub Total <span>Rs.{subTotal.toFixed(2)}</span></p>
                                            <p>Shipping Cost <span>Rs.{shippingCost.toFixed(2)}</span></p>
                                            <p>Discount <span>- Rs.0.00</span></p>
                                            <h2>Grand Total <span>Rs.{Math.round(grandTotal.toFixed(2))}</span></h2>
                                        </div>
                                        <div className="cart-summary-button">
                                            <button className="btn" onClick={handleProceedToCheckout}>Checkout</button>
                                            <button className="btn" onClick={() => { if (window.confirm('Clear cart?')) clearCart(); }}>Clear Cart</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartPageComponent;