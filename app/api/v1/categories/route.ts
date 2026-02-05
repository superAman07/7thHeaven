import { NextResponse, NextRequest } from 'next/server';
import { getCategories } from '@/services/product';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    image: z.string().optional(),
    collectionId: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const collectionSlug = searchParams.get('collection'); // ?collection=perfumes
        
        const categories = await getCategories(collectionSlug || undefined);
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error('GET /categories Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = categorySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
        }
        
        const newCategory = await prisma.category.create({
            data: validation.data
        });
        
        return NextResponse.json({ success: true, data: newCategory });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
    }
}