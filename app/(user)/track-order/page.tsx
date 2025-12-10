'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

    return (
        <div id="main-wrapper">
            {/* Banner */}
            <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
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
                                <div className="order-details-table table-responsive border p-4 rounded">
                                    <h3 className="mb-4">Order Status: <span className="text-primary">{orderData.status}</span></h3>
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td><strong>Order ID:</strong></td>
                                                <td>{orderData.id}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Date:</strong></td>
                                                <td>{new Date(orderData.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Payment Status:</strong></td>
                                                <td>
                                                    <span className={`badge ${orderData.paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning'}`}>
                                                        {orderData.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><strong>Total Amount:</strong></td>
                                                <td>Rs. {parseFloat(orderData.subtotal).toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <h4 className="mt-4">Items</h4>
                                    <ul className="list-group">
                                        {Array.isArray(orderData.items) && orderData.items.map((item: any, idx: number) => (
                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <br />
                                                    <small className="text-muted">Size: {item.size} | Qty: {item.quantity}</small>
                                                </div>
                                                <span>Rs. {item.priceAtPurchase}</span>
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