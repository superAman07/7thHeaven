import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs'; 
import { sendOTPEmail } from '@/lib/email';

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get Full Profile
 *     description: Returns detailed profile info including address and referral code.
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *   post:
 *     summary: Request Profile Update OTP
 *     description: Request OTP to verify phone/email change.
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - value
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, phone]
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 *   put:
 *     summary: Update Profile
 *     description: >
 *       Update profile details. 
 *       **Note:** Changing Phone/Email requires `otp`. 
 *       Changing Password requires `currentPassword`.
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               fullAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *                 description: Required if changing phone/email
 *               newPassword:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *                 description: Required if setting newPassword
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                fullAddress: true,
                city: true,
                state: true,
                pincode: true,
                country: true,
                is7thHeaven: true,
                referralCode: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Fetch Me Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, value } = body; // type: 'phone' | 'email'

        if (!['phone', 'email'].includes(type) || !value) {
            return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });

        await prisma.user.update({
            where: { id: userId },
            data: { otpHash, otpExpiry }
        });
        if (type === 'email') {
            sendOTPEmail(value, otp, user?.fullName || 'Customer')
                .catch(err => console.error('Profile OTP email error:', err));
        }

        return NextResponse.json({ success: true, message: `OTP sent to ${value}` });

    } catch (error) {
        console.error('Request OTP Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { 
            fullName, 
            email, 
            phone,
            fullAddress,
            city,
            state,
            pincode,
            country,
            currentPassword,
            newPassword,
            otp // OTP is required if phone or email changes
        } = body;

        // Fetch user first to check current values
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = {
            fullName,
            fullAddress,
            city,
            state,
            pincode,
            country
        };

        // Handle Phone Update
        if (phone && phone !== user.phone) {
            if (!otp) {
                return NextResponse.json({ error: 'OTP is required to update phone number.' }, { status: 400 });
            }
            // Verify OTP
            if (!user.otpHash || !user.otpExpiry || new Date() > user.otpExpiry) {
                 return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
            }
            const isOtpValid = await bcrypt.compare(otp, user.otpHash);
            if (!isOtpValid) {
                return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
            }
            updateData.phone = phone;
        } else if (phone) {
            updateData.phone = phone;
        }

        // Handle Email Update
        if (email && email !== user.email) {
            if (!otp) {
                return NextResponse.json({ error: 'OTP is required to update email.' }, { status: 400 });
            }
            // Verify OTP (Reusing same otpHash slot)
            if (!user.otpHash || !user.otpExpiry || new Date() > user.otpExpiry) {
                 return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
            }
            const isOtpValid = await bcrypt.compare(otp, user.otpHash);
            if (!isOtpValid) {
                return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
            }
            updateData.email = email;
        } else if (email) {
            updateData.email = email;
        }

        // Handle Password Change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new one.' }, { status: 400 });
            }

            if (!user.passwordHash) { 
                return NextResponse.json({ error: 'User password not set.' }, { status: 400 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.passwordHash = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                fullAddress: true,
                city: true,
                state: true,
                pincode: true,
                country: true
            }
        });

        return NextResponse.json({ success: true, user: updatedUser, message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}