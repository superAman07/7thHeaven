'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

interface OrderStatus {
    id: string;
    paymentStatus: string;
    subtotal: number;
}

export default function PaymentStatusPage() {
    const params = useParams();
    const { transactionId } = params;
    const { clearCart } = useCart();

    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [order, setOrder] = useState<OrderStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!transactionId) return;

        const checkStatus = async () => {
            try {
                const response = await axios.get(`/api/v1/payment/status/${transactionId}`);
                if (response.data.success) {
                    const orderData = response.data.order;
                    setOrder(orderData);
                    if (orderData.paymentStatus === 'PAID') {
                        setStatus('success');
                        clearCart();
                    } else {
                        setStatus('failed');
                    }
                } else {
                    throw new Error(response.data.error || 'Failed to fetch status.');
                }
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.response?.data?.error || err.message || 'An unknown error occurred.');
            }
        };

        // We add a small delay to give the webhook time to process first.
        const timer = setTimeout(() => {
            checkStatus();
        }, 2000);

        return () => clearTimeout(timer);

    }, [transactionId, clearCart]);

    if (status === 'loading') {
        return (
            <div className="container text-center pt-100 pb-100">
                <h2>Verifying Payment...</h2>
                <p>Please wait, we are confirming your payment status.</p>
                <div className="spinner-border text-warning mt-4" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (status === 'success' && order) {
        return (
            <div className="container text-center pt-100 pb-100">
                <div className="icon-success mb-4" style={{ fontSize: '80px', color: '#28a745' }}>✓</div>
                <h1>Payment Successful!</h1>
                <p className="lead">Thank you for your purchase.</p>
                <div className="mt-4">
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Amount Paid:</strong> Rs. {order.subtotal}</p>
                </div>
                <Link href="/collections" className="btn btn-round mt-4">Continue Shopping</Link>
            </div>
        );
    }

    if (status === 'failed' || status === 'error') {
        return (
            <div className="container text-center pt-100 pb-100">
                <div className="icon-failed mb-4" style={{ fontSize: '80px', color: '#dc3545' }}>✗</div>
                <h1>Payment Failed</h1>
                <p className="lead">{errorMessage || 'Your payment could not be processed.'}</p>
                <p>If the amount was deducted, it will be refunded as per bank norms.</p>
                <div className="mt-4">
                    {order && <p><strong>Order ID:</strong> {order.id}</p>}
                    <Link href="/cart" className="btn btn-round mt-4">Try Again</Link>
                </div>
            </div>
        );
    }

    return null;
}