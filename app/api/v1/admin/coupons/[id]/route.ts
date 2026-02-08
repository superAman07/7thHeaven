import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getUserIdFromToken } from '@/lib/auth';

// GET single coupon with usage history
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const coupon = await prisma.coupon.findUnique({
            where: { id: id },
            include: {
                usageHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, coupon });
    } catch (error) {
        console.error('Get coupon error:', error);
        return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
    }
}

// UPDATE coupon
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await req.json();

        const coupon = await prisma.coupon.update({
            where: { id: id },
            data: {
                code: body.code?.toUpperCase().trim(),
                type: body.type,
                value: body.value,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                usageLimit: body.usageLimit || null,
                minOrderAmount: body.minOrderAmount || 0,
                influencerName: body.influencerName || null,
                influencerEmail: body.influencerEmail || null,
                influencerPhone: body.influencerPhone || null,
                isActive: body.isActive ?? true
            }
        });

        return NextResponse.json({ success: true, coupon });
    } catch (error) {
        console.error('Update coupon error:', error);
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }
}

// DELETE coupon
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        await prisma.coupon.delete({ where: { id: id } });

        return NextResponse.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}