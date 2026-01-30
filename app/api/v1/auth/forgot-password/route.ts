import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // Don't reveal if user exists or not for security
            return NextResponse.json({ 
                success: true, 
                message: 'If an account with that email exists, you will receive an OTP.' 
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash OTP and set expiry (10 minutes)
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Store OTP in user record
        await prisma.user.update({
            where: { id: user.id },
            data: { otpHash, otpExpiry }
        });

        // Send OTP via email
        await sendOTPEmail(email, otp, user.fullName || 'Customer');

        return NextResponse.json({ 
            success: true, 
            message: 'OTP sent to your email address.',
            userId: user.id // We'll need this to reset password
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}