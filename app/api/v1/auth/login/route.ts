import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { identifier, password } = validation.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: { message: 'Invalid credentials.' } }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: { message: 'Invalid credentials.' } }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ success: false, error: { message: 'Your account has been suspended. Please contact support.' } }, { status: 403 });
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
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
        }
      }
    });

    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error('Error in /api/v1/auth/login:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}