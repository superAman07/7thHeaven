import { NextResponse } from 'next/server';
import { getCategories } from '@/services/product';

export async function GET() {
    try {
        const categories = await getCategories();
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error('GET /api/v1/categories Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 