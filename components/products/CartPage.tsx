'use client'
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';
import axios from 'axios';

const CartPageComponent: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, saveCart, isLoggedIn } = useCart();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [shippingCountry, setShippingCountry] = useState('Bangladesh');
    const [shippingCity, setShippingCity] = useState('Dhaka');
    const [zipCode, setZipCode] = useState('');

    // Coupon & Membership State
    const [couponCode, setCouponCode] = useState('');
    const [is7thHeavenOptIn, setIs7thHeavenOptIn] = useState(false);

    // Admin Setting (Placeholder)
    const MIN_PURCHASE_FOR_MEMBERSHIP = 2000;

    // Fetch user data if logged in
    useEffect(() => {
        const fetchUserData = async () => {
            if (isLoggedIn) {
                try {
                    const { data } = await axios.get('/api/v1/auth/me', {
                        withCredentials: true
                    }); if (data.success && data.user) {
                        const { user } = data;
                        setFullName(user.fullName || '');
                        setPhone(user.phone || '');
                        setEmail(user.email || '');
                        setFullAddress(user.fullAddress || '');
                        setCity(user.city || '');
                        setState(user.state || '');
                        setPincode(user.pincode || '');
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                }
            }
        };
        fetchUserData();
    }, [isLoggedIn]);

    const subTotal = cartTotal;
    const shippingCost = 0;
    const grandTotal = subTotal + shippingCost;

    const handleIncrement = (id: string) => {
        const item = cartItems.find(item => item.id === id);
        if (item) {
            updateQuantity(id, item.quantity + 1);
        }
    };

    const handleDecrement = (id: string) => {
        const item = cartItems.find(item => item.id === id);
        if (item && item.quantity > 1) {
            updateQuantity(id, item.quantity - 1);
        }
    };

    const handleRemove = (id: string) => {
        removeFromCart(id);
    };

    const handleCheckout = async () => {
        await saveCart();
        const payload: any = {
            items: cartItems.map(item => {
                const price = item.variants?.[0]?.price || 0;
                const discount = item.discountPercentage || 0;
                const currentPrice = price * (1 - discount / 100);

                return {
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: currentPrice,
                    totalPrice: currentPrice * item.quantity
                };
            }),
            currency: 'Rs',
            summary: {
                subTotal,
                shippingCost,
                grandTotal
            },
            shippingDetails: {
                country: shippingCountry,
                city: shippingCity,
                zipCode
            },
            couponCode: couponCode || undefined
        };

        console.log('Checkout Payload:', payload);
        alert('Checkout Payload generated! Check console.');
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
            {/* Page Banner Section End */}

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
                                            // Calculate price with discount (same as ProductDetailsClient)
                                            const price = item.variants?.[0]?.price || 0;
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
                                                    </td>
                                                    <td className="pro-price">
                                                        <span>Rs.{currentPrice.toFixed(2)}</span>
                                                    </td>
                                                    <td className="pro-quantity">
                                                        <div className="pro-qty">
                                                            {/* Custom Quantity Buttons - same UI, different handlers */}
                                                            <span className="dec qtybtn cursor-pointer pt-1" onClick={() => handleDecrement(item.id)}>-</span>
                                                            <input type="text" value={item.quantity} readOnly />
                                                            <span className="inc qtybtn cursor-pointer pt-1" onClick={() => handleIncrement(item.id)}>+</span>
                                                        </div>
                                                    </td>
                                                    <td className="pro-subtotal">
                                                        <span>Rs.{(currentPrice * item.quantity).toFixed(2)}</span>
                                                    </td>
                                                    <td className="pro-remove">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}>
                                                            <i className="fa fa-trash-o"></i>
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {cartItems.length === 0 && (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                                    Your cart is empty. <Link href="/collections">Continue shopping</Link>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="row">
                                <div className="col-lg-6 col-12 mb-5">
                                    {/* Calculate Shipping - Keep same UI */}
                                    <div className="calculate-shipping">
                                        <h4>Shipping Details</h4>
                                        <form action="#">
                                            <div className="row">
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                                </div>
                                                <div className="col-12 mb-25">
                                                    <input type="email" placeholder="Email Address (Optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
                                                </div>
                                                <div className="col-12 mb-25">
                                                    <input type="text" placeholder="Full Address (House No, Street, Area)" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="Pincode / Zip" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    {/* Discount Coupon - Keep same UI */}
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

                                {/* Cart Summary - Keep same UI */}
                                <div className="col-lg-6 col-12 mb-30 d-flex">
                                    <div className="cart-summary">
                                        <div className="cart-summary-wrap">
                                            <h4>Cart Summary</h4>
                                            <p>Sub Total <span>Rs.{subTotal.toFixed(2)}</span></p>
                                            <p>Shipping Cost <span>Rs.{shippingCost.toFixed(2)}</span></p>
                                            <h2>Grand Total <span>Rs.{grandTotal.toFixed(2)}</span></h2>
                                        </div>
                                        {subTotal >= MIN_PURCHASE_FOR_MEMBERSHIP && (
                                            <div className="mt-3 p-3" style={{ backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '5px' }}>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="heavenOptIn"
                                                        checked={is7thHeavenOptIn}
                                                        onChange={(e) => setIs7thHeavenOptIn(e.target.checked)}
                                                        style={{ width: '18px', height: '18px', marginTop: '3px' }}
                                                    />
                                                    <label className="form-check-label ms-2" htmlFor="heavenOptIn" style={{ fontSize: '15px', fontWeight: 500 }}>
                                                        Do you want to be part of 7th Heaven?
                                                    </label>
                                                </div>
                                                <p className="text-muted mt-1" style={{ fontSize: '13px', marginLeft: '28px' }}>
                                                    Unlock exclusive benefits and referral rewards.
                                                </p>
                                            </div>
                                        )}
                                        <div className="cart-summary-button">
                                            <button className="btn" onClick={handleCheckout}>Checkout</button>
                                            <button className="btn" onClick={() => clearCart()}>Clear Cart</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Cart section end */}
        </>
    );
};

export default CartPageComponent;