import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';
import { z } from 'zod';

const tokenSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(['ANDROID', 'IOS', 'WEB']).default('ANDROID'),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { token, platform } = tokenSchema.parse(body);

    // Upsert: If token exists, update timestamp. If not, create.
    await prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform }, // Update userId in case user switched accounts on same device
      create: {
        token,
        platform,
        userId,
      },
    });

    return NextResponse.json({ success: true, message: 'Device registered for notifications' });

  } catch (error) {
    console.error('Notification Register Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}