import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { sendOrderConfirmation, sendWelcomeEmail } from '@/lib/email';
import uniqid from 'uniqid';

async function sendOrderConfirmationSMS(phone: string, orderId: string, amount: number) {
    try {
        const message = `Thank you for your order! Order ID: ${orderId}. Amount Paid: Rs. ${amount}. Track your status here: ${process.env.NEXT_PUBLIC_BASE_URL}/track-order`;
        console.log(`\n=== [SMS MOCK] Order Confirmation ===`);
        console.log(`To: ${phone}`);
        console.log(`Msg: ${message}`);
        console.log(`=====================================\n`);
    } catch (error) { console.error("SMS Error:", error); }
}
async function sendReferralSMS(phone: string, code: string, name: string) {
    try {
        console.log(`[SMS MOCK] Referral: Welcome ${name}! Code: ${code} sent to ${phone}`);
    } catch (error) { console.error("SMS Error:", error); }
}

function generateReferralCode() {
    return '7H-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function completeOrder(orderId: string, transactionId: string, amountPaid: number) {
    console.log(`[OrderService] Completing Order: ${orderId}, Txn: ${transactionId}`);

    // 1. Fetch the Order with all necessary relations
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            // We need items to update inventory and send emails
        }
    });

    if (!order) throw new Error("Order not found");
    if (order.paymentStatus === 'PAID') {
        console.log(`[OrderService] Order ${orderId} is already PAID. Skipping.`);
        return { success: true, message: "Already Paid" };
    }

    // 2. Update Order Status
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            netAmountPaid: amountPaid,
            gatewayOrderId: transactionId
        }
    });

    // We need the items data. 
    // Note: 'items' in prisma.order is a Json field, so we cast it.
    const orderItems = order.items as any[];

    // 3. Inventory Update
    for (const item of orderItems) {
        try {
            const quantityToDeduct = item.quantity;
            if (item.variantId) {
                const updatedVariant = await prisma.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: quantityToDeduct } }
                });
                // Check if stock hit 0
                if (updatedVariant.stock <= 0) {
                    await prisma.productVariant.update({
                        where: { id: item.variantId },
                        data: { stock: 0 }
                    });
                }
            } else if (item.productId) {
                const updatedProduct = await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: quantityToDeduct } }
                });
                if (updatedProduct.stock <= 0) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { inStock: false, stock: 0 }
                    });
                }
            }
        } catch (e) {
            console.error(`[OrderService] Inventory update failed for item ${item.name}`, e);
        }
    }

    // 4. MLM / 7th Heaven Logic
    if (order.mlmOptInRequested) {
        let newReferralCode = order.user.referralCode;
        if (!newReferralCode) newReferralCode = generateReferralCode();

        // Handle Referrer Linkage (if provided during checkout)
        // logic for finding referrer is usually done at order creation specific to your app,
        // but here we confirm the status update.
        await prisma.user.update({
            where: { id: order.userId },
            data: { 
                is7thHeaven: true, 
                referralCode: newReferralCode 
            }
        });

        // Send Welcome Email
        if (order.user.email) {
            await sendWelcomeEmail(order.user.email, order.user.fullName, newReferralCode || undefined)
                .catch(e => console.error("Welcome Email Failed", e));
        }
        if (order.user.phone && newReferralCode) await sendReferralSMS(order.user.phone, newReferralCode, order.user.fullName);
    }

    // 5. Coupon Usage Recording
    if (order.couponCode) {
        const coupon = await prisma.coupon.findUnique({
            where: { code: order.couponCode }
        });
        
        if (coupon) {
            await prisma.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } }
            });
            
            await prisma.couponUsage.create({
                data: {
                    couponId: coupon.id,
                    orderId: order.id,
                    userId: order.userId,
                    userName: order.user.fullName,
                    discountAmount: Number(order.discount) || 0,
                    orderTotal: amountPaid
                }
            });
        }
    }

    // 6. Notifications & Emails
    // In-App Notification
    await sendNotification(
        order.userId,
        "Order Confirmed! 🎉",
        `Your order #${order.id.slice(-6).toUpperCase()} has been placed successfully.`,
        "ORDER_UPDATE"
    ).catch(e => console.error("Notification Failed", e));

    // Email Confirmation
    if (order.shippingAddress) {
        // cast to any to access properties safely
        const shipping = order.shippingAddress as any;
        if (shipping.email) {
            const emailItems = orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.priceAtPurchase
            }));

            await sendOrderConfirmation(shipping.email, {
                orderId: order.id,
                customerName: shipping.fullName,
                items: emailItems,
                total: amountPaid
            }).catch(e => console.error("Order Confirmation Email Failed", e));
        }
    }

    // 7. Clear Cart
    const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return { success: true };
}