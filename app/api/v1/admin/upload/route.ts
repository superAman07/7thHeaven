import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: { message: 'No file provided.' } }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename and path
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadsDir, filename);

    // Ensure the uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    // Write the file to the server
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, data: { url: publicUrl } });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: { message: 'File upload failed.' } }, { status: 500 });
  }
}