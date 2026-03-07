import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { canJoinUnderReferrer } from '@/lib/mlm-slot-validator';

/**
 * @swagger
 * /api/v1/referral/validate:
 *   post:
 *     summary: Validate Referral Code
 *     description: Validates a referral code by checking if it belongs to an active 7th Heaven member.
 *     tags:
 *       - 7th Heaven
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: The referral code to validate
 *                 example: "7H-LPY75W"
 *     responses:
 *       200:
 *         description: Invite code is valid and slots are available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Valid invite code"
 *       400:
 *         description: Code is valid but slots are full (HEAVEN1_COMPLETE or SLOTS_FULL)
 *       404:
 *         description: Invalid or inactive invite code
 */

export async function POST(req: NextRequest) {
    const { code } = await req.json();

    if (!code) {
        return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: { referralCode: code, is7thHeaven: true }
    });

    if (!user) {
        return NextResponse.json({ error: 'Invalid or inactive referral code' }, { status: 404 });
    }

    const slotCheck = await canJoinUnderReferrer(user.id);
    if (!slotCheck.allowed) {
        return NextResponse.json({
            error: slotCheck.message,
            reason: slotCheck.reason,
        }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Valid invite code' });
}