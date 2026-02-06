import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get Current User Profile
 *     description: Returns the currently logged-in user's details based on the session cookie.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *       401:
 *         description: Not authenticated
 */

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        console.log("userId:", userId);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                pincode: true,
                city: true,
                state: true,
                fullAddress: true,
                country: true,
                is7thHeaven: true,
                referralCode: true,
            }
        });
        console.log("user:", user);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('[ME_GET_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}