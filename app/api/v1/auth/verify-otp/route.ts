import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { phone, otp } = validation.data;

    // 1. Find the user and their OTP info
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.otpHash || !user.otpExpiry) {
      return NextResponse.json({ success: false, error: { message: 'Invalid request. Please try signing up again.' } }, { status: 400 });
    }

    // 2. Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ success: false, error: { message: 'OTP has expired. Please request a new one.' } }, { status: 410 }); // 410 Gone
    }

    // 3. Securely compare the provided OTP with the stored hash
    const isOtpValid = await bcrypt.compare(otp, user.otpHash);

    if (!isOtpValid) {
      return NextResponse.json({ success: false, error: { message: 'Invalid OTP.' } }, { status: 401 });
    }

    // 4. OTP is valid. Clear it from the database to prevent reuse.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash: null,
        otpExpiry: null,
      },
    });

    // 5. Generate a short-lived "verification token" (JWT)
    const verificationToken = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' } // This token is valid for 15 minutes
    );

    // Determine if the user needs to set a password
    const needsPasswordSetup = !user.passwordHash;

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        verificationToken,
        needsPasswordSetup, // Tell the frontend if the next step is setting a password
      },
    });

  } catch (error) {
    console.error('Error in /api/v1/auth/verify-otp:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}