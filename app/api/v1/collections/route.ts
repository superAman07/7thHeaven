import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * @swagger
 * /api/v1/collections:
 *   get:
 *     summary: List all Collections
 *     description: Returns top-level collections (e.g. Gift Sets, Perfumes)
 *     tags:
 *       - Collections
 *     responses:
 *       200:
 *         description: A list of collections
 */
const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: { select: { categories: true } },
        categories: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error('GET /collections Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = collectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const { name, slug, description, image, isActive } = validation.data;

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    console.error('POST /collections Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A collection with this name or slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create collection' }, { status: 500 });
  }
}