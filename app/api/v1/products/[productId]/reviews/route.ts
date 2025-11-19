import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';

// Validation schema for review submission
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(10).max(1000).optional(),
});

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    fullName: string;
    phone: string;
  };
}

// Middleware to verify authentication
async function authenticateUser(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' };
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    
    if (!user) {
      return { user: null, error: 'Invalid token' };
    }

    return { user };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    // Authenticate user
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        text: validatedData.text || null,
        userId: user.id,
        productId: productId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    // Update product's average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { ratingsAvg: avgRating._avg.rating || 0 },
    });

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        text: review.text,
        createdAt: review.createdAt,
        user: {
          fullName: review.user.fullName
        }
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    // Get all reviews for the product
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}