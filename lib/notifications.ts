import prisma from '@/lib/prisma';

export async function sendNotification(userId: string, title: string, body: string, type: string = 'GENERAL') {
  try {
    // 1. Save to Database (In-App Notification History)
    await prisma.notification.create({ // We need to add this model to schema too if not added
        data: {
            userId,
            title,
            body,
            type
        }
    });

    // 2. Get User's Device Tokens
    const devices = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true }
    });

    if (devices.length === 0) {
      console.log(`[Notification] User ${userId} has no devices registered.`);
      return;
    }

    const tokens = devices.map(d => d.token);

    // 3. Send to Firebase (Mock for now)
    // In real production, you would use admin.messaging().sendMulticast(...)
    console.log(`\n🔔 [PUSH NOTIFICATION MOCK] 🔔`);
    console.log(`To User: ${userId}`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    console.log(`Target Tokens: ${tokens.length} devices`);
    console.log(`-----------------------------\n`);

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}