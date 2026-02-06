import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Forgot Password - Step 3 (Reset)
 *     description: Resets the user's password using the verified OTP.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 description: The valid OTP is required again for security
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error
 */

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, otp, newPassword } = body;

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Verify OTP
        if (!user.otpHash || !user.otpExpiry) {
            return NextResponse.json({ error: 'No OTP request found. Please request a new OTP.' }, { status: 400 });
        }

        if (new Date() > user.otpExpiry) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        const isOtpValid = await bcrypt.compare(otp, user.otpHash);
        if (!isOtpValid) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // Hash new password and update user
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
            where: { id: user.id },
            data: { 
                passwordHash,
                otpHash: null,  // Clear the OTP
                otpExpiry: null
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Password reset successfully! You can now login.' 
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}