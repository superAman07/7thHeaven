import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // if (path.startsWith('/cart/checkout')) {
  //   const userToken = request.cookies.get('session_token')?.value;

  //   if (!userToken) {
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }

  //   try {
  //     const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  //     await jose.jwtVerify(userToken, secret);
  //     return NextResponse.next();
  //   } catch (error) {
  //     console.error('User session verification failed:', error);
  //     const response = NextResponse.redirect(new URL('/login', request.url));
  //     response.cookies.set('session_token', '', { maxAge: 0 });
  //     return response;
  //   }
  // }
// admin protected routes

  if (path.startsWith('/celsius-7th-heaven') && !path.startsWith('/celsius-7th-heaven/login')) {
    const adminToken = request.cookies.get('admin_session')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/celsius-7th-heaven/login', request.url));
    }
  }

  if (path.startsWith('/api/v1/payment/callback')) {
    return NextResponse.next();
  }
  if (path.startsWith('/api/v1/admin') && path !== '/api/v1/admin/login') {
    const adminToken = request.cookies.get('admin_session')?.value;
    const requestHeaders = new Headers(request.headers);

    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jose.jwtVerify(adminToken, secret);

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
      console.error('Admin middleware auth error:', error);
      const response = NextResponse.json(
        { success: false, error: { message: 'Invalid or expired admin session.' } },
        { status: 401 }
      );
      response.cookies.set('admin_session', '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // '/cart/checkout/:path*',
    '/my-account/:path*',
    '/api/v1/admin/((?!login).*)',
    '/((?!_next/static|_next/image|favicon.ico|api/v1/payment/callback).*)',
  ],
};