import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import axios from 'axios';

function generateReferralCode() {
    return '7H-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function sendOrderConfirmationSMS(phone: string, orderId: string, amount: number) {
    try {
        // In the future, replace this console.log with an actual API call
        // Example: await axios.post('https://api.textlocal.in/send/', { ... });
        
        const message = `Thank you for your order! Order ID: ${orderId}. Amount Paid: Rs. ${amount}. Track your status here: ${process.env.NEXT_PUBLIC_BASE_URL}/track-order`;

        console.log(`\n================================================`);
        console.log(`[SMS SERVICE MOCK] Sending Order Confirmation`);
        console.log(`To Phone : ${phone}`);
        console.log(`Message  : ${message}`);
        console.log(`================================================\n`);
    } catch (error) {
        console.error("Failed to send Order SMS:", error);
    }
}

async function sendReferralSMS(phone: string, code: string, name: string) {
    try {
        // Example: Fast2SMS or Twilio logic here
        // const message = `Welcome to 7th Heaven Club, ${name}! Your referral code is ${code}. Share it to start earning rewards.`;
        // await axios.post('YOUR_SMS_API_URL', { ... });
        console.log(`[SMS MOCK] Sending to ${phone}: Welcome ${name}! Your code is ${code}`);
    } catch (error) {
        console.error("Failed to send SMS:", error);
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log("--- Payment Callback Received ---");
        
        // 1. Read raw text (Standard way)
        const rawBody = await req.text();
        
        console.log("Content-Length Header:", req.headers.get('content-length'));
        console.log("Actual Body Length:", rawBody.length);

        if (!rawBody) {
            console.error("Callback Error: Empty request body received.");
            return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
        }

        let base64Response;

        // 2. Try parsing as JSON first
        try {
            const body = JSON.parse(rawBody);
            base64Response = body.response;
            console.log("Parsed as JSON. Response field found:", !!base64Response);
        } catch (e) {
            console.log("JSON parse failed, trying URLSearchParams...");
            const params = new URLSearchParams(rawBody);
            base64Response = params.get('response');
            console.log("Parsed as Form Data. Response field found:", !!base64Response);
        }

        if (!base64Response) {
            console.error("Callback Error: Could not find 'response' in body.");
            return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
        }

        // 3. Verify the checksum
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;
        const receivedChecksum = req.headers.get('x-verify');

        if (!saltKey || !saltIndex) {
             console.error("Server Error: PhonePe credentials missing in .env");
             return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const calculatedChecksum = crypto.createHash('sha256').update(base64Response + saltKey).digest('hex') + '###' + saltIndex;

        if (receivedChecksum !== calculatedChecksum) {
            console.error("Webhook checksum mismatch!");
            return NextResponse.json({ error: 'Checksum mismatch' }, { status: 400 });
        }

        // 4. Decode and Process
        const decodedResponse = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
        const { code: paymentStatus } = decodedResponse;
        const { merchantTransactionId, amount } = decodedResponse.data;

        console.log(`Transaction: ${merchantTransactionId}, Status: ${paymentStatus}`);

        const order = await prisma.order.findFirst({
            where: { gatewayOrderId: merchantTransactionId },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.paymentStatus !== 'PENDING') {
            return NextResponse.json({ success: true, message: 'Order already processed.' });
        }

        if (paymentStatus === 'PAYMENT_SUCCESS') {
            const amountPaid = amount / 100;
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'PAID',
                    netAmountPaid: amountPaid,
                }
            });

            const orderItems = order.items as any[];
            
            for (const item of orderItems) {
                const quantityToDeduct = item.quantity || 1;
                try {
                    if (item.selectedVariant && item.selectedVariant.id) {
                        const updatedVariant = await prisma.productVariant.update({
                            where: { id: item.selectedVariant.id },
                            data: { stock: { decrement: quantityToDeduct } }
                        });

                        if (updatedVariant.stock < 0) {
                            await prisma.productVariant.update({
                                where: { id: item.selectedVariant.id },
                                data: { stock: 0 }
                            });
                        }
                    } else {
                        const updatedProduct = await prisma.product.update({
                            where: { id: item.id }, 
                            data: { stock: { decrement: quantityToDeduct } }
                        });

                        if (updatedProduct.stock <= 0) {
                            await prisma.product.update({
                                where: { id: item.id },
                                data: { 
                                    inStock: false,
                                    stock: 0
                                }
                            });
                            console.log(`Product ${item.name} is now OUT OF STOCK.`);
                        }
                    }
                } catch (err) {
                    console.error(`Inventory Error: Failed to decrement stock for item ${item.name}:`, err);
                }
            }

            // Send SMS
            if (order.user.phone) {
                await sendOrderConfirmationSMS(order.user.phone, order.id, amountPaid);
            }

            // MLM Logic
            if (order.mlmOptInRequested) {
                let newReferralCode = order.user.referralCode;
                if (!newReferralCode) newReferralCode = generateReferralCode();

                await prisma.user.update({
                    where: { id: order.userId },
                    data: { is7thHeaven: true, referralCode: newReferralCode } 
                });
                if (order.user.phone && newReferralCode) {
                    await sendReferralSMS(order.user.phone, newReferralCode, order.user.fullName);
                }
            }

            // Clear Cart
            const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
            if (cart) {
                await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            }

        } else {
            await prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'FAILED' }
            });
        }

        return NextResponse.json({ success: true, message: 'Callback received' });

    } catch (error) {
        console.error('Payment Callback Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}