import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const requestLoginOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = requestLoginOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { phone } = validation.data;

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No account found with this phone number. Please sign up to continue.',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash,
        otpExpiry,
      },
    });

    console.log(`--- LOGIN OTP for ${phone}: ${otp} ---`);

    return NextResponse.json({ success: true, message: 'OTP has been sent to your phone number.' });

  } catch (error) {
    console.error('Error in /api/v1/auth/request-login-otp:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}