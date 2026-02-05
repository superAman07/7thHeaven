import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: updatedCollection });
  } catch (error) {
    console.error('PUT Collection Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    // Optional: Check if it has categories before deleting?
    // For now, let's allow delete (it might fail if DB constraints prevent it, which is good)
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
     console.error('DELETE Collection Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete collection' }, { status: 500 });
  }
}