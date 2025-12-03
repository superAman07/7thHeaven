import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the user and their network (Recursive include for 7 levels)
        // Note: Prisma doesn't support recursive queries easily, so we use nested includes.
        // We only care about "is7thHeaven: true" users for the scheme.
        const userNetwork = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                referralCode: true,
                is7thHeaven: true,
                referrals: { // Level 1
                    where: { is7thHeaven: true },
                    select: {
                        id: true, fullName: true, createdAt: true,
                        referrals: { // Level 2
                            where: { is7thHeaven: true },
                            select: {
                                id: true,
                                referrals: { // Level 3
                                    where: { is7thHeaven: true },
                                    select: {
                                        id: true,
                                        referrals: { // Level 4
                                            where: { is7thHeaven: true },
                                            select: {
                                                id: true,
                                                referrals: { // Level 5
                                                    where: { is7thHeaven: true },
                                                    select: {
                                                        id: true,
                                                        referrals: { // Level 6
                                                            where: { is7thHeaven: true },
                                                            select: {
                                                                id: true,
                                                                referrals: { // Level 7
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

        if (!userNetwork) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate Counts per Level
        const levelCounts = [0, 0, 0, 0, 0, 0, 0]; // Index 0 = Level 1, Index 6 = Level 7

        const level1 = userNetwork.referrals || [];
        levelCounts[0] = level1.length;

        level1.forEach(l1 => {
            const level2 = l1.referrals || [];
            levelCounts[1] += level2.length;

            level2.forEach(l2 => {
                const level3 = l2.referrals || [];
                levelCounts[2] += level3.length;

                level3.forEach(l3 => {
                    const level4 = l3.referrals || [];
                    levelCounts[3] += level4.length;

                    level4.forEach(l4 => {
                        const level5 = l4.referrals || [];
                        levelCounts[4] += level5.length;

                        level5.forEach(l5 => {
                            const level6 = l5.referrals || [];
                            levelCounts[5] += level6.length;

                            level6.forEach(l6 => {
                                const level7 = l6.referrals || [];
                                levelCounts[6] += level7.length;
                            });
                        });
                    });
                });
            });
        });

        // Define Targets (Powers of 5)
        const targets = [5, 25, 125, 625, 3125, 15625, 78125];

        // Calculate Completion Status
        const levels = targets.map((target, index) => ({
            level: index + 1,
            count: levelCounts[index],
            target: target,
            isCompleted: levelCounts[index] >= target,
            progress: Math.min(100, (levelCounts[index] / target) * 100)
        }));

        return NextResponse.json({
            success: true,
            data: {
                referralCode: userNetwork.referralCode,
                isMember: userNetwork.is7thHeaven,
                levels: levels,
                totalTeamSize: levelCounts.reduce((a, b) => a + b, 0),
                directReferrals: level1.map(u => ({ name: u.fullName, joinedAt: u.createdAt })) // Send Level 1 details for display
            }
        });

    } catch (error) {
        console.error("Network API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}