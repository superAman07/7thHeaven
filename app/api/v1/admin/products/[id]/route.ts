import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Handler to get a single product by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: true,
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: { message: 'Product not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

// DELETE: Handler to delete a product
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // The schema's `onDelete: Cascade` on ProductVariant will handle deleting variants automatically.
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, data: { message: 'Product deleted successfully.' } });
  } catch (error) {
    console.error(`Error deleting product ${params.id}:`, error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

// We will add the PUT (update) logic in the next step as it is more complex.