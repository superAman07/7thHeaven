import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        (await cookies()).set('admin_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: -1,
            path: '/',
        });

        return NextResponse.json({ success: true, data: { message: 'Logout successful' } });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false, error: { message: 'An internal error occurred' } }, { status: 500 });
    }
}