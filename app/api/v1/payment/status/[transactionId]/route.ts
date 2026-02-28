import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';
import crypto from 'crypto';
import axios from 'axios';

/**
 * @swagger
 * /api/v1/payment/status/{transactionId}:
 *   get:
 *     summary: Get Payment Status
 *     description: Retrieves the current status of a payment transaction and order details.
 *     tags:
 *       - Payment
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID from payment gateway
 *         example: "TEST-1770545426492"
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Order ID
 *                     paymentStatus:
 *                       type: string
 *                       enum: [PENDING, PAID, FAILED]
 *                       example: "PAID"
 *                     subtotal:
 *                       type: number
 *                       description: Original cart total
 *                       example: 9750
 *                     netAmountPaid:
 *                       type: number
 *                       description: Final amount after discount
 *                       example: 8775
 *                     discount:
 *                       type: number
 *                       description: Discount amount applied
 *                       example: 975
 *                     couponCode:
 *                       type: string
 *                       nullable: true
 *                       example: "SUMMER20"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           priceAtPurchase:
 *                             type: number
 *                           size:
 *                             type: string
 *                     shippingAddress:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         fullAddress:
 *                           type: string
 *                         city:
 *                           type: string
 *                         state:
 *                           type: string
 *                         pincode:
 *                           type: string
 *                         phone:
 *                           type: string
 *                     mlmOptInRequested:
 *                       type: boolean
 *                       description: Whether user opted for 7th Heaven
 *                     user:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         isGuest:
 *                           type: boolean
 *                           description: True if user has no password set (guest checkout)
 *                           example: true
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
    try {
        const userId = await getUserIdFromToken(req);
        const { transactionId } = await params;

        // 1. Find the order
        let order = await prisma.order.findFirst({
            where: { gatewayOrderId: transactionId },
            select: {
                id: true,
                paymentStatus: true,
                subtotal: true,
                netAmountPaid: true,
                discount: true,
                couponCode: true,
                createdAt: true,
                items: true,
                shippingAddress: true,
                gatewayOrderId: true,
                mlmOptInRequested: true,
                userId: true,
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                        passwordHash: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        if (order.paymentStatus === 'PAID') {
            const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
            if (cart) {
                await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            }
            const { user, ...orderData } = order!;
            return NextResponse.json({ 
                success: true, 
                order: { 
                    ...orderData, 
                    user: { fullName: user?.fullName, email: user?.email, phone: user?.phone },
                    isGuest: !user?.passwordHash 
                } 
            });
        }

        // 2. ACTIVE STATUS CHECK: If DB says PENDING, ask PhonePe directly
        if (order.paymentStatus === 'PENDING' && order.gatewayOrderId) {
            try {
                const merchantId = process.env.PHONEPE_MERCHANT_ID;
                const saltKey = process.env.PHONEPE_SALT_KEY;
                const saltIndex = process.env.PHONEPE_SALT_INDEX;
                const hostUrl = process.env.PHONEPE_HOST_URL;

                const stringToHash = `/pg/v1/status/${merchantId}/${order.gatewayOrderId}` + saltKey;
                const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
                const checksum = sha256 + "###" + saltIndex;

                const ppRes = await axios.get(`${hostUrl}/pg/v1/status/${merchantId}/${order.gatewayOrderId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': checksum,
                        'X-MERCHANT-ID': merchantId
                    }
                });

                const ppStatus = ppRes.data.code;

                if (ppStatus === 'PAYMENT_SUCCESS') {
                    // --- SUCCESS LOGIC (Sync with Callback Logic) ---
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { paymentStatus: 'PAID' }
                    });

                    // Inventory Management (Copy of Callback Logic)
                    const orderItems = order.items as any[];
                    for (const item of orderItems) {
                        const quantityToDeduct = item.quantity || 1;
                        const variantId = item.variantId || item.selectedVariant?.id;
                        const productId = item.productId || item.id;

                        try {
                            if (variantId) {
                                const updatedVariant = await prisma.productVariant.update({
                                    where: { id: variantId },
                                    data: { stock: { decrement: quantityToDeduct } }
                                });
                                if (updatedVariant.stock < 0) {
                                    await prisma.productVariant.update({
                                        where: { id: variantId },
                                        data: { stock: 0 }
                                    });
                                }
                            } else if (productId) {
                                const updatedProduct = await prisma.product.update({
                                    where: { id: productId }, 
                                    data: { stock: { decrement: quantityToDeduct } }
                                });
                                if (updatedProduct.stock <= 0) {
                                    await prisma.product.update({
                                        where: { id: productId },
                                        data: { inStock: false, stock: 0 }
                                    });
                                }
                            }
                        } catch (err) {
                            console.error(`Inventory Error for item ${item.name}:`, err);
                        }
                    }
                    // ------------------------------------------------/

                } else if (ppStatus === 'PAYMENT_ERROR' || ppStatus === 'PAYMENT_DECLINED') {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { paymentStatus: 'FAILED' }
                    });
                }
                
                // Refresh order object after update
                order = await prisma.order.findFirst({
                    where: { gatewayOrderId: transactionId },
                    select: {
                        id: true,
                        paymentStatus: true,
                        subtotal: true,
                        netAmountPaid: true,
                        discount: true,
                        couponCode: true,
                        createdAt: true,
                        items: true,
                        shippingAddress: true,
                        gatewayOrderId: true,
                        userId: true,
                        mlmOptInRequested: true,
                        user: { select: { fullName: true, email: true, phone: true, passwordHash: true } }
                    }
                });

            } catch (checkErr) {
                console.error("Active Status Check Failed:", checkErr);
            }
        }

        const { user: usr, ...rest } = order!;
        return NextResponse.json({ 
            success: true, 
            order: { 
                ...rest, 
                user: { fullName: usr?.fullName, email: usr?.email, phone: usr?.phone },
                isGuest: !usr?.passwordHash 
            } 
        });
    } catch (error) {
        console.error('Get Payment Status Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}