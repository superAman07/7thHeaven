import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, coupons });
    } catch (error) {
        console.error('Get coupons error:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            code,
            type,
            value,
            expiresAt,
            usageLimit,
            minOrderAmount,
            influencerName,
            influencerEmail,
            influencerPhone,
            isActive
        } = body;

        if (!code || !type || value === undefined) {
            return NextResponse.json(
                { error: 'Code, type, and value are required' },
                { status: 400 }
            );
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                type,
                value,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                usageLimit: usageLimit || null,
                minOrderAmount: minOrderAmount || 0,
                influencerName: influencerName || null,
                influencerEmail: influencerEmail || null,
                influencerPhone: influencerPhone || null,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json({ success: true, coupon }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Coupon code already exists' },
                { status: 400 }
            );
        }
        console.error('Create coupon error:', error);
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}