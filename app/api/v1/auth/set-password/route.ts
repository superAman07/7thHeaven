import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const setPasswordSchema = z.object({
  verificationToken: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters long').regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Password must contain at least one letter and one number'),
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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.update({
      where: { id: tokenPayload.userId },
      data: {
        passwordHash,
      },
    });

    const sessionToken = jwt.sign(
      { userId: user.id, phone: user.phone, fullName: user.fullName },
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