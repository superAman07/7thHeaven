import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAccountStatusUpdate, sendWelcomeEmail } from '@/lib/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.isBlocked !== undefined) updateData.isBlocked = body.isBlocked;
    
    let isUpgrading = false;
    if (body.is7thHeaven === true) {
        updateData.is7thHeaven = true;
        isUpgrading = true;
        
        const userCheck = await prisma.user.findUnique({ where: { id }, select: { referralCode: true } });
        if (!userCheck?.referralCode) {
            updateData.referralCode = '7H-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        }
    } else if (body.is7thHeaven === false) {
        updateData.is7thHeaven = false;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (updatedUser.email) {
        try {
            if (body.isBlocked !== undefined) {
                await sendAccountStatusUpdate(updatedUser.email, updatedUser.fullName, body.isBlocked);
            }
            if (isUpgrading) {
                 await sendWelcomeEmail(updatedUser.email, updatedUser.fullName, updatedUser.referralCode || undefined);
            }
        } catch (emailError) {
            console.error("Failed to send status email:", emailError);
        }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}