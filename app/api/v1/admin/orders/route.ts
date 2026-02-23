import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const customer = searchParams.get('customer') || '';

        const skip = (page - 1) * limit;

        const where: Prisma.OrderWhereInput = {};
        if (customer) {
            where.userId = customer;
        }
        // Special Filter for Refund Pending
        if (status === 'REFUND_PENDING') {
            where.status = 'CANCELLED';
            where.paymentStatus = 'PAID';
        } else if (status === 'NEW_ORDERS') {
            where.status = { in: ['PENDING', 'PROCESSING'] };
            where.paymentStatus = 'PAID';
        } else if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { id: { contains: search, mode: 'insensitive' } },
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { phone: { contains: search, mode: 'insensitive' } } },
            ];
        }

        // Get orders, total count, AND special Refund Pending Count
        const [orders, total, refundPendingCount, newOrdersCount] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
            // Always fetch the count of orders needing refund
            prisma.order.count({
                where: {
                    status: 'CANCELLED',
                    paymentStatus: 'PAID'
                }
            }),
            prisma.order.count({
                where: {
                    status: { in: ['PENDING', 'PROCESSING'] },
                    paymentStatus: 'PAID'
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                refundPendingCount,
                newOrdersCount
            }
        });

    } catch (error) {
        console.error('Admin Orders Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}