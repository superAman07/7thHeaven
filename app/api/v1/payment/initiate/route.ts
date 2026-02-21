import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import uniqid from 'uniqid';
import { generatePayUHash } from '@/lib/payu';

/**
 * @swagger
 * /api/v1/payment/initiate:
 *   post:
 *     summary: Initiate Payment (PayU)
 *     description: >
 *       Generates a secure hash and transaction ID for PayU. 
 *       Returns the parameters required to submit the PayU form from the client side.
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
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payuParams:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     txnid:
 *                       type: string
 *                     amount:
 *                       type: string
 *                     productinfo:
 *                       type: string
 *                     firstname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     surl:
 *                       type: string
 *                     furl:
 *                       type: string
 *                     hash:
 *                       type: string
 *                 actionUrl:
 *                   type: string
 *                   description: "The PayU URL to submit the form to (Test/Live)"
 *       400:
 *         description: Missing Order ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error
 */

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // 1. Fetch order details securely from DB
        // Include user to get their contact details for PayU
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true } 
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.gatewayOrderId) {
            const existingTxnid = order.gatewayOrderId;
            const finalAmount = order.netAmountPaid && order.netAmountPaid.toNumber() > 0 
                ? order.netAmountPaid.toNumber()
                : (order.subtotal.toNumber() - (order.discount?.toNumber() || 0));
            
            const amountStr = finalAmount.toFixed(2);
            const productinfo = `Order #${orderId}`;
            const firstname = order.user.fullName?.split(' ')[0];
            const email = order.user.email;
            const phone = order.user.phone;
            const hash = generatePayUHash({
                txnid: existingTxnid,
                amount: amountStr,
                productinfo,
                firstname,
                email
            });
            return NextResponse.json({
                success: true,
                payuParams: {
                    key: process.env.PAYU_KEY,
                    txnid: existingTxnid,
                    amount: amountStr,
                    productinfo,
                    firstname,
                    email,
                    phone,
                    surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/payment/callback`,
                    furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/payment/callback`,
                    hash
                },
                actionUrl: `${process.env.PAYU_BASE_URL}/_payment`
            });
        }

        // 2. Prepare PayU Data
        // PayU requires a unique transaction ID. We accept this as the Gateway Order ID.
        const txnid = uniqid(); 
        
        // Calculate amount: PayU expects a string with up to 2 decimal places (e.g. "100.00")
        const finalAmount = order.netAmountPaid && order.netAmountPaid.toNumber() > 0 
            ? order.netAmountPaid.toNumber()
            : (order.subtotal.toNumber() - (order.discount?.toNumber() || 0));
        
        const amountStr = finalAmount.toFixed(2);
            
        // Essential fields for Hash Calculation
        const productinfo = `Order #${orderId}`;
        const firstname = order.user.fullName?.split(' ')[0] || 'Customer';
        const email = order.user.email || 'customerr@example.com';
        const phone = order.user.phone || '9999999999';

        // 3. Generate Secure Hash using our utility
        const hash = generatePayUHash({
            txnid,
            amount: amountStr,
            productinfo,
            firstname,
            email
        });

        // 4. Update Order with the Transaction ID (Critical for tracking)
        await prisma.order.update({
            where: { id: orderId },
            data: { gatewayOrderId: txnid },
        });

        // 5. Return params to Frontend
        // The frontend will use these to create a hidden form and auto-submit it to PayU
        return NextResponse.json({
            success: true,
            payuParams: {
                key: process.env.PAYU_KEY,
                txnid: txnid,
                amount: amountStr,
                productinfo: productinfo,
                firstname: firstname,
                email: email,
                phone: phone,
                surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/payment/callback`, // Success URL
                furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/payment/callback`, // Failure URL
                hash: hash
            },
            // Note: In Production, this should be https://secure.payu.in/_payment
            // We use the env variable to switch easily.
            actionUrl: `${process.env.PAYU_BASE_URL}/_payment` 
        });

    } catch (error) {
        console.error('Payment Initiation Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import crypto from 'crypto';
// import uniqid from 'uniqid';

// /**
//  * @swagger
//  * /api/v1/payment/initiate:
//  *   post:
//  *     summary: Initiate Payment (Generic/PayU)
//  *     description: >
//  *       Initiates a payment transaction. 
//  *       **Note:** Currently pending final integration with PayU/Gateway.
//  *     tags:
//  *       - Payment
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - orderId
//  *             properties:
//  *               orderId:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Payment initialized
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 paymentUrl:
//  *                   type: string
//  *                   description: "Gateway URL (Pending)"
//  */

// export async function POST(req: NextRequest) {
//     try {
//         const { orderId } = await req.json();

//         if (!orderId) {
//             return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
//         }

//         // 1. Fetch order details securely from DB
//         const order = await prisma.order.findUnique({
//             where: { id: orderId },
//             include: { user: true } // Include user to get their phone number
//         });

//         if (!order) {
//             return NextResponse.json({ error: 'Order not found' }, { status: 404 });
//         }

//         // 2. Prepare the payment payload for PhonePe
//         const finalAmount = order.netAmountPaid && order.netAmountPaid.toNumber() > 0 
//             ? order.netAmountPaid.toNumber() 
//             : order.subtotal.toNumber() - (order.discount?.toNumber() || 0);
//         const amountInPaise = Math.round(finalAmount * 100);
//         const merchantTransactionId = uniqid();

//         await prisma.order.update({
//             where: { id: orderId },
//             data: { gatewayOrderId: merchantTransactionId },
//         });

//         const paymentData = {
//             merchantId: process.env.PHONEPE_MERCHANT_ID,
//             merchantTransactionId: merchantTransactionId,
//             merchantUserId: order.userId,
//             amount: amountInPaise,
//             redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/status/${merchantTransactionId}`,
//             redirectMode: 'REDIRECT',
//             callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/payment/callback`,
//             mobileNumber: order.user.phone, // Assuming user model has a phone field
//             paymentInstrument: {
//                 type: 'PAY_PAGE'
//             }
//         };

//         // 3. Create the checksum (X-VERIFY header)
//         const payloadString = JSON.stringify(paymentData);
//         const base64Payload = Buffer.from(payloadString).toString('base64');
//         const saltKey = process.env.PHONEPE_SALT_KEY;
//         const saltIndex = process.env.PHONEPE_SALT_INDEX;

//         const stringToHash = `${base64Payload}/pg/v1/pay${saltKey}`;
//         const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
//         const checksum = `${sha256}###${saltIndex}`;

//         // 4. Make the API call to PhonePe
//         const phonepeResponse = await fetch(`${process.env.PHONEPE_HOST_URL}/pg/v1/pay`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-VERIFY': checksum,
//             },
//             body: JSON.stringify({ request: base64Payload }),
//         });

//         const responseData = await phonepeResponse.json();

//         if (!responseData.success) {
//             console.error("PhonePe API Error:", responseData);
//             return NextResponse.json({ error: 'Failed to initiate payment with PhonePe', details: responseData.message }, { status: 500 });
//         }

//         // 5. Return the payment URL to the client
//         const paymentUrl = responseData.data.instrumentResponse.redirectInfo.url;
//         return NextResponse.json({ success: true, paymentUrl });

//     } catch (error) {
//         console.error('Payment Initiation Error:', error);
//         const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
//         return NextResponse.json({ error: errorMessage }, { status: 500 });
//     }
// }