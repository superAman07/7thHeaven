import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { z } from 'zod';

// Simple schema
const sendSchema = z.object({
    targetEmail: z.string().email(),
    title: z.string().min(1),
    body: z.string().min(1),
});

export async function POST(req: NextRequest) {
    try {
        // (Add Admin Auth Check here if not handled by middleware)
        
        const body = await req.json();
        const { targetEmail, title, body: msgBody } = sendSchema.parse(body);

        const user = await prisma.user.findUnique({ where: { email: targetEmail } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await sendNotification(user.id, title, msgBody, 'ADMIN_BROADCAST');

        return NextResponse.json({ success: true, message: 'Notification sent' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }
}