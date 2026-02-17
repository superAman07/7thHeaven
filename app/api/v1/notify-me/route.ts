import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';
import { sendNotifyMeConfirmation } from '@/lib/email';

/**
 * @swagger
 * /api/v1/notify-me:
 *   post:
 *     summary: Subscribe to collection launch notification
 *     tags:
 *       - Notifications
 */
export async function POST(request: NextRequest) {
    try {
        const { email, collectionSlug, source = 'coming_soon' } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, error: 'Valid email is required' },
                { status: 400 }
            );
        }

        const cleanEmail = email.toLowerCase().trim();
        const slug = collectionSlug || 'general';

        // Upsert: if already exists, just update timestamp (no duplicates)
        const subscriber = await prisma.notifySubscriber.upsert({
            where: {
                email_collectionSlug: {
                    email: cleanEmail,
                    collectionSlug: slug,
                },
            },
            update: {
                createdAt: new Date(),
            },
            create: {
                email: cleanEmail,
                collectionSlug: slug,
                source,
            },
        });

        // Send confirmation email (format slug into readable name)
        const collectionName = slug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());

        // Fire-and-forget: don't block API response
        sendNotifyMeConfirmation(cleanEmail, collectionName).catch(err =>
            console.error('[Notify Me] Confirmation email failed:', err)
        );

        return NextResponse.json({ success: true, data: { id: subscriber.id } });
    } catch (error) {
        console.error('[Notify Me] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Something went wrong' },
            { status: 500 }
        );
    }
}

// GET: Admin can see all subscribers (with counts)
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const subscribers = await prisma.notifySubscriber.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Group by collection for admin UI
        const grouped: Record<string, { total: number; notified: number; pending: number }> = {};
        subscribers.forEach((sub:any) => {
            const slug = sub.collectionSlug || 'general';
            if (!grouped[slug]) grouped[slug] = { total: 0, notified: 0, pending: 0 };
            grouped[slug].total++;
            if (sub.isNotified) grouped[slug].notified++;
            else grouped[slug].pending++;
        });

        return NextResponse.json({
            success: true,
            data: subscribers,
            summary: grouped,
            totalCount: subscribers.length,
        });
    } catch (error) {
        console.error('[Notify Me] GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}

// DELETE: Admin can remove a subscriber
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await request.json();
        await prisma.notifySubscriber.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
}