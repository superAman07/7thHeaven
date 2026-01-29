import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: body.isBlocked },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Block User Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}