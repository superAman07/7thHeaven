import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken, verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const setting = await prisma.mLMSettings.findFirst();
        // const value = setting ? setting.minAmount.toNumber() : 2000;
        // return NextResponse.json({ success: true, value });
        return NextResponse.json({ 
            success: true, 
            value: setting?.minAmount ? Number(setting.minAmount) : 2000,
            maxClubPrice: setting?.maxClubProductPrice ? Number(setting.maxClubProductPrice) : 4000 
        });
    } catch (error) {
        console.error("GET /api/v1/settings Error:", error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // console.log("POST /settings Headers:", Object.fromEntries(req.headers));

        const userId = await getUserIdFromToken(req);

        if (!userId) {
            console.error("POST /settings: Unauthorized - No valid token found");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { isAdmin: true } 
        });

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        // const { minPurchase } = body;
        // const newMinAmount = parseFloat(minPurchase);

        // if (isNaN(newMinAmount) || newMinAmount < 0) {
        //     return NextResponse.json({ error: 'A valid minimum purchase amount is required' }, { status: 400 });
        // }

        // const existingSetting = await prisma.mLMSettings.findFirst();

        // if (existingSetting) {
        //     await prisma.mLMSettings.update({
        //         where: { id: existingSetting.id },
        //         data: { minAmount: newMinAmount },
        //     });
        // } else {
        //     await prisma.mLMSettings.create({
        //         data: { minAmount: newMinAmount },
        //     });
        // }

        // return NextResponse.json({ success: true });
        const { minPurchase, maxClubProductPrice } = body;

        const dataToUpdate: any = {};

        // Handle minAmount (using your frontend's 'minPurchase' key)
        if (minPurchase !== undefined) {
             const newMinAmount = parseFloat(minPurchase);
             if (!isNaN(newMinAmount) && newMinAmount >= 0) {
                 dataToUpdate.minAmount = newMinAmount;
             }
        }

        // Handle new Club Price
        if (maxClubProductPrice !== undefined) {
             const newMaxClub = parseFloat(maxClubProductPrice);
             if (!isNaN(newMaxClub) && newMaxClub >= 0) {
                 dataToUpdate.maxClubProductPrice = newMaxClub;
             }
        }

        if (Object.keys(dataToUpdate).length === 0) {
             return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const existingSetting = await prisma.mLMSettings.findFirst();

        if (existingSetting) {
            await prisma.mLMSettings.update({
                where: { id: existingSetting.id },
                data: dataToUpdate,
            });
        } else {
            await prisma.mLMSettings.create({
                data: {
                    minAmount: dataToUpdate.minAmount ?? 2000,
                    maxClubProductPrice: dataToUpdate.maxClubProductPrice ?? 4000
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/v1/settings Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}