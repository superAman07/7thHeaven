'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import toast from 'react-hot-toast';
import { generateInvoice, InvoiceData } from '@/services/invoiceGenerator';

const urlToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; 
        img.src = url;
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                reject(new Error("CORS Security Error"));
            }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
    });
};

export default function PaymentStatusPage() {
    const params = useParams();
    const { transactionId } = params;
    const { clearCart } = useCart();

    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [order, setOrder] = useState<InvoiceData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [retries, setRetries] = useState(0);

    const [siteSettings, setSiteSettings] = useState<any>(null);

    useEffect(() => {
        axios.get('/api/v1/site-settings').then(res => {
            if(res.data.success) setSiteSettings(res.data.data);
        });
    }, []);

    useEffect(() => {
        if (!transactionId) return;
        if (status === 'success' || status === 'failed') return;

        const checkStatus = async () => {
            try {
                console.log(`[Polling ${retries + 1}/30] Checking status for: ${transactionId}`);
                const response = await axios.get(`/api/v1/payment/status/${transactionId}?_t=${Date.now()}`);
                
                if (response.data.success) {
                    const orderData = response.data.order;
                    setOrder(orderData);
                    
                    if (orderData.paymentStatus === 'PAID') {
                        setStatus('success');
                        clearCart();
                        toast.success("Payment Confirmed!");
                    } else if (orderData.paymentStatus === 'FAILED' || orderData.paymentStatus === 'CANCELLED') {
                        setStatus('failed');
                        setErrorMessage("Payment was marked as FAILED by the gateway.");
                    } else {
                        if (retries >= 30) { 
                            setStatus('failed');
                            setErrorMessage("Payment confirmation timed out. If money was deducted, it will be updated shortly.");
                        } else {
                            setRetries(prev => prev + 1);
                        }
                    }
                }
            } catch (err: any) {
                console.error("Poll Error:", err);
                if (retries < 30) {
                    setRetries(prev => prev + 1);
                } else {
                    setStatus('error');
                    setErrorMessage(err.response?.data?.error || err.message);
                }
            }
        };

        const timer = setTimeout(() => checkStatus(), 2000);
        return () => clearTimeout(timer);
    }, [transactionId, retries, status, clearCart]);

    const copyToClipboard = () => {
        if (order) {
            navigator.clipboard.writeText(order.id);
            toast.success("Order ID copied!");
        }
    };

    const handleDownloadInvoice = async () => {
        if (!order) return;
        
        try {
            let logoBase64 = undefined;
            const defaultLogo = '/celsius-logo.png';

            // 1. Get Logo (Same logic as Track Order)
            if (siteSettings?.logoUrl) {
                try {
                    logoBase64 = await urlToBase64(siteSettings.logoUrl);
                } catch (e) {
                    logoBase64 = await urlToBase64(defaultLogo).catch(() => undefined);
                }
            }

            // 2. Wrap the order with Company Details so the PDF generator sees them
            const brandedOrder: any = {
                ...order,
                companyDetails: {
                    name: siteSettings?.companyName || "Celsius",
                    address: `${siteSettings?.address || ''}, ${siteSettings?.city || ''}`,
                    phone: siteSettings?.phone || "",
                    email: siteSettings?.email || "",
                    logoUrl: logoBase64
                }
            };

            generateInvoice(brandedOrder);
            toast.success("Professional invoice generated!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate branded invoice");
        }
    };

    // Common button styles
    const primaryBtnStyle = {
        background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        color: '#fff',
        border: 'none',
        padding: '14px 32px',
        borderRadius: '50px',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
        fontSize: '13px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
    };

    const outlineBtnStyle = {
        background: 'transparent',
        color: '#333',
        border: '2px solid #333',
        padding: '12px 28px',
        borderRadius: '50px',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
        fontSize: '13px',
        transition: 'all 0.3s ease'
    };

    // LOADING STATE
    if (status === 'loading') {
        return (
            <div id="main-wrapper">
                {/* Dark Banner */}
                <div 
                    className="page-banner-section  section min-h-[50vh]! lg:min-h-[60vh]! flex! items-end! pb-0! pt-[180px]! lg:pt-[240px]!" 
                    style={{ background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)' }}
                >
                    <div className="container-fluid px-4 px-md-5">
                        <div className="row">
                            <div className="col-12 p-0">
                                <div className="page-banner w-100 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end">
                                    <div className="order-2 order-md-1 mt-2 mt-md-0">
                                        <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                                            <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                                            <li className="text-white/80">Payment</li>
                                        </ul>
                                    </div>
                                    <div className="order-1 order-md-2 text-center text-md-end">
                                        <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                            Processing Payment
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading Content */}
                <div className="container text-center py-20">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 border-4 border-[#ddb040]/30 border-t-[#ddb040] rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-600">Verifying your payment...</p>
                    <p className="text-sm text-gray-400 mt-2">Please don't close this page</p>
                </div>
            </div>
        );
    }

    // SUCCESS STATE
    if (status === 'success' && order) {
        return (
            <div id="main-wrapper">
                {/* Celebration Banner */}
                <div 
                    className="page-banner-section pb-0! section min-h-[60vh]! lg:min-h-[70vh]! flex! items-center! justify-center! relative overflow-hidden pt-[180px]! lg:pt-[240px]!" 
                    style={{ background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)' }}
                >
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'radial-gradient(circle, #E6B422 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}></div>
                    
                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 animate-pulse"
                        style={{ background: 'radial-gradient(circle, #E6B422 0%, transparent 70%)' }}
                    ></div>

                    <div className="container text-center relative z-10 py-8">
                        {/* Success Icon */}
                        <div className="mb-3 mt-4 animate-bounce">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-green-400 to-green-600 shadow-2xl">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-xl md:text-3xl font-bold text-white mb-1" style={{ letterSpacing: '0.05em' }}>
                            Payment Successful!
                        </h1>
                        <p className="text-[#D4AF37] text-xl md:text-2xl font-light">
                            Thank you for shopping with Celsius
                        </p>
                    </div>
                </div>

                {/* 7th Heaven Welcome Section (if opted in) */}
                {order.mlmOptInRequested && (
                    <div className="bg-linear-to-b from-black to-[#1a1511] py-16 text-center">
                        <div className="container">
                            <div className="inline-block relative mb-6">
                                <div className="absolute inset-0 bg-[#ddb040] blur-2xl opacity-30 animate-pulse"></div>
                                <div className="relative bg-black text-[#ddb040] px-6 py-4 rounded-full font-serif text-md! md:text-2xl! font-bold tracking-widest border-2 border-[#ddb040] shadow-2xl">
                                    👑 WELCOME TO 7TH HEAVEN
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif text-white mt-6 mb-4">
                                You Have Ascended.
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto text-lg mb-8">
                                Your empire begins now. Your exclusive referral code has been activated.
                            </p>
                            <Link 
                                href="/7th-heaven" 
                                style={primaryBtnStyle}
                                className="inline-block hover:scale-105 transition-transform"
                            >
                                🌟 Enter Your Dashboard
                            </Link>
                        </div>
                    </div>
                )}

                {/* Order Details Section */}
                <div className="pt-32 pb-20 bg-[#faf9f7]">
                    <div className="container">
                        <div className="max-w-lg mx-auto">
                            {/* Order Card */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <h3 className="text-center text-gray-400 text-sm uppercase tracking-widest mb-6">
                                    Order Confirmation
                                </h3>
                                
                                <div className="text-center mb-6">
                                    <p className="text-gray-500 text-sm mb-2">Order ID</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="font-mono text-md sm:text-xl font-bold text-gray-800">{order.id}</span>
                                        <button 
                                            onClick={copyToClipboard}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Copy"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Amount Paid</span>
                                        <span className="text-2xl font-bold text-[#D4AF37]">₹{order.netAmountPaid ? Number(order.netAmountPaid).toFixed(2) : Number(order.subtotal).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Alert */}
                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p className="text-amber-800 text-sm">
                                    <strong>Important:</strong> Please save your Order ID. You'll need it to track your order.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={handleDownloadInvoice}
                                    style={outlineBtnStyle}
                                    className="hover:bg-gray-100"
                                >
                                    📄 Download Invoice
                                </button>
                                <Link href="/track-order" style={outlineBtnStyle} className="text-center hover:bg-gray-100">
                                    📦 Track Order
                                </Link>
                            </div>

                            <div className="mt-6 text-center">
                                <Link 
                                    href="/collections" 
                                    style={primaryBtnStyle}
                                    className="inline-block hover:scale-105 transition-transform"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // FAILED STATE
    if (status === 'failed' || status === 'error') {
        return (
            <div id="main-wrapper">
                {/* Error Banner */}
                <div 
                    className="page-banner-section pb-0! section min-h-[50vh]! lg:min-h-[60vh]! flex! items-end! pt-[180px]! lg:pt-[240px]!" 
                    style={{ background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)' }}
                >
                    <div className="container-fluid px-4 px-md-5">
                        <div className="row">
                            <div className="col-12 p-0">
                                <div className="page-banner w-100 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end">
                                    <div className="order-2 order-md-1 mt-2 mt-md-0">
                                        <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                                            <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                                            <li className="text-white/80">Payment</li>
                                        </ul>
                                    </div>
                                    <div className="order-1 order-md-2 text-center text-md-end">
                                        <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                            Payment Status
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Failed Content */}
                <div className="container text-center py-20">
                    <div className="max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Failed</h2>
                        <p className="text-gray-600 mb-6">{errorMessage || 'Your payment could not be processed.'}</p>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
                            <p className="text-gray-500 text-sm">
                                <strong>Note:</strong> If any amount was deducted, it will be refunded to your account within 5-7 business days.
                            </p>
                        </div>

                        {order && (
                            <p className="text-gray-500 text-sm mb-6">
                                Reference: <span className="font-mono">{order.id}</span>
                            </p>
                        )}

                        <Link 
                            href="/cart/checkout" 
                            style={primaryBtnStyle}
                            className="inline-block hover:scale-105 transition-transform"
                        >
                            Try Again
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}