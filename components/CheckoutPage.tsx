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
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [minPurchaseLimit, setMinPurchaseLimit] = useState(2000);

    const [isAlreadyMember, setIsAlreadyMember] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [referralVerified, setReferralVerified] = useState(false);
    const [referralError, setReferralError] = useState('');
    const [isVerifyingReferral, setIsVerifyingReferral] = useState(false);
    const [referralSlotsFull, setReferralSlotsFull] = useState<string | null>(null);
    const [referralLocked, setReferralLocked] = useState(false);
    // OTP states
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const searchParams = useSearchParams();
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountAmount: number;
    } | null>(null);
    const has7thHeavenProduct = cartItems.some(item => item.isFor7thHeaven);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);
    useEffect(() => {
        const couponCode = searchParams.get('coupon');
        const couponType = searchParams.get('couponType');
        const couponValue = searchParams.get('couponValue');
        
        if (couponCode && couponType && couponValue) {
            const value = parseFloat(couponValue);
            const discount = couponType === 'PERCENT' 
                ? Math.round(cartTotal * (value / 100)) 
                : value;
            setAppliedCoupon({
                code: couponCode,
                discountAmount: discount
            });
        }
    }, [searchParams, cartTotal]);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('7thHeavenReferral', ref);
            axios.post('/api/v1/referral/validate', { code: ref })
                .then(() => {
                    setReferralCode(ref);
                    setReferralLocked(true);
                    setIs7thHeavenOptIn(true);
                })
                .catch((err) => {
                    const reason = err?.response?.data?.reason;
                    if (reason === 'HEAVEN1_COMPLETE' || reason === 'SLOTS_FULL') {
                        localStorage.removeItem('7thHeavenReferral');
                        document.cookie = 'referralCode=; path=/; max-age=0';
                        setReferralError(err?.response?.data?.error || 'This invite code is no longer available.');
                        setReferralSlotsFull(reason);
                    }
                });
        } else {
            const storedRef = localStorage.getItem('7thHeavenReferral');
            if (storedRef) {
                axios.post('/api/v1/referral/validate', { code: storedRef })
                    .then(() => {
                        setReferralCode(storedRef);
                        setReferralLocked(true);
                        setIs7thHeavenOptIn(true);
                    })
                    .catch((err) => {
                        const reason = err?.response?.data?.reason;
                        if (reason === 'HEAVEN1_COMPLETE' || reason === 'SLOTS_FULL') {
                            localStorage.removeItem('7thHeavenReferral');
                            document.cookie = 'referralCode=; path=/; max-age=0';
                            setReferralError(err?.response?.data?.error || 'This invite code is no longer available.');
                            setReferralSlotsFull(reason);
                        }
                    });
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
            setResendCooldown(30);
        } catch (err: any) {
            setOtpError(err.response?.data?.error?.message || 'Failed to send OTP');
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyReferral = async () => {
        if (!referralCode.trim()) return;
        setIsVerifyingReferral(true);
        setReferralError('');
        try {
            const res = await axios.post('/api/v1/referral/validate', { code: referralCode });
            if (res.data.success) {
                setReferralVerified(true);
                setReferralError('');
                localStorage.setItem('7thHeavenReferral', referralCode);
                document.cookie = `referralCode=${referralCode}; path=/; max-age=${60 * 60 * 24 * 30}`;
            }
        } catch (err: any) {
            const reason = err.response?.data?.reason;
            setReferralError(err.response?.data?.error || 'Invalid invite code');
            setReferralVerified(false);
            setReferralSlotsFull(reason === 'HEAVEN1_COMPLETE' || reason === 'SLOTS_FULL' ? reason : null);
        } finally {
            setIsVerifyingReferral(false);
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
        if (!isLoggedIn && !otpVerified) {
            alert("Please verify your email via OTP before placing an order.");
            setIsProcessing(false);
            return;
        }
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
            const finalShipping = shipToDifferentAddress ? {
                ...billing,
                phone: shipping.phone || billing.phone,
                address1: shipping.address1,
                address2: ''
            } : billing;
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
                    fullAddress: shipToDifferentAddress ? finalShipping.address1 : `${billing.address1} ${billing.address2}`.trim(),
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
                className="page-banner-section section min-h-[max(320px,35vh)]! lg:min-h-[45vh]! flex! items-end! pb-[20px]!" 
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
                                                    <input type="text" placeholder="Full Address" className="mb-2" value={billing.address1} onChange={e => setBilling({ ...billing, address1: e.target.value })} required />
                                                </div>

                                                <div className="col-12 mb-20">
                                                    <div className="d-flex align-items-center mb-2" style={{ backgroundColor: '#f8f9fa', padding: '12px 15px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            id="ship_different_address" 
                                                            checked={shipToDifferentAddress}
                                                            onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                                                            style={{ width: '18px', height: '18px', marginRight: '10px', cursor: 'pointer', accentColor: '#ddb040' }}
                                                        />
                                                        <label htmlFor="ship_different_address" style={{ fontWeight: 600, fontSize: '15px', color: '#333', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
                                                            Ship to a different address?
                                                        </label>
                                                    </div>

                                                    {shipToDifferentAddress && (
                                                        <div className="p-4 mt-3" style={{ backgroundColor: '#fafafa', border: '1px solid #ddd', borderRadius: '8px', animation: 'fadeIn 0.3s ease-in-out' }}>
                                                            <div className="row">
                                                                <div className="col-12 mb-20">
                                                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>Full Different Address*</label>
                                                                    <textarea 
                                                                        className="form-control"
                                                                        placeholder="Enter complete address including pin code, state, city" 
                                                                        value={shipping.address1} 
                                                                        onChange={e => setShipping({ ...shipping, address1: e.target.value })} 
                                                                        required={shipToDifferentAddress}
                                                                        rows={3}
                                                                        style={{ resize: 'vertical' }}
                                                                    />
                                                                </div>
                                                                <div className="col-12 mb-0">
                                                                    <label style={{ fontSize: '14px', fontWeight: 600 }}>Phone Number (Optional)</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="form-control"
                                                                        placeholder="Enter different phone number" 
                                                                        value={shipping.phone} 
                                                                        onChange={e => setShipping({ ...shipping, phone: e.target.value })} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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
                                            </div>
                                        </div>




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
                                                            const price = item.selectedVariant?.price || item.variants?.[0]?.price || 0;
                                                            const sellingPrice = (item.selectedVariant as any)?.sellingPrice;
                                                            const hasDiscount = sellingPrice != null && sellingPrice < price;
                                                            const currentPrice = hasDiscount ? sellingPrice : price;
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
                                                        (cartTotal - (appliedCoupon?.discountAmount || 0)) >= minPurchaseLimit ? (
                                                            <div className="p-4" style={{ backgroundColor: '#fff', border: '2px solid #eab308', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        id="heavenOptIn" 
                                                                        checked={is7thHeavenOptIn} 
                                                                        onChange={(e) => setIs7thHeavenOptIn(e.target.checked)}
                                                                        disabled={!has7thHeavenProduct}
                                                                        style={{ width: '20px', height: '20px', marginRight: '12px', accentColor: '#eab308', cursor: has7thHeavenProduct ? 'pointer' : 'not-allowed' }}
                                                                    />
                                                                    <label htmlFor="heavenOptIn" style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1a1a1a', cursor: has7thHeavenProduct ? 'pointer' : 'not-allowed' }}>
                                                                        Join 7th Heaven Club
                                                                    </label>
                                                                </div>

                                                                {!has7thHeavenProduct && (
                                                                    <div className="mt-3 p-3 text-center" style={{ backgroundColor: '#f8f9fa', border: '1px dashed #ccc', borderRadius: '6px' }}>
                                                                        <p className="mb-1" style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>
                                                                            You are currently checking out as a regular customer.
                                                                        </p>
                                                                        <p className="mb-0 text-sm" style={{ color: '#666' }}>
                                                                            Add at least one <Link href="/7th-heaven" className="font-bold underline" style={{ color: '#ddb040' }}>7th Heaven Product</Link> to your cart to join the club!
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                
                                                                {is7thHeavenOptIn && has7thHeavenProduct && (
                                                                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                                        <div className="mb-2">
                                                                            <label className="block text-sm font-semibold mb-2" style={{ color: '#444' }}>Referral Code (Optional)</label>
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={referralCode}
                                                                                    onChange={(e) => {
                                                                                        if (!referralLocked) {
                                                                                            setReferralCode(e.target.value.toUpperCase());
                                                                                            setReferralVerified(false);
                                                                                            setReferralError('');
                                                                                        }
                                                                                    }}
                                                                                    placeholder="Enter invite code"
                                                                                    disabled={referralLocked || referralVerified}
                                                                                    className="flex-1 p-2 rounded"
                                                                                    style={{ border: '1px solid #ccc', backgroundColor: (referralLocked || referralVerified) ? '#f3f4f6' : '#fff' }}
                                                                                />
                                                                                {!referralLocked && !referralVerified && referralCode.trim() && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={handleVerifyReferral}
                                                                                        disabled={isVerifyingReferral}
                                                                                        style={{ padding: '8px 20px', backgroundColor: '#eab308', color: '#000', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                                                                    >
                                                                                        {isVerifyingReferral ? 'Checking...' : 'Apply'}
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            {referralLocked && <small className="text-gray-500 mt-1 block">Referral code auto-applied</small>}
                                                                            {referralVerified && <small style={{ color: '#16a34a', fontWeight: 600, display: 'block', marginTop: '4px' }}>✓ Valid referral code</small>}
                                                                            {referralError && <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>{referralError}</small>}
                                                                            {referralSlotsFull && (
                                                                                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setReferralCode('');
                                                                                            setReferralError('');
                                                                                            setReferralSlotsFull(null);
                                                                                            setReferralVerified(false);
                                                                                            setReferralLocked(false);
                                                                                        }}
                                                                                        style={{ fontSize: '13px', padding: '6px 14px', backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                                                    >
                                                                                        Try Another Code
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setReferralCode('');
                                                                                            setReferralError('');
                                                                                            setReferralSlotsFull(null);
                                                                                            setReferralVerified(false);
                                                                                            setReferralLocked(false);
                                                                                            localStorage.removeItem('7thHeavenReferral');
                                                                                        }}
                                                                                        style={{ fontSize: '13px', padding: '6px 14px', backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                                                                                    >
                                                                                        Continue Without Code
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <p className="mt-3 mb-0 text-center" style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                                                                    {!isLoggedIn && !otpVerified ? (
                                                                        <span className="text-amber-800"><i className="fa fa-lock mr-1"></i> Verify email below to join</span>
                                                                    ) : (
                                                                        "Unlock exclusive benefits and referral rewards!"
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', border: '1px dashed #ddb040', borderRadius: '5px' }}>
                                                                <p className="mb-1" style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>Want to join the <strong>7th Heaven Club</strong>?</p>
                                                                <p className="mb-0" style={{ fontSize: '13px', color: '#ddb040', fontWeight: 700 }}>Add items worth Rs.{(minPurchaseLimit - (cartTotal - (appliedCoupon?.discountAmount || 0))).toFixed(2)} more from the <Link href="/7th-heaven" style={{ textDecoration: 'underline' }}>7th Heaven collection</Link> to unlock!</p>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>

                                            {/* Email Verification for Guest Users */}
                                            {!isLoggedIn && !otpVerified && (
                                                <div className="col-12 mb-30">
                                                    <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '16px' }}>
                                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#856404' }}>
                                                            ✉️ Verify Your Email to Place Order
                                                        </label>
                                                        {!otpSent ? (
                                                            <button 
                                                                type="button"
                                                                onClick={handleSendOtp}
                                                                disabled={otpSending || !billing.email}
                                                                style={{ padding: '8px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                {otpSending ? 'Sending...' : 'Send OTP to Email'}
                                                            </button>
                                                        ) : (
                                                            <div>
                                                                <div style={{ display: 'flex !important', gap: '8px !important', alignItems: 'center !important' }}>
                                                                    <input
                                                                        type="text"
                                                                        value={otpCode}
                                                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                        placeholder="Enter 6-digit OTP"
                                                                        maxLength={6}
                                                                        style={{ flex: 1, padding: '8px 12px', fontSize: '14px', height: '38px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                                    />
                                                                    <button 
                                                                        type="button"
                                                                        onClick={handleVerifyOtp}
                                                                        style={{ height: '38px', padding: '0 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                                    >
                                                                        Verify
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleSendOtp}
                                                                    disabled={resendCooldown > 0 || otpSending}
                                                                    style={{ marginTop: '10px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: resendCooldown > 0 ? '#999' : '#333', backgroundColor: resendCooldown > 0 ? '#f3f4f6' : '#e5e7eb', border: '1px solid', borderColor: resendCooldown > 0 ? '#e5e7eb' : '#d1d5db', borderRadius: '4px', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer' }}
                                                                >
                                                                    {otpSending ? 'Sending...' : resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                                                                </button>
                                                            </div>
                                                        )}
                                                        {otpError && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>{otpError}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            {!isLoggedIn && otpVerified && (
                                                <div className="col-12 mb-30">
                                                    <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px', padding: '16px' }}>
                                                        <p style={{ marginBottom: 0, color: '#155724', fontWeight: 600 }}>
                                                            ✅ Email Verified Successfully!
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

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
                                                            PayU / UPI / Cards / NetBanking
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
                                                        <input 
                                                            type="checkbox" 
                                                            id="accept_terms" 
                                                            checked={agreeToTerms}
                                                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                                                        />
                                                        <label htmlFor="accept_terms">
                                                            I've read and accept the{' '}
                                                            <Link href="/policies/legal_terms" target="_blank" style={{ color: '#ddb040', textDecoration: 'underline' }}>Terms & Conditions</Link>
                                                            {' '}and{' '}
                                                            <Link href="/policies/legal_refund" target="_blank" style={{ color: '#ddb040', textDecoration: 'underline' }}>Refund Policy</Link>
                                                        </label>
                                                        {is7thHeavenOptIn && (
                                                            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', marginBottom: '0', fontWeight: 600 }}>
                                                                ⚠️ By opting into 7th Heaven, you agree that this order cannot be cancelled after payment. Membership is activated immediately upon successful payment.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button className="place-order btn btn-lg btn-round" disabled={isProcessing || !agreeToTerms || (!isLoggedIn && !otpVerified)}>
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