import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendRewardApprovedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// ─── GET: Fetch all reward claims ───
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || '';

        const where: any = {};
        if (status) where.status = status;

        const claims = await prisma.rewardClaim.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        referralCode: true,
                    }
                }
            },
            orderBy: { claimedAt: 'desc' }
        });

        const pendingCount = await prisma.rewardClaim.count({ where: { status: 'PENDING' } });

        return NextResponse.json({ success: true, data: claims, pendingCount });
    } catch (error) {
        console.error('Claims GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch claims' }, { status: 500 });
    }
}

// ─── PUT: Update claim status (Approve / Deliver) ───
export async function PUT(req: NextRequest) {
    try {
        const { claimId, status, note } = await req.json();

        if (!claimId || !['APPROVED', 'DELIVERED'].includes(status)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid claimId or status. Status must be APPROVED or DELIVERED.' 
            }, { status: 400 });
        }

        const claim = await prisma.rewardClaim.update({
            where: { id: claimId },
            data: {
                status,
                processedAt: new Date(),
                note: note || undefined,
            },
            include: {
                user: { select: { fullName: true, email: true } }
            }
        });

        // Send congratulation email to user when approved
        if (status === 'APPROVED' && claim.user.email) {
            await sendRewardApprovedEmail(claim.user.email, {
                customerName: claim.user.fullName,
                level: claim.level,
                amount: claim.amount,
                note: note,
            });
        }

        return NextResponse.json({ success: true, data: claim });
    } catch (error) {
        console.error('Claims PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update claim' }, { status: 500 });
    }
}