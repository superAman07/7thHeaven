import prisma from '@/lib/prisma';

// TODO: When ready for production, install firebase-admin:
// npm install firebase-admin
// import * as admin from 'firebase-admin';

// Initialize Firebase (Singleton pattern)
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }),
//   });
// }

export async function sendNotification(userId: string, title: string, body: string, type: string = 'GENERAL') {
  try {
    // 1. Save to Database (Persistent History)
    await prisma.notification.create({
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

    // 3. Send to Firebase (Production Logic)
    /*
    const message = {
      notification: { title, body },
      data: { type }, // Custom data for app routing
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`[FCM] Sent ${response.successCount} messages, failed ${response.failureCount}`);
    
    // Cleanup invalid tokens
    if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) failedTokens.push(tokens[idx]);
        });
        if (failedTokens.length > 0) {
            await prisma.deviceToken.deleteMany({ where: { token: { in: failedTokens } } });
        }
    }
    */

    // --- MOCK LOG FOR NOW ---
    console.log(`\n🔔 [PUSH NOTIFICATION SENT] 🔔`);
    console.log(`To User: ${userId}`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    console.log(`Target Tokens: ${tokens.length} devices`);
    console.log(`-----------------------------\n`);

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}