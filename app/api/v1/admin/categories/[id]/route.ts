import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateCategorySchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    image: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    try {
        const body = await request.json();
        const validation = updateCategorySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: validation.data,
        });

        return NextResponse.json({ success: true, data: updatedCategory });
    } catch (error) {
        console.error(`Error updating category ${id}:`, error);
        return NextResponse.json({ success: false, error: { message: "An unexpected error occurred." } }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    try {
        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, data: { message: "Category deleted successfully." } });
    } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        return NextResponse.json({ success: false, error: { message: "An unexpected error occurred." } }, { status: 500 });
    }
}