import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export async function verifyToken(token: string) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        isAdmin: true
      }
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function generateToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } 
  );
}

export async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        token = cookies['admin_session'] || cookies['session_token'];
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    if (!decoded.userId) {
      return null;
    }

    return decoded.userId;

  } catch (error) {
    return null;
  }
}