import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const requestOtpSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters long' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = requestOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { fullName, phone } = validation.data;

    // 1. Check if a fully registered user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser && existingUser.passwordHash) {
      // User is already fully registered. They should log in.
      return NextResponse.json({ success: false, error: { message: 'An account with this phone number already exists. Please log in.' } }, { status: 409 }); // 409 Conflict
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP is valid for 10 minutes

    // 3. Hash the OTP for secure storage
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // 4. Use `upsert` to create a new user or update an existing one who hasn't set a password
    await prisma.user.upsert({
      where: { phone },
      update: {
        fullName,
        otpHash,
        otpExpiry,
      },
      create: {
        fullName,
        phone,
        otpHash,
        otpExpiry,
      },
    });

    // 5. Simulate sending the OTP. In production, you would use Twilio here.
    console.log(`--- OTP for ${phone}: ${otp} ---`);

    return NextResponse.json({ success: true, message: 'OTP has been sent to your phone number.' });

  } catch (error) {
    console.error('Error in /api/v1/auth/request-otp:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}