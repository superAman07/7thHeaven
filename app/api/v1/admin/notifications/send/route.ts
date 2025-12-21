import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { z } from 'zod';

const sendSchema = z.object({
    targetEmail: z.string().email().optional(),
    broadcast: z.boolean().optional(),
    title: z.string().min(1),
    body: z.string().min(1),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        const limit = parseInt(searchParams.get('limit') || '100');

        let whereClause: any = {
            type: 'ADMIN_BROADCAST'
        };

        if (email) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) whereClause.userId = user.id;
            else return NextResponse.json({ success: true, data: [] });
        }

        const rawNotifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: limit * 5,
            include: {
                user: { select: { email: true, fullName: true } }
            }
        });

        const groupedNotifications: any[] = [];
        const seenKeys = new Map<string, any>();

        for (const notif of rawNotifications) {
            const timeKey = new Date(notif.createdAt).toISOString().slice(0, 16); // "2023-10-27T10:00"
            const key = `${notif.title}|${notif.body}|${timeKey}`;

            if (seenKeys.has(key)) {
                const existing = seenKeys.get(key);
                existing.recipientCount = (existing.recipientCount || 1) + 1;
                existing.isBroadcast = true;
            } else {
                const newEntry = {
                    ...notif,
                    recipientCount: 1,
                    isBroadcast: false
                };
                groupedNotifications.push(newEntry);
                seenKeys.set(key, newEntry);
            }
        }

        return NextResponse.json({ success: true, data: groupedNotifications.slice(0, limit) });

    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { targetEmail, broadcast, title, body: msgBody } = sendSchema.parse(body);

        if (broadcast) {
            const allUsers = await prisma.user.findMany({ select: { id: true } });
            // In production, use a Queue (BullMQ/Redis). Loop is okay for <1000 users.
            for (const user of allUsers) {
                await sendNotification(user.id, title, msgBody, 'ADMIN_BROADCAST');
            }
            return NextResponse.json({ success: true, message: `Broadcast sent to ${allUsers.length} users` });

        } else if (targetEmail) {
            const user = await prisma.user.findUnique({ where: { email: targetEmail } });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            await sendNotification(user.id, title, msgBody, 'ADMIN_BROADCAST');
            return NextResponse.json({ success: true, message: 'Notification sent' });
        } else {
            return NextResponse.json({ error: 'Target required' }, { status: 400 });
        }

    } catch (error) {
        console.error("Notification Send Error:", error);
        return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const target = await prisma.notification.findUnique({ where: { id } });

        if (target) {
            const timeStart = new Date(target.createdAt.getTime() - 60000);
            const timeEnd = new Date(target.createdAt.getTime() + 60000);

            await prisma.notification.deleteMany({
                where: {
                    title: target.title,
                    body: target.body,
                    type: target.type,
                    createdAt: { gte: timeStart, lte: timeEnd }
                }
            });
        }

        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}