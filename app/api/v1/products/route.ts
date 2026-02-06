import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/services/product';

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Fetch all products with filters
 *     description: Retrieve a paginated list of products. Supports filtering by collection (e.g., Gift Sets), category (e.g., For Him), gender, and price.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *       - name: collectionSlug
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by Parent Collection Slug (e.g., 'gift-sets'). Use this for the main listing page.
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by Category Slug (e.g., 'for-him') or ID. Can be comma-separated.
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Men, Women, Unisex]
 *         description: Filter by gender tag
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [newest, price_asc, price_desc, name_asc]
 *         description: Sorting order
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       price:
 *                         type: number
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '3'),
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      collectionSlug: searchParams.get('collectionSlug') || undefined,
      gender: searchParams.get('gender') || undefined,
      sort: searchParams.get('sort') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    };

    const result = await getProducts(params);

    return NextResponse.json({ 
      success: true, 
      data: result.data, 
      meta: result.meta 
    });
  } catch (error) {
    console.error('GET /api/v1/products Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}