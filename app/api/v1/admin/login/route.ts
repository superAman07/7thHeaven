import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { compare } from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ success: false, error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-change-it');
    const alg = 'HS256';

    const token = await new jose.SignJWT({ userId: user.id, isAdmin: user.isAdmin })
      .setProtectedHeader({ alg })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(secret);

    (await cookies()).set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({ success: true, data: { message: 'Login successful' } });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: { message: 'An internal error occurred' } }, { status: 500 });
  }
}