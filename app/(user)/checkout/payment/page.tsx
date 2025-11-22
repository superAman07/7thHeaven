'use client';
import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    return (
        <div className="container pt-100 pb-100 text-center">
            <h1>Complete Your Payment</h1>
            <p>Please pay for your order.</p>
            
            <div className="mt-5">
                <h3>Order ID: {orderId}</h3>
                <h2>Amount to Pay: Rs. {amount}</h2>
            </div>

            <div className="mt-5">
                {/* Payment Gateway Button (e.g., Razorpay) will go here */}
                <button className="btn btn-lg btn-round">Pay Now</button>
            </div>
        </div>
    );
}