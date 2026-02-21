'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

export default function PaymentProcessPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // PayU Params state
    const [payuData, setPayuData] = useState<{
        actionUrl: string;
        params: any;
    } | null>(null);

    const initiatedRef = useRef(false);

    useEffect(() => {
        if (!orderId || initiatedRef.current) return;
        initiatedRef.current = true;

        const initiatePayment = async () => {
            try {
                const res = await axios.post('/api/v1/payment/initiate', { orderId });
                
                if (res.data.success) {
                    setPayuData({
                        actionUrl: res.data.actionUrl,
                        params: res.data.payuParams
                    });
                } else {
                    setError('Failed to initiate payment. Please try again.');
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("Initiate Error", err);
                setError(err.response?.data?.error || 'Something went wrong');
                setLoading(false);
            }
        };

        initiatePayment();
    }, [orderId]);

    // Auto-submit form when data is ready
    useEffect(() => {
        if (payuData && formRef.current) {
            formRef.current.submit();
        }
    }, [payuData]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded shadow text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Payment Error</h2>
                    <p className="mb-6">{error}</p>
                    <button 
                        onClick={() => router.push('/cart/checkout')}
                        className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Return to Checkout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Redirecting to Payment Gateway...</h2>
                <p className="text-gray-500 mt-2">Please do not refresh the page.</p>
            </div>

            {/* Hidden Form for PayU */}
            {payuData && (
                <form ref={formRef} action={payuData.actionUrl} method="POST" style={{ display: 'none' }}>
                    <input type="hidden" name="key" value={payuData.params.key} />
                    <input type="hidden" name="txnid" value={payuData.params.txnid} />
                    <input type="hidden" name="productinfo" value={payuData.params.productinfo} />
                    <input type="hidden" name="amount" value={payuData.params.amount} />
                    <input type="hidden" name="email" value={payuData.params.email} />
                    <input type="hidden" name="firstname" value={payuData.params.firstname} />
                    <input type="hidden" name="phone" value={payuData.params.phone} />
                    <input type="hidden" name="surl" value={payuData.params.surl} />
                    <input type="hidden" name="furl" value={payuData.params.furl} />
                    <input type="hidden" name="hash" value={payuData.params.hash} />
                    {/* PayU mandatory empty fields for hash calculation structure */}
                    <input type="hidden" name="udf1" value="" />
                    <input type="hidden" name="udf2" value="" />
                    <input type="hidden" name="udf3" value="" />
                    <input type="hidden" name="udf4" value="" />
                    <input type="hidden" name="udf5" value="" />
                </form>
            )}
        </div>
    );
}