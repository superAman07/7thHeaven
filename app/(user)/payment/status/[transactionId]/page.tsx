'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import toast from 'react-hot-toast';
import { generateInvoice, InvoiceData } from '@/services/invoiceGenerator'; // Import the service

export default function PaymentStatusPage() {
    const params = useParams();
    const { transactionId } = params;
    const { clearCart } = useCart();

    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');

    const [order, setOrder] = useState<InvoiceData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [retries, setRetries] = useState(0);

    useEffect(() => {
        if (!transactionId) return;
        // Stop polling if final state reached
        if (status === 'success' || status === 'failed') return;

        const checkStatus = async () => {
            try {
                // DEBUG: Add timestamp to prevent caching (CRITICAL FIX)
                console.log(`[Polling ${retries + 1}/30] Checking status for: ${transactionId}`);
                const response = await axios.get(`/api/v1/payment/status/${transactionId}?_t=${Date.now()}`);
                
                console.log("API Response:", response.data);

                if (response.data.success) {
                    const orderData = response.data.order;
                    setOrder(orderData);
                    
                    console.log("Current Payment Status in DB:", orderData.paymentStatus);

                    if (orderData.paymentStatus === 'PAID') {
                        setStatus('success');
                        clearCart();
                        toast.success("Payment Confirmed!");
                    } else if (orderData.paymentStatus === 'FAILED' || orderData.paymentStatus === 'CANCELLED') {
                        setStatus('failed');
                        setErrorMessage("Payment was marked as FAILED by the gateway.");
                    } else {
                        // Still PENDING
                        if (retries >= 30) { 
                            setStatus('failed');
                            setErrorMessage("Payment confirmation timed out. If money was deducted, it will be updated shortly.");
                        } else {
                            // Trigger next poll
                            setRetries(prev => prev + 1);
                        }
                    }
                }
            } catch (err: any) {
                console.error("Poll Error:", err);
                // On error, also retry unless max retries reached
                if (retries < 30) {
                    setRetries(prev => prev + 1);
                } else {
                    setStatus('error');
                    setErrorMessage(err.response?.data?.error || err.message);
                }
            }
        };

        // Wait 2 seconds before checking status
        const timer = setTimeout(() => {
            checkStatus();
        }, 2000);

        return () => clearTimeout(timer);

    }, [transactionId, retries, status, clearCart]);

    const copyToClipboard = () => {
        if (order) {
            navigator.clipboard.writeText(order.id);
            toast.success("Order ID copied to clipboard!");
        }
    };

    // --- NEW: Handle Download ---
    const handleDownloadInvoice = () => {
        if (order) {
            generateInvoice(order);
            toast.success("Invoice downloaded!");
        }
    };

    if (status === 'loading') {
        return (
            <div className="container text-center pt-100 pb-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-3">Verifying payment status...</p>
            </div>
        );
    }

    if (status === 'success' && order) {
        return (
            <div className="container text-center pt-100 pb-100">
                <div className="icon-success mb-4" style={{ fontSize: '80px', color: '#28a745' }}>✓</div>
                <h1 className="mb-3">Payment Successful!</h1>
                <p className="lead mb-4">Thank you for your purchase.</p>
                
                {/* Order Details Card */}
                <div className="card mx-auto p-4 shadow-sm mb-4" style={{ maxWidth: '500px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <h5 className="text-muted mb-3" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Reference</h5>
                    
                    <div className="mb-3">
                        <p className="mb-1 text-muted" style={{ fontSize: '13px' }}>Order ID</p>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            <span className="font-weight-bold text-dark" style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{order.id}</span>
                            <button 
                                onClick={copyToClipboard} 
                                className="btn btn-sm btn-light border" 
                                title="Copy Order ID"
                                style={{ padding: '2px 8px' }}
                            >
                                <i className="fa fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>

                    <p className="mb-0" style={{ fontSize: '18px' }}><strong>Amount Paid:</strong> Rs. {order.subtotal}</p>
                </div>

                {/* Important Warning for Guests */}
                <div className="alert alert-warning mx-auto mb-4" style={{ maxWidth: '600px', textAlign: 'left', fontSize: '14px' }}>
                    <div className="d-flex">
                        <i className="fa fa-info-circle mr-3 mt-1" style={{ fontSize: '18px' }}></i>
                        <div>
                            <strong>Important:</strong> Please save your <strong>Order ID</strong> shown above. 
                            <br/>
                            You will need this ID to track your order status if you are not logged in.
                        </div>
                    </div>
                </div>

                <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
                    {/* --- NEW: Download Button --- */}
                    <button 
                        onClick={handleDownloadInvoice} 
                        className="btn btn-outline-dark btn-round"
                    >
                        <i className="fa fa-file-pdf-o mr-2"></i> Download Invoice
                    </button>

                    <Link href="/track-order" className="btn btn-outline-dark btn-round">
                        Track Order
                    </Link>
                    <Link href="/collections/perfumes" className="btn btn-primary btn-round" style={{ backgroundColor: '#ddb040', borderColor: '#ddb040', color: '#fff' }}>
                        Continue Shopping
                    </Link>
                </div>
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
                                    <Link href="/cart/checkout" className="btn btn-round mt-4">Try Again</Link>
            </div>
        </div>
    );
}

return null;
}