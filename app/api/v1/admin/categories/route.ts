import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// ✅ UPDATED Schema to accept collectionId
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().optional(),
  collectionId: z.string().optional().nullable(), // Added this
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { collection: true }, // ✅ Return Parent Collection info
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const { name, slug, image, collectionId } = validation.data;

    // Check duplicates
    const exist = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (exist) {
      return NextResponse.json({ success: false, error: { message: "Category name/slug taken" } }, { status: 409 });
    }

    // ✅ SAVE collectionId in database
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        image,
        collectionId: collectionId || null, 
      },
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ success: false, error: { message: "Server Error" } }, { status: 500 });
  }
}