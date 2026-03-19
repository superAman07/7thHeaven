import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import uniqid from 'uniqid';
import { sendNotification } from '@/lib/notifications';
import { sendOrderConfirmation } from '@/lib/email';

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get Order History
 *     description: Returns a list of past orders for the logged-in user.
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders with items
 *   post:
 *     summary: Place Order (Checkout)
 *     description: Creates a new order. This is the **Checkout** endpoint.
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingDetails
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     variantId:
 *                       type: string
 *               shippingDetails:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   fullAddress:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *                   country:
 *                     type: string
 *               mlmOptIn:
 *                 type: boolean
 *                 description: "If true, user becomes a 7th Heaven Member"
 *               referrerCode:
 *                 type: string
 *                 description: "Optional referral code from existing 7th Heaven member"
 *               couponCode:
 *                 type: string
 *                 nullable: true
 *                 description: "Coupon code to apply (one-time use per customer)"
 *               discountAmount:
 *                 type: number
 *                 description: "Pre-calculated discount amount"
 *     responses:
 *       200:
 *         description: Order placed successfully. If mlmSkipped is true, invite code was valid but referrer's slots were full — order still succeeds.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orderId:
 *                   type: string
 *                 totalAmount:
 *                   type: number
 *                 mlmSkipped:
 *                   type: boolean
 *                   description: "Present and true if MLM opt-in was skipped due to full slots"
 *                 mlmSkipReason:
 *                   type: string
 *                   description: "Human-readable reason why MLM opt-in was skipped"
 *       400:
 *         description: "Coupon already used, invalid items, or out of stock"
 */

