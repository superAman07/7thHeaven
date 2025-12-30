import prisma from '@/lib/prisma';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  try {
    const filePath = path.join(process.cwd(), 'firebase-admin.json');
    
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const serviceAccount = JSON.parse(fileContent);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("🔥 Firebase Admin Initialized Successfully");
    } else {
        console.warn("⚠️ firebase-admin.json not found at:", filePath);
    }
  } catch (error) {
    console.error("⚠️ Firebase Init Failed:", error);
  }
}

export async function sendNotification(userId: string, title: string, body: string, type: string = 'GENERAL') {
  try {
    await prisma.notification.create({
        data: { userId, title, body, type }
    });

    const devices = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true }
    });

    if (devices.length === 0) return;

    const tokens = devices.map(d => d.token);

    if (admin.apps.length) {
        const message = {
            notification: { title, body },
            data: { type }, 
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Sent to ${userId}: Success ${response.successCount}, Failed ${response.failureCount}`);
        
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) failedTokens.push(tokens[idx]);
            });
            if (failedTokens.length > 0) {
                await prisma.deviceToken.deleteMany({ where: { token: { in: failedTokens } } });
            }
        }
    } else {
        console.log(`[FCM MOCK] Firebase not active. Notification saved to DB only.`);
    }

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}