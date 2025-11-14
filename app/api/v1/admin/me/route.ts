import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session');

  if (!token) {
    return NextResponse.json({ success: false, error: { message: 'Not authenticated' } }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token.value, secret);

    if (!payload.userId || !payload.isAdmin) {
      throw new Error('Invalid token payload');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        fullName: true,
        email: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'User not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Auth verification error:', error);
    // Clear the invalid cookie
    cookieStore.set('admin_session', '', { maxAge: 0 });
    return NextResponse.json({ success: false, error: { message: 'Invalid or expired session' } }, { status: 401 });
  }
}