import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendRewardClaimToAdmin } from '@/lib/email';

const REWARD_AMOUNTS: Record<number, string> = {
    1: 'Prize worth ₹5,000',
    3: 'Prize worth ₹25,000',
    5: 'Prize worth ₹1,25,000',
    7: '₹1 Crore Cash Prize'
};

const ODD_LEVEL_TARGETS: Record<number, number> = {
    1: 5,
    3: 125,
    5: 3125,
    7: 78125
};

// Helper: Calculate level counts for a user (same logic as network/route.ts)
async function calculateLevelCounts(userId: string): Promise<number[]> {
    const userNetwork = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            children: {
                where: { is7thHeaven: true },
                select: {
                    id: true,
                    children: {
                        where: { is7thHeaven: true },
                        select: {
                            id: true,
                            children: {
                                where: { is7thHeaven: true },
                                select: {
                                    id: true,
                                    children: {
                                        where: { is7thHeaven: true },
                                        select: {
                                            id: true,
                                            children: {
                                                where: { is7thHeaven: true },
                                                select: {
                                                    id: true,
                                                    children: {
                                                        where: { is7thHeaven: true },
                                                        select: {
                                                            id: true,
                                                            children: {
                                                                where: { is7thHeaven: true },
                                                                select: { id: true }
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
                    }
                }
            }
        }
    });

    if (!userNetwork) return [0, 0, 0, 0, 0, 0, 0];

    const levelCounts = [0, 0, 0, 0, 0, 0, 0];
    const level1 = userNetwork.children || [];
    levelCounts[0] = level1.length;

    level1.forEach(l1 => {
        const level2 = l1.children || [];
        levelCounts[1] += level2.length;
        level2.forEach(l2 => {
            const level3 = l2.children || [];
            levelCounts[2] += level3.length;
            level3.forEach(l3 => {
                const level4 = l3.children || [];
                levelCounts[3] += level4.length;
                level4.forEach(l4 => {
                    const level5 = l4.children || [];
                    levelCounts[4] += level5.length;
                    level5.forEach(l5 => {
                        const level6 = l5.children || [];
                        levelCounts[5] += level6.length;
                        level6.forEach(l6 => {
                            const level7 = l6.children || [];
                            levelCounts[6] += level7.length;
                        });
                    });
                });
            });
        });
    });

    return levelCounts;
}

// ─── GET: Fetch user's existing claims ───
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const claims = await prisma.rewardClaim.findMany({
            where: { userId },
            orderBy: { claimedAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: claims });
    } catch (error) {
        console.error('Claim GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// ─── POST: Claim a level reward ───
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { level } = await req.json();

        // Validate: only odd levels are reward levels
        if (![1, 3, 5, 7].includes(level)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid level. Only Heaven 1, 3, 5, 7 have rewards.' 
            }, { status: 400 });
        }

        // Check for duplicate claim
        const existingClaim = await prisma.rewardClaim.findUnique({
            where: { userId_level: { userId, level } }
        });

        if (existingClaim) {
            return NextResponse.json({ 
                success: false, 
                error: `You have already claimed Heaven ${level} reward. Status: ${existingClaim.status}` 
            }, { status: 409 });
        }

        // Server-side verify level completion
        const levelCounts = await calculateLevelCounts(userId);
        const levelIndex = level - 1; // level 1 = index 0, level 3 = index 2, etc.
        const target = ODD_LEVEL_TARGETS[level];
        const count = levelCounts[levelIndex];

        if (count < target) {
            return NextResponse.json({ 
                success: false, 
                error: `Heaven ${level} is not completed yet. You have ${count}/${target} members.` 
            }, { status: 403 });
        }

        // Fetch user details for the email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fullName: true, email: true, phone: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const amount = REWARD_AMOUNTS[level];

        // Create the claim
        const claim = await prisma.rewardClaim.create({
            data: {
                userId,
                level,
                amount,
                status: 'PENDING'
            }
        });

        // Send email notification to admin
        if (user.email) {
            await sendRewardClaimToAdmin({
                userName: user.fullName,
                userEmail: user.email,
                userPhone: user.phone,
                level,
                amount
            });
        }

        return NextResponse.json({ 
            success: true, 
            message: level === 7 
                ? `🎉 Your Heaven 7 — ₹1 Crore Cash Prize has been claimed! Our team will review and process it shortly.`
                : `🎉 Your Heaven ${level} prize (${amount}) has been claimed! Our team will review and process it shortly.`,
            data: claim 
        });

    } catch (error) {
        console.error('Claim POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}