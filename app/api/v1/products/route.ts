import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        inStock: true, 
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,  
      include: {
        variants: true, 
        category: {
          select: { slug: true } 
        }
      },
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}