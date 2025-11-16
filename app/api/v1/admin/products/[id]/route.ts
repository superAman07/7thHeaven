import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const genderTagsEnum = z.enum(["Male", "Female", "Unisex"]);

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, 'Variant size is required'),
  price: z.number().positive('Price must be a positive number'),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  images: z.array(z.string()).min(1).optional(),
  genderTags: z.array(genderTagsEnum).min(1).optional(),
  categoryId: z.string().cuid().optional(),
  inStock: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  variants: z.array(variantSchema).min(1).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, data: { message: 'Product deleted successfully.' } });
  } catch (error) {
    console.error(`Error deleting product ${params.id}:`, error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const { variants, ...productData } = validation.data;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: params.id },
        data: productData,
      });

      if (variants) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: params.id },
          select: { id: true },
        });
        const existingVariantIds = new Set(existingVariants.map(v => v.id));

        const variantsToCreate = variants.filter(v => !v.id);
        const variantsToUpdate = variants.filter(v => v.id && existingVariantIds.has(v.id));
        const updatedVariantIds = new Set(variantsToUpdate.map(v => v.id));
        const variantIdsToDelete = [...existingVariantIds].filter(id => !updatedVariantIds.has(id));

        if (variantIdsToDelete.length > 0) {
          await tx.productVariant.deleteMany({ where: { id: { in: variantIdsToDelete } } });
        }
        if (variantsToCreate.length > 0) {
          await tx.productVariant.createMany({
            data: variantsToCreate.map(({ size, price }) => ({ productId: params.id, size, price: price.toString() })),
          });
        }
        for (const variant of variantsToUpdate) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { size: variant.size, price: variant.price.toString() },
          });
        }
      }

      return product;
    });

    const finalProduct = await prisma.product.findUnique({
        where: { id: params.id },
        include: { variants: true, category: true }
    });

    return NextResponse.json({ success: true, data: finalProduct });
  } catch (error) {
    console.error(`Error updating product ${params.id}:`, error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}