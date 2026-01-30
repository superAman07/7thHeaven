import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or OTP' }, { status: 400 });
        }

        // Verify OTP exists
        if (!user.otpHash || !user.otpExpiry) {
            return NextResponse.json({ error: 'No OTP request found. Please request a new one.' }, { status: 400 });
        }

        // Check expiry
        if (new Date() > user.otpExpiry) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Verify OTP
        const isOtpValid = await bcrypt.compare(otp, user.otpHash);
        if (!isOtpValid) {
            return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'OTP verified successfully!' 
        });

    } catch (error) {
        console.error('Verify Reset OTP Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}