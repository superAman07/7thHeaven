import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userIds, message } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ success: false, error: "No users selected" }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ success: false, error: "Message content is empty" }, { status: 400 });
        }

        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds },
                email: { not: null }
            },
            select: { id: true, email: true, fullName: true }
        });

        if (users.length === 0) {
            return NextResponse.json({ success: false, error: "No valid recipients found" }, { status: 404 });
        }

        let sentCount = 0;
        await Promise.all(users.map(async (user) => {
            if (user.email) {
                const LOGO_URL = "https://celsius-brand.s3.ap-south-1.amazonaws.com/celsius-logo.png"; // Use the same URL from lib/email.ts
                const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://celsiusfragrances.com";

                const html = `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
                    
                    <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
                    </div>

                    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0; font-weight: 600;">Hello ${user.fullName || 'Member'},</h2>
                        <div style="font-size: 15px; color: #555; line-height: 1.8; white-space: pre-wrap;">${message}</div>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                        
                        <div style="text-align: center;">
                        <a href="${SITE_URL}" style="background: #ddb040; color: #000; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Visit Store</a>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>&copy; 2026 Celsius. All rights reserved.</p>
                        <p style="font-size: 11px; color: #bbb;">You received this because you are a valued member of Celsius.</p>
                    </div>
                    </div>
                `;

                const success = await sendEmail({
                    to: user.email,
                    subject: "New Message from Celsius Admin",
                    html: html
                });

                if (success) {
                    sentCount++;
                    // LOG THE MESSAGE
                    await prisma.adminMessage.create({
                        data: {
                            userId: user.id,
                            message: message,
                            subject: "Message from Admin"
                        }
                    });
                }
            }
        }));

        return NextResponse.json({
            success: true,
            message: `Sent ${sentCount} emails successfully`
        });

    } catch (error) {
        console.error("Admin Message Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}