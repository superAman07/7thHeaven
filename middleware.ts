import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) { 
  const requestHeaders = new Headers(request.headers);
 
  const token = request.cookies.get('admin_session')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: 'Authentication required.' } },
      { status: 401 }
    );
  }

  try { 
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);
 
    if (!payload.isAdmin) {
      throw new Error('Forbidden: User is not an admin.');
    }
 
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-is-admin', 'true');
 
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Middleware auth error:', error);
    const response = NextResponse.json(
      { success: false, error: { message: 'Invalid or expired session.' } },
      { status: 401 }
    ); 
    response.cookies.set('admin_session', '', { maxAge: 0 });
    return response;
  }
}

export const config = { 
  matcher: '/api/v1/admin/((?!login).*)',
};