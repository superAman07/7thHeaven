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
 *     responses:
 *       200:
 *         description: Order placed successfully
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
        const { items, shippingDetails, mlmOptIn } = validation.data;
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
            const discountPercentage = product.discountPercentage ? product.discountPercentage.toNumber() : 0;
            
            const price = basePrice * (1 - discountPercentage / 100);
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
        const newOrder = await prisma.order.create({
            data: {
                userId: userId!,
                subtotal: subtotal,
                discount: 0,
                netAmountPaid: 0,
                paymentStatus: 'PENDING',
                shippingAddress: shippingDetails as any,
                mlmOptInRequested: mlmOptIn || false,
                items: orderItemsData,
            },
        });
        // --- BYPASS LOGIC START (Immediate Success + Admin Upgrade) ---
        const BYPASS_FOR_TESTING = true;
        if (BYPASS_FOR_TESTING) {
             const merchantTransactionId = `TEST-${Date.now()}`;
             
             // 1. Update Order to PAID
             await prisma.order.update({
                where: { id: newOrder.id },
                data: {
                    paymentStatus: 'PAID',
                    status: 'PROCESSING',
                    netAmountPaid: subtotal,
                    gatewayOrderId: merchantTransactionId
                }
             });
             // 2. Update User (IsAdmin + 7th Heaven + Referral)
             if (mlmOptIn) {
                let userRef = await prisma.user.findUnique({ where: { id: userId! } });
                let newReferralCode = userRef?.referralCode;
                if (!newReferralCode) newReferralCode = generateReferralCode();
                await prisma.user.update({
                    where: { id: userId! },
                    data: { 
                        is7thHeaven: true, 
                        referralCode: newReferralCode,
                    } 
                });
             } else {
                 // Even if no OptIn, user apparently wants admin bypass? 
                 // Uncomment below if you want EVERY order to make user admin:
                 /*
                 await prisma.user.update({
                    where: { id: userId! },
                    data: { isAdmin: true } 
                 });
                 */
             }
             // 3. Inventory Update
             for (const item of orderItemsData) {
                try {
                    const quantityToDeduct = item.quantity;
                    if (item.variantId) {
                         await prisma.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { decrement: quantityToDeduct } }
                        });
                    } else if (item.productId) {
                         await prisma.product.update({
                            where: { id: item.productId }, 
                            data: { stock: { decrement: quantityToDeduct } }
                        });
                    }
                } catch (e) { console.error("Inventory update failed", e); }
             }
             // 4. Clear Cart
             const cart = await prisma.cart.findUnique({ where: { userId: userId! } });
             if (cart) {
                await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
             }
             
             // 5. Send Order Confirmation Email
             if (shippingDetails.email) {
                sendOrderConfirmation(shippingDetails.email, {
                  orderId: newOrder.id,
                  customerName: shippingDetails.fullName,
                  items: orderItemsData.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.priceAtPurchase
                  })),
                  total: subtotal
                }).catch(err => console.error('Email send error:', err));
             }
             
             return NextResponse.json({
                success: true,
                orderId: newOrder.id,
                totalAmount: newOrder.subtotal,
                bypassed: true, 
                transactionId: merchantTransactionId
            });
        }
        // --- BYPASS LOGIC END ---
        await prisma.user.update({
            where: { id: userId },
            data: {
                fullAddress: shippingDetails.fullAddress,
                city: shippingDetails.city,
                state: shippingDetails.state,
                pincode: shippingDetails.pincode,
                country: shippingDetails.country
            }
        });
        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            totalAmount: newOrder.subtotal 
        });
    } catch (error) {
        console.error('Create Order Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


// export async function POST(req: NextRequest) {
//     try {
//         const body = await req.json();
//         const validation = orderSchema.safeParse(body);
//         if (!validation.success) {
//             return NextResponse.json({ error: 'Invalid request body', details: validation.error }, { status: 400 });
//         }
//         const { items, shippingDetails, mlmOptIn } = validation.data;
//         let userId = await getUserIdFromToken(req);

//         if (!userId) {
//             let user = await prisma.user.findUnique({
//                 where: { phone: shippingDetails.phone }
//             });

//             if (!user && shippingDetails.email) {
//                 user = await prisma.user.findUnique({
//                     where: { email: shippingDetails.email }
//                 });
//             }

//             if (user) {
//                 userId = user.id;
//             } else {
//                 const newUser = await prisma.user.create({
//                     data: {
//                         fullName: shippingDetails.fullName,
//                         phone: shippingDetails.phone,
//                         email: shippingDetails.email,
//                         fullAddress: shippingDetails.fullAddress,
//                         city: shippingDetails.city,
//                         state: shippingDetails.state,
//                         pincode: shippingDetails.pincode,
//                         country: shippingDetails.country,
//                         passwordHash: null,
//                     }
//                 });
//                 userId = newUser.id;
//             }
//         }
    
//         const productIds = items.map(item => item.productId);
//         const productsFromDb = await prisma.product.findMany({
//             where: { id: { in: productIds } },
//             include: { variants: true }
//         });

//         let subtotal = 0;
//         const orderItemsData = items.map(item => {
//             const product = productsFromDb.find(p => p.id === item.productId);
            
//             if (!product) {
//                 throw new Error(`Product with ID ${item.productId} not found.`);
//             }
//             if (product.isArchived) {
//                 throw new Error(`Item "${product.name}" is no longer available (Archived). Please remove it from your cart.`);
//             }
//             if (!product.inStock) {
//                  throw new Error(`Item "${product.name}" is currently out of stock.`);
//             }
//             let selectedVariant;
//             if (item.variantId) {
//                 selectedVariant = product.variants.find(v => v.id === item.variantId);
//             }

//             if (!selectedVariant) {
//                 if (product.variants.length > 0) {
//                     console.warn(`No variantId provided for product ${product.name}. Defaulting to first variant.`);
//                     selectedVariant = product.variants[0];
//                 } else {
//                     throw new Error(`Product ${product.name} has no variants available.`);
//                 }
//             }

//             if (selectedVariant.stock < item.quantity) {
//                 throw new Error(`Insufficient stock for ${product.name} (${selectedVariant.size}). Only ${selectedVariant.stock} left.`);
//             }

//             const basePrice = selectedVariant.price.toNumber();
//             const discountPercentage = product.discountPercentage ? product.discountPercentage.toNumber() : 0;
            
//             const price = basePrice * (1 - discountPercentage / 100);
//             subtotal += price * item.quantity;

//             return {
//                 productId: item.productId,
//                 variantId: selectedVariant.id,
//                 name: product.name,
//                 size: selectedVariant.size, 
//                 image: product.images[0] || '',
//                 quantity: item.quantity,
//                 priceAtPurchase: price,
//             };
//         });

//         const newOrder = await prisma.order.create({
//             data: {
//                 userId: userId!,
//                 subtotal: subtotal,
//                 discount: 0,
//                 netAmountPaid: 0,
//                 paymentStatus: 'PENDING',
//                 shippingAddress: shippingDetails as any,
//                 mlmOptInRequested: mlmOptIn || false,
//                 items: orderItemsData,
//             },
//         });

//         await prisma.user.update({
//             where: { id: userId },
//             data: {
//                 fullAddress: shippingDetails.fullAddress,
//                 city: shippingDetails.city,
//                 state: shippingDetails.state,
//                 pincode: shippingDetails.pincode,
//                 country: shippingDetails.country
//             }
//         });

//         return NextResponse.json({
//             success: true,
//             orderId: newOrder.id,
//             totalAmount: newOrder.subtotal 
//         });

//     } catch (error) {
//         console.error('Create Order Error:', error);
//         const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
//         return NextResponse.json({ error: errorMessage }, { status: 500 });
//     }
// }