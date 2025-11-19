import jwt from 'jsonwebtoken';
import prisma from './prisma';

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

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // Fetch the user from database to ensure they still exist
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
      return null; // User not found
    }

    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null; // Invalid token
  }
}

export function generateToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}