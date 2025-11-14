import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const genderTagsEnum = z.enum(["Male", "Female", "Unisex"]);
const variantSchema = z.object({
  size: z.string().min(1, 'Variant size is required'),
  price: z.number().positive('Price must be a positive number'),
});
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  genderTags: z.array(genderTagsEnum).min(1, 'At least one gender tag is required'),
  categoryId: z.string().cuid('Invalid category ID'),
  inStock: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, 'At least one product variant is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchTerm = searchParams.get('search') || '';
    const categoryId = searchParams.get('category') || '';
    const inStock = searchParams.get('status');
    
    const skip = (page - 1) * limit;

    const whereClause: any = {
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (inStock === 'true' || inStock === 'false') {
      whereClause.inStock = inStock === 'true';
    }

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true },
          },
          variants: true,
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const { variants, ...productData } = validation.data;

    const newProduct = await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants,
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}