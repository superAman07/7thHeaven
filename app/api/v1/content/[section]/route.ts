import { NextRequest, NextResponse } from 'next/server';
import { 
    getSiteContent, 
    updateSiteContent, 
    defaultGlobalSettings, 
    defaultHomeAbout 
} from '@/lib/site-content';
import * as jose from 'jose';

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

// ----------------------------------------------------------------------
// 2. PUT: Admin Access Only
// Used by Admin Dashboard to save changes.
// ----------------------------------------------------------------------
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ section: string }> }
) {
    try {
        // 1. Security Check: Verify Admin Token
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        try {
            await jose.jwtVerify(token, secret);
        } catch (e) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        // 2. Parse Data
        const { section } = await params;
        const body = await request.json();

        // 3. Update Database (Upsert)
        // Note: You can extract admin ID from token if you want to track "updatedBy"
        const updatedContent = await updateSiteContent(section, body);

        return NextResponse.json({ success: true, data: updatedContent });

    } catch (error) {
        console.error('[Content API] PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}