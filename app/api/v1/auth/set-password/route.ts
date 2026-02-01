import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { sendWelcomeEmail } from '@/lib/email';

const setPasswordSchema = z.object({
  verificationToken: z.string(),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = setPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { verificationToken, password } = validation.data;

    let tokenPayload: { userId: string };
    try {
      const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET!);
      tokenPayload = decoded as { userId: string };
    } catch (error) {
      return NextResponse.json({ success: false, error: { message: 'Invalid or expired token.' } }, { status: 401 });
    }

    const referralCode = request.cookies.get('referralCode')?.value;
    let referrerId = undefined;

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode }
      });
      
      if (referrer && referrer.id !== tokenPayload.userId) {
        referrerId = referrer.id;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const currentUser = await prisma.user.findUnique({
        where: { id: tokenPayload.userId },
        select: { referrerId: true }
    });

    const user = await prisma.user.update({
      where: { id: tokenPayload.userId },
      data: {
        passwordHash,
        ...(referrerId && !currentUser?.referrerId ? { referrerId } : {}),
      },
    });

    if (user.email) {
      try {
        await sendWelcomeEmail(user.email, user.fullName);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    const sessionToken = jwt.sign(
      { userId: user.id, phone: user.phone, fullName: user.fullName, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const cookie = serialize('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
      sameSite: 'lax',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password set successfully. You are now logged in.',
    });

    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error('Error in /api/v1/auth/set-password:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}