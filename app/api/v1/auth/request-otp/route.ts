import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const requestOtpSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters long' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = requestOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { fullName, email, phone, referralCode } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        passwordHash: { not: null },
        OR: [
          { phone },
          { email },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: { message: 'An account with this phone number or email already exists. Please log in.' } }, { status: 409 }); // 409 Conflict
    }

    let referrerId = undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    await prisma.user.upsert({
      where: { phone },
      update: {
        fullName,
        email,
        otpHash,
        otpExpiry,
        ...(referrerId ? { referrerId } : {})
      },
      create: {
        fullName,
        email,
        phone,
        otpHash,
        otpExpiry,
        referrerId 
      },
    });

    console.log(`--- OTP for ${phone}: ${otp} ---`);

    return NextResponse.json({ success: true, message: 'OTP has been sent to your phone number.', debugOtp: otp });

  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ success: false, error: { message: 'This email address is already in use. Please use a different one.' } }, { status: 409 });
    }
    console.error('Error in /api/v1/auth/request-otp:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}