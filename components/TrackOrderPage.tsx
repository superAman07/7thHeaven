'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { generateInvoice } from '@/services/invoiceGenerator';

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
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (error) {
                reject(new Error("CORS Security Error: Cannot export image data"));
            }
        };
        
        img.onerror = () => {
             reject(new Error("Failed to load image source"));
        };
    });
};

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [siteSettings, setSiteSettings] = useState<any>(null);

    React.useEffect(() => {
        axios.get('/api/v1/site-settings').then(res => {
            if(res.data.success) {
                setSiteSettings(res.data.data);
            }
        }).catch(err => console.error("Failed to fetch settings", err));
    }, []);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setOrderData(null);
        const isEmail = identifier.includes('@');
        const payload = {
            orderId: orderId.trim(),
            ...(isEmail ? { email: identifier.trim() } : { phone: identifier.trim() })
        };
        try {
            const res = await axios.post('/api/v1/orders/track', payload);
            if (res.data.success) {
                setOrderData(res.data.order);
                toast.success("Order found!");
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || "Order not found. Please check your details.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!orderData) return;
        
        try {
            let logoBase64 = undefined;
            const defaultLogo = '/celsius-logo.png';

            const loadLogo = async (url: string) => {
                try {
                    return await urlToBase64(url);
                } catch (e) {
                    return null;
                }
            };

            if (siteSettings?.logoUrl) {
                logoBase64 = await loadLogo(siteSettings.logoUrl);
            }

            if (!logoBase64) {
                console.log("Remote logo failed, using local fallback...");
                logoBase64 = await loadLogo(defaultLogo);
            }

            const invoiceData: any = {
                id: orderData.orderId || orderData.id,
                status: orderData.status,
                createdAt: orderData.createdAt,
                couponCode: orderData.couponCode || "",
                subtotal: parseFloat(orderData.subtotal),
                discount: parseFloat(orderData.discount) || 0,
                netAmountPaid: parseFloat(orderData.netAmountPaid) || (parseFloat(orderData.subtotal) - (parseFloat(orderData.discount) || 0)),
                paymentStatus: orderData.paymentStatus,
                items: orderData.items,
                shippingAddress: orderData.shippingAddress,
                companyDetails: {
                    name: siteSettings?.companyName || "Celsius",
                    address: `${siteSettings?.address || ''}, ${siteSettings?.city || ''}`,
                    phone: siteSettings?.phone || "",
                    email: siteSettings?.email || "",
                    logoUrl: logoBase64,
                    gstNumber: siteSettings?.gstNumber || ""
                }
            };
            generateInvoice(invoiceData);
            toast.success("Invoice downloading...");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate invoice");
        }
    };

    return (
        <div id="main-wrapper">
            {/* Banner */}
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
                                        <li className="text-white/80">Track Order</li>
                                    </ul>
                                </div>
                                <div className="order-1 order-md-2 text-center text-md-end">
                                    <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                        Track Your Order
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Form Section */}
            <div className="py-16 md:py-24 px-4 min-h-[50vh] bg-[#f9f9f9]">
                <div className="container mx-auto max-w-lg">
                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
                        <form onSubmit={handleTrack}>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Order ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. CMLIHUZ7..." 
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ddb040] focus:ring-1 focus:ring-[#ddb040] outline-none transition-all text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Found in your confirmation email.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number OR Email</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter phone or email used at checkout" 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ddb040] focus:ring-1 focus:ring-[#ddb040] outline-none transition-all text-sm"
                                    />
                                </div>
                                <button 
                                    className="w-full py-3 bg-[#ddb040] hover:bg-[#c9a227] text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 text-sm uppercase tracking-wide"
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : 'Track Order'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Details Result - Compact & Responsive */}
                    {orderData && (
                        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header */}
                            <div className="bg-[#1a1511] p-5 flex flex-wrap justify-between items-center gap-3">
                                <div>
                                    <div className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Order Status</div>
                                    <div className="text-[#ddb040] text-lg font-bold uppercase">{orderData.status}</div>
                                </div>
                                {(['PAID', 'REFUNDED'].includes((orderData.paymentStatus || '').toString().trim().toUpperCase()) || 
                                  orderData.status === 'DELIVERED') && (
                                        <button 
                                        onClick={handleDownloadInvoice}
                                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium backdrop-blur-sm transition-all flex items-center gap-2"
                                    >
                                        <i className="fa fa-download"></i> Invoice
                                    </button>
                                )}
                            </div>
                            
                            {/* Details Grid */}
                            <div className="p-5 md:p-6">
                                <div className="grid grid-cols-1 gap-6 mb-6">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                            <span className="text-gray-500">Order ID</span>
                                            <span className="font-mono font-medium">{orderData.orderId || orderData.id}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                            <span className="text-gray-500">Date</span>
                                            <span className="font-medium">{new Date(orderData.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                            <span className="text-gray-500">Payment</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${orderData.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {orderData.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide mb-2">Shipping To</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            <strong className="block text-gray-900">{orderData.shippingAddress?.name || orderData.customerName}</strong>
                                            {orderData.shippingAddress?.street}, {orderData.shippingAddress?.city}<br/>
                                            {orderData.shippingAddress?.state} {orderData.shippingAddress?.postalCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wide mb-3 border-b pb-1">Order Items</h4>
                                    <div className="space-y-3">
                                        {Array.isArray(orderData.items) && orderData.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center group hover:bg-gray-50 p-2 rounded transition-colors text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                        <i className="fa fa-cube text-xs"></i>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-xs text-gray-500">Qty: {item.quantity} × Rs. {item.priceAtPurchase}</div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-gray-900">Rs. {item.priceAtPurchase * item.quantity}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-semibold">Rs. {parseFloat(orderData.subtotal).toLocaleString()}</span>
                                        </div>
                                        {orderData.discount && parseFloat(orderData.discount) > 0 && (
                                            <div className="flex justify-between items-center mb-2 text-green-600">
                                                <span>Discount</span>
                                                <span>- Rs. {parseFloat(orderData.discount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <span className="text-base font-bold text-gray-900">Total Paid</span>
                                            <span className="text-lg font-serif text-[#ddb040] font-bold">
                                                Rs. {(parseFloat(orderData.netAmountPaid) || parseFloat(orderData.subtotal) - (parseFloat(orderData.discount) || 0)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}