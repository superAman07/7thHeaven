'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { generateInvoice } from '@/services/invoiceGenerator';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);

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

    const handleDownloadInvoice = () => {
        if (!orderData) return;
        
        try {
            const invoiceData: any = {
                id: orderData.orderId || orderData.id,
                status: orderData.status,
                createdAt: orderData.createdAt,
                subtotal: parseFloat(orderData.subtotal),
                paymentStatus: orderData.paymentStatus,
                items: orderData.items,
                shippingAddress: orderData.shippingAddress
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
                className="page-banner-section section min-h-[30vh]! lg:min-h-[45vh]! flex! items-end! pb-[30px]! lg:pb-[40px]!" 
                style={{ 
                    background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)',
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="page-banner text-center">
                                <h1>Track Your Order</h1>
                                <ul className="page-breadcrumb">
                                    <li><Link href="/">Home</Link></li>
                                    <li>Track Order</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Form Section */}
            <div className="py-20 px-4">
                <div className="container mx-auto max-w-xl">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <form onSubmit={handleTrack}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. CMLIHUZ7..." 
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ddb040] focus:ring-1 focus:ring-[#ddb040] outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Found in your confirmation email.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number OR Email</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter the phone or email used at checkout" 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ddb040] focus:ring-1 focus:ring-[#ddb040] outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    className="w-full py-4 bg-[#ddb040] hover:bg-[#c9a227] text-white font-bold rounded-lg transition-colors shadow-lg shadow-[#ddb040]/30 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : 'Track Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Order Details Result */}
                    {orderData && (
                        <div className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header */}
                            <div className="bg-[#1a1511] p-6 flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <div className="text-white/60 text-sm uppercase tracking-wider mb-1">Order Status</div>
                                    <div className="text-[#ddb040] text-2xl font-bold uppercase">{orderData.status}</div>
                                </div>
                                {['PAID', 'REFUNDED'].includes((orderData.paymentStatus || '').toString().trim().toUpperCase()) && (
                                    <button 
                                        onClick={handleDownloadInvoice}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm transition-all flex items-center gap-2"
                                    >
                                        <i className="fa fa-download"></i> Invoice
                                    </button>
                                )}
                            </div>
                            {/* Details Grid */}
                            <div className="p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-3">
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
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${orderData.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {orderData.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Shipping To</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            <strong className="block text-gray-900">{orderData.shippingAddress?.name || orderData.customerName}</strong>
                                            {orderData.shippingAddress?.street}<br/>
                                            {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} {orderData.shippingAddress?.postalCode}<br/>
                                            {orderData.shippingAddress?.country}<br/>
                                            <span className="block mt-2 text-gray-500">{orderData.shippingAddress?.phone}</span>
                                        </p>
                                    </div>
                                </div>
                                {/* Items */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b pb-2">Order Items</h4>
                                    <div className="space-y-4">
                                        {Array.isArray(orderData.items) && orderData.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center group hover:bg-gray-50 p-2 rounded transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                        <i className="fa fa-cube"></i>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-sm text-gray-500">Qty: {item.quantity} × Rs. {item.priceAtPurchase}</div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-gray-900">Rs. {item.priceAtPurchase * item.quantity}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-serif text-[#ddb040] font-bold">Rs. {parseFloat(orderData.subtotal).toLocaleString()}</span>
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