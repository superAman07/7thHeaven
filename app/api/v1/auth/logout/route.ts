import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Clears the session cookie.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

export async function POST() {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear the session cookie
    response.cookies.set('session_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
    });

    return response;
}