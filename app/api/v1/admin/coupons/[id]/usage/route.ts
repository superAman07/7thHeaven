import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const couponId = (await params).id;

    const usageHistory = await prisma.couponUsage.findMany({
      where: { couponId },
      orderBy: { createdAt: 'desc' },
      select: {
        userName: true,
        userId: true,
        discountAmount: true,
        orderTotal: true,
        createdAt: true,
      }
    });

    // Transform Decimal to number for JSON
    const formattedHistory = usageHistory.map(usage => ({
      userName: usage.userName,
      userId: usage.userId,
      discountAmount: Number(usage.discountAmount),
      orderTotal: Number(usage.orderTotal),
      usedAt: usage.createdAt,
    }));

    return NextResponse.json({ success: true, usageHistory: formattedHistory });
  } catch (error) {
    console.error('Error fetching coupon usage:', error);
    return NextResponse.json({ error: 'Failed to fetch usage history' }, { status: 500 });
  }
}