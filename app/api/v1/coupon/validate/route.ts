import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/v1/coupon/validate:
 *   post:
 *     summary: Validate Coupon Code
 *     description: Validates a coupon code and calculates the discount amount based on cart total.
 *     tags:
 *       - Coupons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - cartTotal
 *             properties:
 *               code:
 *                 type: string
 *                 description: The coupon code to validate
 *                 example: "SUMMER20"
 *               cartTotal:
 *                 type: number
 *                 description: Current cart total before discount
 *                 example: 9750
 *     responses:
 *       200:
 *         description: Coupon validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 coupon:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     code:
 *                       type: string
 *                       example: "SUMMER20"
 *                     type:
 *                       type: string
 *                       enum: [PERCENT, FIXED]
 *                       example: "PERCENT"
 *                     value:
 *                       type: number
 *                       example: 10
 *                     discountAmount:
 *                       type: number
 *                       example: 975
 *                     finalTotal:
 *                       type: number
 *                       example: 8775
 *       400:
 *         description: Invalid request, coupon inactive, or minimum amount not met
 *       404:
 *         description: Coupon code not found
 *       500:
 *         description: Server error
 */

export async function POST(req: NextRequest) {
    try {
        const { code, cartTotal } = await req.json();

        if (!code || cartTotal === undefined) {
            return NextResponse.json(
                { success: false, error: 'Coupon code and cart total are required' },
                { status: 400 }
            );
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase().trim() }
        });

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: 'Invalid coupon code' },
                { status: 404 }
            );
        }

        // Check if active
        if (!coupon.isActive) {
            return NextResponse.json(
                { success: false, error: 'This coupon is no longer active' },
                { status: 400 }
            );
        }

        // Check expiry
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return NextResponse.json(
                { success: false, error: 'This coupon has expired' },
                { status: 400 }
            );
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json(
                { success: false, error: 'This coupon has reached its usage limit' },
                { status: 400 }
            );
        }

        // Check minimum order amount
        const minAmount = Number(coupon.minOrderAmount) || 0;
        if (cartTotal < minAmount) {
            return NextResponse.json(
                { success: false, error: `Minimum order amount of ₹${minAmount} required` },
                { status: 400 }
            );
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'PERCENT') {
            discountAmount = Math.round((cartTotal * Number(coupon.value)) / 100);
        } else if (coupon.type === 'FIXED') {
            discountAmount = Math.min(Number(coupon.value), cartTotal);
        }

        return NextResponse.json({
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                value: Number(coupon.value),
                discountAmount,
                finalTotal: cartTotal - discountAmount
            }
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to validate coupon' },
            { status: 500 }
        );
    }
}