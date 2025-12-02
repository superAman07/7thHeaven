import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import axios from 'axios';

function generateReferralCode() {
    return '7H-' + Math.random().toString(36).substring(2, 8).toUpperCase();
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
        const body = await req.json();
        const base64Response = body.response;

        // 1. Verify the checksum
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;
        const receivedChecksum = req.headers.get('x-verify');

        const calculatedChecksum = crypto.createHash('sha256').update(base64Response + saltKey).digest('hex') + '###' + saltIndex;

        if (receivedChecksum !== calculatedChecksum) {
            console.error("Webhook checksum mismatch!");
            return NextResponse.json({ error: 'Checksum mismatch' }, { status: 400 });
        }

        // 2. Decode the response payload
        const decodedResponse = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
        const { code: paymentStatus } = decodedResponse;
        const { merchantTransactionId, amount } = decodedResponse.data;

        // 3. Find the order
        const order = await prisma.order.findFirst({
            where: { gatewayOrderId: merchantTransactionId } ,
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.paymentStatus !== 'PENDING') {
            return NextResponse.json({ success: true, message: 'Order already processed.' });
        }

        // 4. Update the order status
        if (paymentStatus === 'PAYMENT_SUCCESS') {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'PAID',
                    netAmountPaid: amount / 100,
                }
            });

            if (order.mlmOptInRequested) {
                let newReferralCode = order.user.referralCode;
                
                if (!newReferralCode) {
                    newReferralCode = generateReferralCode();
                }

                await prisma.user.update({
                    where: { id: order.userId },
                    data: { 
                        is7thHeaven: true,
                        referralCode: newReferralCode 
                    } 
                });
                if (order.user.phone && newReferralCode) {
                    await sendReferralSMS(order.user.phone, newReferralCode, order.user.fullName);
                }
            }

            // NEW: Clear the user's cart after successful payment
            const cart = await prisma.cart.findUnique({
                where: { userId: order.userId }
            });
            
            if (cart) {
                await prisma.cartItem.deleteMany({
                    where: { cartId: cart.id }
                });
            }

        } else {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'FAILED',
                }
            });
        }

        return NextResponse.json({ success: true, message: 'Callback received' });

    } catch (error) {
        console.error('Payment Callback Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}