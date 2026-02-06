import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/v1/network:
 *   get:
 *     summary: Get Network Dashboard
 *     description: >
 *       Returns the user's MLM dashboard data, including level progress (1-7), total team size, 
 *       and direct referral list.
 *     tags:
 *       - Network
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                 referralCode:
 *                   type: string
 *                 totalTeamSize:
 *                   type: integer
 *                 levels:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       level:
 *                         type: integer
 *                       count:
 *                         type: integer
 *                       target:
 *                         type: integer
 *                       isCompleted:
 *                         type: boolean
 *                 directReferrals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       joinedAt:
 *                         type: string
 *                         format: date
 */

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the user and their network (Recursive include for 7 levels)
        // FIXED: Using 'children' instead of 'referrals' to match schema.prisma
        const userNetwork = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                referralCode: true,
                is7thHeaven: true,
                children: { // Level 1
                    where: { is7thHeaven: true },
                    select: {
                        id: true, fullName: true, createdAt: true,
                        children: { // Level 2
                            where: { is7thHeaven: true },
                            select: {
                                id: true,
                                children: { // Level 3
                                    where: { is7thHeaven: true },
                                    select: {
                                        id: true,
                                        children: { // Level 4
                                            where: { is7thHeaven: true },
                                            select: {
                                                id: true,
                                                children: { // Level 5
                                                    where: { is7thHeaven: true },
                                                    select: {
                                                        id: true,
                                                        children: { // Level 6
                                                            where: { is7thHeaven: true },
                                                            select: {
                                                                id: true,
                                                                children: { // Level 7
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

        // FIXED: Using 'children' here as well
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
                fullName: userNetwork.fullName,
                referralCode: userNetwork.referralCode,
                isMember: userNetwork.is7thHeaven,
                levels: levels,
                totalTeamSize: levelCounts.reduce((a, b) => a + b, 0),
                // directReferrals: level1.length > 0 
                //     ? level1.map(u => ({ name: u.fullName, joinedAt: u.createdAt }))
                //     : [
                //         { name: "Amit Sharma", joinedAt: new Date().toISOString() },
                //         { name: "Rahul Verma", joinedAt: new Date(Date.now() - 86400000).toISOString() },
                //         { name: "Priya Singh", joinedAt: new Date(Date.now() - 172800000).toISOString() }
                //       ]
                directReferrals: level1.map(u => ({ name: u.fullName, joinedAt: u.createdAt }))
            }
        });

    } catch (error) {
        console.error("Network API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}