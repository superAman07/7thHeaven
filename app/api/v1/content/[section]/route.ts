import { NextRequest, NextResponse } from 'next/server';
import { 
    getSiteContent, 
    updateSiteContent, 
    defaultGlobalSettings, 
    defaultHomeAbout,
    defaultHomeSections
} from '@/lib/site-content';
import { getUserIdFromToken } from '@/lib/auth';
import * as jose from 'jose';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/v1/content/{section}:
 *   get:
 *     summary: Get Site Content (Banners)
 *     description: Fetch dynamic content like Home Banners or About Us text.
 *     tags:
 *       - Content
 *     parameters:
 *       - name: section
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [home_sections, home_about, global_settings]
 *     responses:
 *       200:
 *         description: JSON content object
 */

const getDefaultForSection = (section: string) => {
    switch (section) {
        case 'global_settings':
            return defaultGlobalSettings;
        case 'home_about':
            return defaultHomeAbout;
        case 'home_sections':
            return defaultHomeSections;
        default:
            return {};
    }
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ section: string }> }
) {
    try {
        const { section } = await params;
        
        const defaultData = getDefaultForSection(section);

        // 2. Fetch from DB (merges with default automaticallly in lib function)
        const content = await getSiteContent(section, defaultData);
        
        return NextResponse.json({ success: true, data: content });

    } catch (error) {
        console.error('[Content API] GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ section: string }> }
) {
    try {
        // 1. FIXED: Use the standard Auth Helper (Fixes 401)
        const userId = await getUserIdFromToken(request);
        
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.isAdmin) {
             return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // 2. Parse Data
        const { section } = await params;
        const body = await request.json();

        // 3. Update Database
        const updatedContent = await updateSiteContent(section, body, userId);

        return NextResponse.json({ success: true, data: updatedContent });

    } catch (error) {
        console.error('[Content API] PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}