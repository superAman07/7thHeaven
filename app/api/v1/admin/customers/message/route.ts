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
            select: { email: true, fullName: true }
        });

        if (users.length === 0) {
            return NextResponse.json({ success: false, error: "No valid recipients found" }, { status: 404 });
        }

        let sentCount = 0;
        await Promise.all(users.map(async (user) => {
            if (user.email) {
                const html = `
                    <div style="font-family: sans-serif; padding: 20px; background: #f4f4f4;">
                        <div style="background: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #333;">Message from Celsius 7th Heaven</h2>
                            <p>Dear ${user.fullName || 'Member'},</p>
                            <p style="font-size: 16px; color: #555; line-height: 1.6;">${message}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #999;">You received this because you are a valued member of Celsius.</p>
                        </div>
                    </div>
                `;
                
                const success = await sendEmail({
                    to: user.email,
                    subject: "New Message from Celsius Admin",
                    html: html
                });
                
                if (success) sentCount++;
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