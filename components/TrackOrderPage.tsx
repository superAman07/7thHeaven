'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // We will need to create this API route next
            const res = await axios.get(`/api/v1/orders/track/${orderId}`);
            setStatus(res.data);
        } catch (error) {
            alert("Order not found");
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h1>Track Your Order</h1>
            <form onSubmit={handleTrack} className="my-4">
                <input 
                    type="text" 
                    placeholder="Enter Order ID" 
                    className="form-control mb-2"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    required
                />
                <button className="btn btn-primary" disabled={loading}>
                    {loading ? 'Tracking...' : 'Track'}
                </button>
            </form>
            
            {status && (
                <div className="mt-4 p-4 border rounded">
                    <h3>Order Status: {status.status}</h3>
                    <p>Amount: {status.amount}</p>
                    {/* Add more details */}
                </div>
            )}
        </div>
    );
}