function generateReferralCode() {
    return '7H-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().min(1),
    })).min(1),
    shippingDetails: z.object({
        fullName: z.string(),
        phone: z.string(),
        email: z.string().email(),
        fullAddress: z.string(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
        country: z.string(),
    }),
    mlmOptIn: z.boolean().optional(),
    referrerCode: z.string().nullable().optional(),
    couponCode: z.string().nullable().optional(),
    discountAmount: z.number().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const productIds = new Set<string>();
        orders.forEach(order => {
            const items = order.items as any[];
            if (Array.isArray(items)) {
                items.forEach(item => {
                    if (item.productId) productIds.add(item.productId);
                });
            }
        });

        const products = await prisma.product.findMany({
            where: { id: { in: Array.from(productIds) } },
            select: {
                id: true,
                name: true,
                images: true,
                genderTags: true,
                category: {
                    select: { name: true }
                }
            }
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        const enrichedOrders = orders.map(order => {
            const items = (order.items as any[]).map((item: any) => ({
                ...item,
                product: productMap.get(item.productId) || null
            }));
            return { ...order, items };
        });

        return NextResponse.json({ success: true, orders: enrichedOrders });

    } catch (error) {
        console.error('Fetch User Orders Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = orderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request body', details: validation.error }, { status: 400 });
        }
        const { items, shippingDetails, mlmOptIn, referrerCode, couponCode, discountAmount } = validation.data;
        let userId = await getUserIdFromToken(req);
        if (!userId) {
            let user = await prisma.user.findUnique({
                where: { phone: shippingDetails.phone }
            });
            if (!user && shippingDetails.email) {
                user = await prisma.user.findUnique({
                    where: { email: shippingDetails.email }
                });
            }
            if (user) {
                userId = user.id;
            } else {
                const newUser = await prisma.user.create({
                    data: {
                        fullName: shippingDetails.fullName,
                        phone: shippingDetails.phone,
                        email: shippingDetails.email,
                        fullAddress: shippingDetails.fullAddress,
                        city: shippingDetails.city,
                        state: shippingDetails.state,
                        pincode: shippingDetails.pincode,
                        country: shippingDetails.country,
                        passwordHash: null,
                    }
                });
                userId = newUser.id;
            }
        }

        const productIds = items.map(item => item.productId);
        const productsFromDb = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { variants: true }
        });
        let subtotal = 0;
        const orderItemsData = items.map(item => {
            const product = productsFromDb.find(p => p.id === item.productId);

            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }
            if (product.isArchived) {
                throw new Error(`Item "${product.name}" is no longer available (Archived). Please remove it from your cart.`);
            }
            if (!product.inStock) {
                throw new Error(`Item "${product.name}" is currently out of stock.`);
            }
            let selectedVariant;
            if (item.variantId) {
                selectedVariant = product.variants.find(v => v.id === item.variantId);
            }
            if (!selectedVariant) {
                if (product.variants.length > 0) {
                    console.warn(`No variantId provided for product ${product.name}. Defaulting to first variant.`);
                    selectedVariant = product.variants[0];
                } else {
                    throw new Error(`Product ${product.name} has no variants available.`);
                }
            }
            if (selectedVariant.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${selectedVariant.size}). Only ${selectedVariant.stock} left.`);
            }
            const basePrice = selectedVariant.price.toNumber();
            const sellingPrice = selectedVariant.sellingPrice ? selectedVariant.sellingPrice.toNumber() : null;
            const hasDiscount = sellingPrice != null && sellingPrice < basePrice;
            const price = hasDiscount ? Math.round(sellingPrice) : Math.round(basePrice);
            subtotal += price * item.quantity;
            return {
                productId: item.productId,
                variantId: selectedVariant.id,
                name: product.name,
                size: selectedVariant.size,
                image: product.images[0] || '',
                quantity: item.quantity,
                priceAtPurchase: price,
            };
        });
        // ✅ Per-user coupon usage check (safety net)
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase().trim() }
            });
            if (coupon) {
                // Check by userId
                const alreadyUsedByUser = await prisma.couponUsage.findFirst({
                    where: { couponId: coupon.id, userId: userId! }
                });
                if (alreadyUsedByUser) {
                    return NextResponse.json(
                        { error: 'You have already used this coupon' },
                        { status: 400 }
                    );
                }
                // Check by guest email (for guest checkout)
                if (!await getUserIdFromToken(req).catch(() => null) && shippingDetails.email) {
                    const guestUser = await prisma.user.findUnique({ where: { email: shippingDetails.email } });
                    if (guestUser) {
                        const usedByEmail = await prisma.couponUsage.findFirst({
                            where: { couponId: coupon.id, userId: guestUser.id }
                        });
                        if (usedByEmail) {
                            return NextResponse.json(
                                { error: 'This coupon has already been used with this email' },
                                { status: 400 }
                            );
                        }
                    }
                }
            }
        }
        let resolvedReferrerId: string | null = null;
        let mlmSkipped = false;
        let mlmSkipReason: string | undefined;
        if (mlmOptIn && referrerCode) {
            const referrer = await prisma.user.findFirst({
                where: { referralCode: referrerCode, is7thHeaven: true }
            });
            if (referrer && referrer.id !== userId) {
                const { canJoinUnderReferrer } = await import('@/lib/mlm-slot-validator');
                const slotCheck = await canJoinUnderReferrer(referrer.id);
                if (slotCheck.allowed) {
                    resolvedReferrerId = referrer.id;
                } else {
                    mlmSkipped = true;
                    mlmSkipReason = slotCheck.message;
                }
            }
        }
        const customOrderId = 'CELSIUS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const newOrder = await prisma.order.create({
            data: {
                id: customOrderId,
                userId: userId!,
                subtotal: Math.round(subtotal),
                discount: discountAmount || 0,
                couponCode: couponCode || null,
                netAmountPaid: Math.round(subtotal - (discountAmount || 0)),
                paymentStatus: 'PENDING',
                shippingAddress: shippingDetails as any,
                mlmOptInRequested: mlmOptIn || false,
                items: orderItemsData,
            },
        });
        if (resolvedReferrerId) {
            await prisma.user.update({
                where: { id: userId! },
                data: { referrerId: resolvedReferrerId }
            });
        }
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    fullAddress: shippingDetails.fullAddress,
                    city: shippingDetails.city,
                    state: shippingDetails.state,
                    pincode: shippingDetails.pincode,
                    country: shippingDetails.country,
                }
            });
        }
        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            totalAmount: newOrder.subtotal,
            ...(mlmSkipped ? { mlmSkipped: true, mlmSkipReason } : {})
        });
    } catch (error) {
        console.error('Create Order Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}