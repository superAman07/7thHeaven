'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CheckoutPageComponent: React.FC = () => {
    const { cartItems, cartTotal, isLoggedIn } = useCart();
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState('check');
    const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Billing State
    const [billing, setBilling] = useState({
        firstName: '', lastName: '', email: '', phone: '', company: '',
        address1: '', address2: '', country: 'India', city: '', state: '', zip: ''
    });

    // Shipping State
    const [shipping, setShipping] = useState({
        firstName: '', lastName: '', email: '', phone: '', company: '',
        address1: '', address2: '', country: 'India', city: '', state: '', zip: ''
    });

    // 1. Fetch User Data on Load
    useEffect(() => {
        const fetchUserData = async () => {
            if (isLoggedIn) {
                try {
                    const { data } = await axios.get('/api/v1/auth/me', { withCredentials: true });
                    if (data.success && data.user) {
                        const u = data.user;
                        const names = (u.fullName || '').split(' ');
                        const firstName = names[0] || '';
                        const lastName = names.slice(1).join(' ') || '';

                        setBilling(prev => ({
                            ...prev,
                            firstName,
                            lastName,
                            email: u.email || '',
                            phone: u.phone || '',
                            address1: u.fullAddress || '',
                            city: u.city || '',
                            state: u.state || '',
                            zip: u.pincode || ''
                        }));
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                }
            }
        };
        fetchUserData();
    }, [isLoggedIn]);

    // 2. Auto-fetch City/State from Pincode (Billing)
    useEffect(() => {
        if (billing.zip.length === 6) {
            axios.get(`https://api.postalpincode.in/pincode/${billing.zip}`)
                .then(res => {
                    if (res.data && res.data[0].Status === 'Success') {
                        const po = res.data[0].PostOffice[0];
                        setBilling(prev => ({ ...prev, city: po.District, state: po.State }));
                    }
                })
                .catch(err => console.error(err));
        }
    }, [billing.zip]);

    // Animation Helper
    const getSlideStyle = (method: string) => {
        const isOpen = paymentMethod === method;
        return {
            maxHeight: isOpen ? '150px' : '0',
            opacity: isOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.4s ease-in-out, opacity 0.4s ease-in-out, padding 0.4s ease-in-out',
            padding: isOpen ? '10px 0' : '0',
            margin: isOpen ? '10px 0 0 0' : '0',
            fontSize: '14px',
            fontFamily: 'inherit',
            lineHeight: '1.6',
            color: '#666',
            fontWeight: '400',
            textAlign: 'left' as const,
            backgroundColor: isOpen ? '#f8f9fa' : 'transparent',
            borderRadius: isOpen ? '4px' : '0',
            paddingLeft: isOpen ? '15px' : '0',
            paddingRight: isOpen ? '15px' : '0',
        } as React.CSSProperties;
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!billing.firstName || !billing.phone || !billing.address1 || !billing.zip) {
            alert("Please fill in all required billing fields.");
            return;
        }

        setIsProcessing(true);

        const finalShipping = shipToDifferentAddress ? shipping : billing;

        const payload = {
            items: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
            })),
            shippingDetails: {
                fullName: `${finalShipping.firstName} ${finalShipping.lastName}`,
                phone: finalShipping.phone,
                email: finalShipping.email,
                fullAddress: `${finalShipping.address1} ${finalShipping.address2}`,
                city: finalShipping.city,
                state: finalShipping.state,
                pincode: finalShipping.zip,
                country: finalShipping.country
            },
            paymentMethod
        };

        try {
            console.log("Placing Order:", payload);
            // Simulate API Call
            // const { data } = await axios.post('/api/v1/orders', payload);

            alert("Order Placed Successfully (Simulation)! Redirecting to payment...");
            const simulatedOrderId = `ORD-${Date.now()}`;
            router.push(`/checkout/payment?orderId=${simulatedOrderId}`);

        } catch (error) {
            console.error("Order failed", error);
            alert("Failed to place order.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div id="main-wrapper">
            {/* Page Banner */}
            <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="page-banner text-center">
                                <h1>Checkout</h1>
                                <ul className="page-breadcrumb">
                                    <li><Link href="/">Home</Link></li>
                                    <li>Checkout</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Section */}
            <div className="checkout-section section pt-100 pb-70">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <form action="#" className="checkout-form" onSubmit={handlePlaceOrder}>
                                <div className="row row-40">
                                    <div className="col-lg-7">
                                        {/* Billing Address */}
                                        <div id="billing-form" className="mb-10">
                                            <h4 className="checkout-title">Billing Address</h4>
                                            <div className="row">
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>First Name*</label>
                                                    <input type="text" placeholder="First Name" value={billing.firstName} onChange={e => setBilling({ ...billing, firstName: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Last Name*</label>
                                                    <input type="text" placeholder="Last Name" value={billing.lastName} onChange={e => setBilling({ ...billing, lastName: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Email Address*</label>
                                                    <input type="email" placeholder="Email Address" value={billing.email} onChange={e => setBilling({ ...billing, email: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Phone no*</label>
                                                    <input type="text" placeholder="Phone number" value={billing.phone} onChange={e => setBilling({ ...billing, phone: e.target.value })} required />
                                                </div>
                                                <div className="col-12 mb-20">
                                                    <label>Company Name</label>
                                                    <input type="text" placeholder="Company Name" value={billing.company} onChange={e => setBilling({ ...billing, company: e.target.value })} />
                                                </div>
                                                <div className="col-12 mb-20">
                                                    <label>Address*</label>
                                                    <input type="text" placeholder="Address line 1" className="mb-2" value={billing.address1} onChange={e => setBilling({ ...billing, address1: e.target.value })} required />
                                                    <input type="text" placeholder="Address line 2" value={billing.address2} onChange={e => setBilling({ ...billing, address2: e.target.value })} />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Country*</label>
                                                    <select className="nice-select" value={billing.country} onChange={e => setBilling({ ...billing, country: e.target.value })}>
                                                        <option value="India">India</option>
                                                        <option value="Bangladesh">Bangladesh</option>
                                                        <option value="China">China</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Town/City*</label>
                                                    <input type="text" placeholder="Town/City" value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>State*</label>
                                                    <input type="text" placeholder="State" value={billing.state} onChange={e => setBilling({ ...billing, state: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Zip Code*</label>
                                                    <input type="text" placeholder="Zip Code" value={billing.zip} onChange={e => setBilling({ ...billing, zip: e.target.value })} maxLength={6} required />
                                                </div>

                                                <div className="col-12 mb-20">
                                                    <div className="check-box">
                                                        <input type="checkbox" id="shiping_address" checked={shipToDifferentAddress} onChange={e => setShipToDifferentAddress(e.target.checked)} />
                                                        <label htmlFor="shiping_address">Ship to Different Address</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Address (Conditional) */}
                                        {shipToDifferentAddress && (
                                            <div id="shipping-form">
                                                <h4 className="checkout-title">Shipping Address</h4>
                                                <div className="row">
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>First Name*</label>
                                                        <input type="text" placeholder="First Name" value={shipping.firstName} onChange={e => setShipping({ ...shipping, firstName: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Last Name*</label>
                                                        <input type="text" placeholder="Last Name" value={shipping.lastName} onChange={e => setShipping({ ...shipping, lastName: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Email Address*</label>
                                                        <input type="email" placeholder="Email Address" value={shipping.email} onChange={e => setShipping({ ...shipping, email: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Phone no*</label>
                                                        <input type="text" placeholder="Phone number" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} />
                                                    </div>
                                                    <div className="col-12 mb-20">
                                                        <label>Company Name</label>
                                                        <input type="text" placeholder="Company Name" value={shipping.company} onChange={e => setShipping({ ...shipping, company: e.target.value })} />
                                                    </div>
                                                    <div className="col-12 mb-20">
                                                        <label>Address*</label>
                                                        <input type="text" placeholder="Address line 1" className="mb-2" value={shipping.address1} onChange={e => setShipping({ ...shipping, address1: e.target.value })} />
                                                        <input type="text" placeholder="Address line 2" value={shipping.address2} onChange={e => setShipping({ ...shipping, address2: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Country*</label>
                                                        <select className="nice-select" value={shipping.country} onChange={e => setShipping({ ...shipping, country: e.target.value })}>
                                                            <option value="India">India</option>
                                                            <option value="Bangladesh">Bangladesh</option>
                                                            <option value="China">China</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Town/City*</label>
                                                        <input type="text" placeholder="Town/City" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>State*</label>
                                                        <input type="text" placeholder="State" value={shipping.state} onChange={e => setShipping({ ...shipping, state: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Zip Code*</label>
                                                        <input type="text" placeholder="Zip Code" value={shipping.zip} onChange={e => setShipping({ ...shipping, zip: e.target.value })} maxLength={6} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-lg-5">
                                        <div className="row">
                                            {/* Cart Total */}
                                            <div className="col-12 mb-60">
                                                <h4 className="checkout-title">Cart Total</h4>
                                                <div className="checkout-cart-total">
                                                    <h4>Product <span>Total</span></h4>
                                                    <ul>
                                                        {cartItems.map(item => {
                                                            const price = item.variants?.[0]?.price || 0;
                                                            const discount = item.discountPercentage || 0;
                                                            const currentPrice = price * (1 - discount / 100);
                                                            return (
                                                                <li key={item.id}>
                                                                    {item.name} X {item.quantity}
                                                                    <span>Rs.{(currentPrice * item.quantity).toFixed(2)}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                    <p>Sub Total <span>Rs.{cartTotal.toFixed(2)}</span></p>
                                                    <p>Shipping Fee <span>Rs.0.00</span></p>
                                                    <h4>Grand Total <span>Rs.{cartTotal.toFixed(2)}</span></h4>
                                                </div>
                                            </div>

                                            {/* Payment Method */}
                                            <div className="col-12 mb-30">
                                                <h4 className="checkout-title">Payment Method</h4>
                                                <div className="checkout-payment-method">
                                                    {['check', 'bank', 'cash', 'paypal', 'payoneer'].map(method => (
                                                        <div className="single-method" key={method}>
                                                            <input
                                                                type="radio"
                                                                id={`payment_${method}`}
                                                                name="payment-method"
                                                                value={method}
                                                                checked={paymentMethod === method}
                                                                onChange={() => setPaymentMethod(method)}
                                                            />
                                                            <label htmlFor={`payment_${method}`}>
                                                                {method === 'check' ? 'Check Payment' :
                                                                    method === 'bank' ? 'Direct Bank Transfer' :
                                                                        method === 'cash' ? 'Cash on Delivery' :
                                                                            method.charAt(0).toUpperCase() + method.slice(1)}
                                                            </label>
                                                            <p style={getSlideStyle(method)}>
                                                                Please send a Check to Store name with Store Street, Store Town, Store State, Store Postcode, Store Country.
                                                            </p>
                                                        </div>
                                                    ))}

                                                    <div className="single-method">
                                                        <input type="checkbox" id="accept_terms" required />
                                                        <label htmlFor="accept_terms">I’ve read and accept the terms & conditions</label>
                                                    </div>
                                                </div>
                                                <button className="place-order btn btn-lg btn-round" disabled={isProcessing}>
                                                    {isProcessing ? 'Processing...' : 'Place Order'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CheckoutPageComponent;