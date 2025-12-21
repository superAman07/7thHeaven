import prisma from '@/lib/prisma';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // FIX: Use path.join and fs.readFileSync to avoid Webpack bundling errors
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
        // This is expected in production if you haven't set up ENV vars yet
    }
  } catch (error) {
    console.error("⚠️ Firebase Init Failed:", error);
  }
}

export async function sendNotification(userId: string, title: string, body: string, type: string = 'GENERAL') {
  try {
    // 1. Save to Database (Persistent History)
    await prisma.notification.create({
        data: { userId, title, body, type }
    });

    // 2. Get User's Device Tokens
    const devices = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true }
    });

    if (devices.length === 0) return;

    const tokens = devices.map(d => d.token);

    // 3. Send to Firebase (Only if initialized)
    if (admin.apps.length) {
        const message = {
            notification: { title, body },
            data: { type }, 
            tokens: tokens,
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log(`[FCM] Sent to ${userId}: Success ${response.successCount}, Failed ${response.failureCount}`);
        
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
    } else {
        console.log(`[FCM MOCK] Firebase not active. Notification saved to DB only.`);
    }

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}