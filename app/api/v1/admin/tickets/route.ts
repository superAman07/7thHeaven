import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const tickets = await prisma.supportTicket.findMany({
            where: status ? { status } : {},
            include: {
                user: { select: { fullName: true, email: true, phone: true } },
                responses: { orderBy: { createdAt: 'asc' } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, tickets });
    } catch (error) {
        console.error('Admin Fetch Tickets Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}