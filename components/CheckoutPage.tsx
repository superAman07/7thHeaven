'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

const CheckoutPageComponent: React.FC = () => {
    const { cartItems, cartTotal, isLoggedIn } = useCart();
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState('check');
    const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [is7thHeavenOptIn, setIs7thHeavenOptIn] = useState(false);
    const [minPurchaseLimit, setMinPurchaseLimit] = useState(2000);

    const [isAlreadyMember, setIsAlreadyMember] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [referralLocked, setReferralLocked] = useState(false);
    // OTP states
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpError, setOtpError] = useState('');

    const searchParams = useSearchParams();
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountAmount: number;
    } | null>(null);
    useEffect(() => {
        const couponCode = searchParams.get('coupon');
        const discountAmount = searchParams.get('discount');
        
        if (couponCode && discountAmount) {
            setAppliedCoupon({
                code: couponCode,
                discountAmount: parseFloat(discountAmount)
            });
        }
    }, [searchParams]);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setReferralCode(ref);
            setReferralLocked(true);
            setIs7thHeavenOptIn(true);
            localStorage.setItem('7thHeavenReferral', ref);
        } else {
            const storedRef = localStorage.getItem('7thHeavenReferral');
            if (storedRef) {
                setReferralCode(storedRef);
                setReferralLocked(true);
                setIs7thHeavenOptIn(true);
            }
        }
    }, [searchParams]);

    const handleSendOtp = async () => {
        if (!billing.email) {
            setOtpError('Please enter your email first');
            return;
        }
        setOtpSending(true);
        setOtpError('');
        try {
            await axios.post('/api/v1/auth/request-otp', { 
                fullName: `${billing.firstName} ${billing.lastName}`,
                email: billing.email,
                phone: billing.phone.replace(/\D/g, '').slice(-10),
                referralCode: referralCode || undefined
            });
            setOtpSent(true);
        } catch (err: any) {
            setOtpError(err.response?.data?.error?.message || 'Failed to send OTP');
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) {
            setOtpError('Enter valid 6-digit OTP');
            return;
        }
        try {
            const res = await axios.post('/api/v1/auth/verify-otp', { 
                phone: billing.phone.replace(/\D/g, '').slice(-10), 
                otp: otpCode 
            });
            if (res.data.success) {
                setOtpVerified(true);
                setOtpError('');
            }
        } catch (err: any) {
            setOtpError(err.response?.data?.error?.message || 'Invalid OTP');
        }
    };

    useEffect(() => {
        axios.get('/api/v1/settings')
            .then(res => {
                if (res.data.success) {
                    setMinPurchaseLimit(res.data.value);
                }
            })
            .catch(err => console.error("Failed to fetch settings", err));
    }, []);

    const [billing, setBilling] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address1: '', address2: '', country: '', city: '', state: '', zip: ''
    });

    const [shipping, setShipping] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address1: '', address2: '', country: 'India', city: '', state: '', zip: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (isLoggedIn) {
                try {
                    const { data } = await axios.get('/api/v1/auth/me', { withCredentials: true });
                    if (data.success && data.user) {
                        const u = data.user;
                        if (u.is7thHeaven) {
                            setIsAlreadyMember(true);
                        }
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
                            zip: u.pincode || '',
                            country: u.country || 'India'
                        }));
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                }
            }
        };
        fetchUserData();
    }, [isLoggedIn]);

    useEffect(() => {
        if (billing.zip.length === 6) {
            axios.get(`https://api.postalpincode.in/pincode/${billing.zip}`)
                .then(res => {
                    if (res.data && res.data[0].Status === 'Success') {
                        const po = res.data[0].PostOffice[0];
                        setBilling(prev => ({
                            ...prev,
                            city: po.District,
                            state: po.State,
                            country: po.Country
                        }));
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
        const phoneDigits = billing.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            alert("Please enter a valid 10-digit phone number (without country code).");
            return;
        }
        setIsProcessing(true);
        try {
            const finalShipping = shipToDifferentAddress ? shipping : billing;
            const orderPayload = {
                items: cartItems.map(item => ({
                    productId: item.originalProductId || item.id,
                    variantId: item.selectedVariant?.id,
                    quantity: item.quantity,
                })),
                shippingDetails: {
                    fullName: `${finalShipping.firstName} ${finalShipping.lastName}`,
                    phone: finalShipping.phone.replace(/\D/g, '').slice(-10),
                    email: finalShipping.email,
                    fullAddress: `${finalShipping.address1} ${finalShipping.address2}`,
                    city: finalShipping.city,
                    state: finalShipping.state,
                    pincode: finalShipping.zip,
                    country: finalShipping.country
                },
                mlmOptIn: is7thHeavenOptIn,
                referrerCode: is7thHeavenOptIn ? referralCode : null,
                couponCode: appliedCoupon?.code || null,
                discountAmount: appliedCoupon?.discountAmount || 0
            };
            const orderResponse = await axios.post('/api/v1/orders', orderPayload, { withCredentials: true });
            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.error || 'Failed to create order.');
            }
            // --- BYPASS HANDLER ---
            // const { orderId, bypassed, transactionId } = orderResponse.data;
            // if (bypassed) {
            //     // Direct redirect to success page
            //     router.push(`/payment/status/${transactionId}`);
            //     console.log("Payment Bypassed. Redirecting...");
            //     return;
            // }
            // // ----------------------
            // const paymentResponse = await axios.post('/api/v1/payment/initiate', { orderId }, { withCredentials: true });
            // if (!paymentResponse.data.success) {
            //     throw new Error(paymentResponse.data.error || 'Failed to initiate payment.');
            // }
            // const { paymentUrl } = paymentResponse.data;
            // router.push(paymentUrl);
            const { orderId } = orderResponse.data;
            router.push(`/payment/process/${orderId}`);
        } catch (error) {
            console.error("Checkout process failed", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            alert(`Failed to place order: ${errorMessage}`);
            setIsProcessing(false);
        } finally {
            // Keep processing true if redirecting
        }
    };

    const readOnlyInputStyle = {
        backgroundColor: '#f8f9fa',
        cursor: 'not-allowed',
        color: '#6c757d'
    };

    return (
        <div id="main-wrapper">
            {/* Page Banner */}
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
                                <div className="order-2 order-md-1 mt-2 mt-md-0">
                                    <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                                        <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                                        <li className="text-white/80">Checkout</li>
                                    </ul>
                                </div>
                                <div className="order-1 order-md-2 text-center text-md-end">
                                    <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                        Checkout
                                    </h1>
                                </div>

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

                                    {!isLoggedIn && (
                                            <div className="alert alert-info mb-4">
                                                <i className="fa fa-info-circle mr-2"></i>
                                                You are checking out as a <strong>Guest</strong>. 
                                                We will create a secure account for you to track your order.
                                            </div>
                                        )}
                                        {/* Billing Address */}
                                        <div id="billing-form" className="mb-10">
                                            <h4 className="checkout-title">Billing Address</h4>
                                            <div className="row">
                                                {/* NON-EDITABLE FIELDS */}
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>First Name*</label>
                                                    <input 
                                                        type="text" 
                                                        value={billing.firstName} 
                                                        onChange={e => setBilling({...billing, firstName: e.target.value})}
                                                        readOnly={isLoggedIn}
                                                        style={isLoggedIn ? readOnlyInputStyle : {}} 
                                                        required
                                                    />         
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Last Name*</label>
                                                    <input 
                                                        type="text" 
                                                        value={billing.lastName} 
                                                        onChange={e => setBilling({...billing, lastName: e.target.value})}
                                                        readOnly={isLoggedIn} 
                                                        style={isLoggedIn ? readOnlyInputStyle : {}} 
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Email Address*</label>
                                                    <input 
                                                        type="email" 
                                                        value={billing.email} 
                                                        onChange={e => setBilling({...billing, email: e.target.value})}
                                                        readOnly={isLoggedIn} 
                                                        style={isLoggedIn ? readOnlyInputStyle : {}} 
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Phone no*</label>
                                                    <input 
                                                        type="text" 
                                                        value={billing.phone} 
                                                        onChange={e => setBilling({...billing, phone: e.target.value})}
                                                        readOnly={isLoggedIn} 
                                                        style={isLoggedIn ? readOnlyInputStyle : {}} 
                                                        required
                                                    />
                                                </div>

                                                <div className="col-12 mb-20">
                                                    <label>Address*</label>
                                                    <input type="text" placeholder="Address line 1" className="mb-2" value={billing.address1} onChange={e => setBilling({ ...billing, address1: e.target.value })} required />
                                                    <input type="text" placeholder="Address line 2" value={billing.address2} onChange={e => setBilling({ ...billing, address2: e.target.value })} />
                                                </div>

                                                {/* REORDERED FIELDS */}
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Zip Code*</label>
                                                    <input type="text" placeholder="Zip Code" value={billing.zip} onChange={e => setBilling({ ...billing, zip: e.target.value })} maxLength={6} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Country*</label>
                                                    <input type="text" placeholder="Country" value={billing.country} onChange={e => setBilling({ ...billing, country: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Town/City*</label>
                                                    <input type="text" placeholder="Town/City" value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>State*</label>
                                                    <input type="text" placeholder="State" value={billing.state} onChange={e => setBilling({ ...billing, state: e.target.value })} required />
                                                </div>

                                                <div className="col-12 mb-20">
                                                    <div className="check-box">
                                                        <input type="checkbox" id="shiping_address" checked={shipToDifferentAddress} onChange={e => setShipToDifferentAddress(e.target.checked)} />
                                                        <label htmlFor="shiping_address">Ship to Different Address</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Address (Conditional & Fixed) */}
                                        {shipToDifferentAddress && (
                                            <div id="shipping-form">
                                                <h4 className="checkout-title">Shipping Address</h4>
                                                <div className="row">
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>First Name*</label>
                                                        <input type="text" placeholder="First Name" value={shipping.firstName} onChange={e => setShipping({ ...shipping, firstName: e.target.value })} required />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Last Name*</label>
                                                        <input type="text" placeholder="Last Name" value={shipping.lastName} onChange={e => setShipping({ ...shipping, lastName: e.target.value })} required />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Email Address*</label>
                                                        <input type="email" placeholder="Email Address" value={shipping.email} onChange={e => setShipping({ ...shipping, email: e.target.value })} required />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Phone no*</label>
                                                        <input type="text" placeholder="Phone number" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} required />
                                                    </div>
                                                    <div className="col-12 mb-20">
                                                        <label>Address*</label>
                                                        <input type="text" placeholder="Address line 1" className="mb-2" value={shipping.address1} onChange={e => setShipping({ ...shipping, address1: e.target.value })} required />
                                                        <input type="text" placeholder="Address line 2" value={shipping.address2} onChange={e => setShipping({ ...shipping, address2: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Zip Code*</label>
                                                        <input type="text" placeholder="Zip Code" value={shipping.zip} onChange={e => setShipping({ ...shipping, zip: e.target.value })} maxLength={6} required />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Country*</label>
                                                        <input type="text" placeholder="Country" value={shipping.country} onChange={e => setShipping({ ...shipping, country: e.target.value })} required />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>Town/City*</label>
                                                        <input type="text" placeholder="Town/City" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} required />
                                                    </div>
                                                    <div className="col-md-6 col-12 mb-20">
                                                        <label>State*</label>
                                                        <input type="text" placeholder="State" value={shipping.state} onChange={e => setShipping({ ...shipping, state: e.target.value })} required />
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
                                                            const currentPrice = Math.round(price * (1 - discount / 100));
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
                                                    {appliedCoupon && (
                                                        <p style={{ color: '#28a745', fontWeight: 600 }}>
                                                            Discount ({appliedCoupon.code}) 
                                                            <span style={{ color: '#28a745' }}>-Rs.{appliedCoupon.discountAmount.toFixed(2)}</span>
                                                        </p>
                                                    )}
                                                    <h4>Grand Total <span>Rs.{(cartTotal - (appliedCoupon?.discountAmount || 0)).toFixed(2)}</span></h4>
                                                </div>
                                            </div>

                                            {/* START: 7th Heaven Logic */}
                                            <div className="col-12 mb-30">
                                                {isAlreadyMember ? (
                                                    <div className="p-3" style={{ backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '5px' }}>
                                                        <p className="mb-0" style={{ fontSize: '15px', fontWeight: 600 }}>
                                                            <i className="fa fa-check-circle mr-2"></i>
                                                            You are a <strong>7th Heaven Club</strong> member!
                                                        </p>
                                                        <p className="mb-0 mt-1" style={{ fontSize: '13px' }}>Enjoy your exclusive benefits on this order.</p>
                                                    </div>
                                                ) : (
                                                    cartTotal > 0 && (
                                                        cartTotal >= minPurchaseLimit ? (
                                                            <div className="p-3" style={{ backgroundColor: '#ddb040', color: '#000', border: '1px solid #cca33b', borderRadius: '5px' }}>
                                                                <div className="flex justify-center gap-x-2 mb-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        id="heavenOptIn" 
                                                                        className="mt-auto mb-auto" 
                                                                        checked={is7thHeavenOptIn} 
                                                                        onChange={(e) => setIs7thHeavenOptIn(e.target.checked)} 
                                                                        disabled={!isLoggedIn && !otpVerified}
                                                                    />
                                                                    <label htmlFor="heavenOptIn" style={{ fontSize: '16px', fontWeight: 700 }}>Join 7th Heaven Club?</label>
                                                                </div>
                                                                
                                                                {is7thHeavenOptIn && (
                                                                    <div className="mt-3 p-3" style={{ backgroundColor: '#fff', borderRadius: '5px' }}>
                                                                        {/* Referral Code Input */}
                                                                        <div className="mb-3">
                                                                            <label className="block text-sm font-semibold mb-1">Referral Code (Optional)</label>
                                                                            <input
                                                                                type="text"
                                                                                value={referralCode}
                                                                                onChange={(e) => !referralLocked && setReferralCode(e.target.value.toUpperCase())}
                                                                                placeholder="Enter referral code"
                                                                                disabled={referralLocked}
                                                                                className="w-full p-2 border rounded"
                                                                                style={{ backgroundColor: referralLocked ? '#e9ecef' : '#fff' }}
                                                                            />
                                                                            {referralLocked && <small className="text-gray-600">Referral code auto-applied</small>}
                                                                        </div>

                                                                        {/* OTP Section for Guests */}
                                                                        {!isLoggedIn && (
                                                                            <div className="pt-3 border-t">
                                                                                <label className="block text-sm font-semibold mb-1">Verify Your Email</label>
                                                                                {!otpVerified ? (
                                                                                    <>
                                                                                        {!otpSent ? (
                                                                                            <button 
                                                                                                type="button"
                                                                                                onClick={handleSendOtp}
                                                                                                disabled={otpSending || !billing.email}
                                                                                                className="px-4 py-2 bg-black text-white rounded text-sm"
                                                                                            >
                                                                                                {otpSending ? 'Sending...' : 'Send OTP to Email'}
                                                                                            </button>
                                                                                        ) : (
                                                                                            <div className="flex gap-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={otpCode}
                                                                                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                                                    placeholder="Enter 6-digit OTP"
                                                                                                    className="flex-1 p-2 border rounded"
                                                                                                    maxLength={6}
                                                                                                />
                                                                                                <button 
                                                                                                    type="button"
                                                                                                    onClick={handleVerifyOtp}
                                                                                                    className="px-4 py-2 bg-green-600 text-white rounded text-sm"
                                                                                                >
                                                                                                    Verify
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                        {otpError && <p className="text-red-600 text-sm mt-1">{otpError}</p>}
                                                                                    </>
                                                                                ) : (
                                                                                    <p className="text-green-600 font-semibold">
                                                                                        <i className="fa fa-check-circle mr-1"></i> Email Verified!
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <p className="mt-2 mb-0 text-center" style={{ fontSize: '14px', fontWeight: 500 }}>
                                                                    {!isLoggedIn && !otpVerified ? (
                                                                        <span><i className="fa fa-lock"></i> Verify email to join</span>
                                                                    ) : (
                                                                        "Unlock exclusive benefits and referral rewards!"
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', border: '1px dashed #ddb040', borderRadius: '5px' }}>
                                                                <p className="mb-1" style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>Want to join the <strong>7th Heaven Club</strong>?</p>
                                                                <p className="mb-0" style={{ fontSize: '13px', color: '#ddb040', fontWeight: 700 }}>Add items worth Rs.{(minPurchaseLimit - cartTotal).toFixed(2)} more to unlock!</p>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>

                                            {/* Payment Method */}
                                            <div className="col-12 mb-30">
                                                <h4 className="checkout-title">Payment Method</h4>
                                                <div className="checkout-payment-method">
                                                    <div className="single-method">
                                                        <input
                                                            type="radio"
                                                            id="payment_phonepe"
                                                            name="payment-method"
                                                            value="phonepe"
                                                            checked // Always selected
                                                            readOnly
                                                        />
                                                        <label htmlFor="payment_phonepe">
                                                            PhonePe / UPI / Cards / NetBanking
                                                        </label>
                                                        <p style={{
                                                            maxHeight: '150px',
                                                            opacity: 1,
                                                            padding: '10px 15px',
                                                            margin: '10px 0 0 0',
                                                            fontSize: '14px',
                                                            backgroundColor: '#f8f9fa',
                                                            borderRadius: '4px',
                                                        }}>
                                                            You will be redirected to the secure PhonePe payment gateway to complete your purchase.
                                                        </p>
                                                    </div>

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