import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getUserIdFromToken } from '@/lib/auth';

// GET all coupons
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = await verifyToken(token);
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { usageHistory: true } }
            }
        });

        return NextResponse.json({ success: true, coupons });
    } catch (error) {
        console.error('Get coupons error:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

// CREATE new coupon
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = await verifyToken(token);
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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