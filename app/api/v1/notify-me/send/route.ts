import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';
import { sendCollectionLaunchEmail, sendCustomNotifyEmail } from '@/lib/email';

// POST: Admin sends launch notification to all pending subscribers for a collection
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { collectionSlug, customSubject, customBody } = await request.json();

        if (!collectionSlug) {
            return NextResponse.json({ success: false, error: 'collectionSlug is required' }, { status: 400 });
        }

        // Get all pending (not yet notified) subscribers for this collection
        const subscribers = await prisma.notifySubscriber.findMany({
            where: {
                collectionSlug,
                isNotified: false,
            },
        });

        if (subscribers.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No pending subscribers for this collection.',
                sentCount: 0,
            });
        }

        // Format collection name from slug
        const collectionName = collectionSlug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());

        let sentCount = 0;
        let failedCount = 0;
        const isCustom = customSubject && customBody;

        // Send emails (with small delay to avoid rate limits)
        for (const sub of subscribers) {
            try {
                const sent = isCustom
                    ? await sendCustomNotifyEmail(sub.email, customSubject, customBody, collectionName, collectionSlug)
                    : await sendCollectionLaunchEmail(sub.email, collectionName, collectionSlug);
                if (sent) {
                    // Mark as notified
                    await prisma.notifySubscriber.update({
                        where: { id: sub.id },
                        data: { isNotified: true },
                    });
                    sentCount++;
                } else {
                    failedCount++;
                }
            } catch (err) {
                console.error(`[Notify Me] Failed to send to ${sub.email}:`, err);
                failedCount++;
            }

            // Small delay between emails (Resend rate limit: 10/sec on free plan)
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        return NextResponse.json({
            success: true,
            sentCount,
            failedCount,
            totalSubscribers: subscribers.length,
        });
    } catch (error) {
        console.error('[Notify Me] Send Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send notifications' }, { status: 500 });
    }
}