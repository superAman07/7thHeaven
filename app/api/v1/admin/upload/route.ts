import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: 'No file provided.' } },
        { status: 400 }
      );
    }

    // Convert to buffer for S3
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;

    // Determine content type
    const contentType = file.type || 'application/octet-stream';

    // Upload to S3
    const s3Url = await uploadToS3(buffer, filename, contentType);

    // Return the S3 URL (The frontend will see this and be happy)
    return NextResponse.json({ 
        success: true, 
        data: { url: s3Url } 
    });

  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return NextResponse.json(
        { success: false, error: { message: 'File upload failed.' } }, 
        { status: 500 }
    );
  }
}