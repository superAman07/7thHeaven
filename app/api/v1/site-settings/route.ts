import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

// GET - Public: Fetch site settings
export async function GET() {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: 'site-settings' }
        });

        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    id: 'site-settings',
                    companyName: 'Celsius',
                    country: 'India'
                }
            });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch site settings' },
            { status: 500 }
        );
    }
}

// PUT - Admin only: Update site settings
export async function PUT(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true }
        });

        if (!user?.isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await req.json();
        delete body.id;
        delete body.updatedAt;

        const settings = await prisma.siteSettings.upsert({
            where: { id: 'site-settings' },
            update: body,
            create: {
                id: 'site-settings',
                ...body
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Settings updated successfully',
            data: settings 
        });
    } catch (error) {
        console.error('Error updating site settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}