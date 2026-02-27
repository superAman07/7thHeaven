import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const { code } = await req.json();
    
    if (!code) {
        return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: { referralCode: code, is7thHeaven: true }
    });

    if (!user) {
        return NextResponse.json({ error: 'Invalid or inactive referral code' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Valid referral code' });
}