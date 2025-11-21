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

export async function getUserIdFromToken(req: Request): Promise<string | null> {
    try {
        let token: string | undefined;

        // 1. Check Authorization Header (Priority: Mobile Apps)
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        // 2. Check Cookies (Fallback: Web Browser)
        if (!token) {
            const cookieHeader = req.headers.get('cookie');
            if (cookieHeader) {
                // Parse cookies manually from the header string
                const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                    const [key, value] = cookie.trim().split('=');
                    acc[key] = value;
                    return acc;
                }, {} as Record<string, string>);
                
                token = cookies['session_token'];
            }
        }

        if (!token) {
            return null; // No token found in header or cookies
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        
        if (typeof decoded === 'string' || !decoded.userId) {
            return null; // Invalid token payload
        }

        return decoded.userId;

    } catch (error) {
        // This will catch expired tokens, invalid signatures, etc.
        return null;
    }
}