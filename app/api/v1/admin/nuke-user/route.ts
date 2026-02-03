import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: "Email required" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "User not found" });

        console.log(`💥 INITIALIZING NUCLEAR LAUNCH ON: ${email}`);

        // 1. Delete Cart & CartItems (Logic: Delete Cart, Cascade takes items)
        await prisma.cart.deleteMany({ where: { userId: user.id } });

        // 2. Delete Payments tied to User's Orders
        const orders = await prisma.order.findMany({ where: { userId: user.id } });
        const orderIds = orders.map(o => o.id);
        
        await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });

        // 3. Delete Orders
        await prisma.order.deleteMany({ where: { userId: user.id } });

        // 4. Delete Wishlist
        await prisma.wishlist.deleteMany({ where: { userId: user.id } });

        // 5. Delete Validation Stuff
        await prisma.deviceToken.deleteMany({ where: { userId: user.id } });
        await prisma.notification.deleteMany({ where: { userId: user.id } });
        await prisma.review.deleteMany({ where: { userId: user.id } });

        // 6. FINALLY: Delete the User
        await prisma.user.delete({ where: { id: user.id } });

        return NextResponse.json({ success: true, message: `User ${email} and all traces of their existence have been obliterated.` });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}