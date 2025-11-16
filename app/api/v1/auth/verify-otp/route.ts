import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { phone, otp } = validation.data;

    const user = await prisma.user.findUnique({ where: { phone } });

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
      // This is a SIGNUP flow. Issue a short-lived token to set a password.
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