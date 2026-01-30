'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { generateInvoice } from '@/services/invoiceGenerator';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setOrderData(null);

        try {
            const res = await axios.post('/api/v1/orders/track', { orderId, phone });
            if (res.data.success) {
                setOrderData(res.data.order);
                toast.success("Order found!");
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || "Failed to track order";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = () => {
        if (!orderData) return;
        
        try {
            const invoiceData: any = {
                id: orderData.id,
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
            <div className="section pt-100 pb-100">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-8">
                            <div className="login-register-form-area">
                                <div className="login-register-form">
                                    <form onSubmit={handleTrack}>
                                        <div className="row">
                                            <div className="col-12 mb-20">
                                                <label>Order ID</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. clt..." 
                                                    value={orderId}
                                                    onChange={(e) => setOrderId(e.target.value)}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="col-12 mb-20">
                                                <label>Phone Number (Used at checkout)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. 9876543210" 
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <button className="btn btn-dark w-100" disabled={loading}>
                                                    {loading ? 'Searching...' : 'Track Order'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details Result */}
                    {orderData && (
                        <div className="row justify-content-center mt-50">
                            <div className="col-lg-8">
                                                                <div className="order-details-table border p-4 rounded bg-white shadow-sm">
                                    {/* HEADER SECTION STACKED */}
                                    <div className="mb-4 pb-3 border-bottom">
                                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                                            <h3 className="m-0" style={{ fontSize: '1.5rem' }}>
                                                Order Status: <span className="text-primary font-weight-bold">{orderData.status}</span>
                                            </h3>
                                            
                                            {/* CHECK CONDITION: {(orderData.paymentStatus || '').trim().toUpperCase()} */}
                                            {['PAID', 'REFUNDED'].includes((orderData.paymentStatus || '').toString().trim().toUpperCase()) && (
                                                <button 
                                                    onClick={handleDownloadInvoice}
                                                    className="btn btn-dark d-flex align-items-center gap-2 shadow-sm"
                                                    style={{ 
                                                        backgroundColor: '#ddb040', 
                                                        color: '#fff',
                                                        borderColor: '#ddb040',
                                                        padding: '10px 24px', 
                                                        borderRadius: '50px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    <i className="fa fa-file-pdf-o"></i> 
                                                    <span>Download Invoice</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* TABLE SECTION */}
                                    <div className="table-responsive">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '40%', borderTop: 'none' }}><strong>Order ID:</strong></td>
                                                    <td style={{ borderTop: 'none' }}>
                                                        <span className="badge badge-light border" style={{ fontSize: '1rem', color: '#333' }}>
                                                            #{orderData.id}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Date:</strong></td>
                                                    <td>{new Date(orderData.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Payment Status:</strong></td>
                                                    <td>
                                                        {/* Force show the raw value for debug if needed, but keeping logic same as badge */}
                                                        <span className={`badge ${orderData.paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                                                            {orderData.paymentStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Total Amount:</strong></td>
                                                    <td className="font-weight-bold" style={{ fontSize: '1.2em' }}>Rs. {parseFloat(orderData.subtotal).toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <h4 className="mt-4 mb-3 border-bottom pb-2">Items</h4>
                                    <ul className="list-group list-group-flush">
                                        {Array.isArray(orderData.items) && orderData.items.map((item: any, idx: number) => (
                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light rounded d-flex align-items-center justify-center" style={{ width: '50px', height: '50px' }}>
                                                        <i className="fa fa-cube text-muted"></i>
                                                    </div>
                                                    <div>
                                                        <strong className="d-block text-dark">{item.name}</strong>
                                                        <small className="text-muted">Size: {item.size}ml | Qty: {item.quantity}</small>
                                                    </div>
                                                </div>
                                                <span className="font-weight-bold">Rs. {item.priceAtPurchase}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}