import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Helper to format date
const formatDateSimple = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Helper to recursively format the tree and calculate counts
const formatNode = (user: any, level: number = 0): any => {
    const children = user.children ? user.children.map((c: any) => formatNode(c, level + 1)) : [];
    
    // Calculate total team size (direct + indirect)
    const teamSize = children.reduce((acc: number, child: any) => acc + 1 + (child.teamSize || 0), 0);
    
    // Next level target (simple logic: powers of 5, or custom logic)
    const targets = [5, 25, 125, 625, 3125]; 
    const nextTarget = targets[level] || 3125;

    return {
        id: user.id,
        name: user.fullName || "User",
        level: level, // 0 = Root, 1 = Direct Referrals, etc.
        status: user.is7thHeaven ? 'ACTIVE' : 'DORMANT',
        joinedAt: formatDateSimple(user.createdAt),
        teamSize: teamSize, 
        nextLevelTarget: nextTarget,
        children: children
    };
};

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user and 5 levels deep
        const userTree = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, fullName: true, createdAt: true, is7thHeaven: true,
                children: {
                    select: {
                        id: true, fullName: true, createdAt: true, is7thHeaven: true,
                        children: {
                            select: {
                                id: true, fullName: true, createdAt: true, is7thHeaven: true,
                                children: {
                                    select: {
                                        id: true, fullName: true, createdAt: true, is7thHeaven: true,
                                        children: {
                                            select: {
                                                id: true, fullName: true, createdAt: true, is7thHeaven: true,
                                                children: {
                                                     select: { id: true, fullName: true, createdAt: true, is7thHeaven: true }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!userTree) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const formattedTree = formatNode(userTree);

        return NextResponse.json({ success: true, data: formattedTree });

    } catch (error) {
        console.error("Graph API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}