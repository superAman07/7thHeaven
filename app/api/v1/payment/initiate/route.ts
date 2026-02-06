import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import uniqid from 'uniqid';

/**
 * @swagger
 * /api/v1/payment/initiate:
 *   post:
 *     summary: Initiate Payment (Generic/PayU)
 *     description: >
 *       Initiates a payment transaction. 
 *       **Note:** Currently pending final integration with PayU/Gateway.
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initialized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 paymentUrl:
 *                   type: string
 *                   description: "Gateway URL (Pending)"
 */

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // 1. Fetch order details securely from DB
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true } // Include user to get their phone number
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 2. Prepare the payment payload for PhonePe
        const amountInPaise = order.subtotal.toNumber() * 100;
        const merchantTransactionId = uniqid();

        await prisma.order.update({
            where: { id: orderId },
            data: { gatewayOrderId: merchantTransactionId },
        });

        const paymentData = {
            merchantId: process.env.PHONEPE_MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: order.userId,
            amount: amountInPaise,
            redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/status/${merchantTransactionId}`,
            redirectMode: 'REDIRECT',
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/payment/callback`,
            mobileNumber: order.user.phone, // Assuming user model has a phone field
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        // 3. Create the checksum (X-VERIFY header)
        const payloadString = JSON.stringify(paymentData);
        const base64Payload = Buffer.from(payloadString).toString('base64');
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;

        const stringToHash = `${base64Payload}/pg/v1/pay${saltKey}`;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = `${sha256}###${saltIndex}`;

        // 4. Make the API call to PhonePe
        const phonepeResponse = await fetch(`${process.env.PHONEPE_HOST_URL}/pg/v1/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
            },
            body: JSON.stringify({ request: base64Payload }),
        });

        const responseData = await phonepeResponse.json();

        if (!responseData.success) {
            console.error("PhonePe API Error:", responseData);
            return NextResponse.json({ error: 'Failed to initiate payment with PhonePe', details: responseData.message }, { status: 500 });
        }

        // 5. Return the payment URL to the client
        const paymentUrl = responseData.data.instrumentResponse.redirectInfo.url;
        return NextResponse.json({ success: true, paymentUrl });

    } catch (error) {
        console.error('Payment Initiation Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}