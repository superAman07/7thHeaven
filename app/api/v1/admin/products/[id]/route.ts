import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const genderTagsEnum = z.enum(["Male", "Female", "Unisex"]);

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, 'Variant size is required'),
  price: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  sellingPrice: z.union([z.string(), z.number()]).transform((val) => val ? Number(val) : null).optional().nullable(),
  stock: z.union([z.string(), z.number()]).transform((val) => parseInt(String(val), 10) || 0),
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
  isBestSeller: z.boolean().optional(),
  isFor7thHeaven: z.boolean().optional(),
  variants: z.array(variantSchema).min(1).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
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
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { isArchived: true, inStock: false }
    });

    return NextResponse.json({ success: true, data: { message: 'Product deleted successfully.' } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation Error:", validation.error.flatten());
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const { variants, categoryId, ...productData } = validation.data;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...(categoryId && { category: { connect: { id: categoryId } } }),
        },
      });

      if (variants) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true },
        });
        const existingVariantIds = new Set(existingVariants.map(v => v.id));

        const variantsToCreate = variants.filter(v => !v.id);
        const variantsToUpdate = variants.filter(v => v.id && existingVariantIds.has(v.id));

        const incomingVariantIds = new Set(variants.filter(v => v.id).map(v => v.id));
        const variantIdsToDelete = existingVariants
          .map(v => v.id)
          .filter(vid => !incomingVariantIds.has(vid));

        if (variantIdsToDelete.length > 0) {
          await tx.productVariant.deleteMany({ where: { id: { in: variantIdsToDelete } } });
        }

        if (variantsToCreate.length > 0) {
          await tx.productVariant.createMany({
            data: variantsToCreate.map(({ size, price, sellingPrice, stock }) => ({
              productId: id,
              size,
              price: price,
              sellingPrice: sellingPrice ?? null,
              stock: stock
            })),
          });
        }

        for (const variant of variantsToUpdate) {
          if (variant.id) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                size: variant.size,
                price: variant.price,
                sellingPrice: variant.sellingPrice ?? null,
                stock: variant.stock
              },
            });
          }
        }
      }

      return product;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: true }
    });

    return NextResponse.json({ success: true, data: finalProduct });
  } catch (error) {
    console.error("❌ PUT Product Error:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
        details: error
      }
    }, { status: 500 });
  }
}