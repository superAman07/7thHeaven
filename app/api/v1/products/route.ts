import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/services/product';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      gender: searchParams.get('gender') || undefined,
      sort: searchParams.get('sort') || undefined,
    };

    const result = await getProducts(params);

    return NextResponse.json({ 
      success: true, 
      data: result.data, 
      meta: result.meta 
    });
  } catch (error) {
    console.error('GET /api/v1/products Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}