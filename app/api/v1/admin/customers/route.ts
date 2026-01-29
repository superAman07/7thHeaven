import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const customers = await prisma.user.findMany({
            include: {
                _count: { select: { children: true } },
                orders: {
                    where: { paymentStatus: 'PAID' },
                    select: { 
                        id: true, 
                        createdAt: true, 
                        subtotal: true, 
                        status: true,
                        items: true // Fetch full JSON
                    },
                    orderBy: { createdAt: 'desc' }
                }
                // Removed addresses relation as it doesn't exist
            }
        });

        const formattedCustomers = customers.map((user: any) => {
            const realSpend = user.orders.reduce((sum: number, order: any) => sum + Number(order.subtotal), 0);
            
            // Fix: Use direct fields from User model
            let addressStr = user.fullAddress || 'No Address';
            if (!user.fullAddress && user.city) {
                 addressStr = `${user.city}, ${user.country || ''}`;
            }

            return {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                is7thHeaven: user.is7thHeaven,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                lifetimeSpend: realSpend.toString(),
                referralCode: user.referralCode,
                networkSize: user._count?.children || 0,
                orders: user.orders,
                address: addressStr
            };
        });

        formattedCustomers.sort((a: any, b: any) => b.networkSize - a.networkSize);

        return NextResponse.json({
            success: true,
            data: formattedCustomers
        });

    } catch (error) {
        console.error("Admin Customers API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}