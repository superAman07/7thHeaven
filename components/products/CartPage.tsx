'use client'
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../CartContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CartPageComponent: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, saveCart, isLoggedIn } = useCart();

    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [isFetchingPincode, setIsFetchingPincode] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [is7thHeavenOptIn, setIs7thHeavenOptIn] = useState(false);
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
    const [minPurchaseLimit, setMinPurchaseLimit] = useState(0);

    useEffect(() => {
        axios.get('/api/v1/settings')
            .then(res => {
                if (res.data.success) {
                    setMinPurchaseLimit(res.data.value);
                }
            })
            .catch(err => console.error("Failed to fetch settings", err));
    }, []);
    // 1. Fetch User Data
    useEffect(() => {
        const fetchUserData = async () => {
            if (isLoggedIn) {
                try {
                    const { data } = await axios.get('/api/v1/auth/me', {
                        withCredentials: true
                    });
                    if (data.success && data.user) {
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

    // 2. Auto-fetch City/State from Pincode
    useEffect(() => {
        const fetchLocationFromPincode = async () => {
            // Only fetch if pincode is valid (6 digits for India)
            if (pincode.length === 6) {
                setIsFetchingPincode(true);
                try {
                    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
                    const data = response.data;

                    if (data && data[0].Status === 'Success') {
                        const postOffice = data[0].PostOffice[0];
                        setCity(postOffice.District);
                        setState(postOffice.State);
                    }
                } catch (error) {
                    console.error("Failed to fetch pincode details", error);
                } finally {
                    setIsFetchingPincode(false);
                }
            }
        };

        // Debounce slightly to avoid API spam while typing
        const timeoutId = setTimeout(() => {
            fetchLocationFromPincode();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [pincode]);

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
        // Basic Validation
        if (!fullName || !phone || !fullAddress || !city || !pincode) {
            alert("Please fill in all required shipping details.");
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        setIsProcessingCheckout(true);
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
                fullName,
                phone,
                email,
                fullAddress,
                city,
                state,
                pincode,
                country: 'India'
            },
            couponCode: couponCode || undefined,
            mlmOptIn: is7thHeavenOptIn
        };

        try {
            // This is where we will create the order and get an orderId
            // For now, we will simulate this and redirect.
            console.log('Creating order with payload:', payload);

            // ** FUTURE IMPLEMENTATION: **
            // const { data } = await axios.post('/api/v1/orders', payload, { withCredentials: true });
            // if (data.success) {
            //   router.push(`/checkout/payment?orderId=${data.orderId}`);
            // } else {
            //   alert(`Error: ${data.error}`);
            // }

            alert('Order created (simulation)! Redirecting to payment page...');
            // We will create a placeholder order ID for now
            const simulatedOrderId = `ORD-${Date.now()}`;
            router.push(`/checkout/payment?orderId=${simulatedOrderId}`);

        } catch (error) {
            console.error("Checkout failed", error);
            alert("There was an error during checkout. Please try again.");
        } finally {
            setIsProcessingCheckout(false);
        }
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
                                    {/* Calculate Shipping */}
                                    <div className="calculate-shipping">
                                        <h4>Shipping Details</h4>
                                        <form action="#">
                                            <div className="row">
                                                <div className="col-md-6 col-12 mb-25">
                                                    {/* Read-only if logged in (assuming name is fixed) */}
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        readOnly={isLoggedIn && !!fullName}
                                                        className={isLoggedIn && !!fullName ? "bg-light" : ""}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input
                                                        type="text"
                                                        placeholder="Phone Number"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        readOnly={isLoggedIn && !!phone}
                                                        className={isLoggedIn && !!phone ? "bg-light" : ""}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-12 mb-25">
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address (Optional)"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        readOnly={isLoggedIn && !!email}
                                                        className={isLoggedIn && !!email ? "bg-light" : ""}
                                                    />
                                                </div>
                                                <div className="col-12 mb-25">
                                                    <input type="text" placeholder="Full Address (House No, Street, Area)" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input
                                                        type="text"
                                                        placeholder="Pincode / Zip"
                                                        value={pincode}
                                                        onChange={(e) => setPincode(e.target.value)}
                                                        maxLength={6}
                                                        required
                                                    />
                                                    {isFetchingPincode && <small className="text-muted">Fetching location...</small>}
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-25">
                                                    <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
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
                                        {subTotal > 0 && (
                                            subTotal >= minPurchaseLimit ? (
                                                <div className="mt-3 p-3" style={{
                                                    backgroundColor: '#ddb040',
                                                    color: '#000',
                                                    border: '1px solid #cca33b',
                                                    borderRadius: '5px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                }}>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="heavenOptIn"
                                                            checked={is7thHeavenOptIn}
                                                            onChange={(e) => setIs7thHeavenOptIn(e.target.checked)}
                                                            style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer' }}
                                                        />
                                                        <label className="form-check-label ms-2" htmlFor="heavenOptIn" style={{ fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
                                                            Join 7th Heaven Club?
                                                        </label>
                                                    </div>
                                                    <p className="mt-1 mb-0" style={{ fontSize: '14px', marginLeft: '28px', fontWeight: 500 }}>
                                                        Unlock exclusive benefits and referral rewards!
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mt-3 p-3 text-center" style={{
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px dashed #ddb040',
                                                    borderRadius: '5px'
                                                }}>
                                                    <p className="mb-1" style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>
                                                        Want to join the <strong>7th Heaven Club</strong>?
                                                    </p>
                                                    <p className="mb-0" style={{ fontSize: '13px', color: '#ddb040', fontWeight: 700 }}>
                                                        Add items worth Rs.{(minPurchaseLimit - subTotal).toFixed(2)} more to unlock membership!
                                                    </p>
                                                </div>
                                            )
                                        )}
                                        <div className="cart-summary-button">
                                            <button
                                                className="btn"
                                                onClick={handleCheckout}
                                                disabled={isProcessingCheckout}
                                            >
                                                {isProcessingCheckout ? 'Processing...' : 'Checkout'}
                                            </button>
                                            <button className="btn" onClick={() => {
                                                if (window.confirm('Are you sure you want to remove all items from your cart?')) {
                                                    clearCart();
                                                }
                                            }}>Clear Cart</button>
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