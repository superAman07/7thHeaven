import { NextResponse,NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Register - Step 2 (Verify OTP)
 *     description: Verify the code sent to the user's email.
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
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 description: The 6-digit code received via Email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }).optional(),
  email: z.string().email({ message: 'Invalid email' }).optional(),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
}).refine(data => data.phone || data.email, {
  message: 'Either phone or email is required'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { phone, email, otp } = validation.data;

    
    const user = phone 
      ? await prisma.user.findUnique({ where: { phone } })
      : await prisma.user.findUnique({ where: { email: email! } });

    if (!user || !user.otpHash || !user.otpExpiry) {
      return NextResponse.json({ success: false, error: { message: 'Invalid request. Please try again.' } }, { status: 400 });
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ success: false, error: { message: 'OTP has expired. Please request a new one.' } }, { status: 410 });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpHash);

    if (!isOtpValid) {
      return NextResponse.json({ success: false, error: { message: 'Invalid OTP.' } }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { otpHash: null, otpExpiry: null },
    });

    // --- THIS IS THE UPGRADED LOGIC ---
    // Check if the user is already fully registered (i.e., has a password).
    if (user.passwordHash) {
      // This is a LOGIN flow. Create a full session immediately.
      const sessionToken = jwt.sign(
        { userId: user.id, phone: user.phone, fullName: user.fullName, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const cookie = serialize('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'lax',
      });

      const response = NextResponse.json({
        success: true,
        message: 'Logged in successfully.',
        data: { needsPasswordSetup: false }
      });
      response.headers.set('Set-Cookie', cookie);
      return response;

    } else {
      
      const referralCode = request.cookies.get('referralCode')?.value;
      let referrerId = undefined;

      if (referralCode) {
        const referrer = await prisma.user.findUnique({
          where: { referralCode }
        });
        if (referrer && referrer.id !== user.id) {
          referrerId = referrer.id;
        }
      }

      // Update user with referrer if found
      if (referrerId && !user.referrerId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { referrerId }
        });
      }
      const verificationToken = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully.',
        data: {
          verificationToken,
          needsPasswordSetup: true,
        },
      });
    }
  } catch (error) {
    console.error('Error in /api/v1/auth/verify-otp:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}