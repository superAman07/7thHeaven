'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const CartPageComponent: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, saveCart } = useCart();
    const router = useRouter();
    
    const [couponCode, setCouponCode] = useState('');

    const subTotal = cartTotal;
    const shippingCost = 0;
    const grandTotal = subTotal + shippingCost;

    const handleIncrement = (id: string) => {
        const item = cartItems.find(item => item.id === id);
        if (item) updateQuantity(id, item.quantity + 1);
    };

    const handleDecrement = (id: string) => {
        const item = cartItems.find(item => item.id === id);
        if (item && item.quantity > 1) updateQuantity(id, item.quantity - 1);
    };

    const handleRemove = async (id: string) => {
        try {
            await axios.delete('/api/v1/cart', { 
                data: { productId: id },
                withCredentials: true 
            });
            removeFromCart(id);

        } catch (error) {
            console.error("Failed to remove item from cart", error);
            alert("Error removing item. Please try again.");
        }
    };

    const handleProceedToCheckout = async () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        await saveCart();
        router.push('/cart/checkout');
    };

    return (
        <>
            {/* Page Banner Section Start */}
            <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="page-banner text-center">
                                <h1>Shopping Cart</h1>
                                <ul className="page-breadcrumb">
                                    <li><Link href="/">Home</Link></li>
                                    <li>Cart</li>
                                </ul>
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
                            {/* Cart Table */}
                            <div className="cart-table table-responsive mb-30">
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
                                            const price = item.selectedVariant?.price || item.variants?.[0]?.price || 0;
                                            const discount = item.discountPercentage || 0;
                                            const currentPrice = price * (1 - discount / 100);

                                            return (
                                                <tr key={item.id}>
                                                    <td className="pro-thumbnail">
                                                        <Link href={`/products/${item.slug}`}>
                                                            <img src={item.images[0]} alt={item.name} />
                                                        </Link>
                                                    </td>
                                                    <td className="pro-title">
                                                        <Link href={`/products/${item.slug}`}>{item.name}</Link>
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
                                            <h2>Grand Total <span>Rs.{grandTotal.toFixed(2)}</span></h2>
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