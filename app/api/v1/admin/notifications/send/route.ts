import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { z } from 'zod';

// Updated schema to handle broadcast
const sendSchema = z.object({
    targetEmail: z.string().email().optional(),
    broadcast: z.boolean().optional(),
    title: z.string().min(1),
    body: z.string().min(1),
});

export async function POST(req: NextRequest) {
    try {
        // (Add Admin Auth Check here if not handled by middleware)
        
        const body = await req.json();
        const { targetEmail, broadcast, title, body: msgBody } = sendSchema.parse(body);

        if (broadcast) {
            // 1. Send to ALL users
            const allUsers = await prisma.user.findMany({
                select: { id: true }
            });

            // Note: For thousands of users, use a background job (Queue). 
            // For now, a loop is acceptable for MVP.
            for (const user of allUsers) {
                await sendNotification(user.id, title, msgBody, 'ADMIN_BROADCAST');
            }
            
            return NextResponse.json({ success: true, message: `Broadcast sent to ${allUsers.length} users` });

        } else if (targetEmail) {
            // 2. Send to SINGLE user
            const user = await prisma.user.findUnique({ where: { email: targetEmail } });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            await sendNotification(user.id, title, msgBody, 'ADMIN_BROADCAST');
            return NextResponse.json({ success: true, message: 'Notification sent' });
        } else {
            return NextResponse.json({ error: 'Either targetEmail or broadcast is required' }, { status: 400 });
        }

    } catch (error) {
        console.error("Notification Send Error:", error);
        return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }
}