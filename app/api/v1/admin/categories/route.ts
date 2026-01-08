import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Zod schema for validating the request body when creating a category
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be a valid URL slug (e.g., 'perfume-for-men')"),
  image: z.string().optional(),
});

/**
 * Handler to get all categories
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
    }, { status: 500 });
  }
}

/**
 * Handler to create a new category
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: validation.error.flatten() },
      }, { status: 400 });
    }

    const { name, slug, image } = validation.data;

    // Check if category with the same name or slug already exists
    const existingCategory = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        error: { code: "CONFLICT", message: "A category with this name or slug already exists." },
      }, { status: 409 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        image,
      },
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
    }, { status: 500 });
  }
}