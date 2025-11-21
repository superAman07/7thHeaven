import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        console.log("ME_GET_REQUEST_RECEIVED", req.headers);
        const userId = await getUserIdFromToken(req);
        console.log("userId:", userId);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                fullName: true,
                phone: true,
                email: true,
                pincode: true,
                city: true,
                state: true,
                fullAddress: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('[ME_GET_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}