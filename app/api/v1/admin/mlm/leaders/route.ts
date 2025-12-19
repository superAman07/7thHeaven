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

        // 4. Filter only 7th Heaven Members and attach stats
        const leaders = allUsers
            .filter(u => u.is7thHeaven)
            .map(u => {
                const stats = calculateStats(u.id);
                
                // Check Level 7 Completion (Target: 78125, but for demo maybe 5?)
                // We'll return the raw count so UI can decide
                const level7Count = stats.levelCounts[6];
                const level7Target = 78125; // 5^7
                const progress = Math.min(100, (level7Count / level7Target) * 100);

                return {
                    ...u,
                    stats: {
                        totalTeam: stats.totalTeam,
                        level7Count,
                        level7Progress: progress,
                        level1Count: stats.levelCounts[0]
                    }
                };
            })
            .sort((a, b) => b.stats.totalTeam - a.stats.totalTeam); // Sort by biggest team

        return NextResponse.json({ success: true, data: leaders });

    } catch (error) {
        console.error('Leaders API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch leaders' }, { status: 500 });
    }
}