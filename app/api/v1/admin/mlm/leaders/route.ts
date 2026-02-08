import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Fetch all users (lightweight payload) to build the graph
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                referrerId: true,
                fullName: true,
                email: true,
                phone: true,
                is7thHeaven: true,
                createdAt: true,
                referralCode: true
            }
        });

        // 2. Build Adjacency List (Parent -> Children)
        const userMap = new Map<string, typeof allUsers[0]>();
        const childrenMap = new Map<string, string[]>();

        allUsers.forEach(u => {
            userMap.set(u.id, u);
            if (u.referrerId) {
                if (!childrenMap.has(u.referrerId)) {
                    childrenMap.set(u.referrerId, []);
                }
                childrenMap.get(u.referrerId)?.push(u.id);
            }
        });

        // 3. Helper to calculate stats for a specific user
        const calculateStats = (rootId: string) => {
            let totalTeam = 0;
            const levelCounts = [0, 0, 0, 0, 0, 0, 0]; // Levels 1-7
            
            // BFS to traverse 7 levels
            let currentLevelNodes = childrenMap.get(rootId) || [];
            let currentLevel = 0;

            while (currentLevel < 7 && currentLevelNodes.length > 0) {
                levelCounts[currentLevel] = currentLevelNodes.length;
                totalTeam += currentLevelNodes.length;

                const nextLevelNodes: string[] = [];
                currentLevelNodes.forEach(childId => {
                    const grandChildren = childrenMap.get(childId);
                    if (grandChildren) {
                        nextLevelNodes.push(...grandChildren);
                    }
                });

                currentLevelNodes = nextLevelNodes;
                currentLevel++;
            }

            return { totalTeam, levelCounts };
        };

        const leaders = allUsers
            .filter(u => u.is7thHeaven)
            .map(u => {
                const stats = calculateStats(u.id);
                
                const oddLevelTargets = {
                    1: 5,       
                    3: 125,     
                    5: 3125,    
                    7: 78125    
                };

                const oddLevelProgress = {
                    level1: {
                        count: stats.levelCounts[0],
                        target: oddLevelTargets[1],
                        progress: Math.min(100, (stats.levelCounts[0] / oddLevelTargets[1]) * 100),
                        complete: stats.levelCounts[0] >= oddLevelTargets[1]
                    },
                    level3: {
                        count: stats.levelCounts[2],
                        target: oddLevelTargets[3],
                        progress: Math.min(100, (stats.levelCounts[2] / oddLevelTargets[3]) * 100),
                        complete: stats.levelCounts[2] >= oddLevelTargets[3]
                    },
                    level5: {
                        count: stats.levelCounts[4],
                        target: oddLevelTargets[5],
                        progress: Math.min(100, (stats.levelCounts[4] / oddLevelTargets[5]) * 100),
                        complete: stats.levelCounts[4] >= oddLevelTargets[5]
                    },
                    level7: {
                        count: stats.levelCounts[6],
                        target: oddLevelTargets[7],
                        progress: Math.min(100, (stats.levelCounts[6] / oddLevelTargets[7]) * 100),
                        complete: stats.levelCounts[6] >= oddLevelTargets[7]
                    }
                };

                const completedLevels = [1, 3, 5, 7].filter(level => {
                    const key = `level${level}` as keyof typeof oddLevelProgress;
                    return oddLevelProgress[key].complete;
                });

                return {
                    ...u,
                    stats: {
                        totalTeam: stats.totalTeam,
                        levelCounts: stats.levelCounts,
                        oddLevelProgress,
                        completedLevels,
                        level1Count: stats.levelCounts[0],
                        level7Count: stats.levelCounts[6],
                        level7Progress: oddLevelProgress.level7.progress
                    }
                };
            })
            .sort((a, b) => b.stats.totalTeam - a.stats.totalTeam);

        return NextResponse.json({ success: true, data: leaders });

    } catch (error) {
        console.error('Leaders API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch leaders' }, { status: 500 });
    }
}