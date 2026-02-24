'use client'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Minus, User, Crown, Star, 
  Sparkles, Moon, Sun, LocateFixed, UserPlus
} from 'lucide-react';

const POP = {
  purple: '#8B5CF6', purpleLight: '#A78BFA', purpleDark: '#7C3AED',
  pink: '#EC4899', pinkLight: '#F472B6', pinkDark: '#DB2777',
  gold: '#F59E0B', goldLight: '#FCD34D', goldDark: '#D97706',
};

export interface NetworkNode {
    id: string;
    name: string;
    level: number;
    status: 'ACTIVE' | 'DORMANT' | 'EMPTY';
    joinedAt: string;
    teamSize: number;
    nextLevelTarget: number;
    children?: NetworkNode[];
    parentName?: string;
}

export interface SelectedNodeState {
    node: NetworkNode;
    rect: DOMRect;
}

// ═══ HELPERS ═══
const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

const getHeavenName = (level: number) => {
    if (level === 0) return "Ground Heaven";
    return `Heaven ${level}`;
};

const getNextHeavenName = (level: number) => getHeavenName(level + 1);

const countDescendantsAtDepth = (node: NetworkNode, targetDepth: number): number => {
    if (targetDepth === 1) return node.children ? node.children.filter(c => c.status !== 'EMPTY').length : 0;
    if (!node.children || node.children.length === 0) return 0;
    return node.children.reduce((acc, child) => acc + countDescendantsAtDepth(child, targetDepth - 1), 0);
};

const padChildren = (node: NetworkNode): NetworkNode[] => {
    const existing = (node.children || []).filter(c => c.status !== 'EMPTY');
    if (existing.length >= 5) return existing.slice(0, 5);
    const padded = [...existing];
    for (let i = existing.length; i < 5; i++) {
        padded.push({
            id: `empty-${node.id}-${i}`,
            name: 'Empty Slot',
            level: node.level + 1,
            status: 'EMPTY',
            joinedAt: '',
            teamSize: 0,
            nextLevelTarget: 0,
            children: [],
            parentName: node.level === 0 ? 'You' : node.name,
        });
    }
    return padded;
};

// Collect stats per level
const collectLevelStats = (node: NetworkNode): { level: number, active: number, dormant: number, total: number }[] => {
    const statsMap = new Map<number, { active: number, dormant: number }>();
    const traverse = (n: NetworkNode) => {
        if (n.status === 'EMPTY' || n.level === 0) { n.children?.forEach(traverse); return; }
        if (!statsMap.has(n.level)) statsMap.set(n.level, { active: 0, dormant: 0 });
        const s = statsMap.get(n.level)!;
        if (n.status === 'ACTIVE') s.active++;
        else s.dormant++;
        n.children?.forEach(traverse);
    };
    traverse(node);
    const targets = [0, 5, 25, 125, 625, 3125, 15625, 78125];
    return Array.from(statsMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([level, counts]) => ({ level, active: counts.active, dormant: counts.dormant, total: targets[level] || 5 }));
};

// Node visual style based on status
const getNodeStyle = (status: string, isDark: boolean) => {
    switch (status) {
        case 'ACTIVE': return { bg: POP.purple, border: POP.purple, glow: `${POP.purple}40`, text: '#fff' };
        case 'DORMANT': return { bg: POP.pink, border: POP.pink, glow: `${POP.pinkDark}30`, text: '#fff' };
        case 'EMPTY': return { bg: isDark ? '#1a1a2e' : '#f3f4f6', border: isDark ? '#4B5563' : '#d1d5db', glow: 'transparent', text: isDark ? '#6B7280' : '#9CA3AF' };
        default: return { bg: POP.gold, border: POP.gold, glow: `${POP.gold}40`, text: '#fff' };
    }
};

// ═══ MOCK DATA ═══
const generateMockGalaxy = (depth: number = 1, maxDepth: number = 4): NetworkNode[] => {
    if (depth > maxDepth) return [];
    const names = [
        ['Rahul Sharma', 'Sneha Gupta', 'Vikram Reddy', 'Anita Joshi', 'Karan Mehta'],
        ['Priya Singh', 'Amit Kumar', 'Neha Patel', 'Ravi Verma', 'Sita Rao'],
        ['Deepak Nair', 'Meera Das', 'Arjun Roy', 'Pooja Iyer', 'Suresh Yadav'],
        ['Arun Pillai', 'Lakshmi M', 'Rajesh T', 'Kavita B', 'Manoj Shah'],
    ];
    const levelNames = names[depth - 1] || names[0];
    const countMap: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };
    const count = countMap[depth] || 2;
    return Array.from({ length: count }).map((_, i) => ({
        id: `node-${depth}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        name: levelNames[i] || `User ${depth}-${i}`,
        level: depth,
        status: (Math.random() > 0.3 ? 'ACTIVE' : 'DORMANT') as 'ACTIVE' | 'DORMANT',
        joinedAt: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][Math.floor(Math.random() * 6)]} 2024`,
        teamSize: Math.floor(Math.random() * 30) + 1,
        nextLevelTarget: Math.pow(5, depth),
        children: generateMockGalaxy(depth + 1, maxDepth)
    }));
};

const ROOT_USER_DATA: NetworkNode = {
    id: 'root', name: 'You (Creator)', level: 0, status: 'ACTIVE',
    joinedAt: 'Jan 2024', teamSize: 142, nextLevelTarget: 5,
    children: generateMockGalaxy(1, 4)
};

// ═══ SUB-COMPONENTS ═══

// --- NODE ORB ---
const NodeOrb: React.FC<{
    node: NetworkNode;
    isRoot?: boolean;
    onNodeClick: (node: NetworkNode, rect: DOMRect) => void;
    onToggleExpand: () => void;
    isExpanded: boolean;
    hasChildren: boolean;
    isDark: boolean;
}> = ({ node, isRoot, onNodeClick, onToggleExpand, isExpanded, hasChildren, isDark }) => {
    const isEmpty = node.status === 'EMPTY';
    const isActive = node.status === 'ACTIVE';
    const orbRef = useRef<HTMLDivElement>(null);
    const colors = getNodeStyle(node.status, isDark);

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.type === 'click') e.stopPropagation();
        if (orbRef.current) onNodeClick(node, orbRef.current.getBoundingClientRect());
    };

    // ── EMPTY SLOT ──
    if (isEmpty) {
        return (
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    ref={orbRef}
                    whileHover={{ scale: 1.08 }}
                    onClick={handleInteraction}
                    className="w-11 h-11 md:w-12 md:h-12 rounded-full flex! items-center! justify-center! cursor-pointer"
                    style={{
                        border: `2px dashed ${colors.border}`,
                        background: colors.bg,
                        animation: 'emptyPulse 3s ease-in-out infinite',
                    }}
                >
                    <UserPlus size={14} style={{ color: colors.text }} />
                </motion.div>
                <div className="mt-1 text-[8px] font-sans" style={{ color: colors.text }}>Open</div>
            </div>
        );
    }

    // ── ROOT / ACTIVE / DORMANT ──
    return (
        <div className="relative z-10 flex flex-col items-center group">
            <motion.div 
                ref={orbRef}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInteraction}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex! items-center! justify-center! shadow-xl relative cursor-pointer transition-all duration-300"
                style={{
                    background: isRoot ? `linear-gradient(135deg, ${POP.gold}, ${POP.goldDark})` : colors.bg,
                    border: isRoot ? 'none' : `2.5px solid ${colors.border}`,
                    boxShadow: isRoot
                        ? `0 0 30px ${POP.gold}50, 0 0 60px ${POP.gold}20`
                        : isActive
                            ? `0 0 20px ${colors.glow}, 0 4px 15px rgba(0,0,0,0.3)`
                            : `0 0 10px ${colors.glow}, 0 4px 15px rgba(0,0,0,0.2)`,
                }}
            >
                {isActive && !isRoot && (
                    <div className="absolute inset-[-4px] rounded-full pointer-events-none" style={{
                        border: `2px solid ${colors.border}`,
                        animation: 'activeBreathing 2.5s ease-in-out infinite',
                    }} />
                )}
                {isRoot && (
                    <div className="absolute inset-[-5px] rounded-full pointer-events-none" style={{
                        border: `3px solid ${POP.goldLight}`,
                        animation: 'rootPulse 3s ease-in-out infinite',
                    }} />
                )}
                
                {isRoot ? <Crown size={26} className="text-white" /> : 
                 isActive ? <Star size={20} fill="white" className="text-white" /> : 
                 <User size={20} className="text-white/90" />}
                
                <div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 text-[10px] font-bold rounded-full flex! items-center! justify-center! font-sans shadow-md"
                    style={{
                        background: isDark ? '#0f0f0f' : '#fff',
                        color: isRoot ? POP.gold : colors.bg,
                        border: `2px solid ${isRoot ? POP.gold : colors.border}`,
                    }}
                >
                    {node.level}
                </div>
            </motion.div>

            <div className="mt-1 text-[8px] md:text-[10px] font-bold text-center max-w-[65px] truncate font-sans"
                style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                {isRoot ? 'YOU' : node.name.split(' ')[0]}
            </div>

            {hasChildren && !isEmpty && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="mt-1 w-5 h-5 p-0 rounded-full transition-colors z-20 flex! items-center! justify-center!"
                    style={{
                        background: isRoot ? POP.gold : colors.bg,
                        border: `1.5px solid ${isRoot ? POP.goldLight : colors.border}`,
                        color: '#fff',
                    }}
                >
                    {isExpanded ? <Minus size={10} /> : <Plus size={10} />}
                </button>
            )}
        </div>
    );
};

// --- GALAXY TREE ---
const GalaxyTree = ({ node, onNodeClick, isDark, depth = 0 }: { 
    node: NetworkNode, onNodeClick: (n: NetworkNode, r: DOMRect) => void, isDark: boolean, depth?: number 
}) => {
    const [isExpanded, setIsExpanded] = useState(depth < 1);
    const isEmpty = node.status === 'EMPTY';
    const isDormant = node.status === 'DORMANT';
    const canHaveChildren = !isEmpty && !isDormant;
    const paddedChildren = canHaveChildren ? padChildren(node) : [];
    const hasChildren = paddedChildren.length > 0;
    const realChildCount = paddedChildren.filter(c => c.status !== 'EMPTY').length;
    const parentColors = getNodeStyle(node.status, isDark);

    return (
        <div className="flex flex-col items-center">
            <NodeOrb 
                node={node} isRoot={node.level === 0} onNodeClick={onNodeClick} 
                onToggleExpand={() => setIsExpanded(!isExpanded)} isExpanded={isExpanded} 
                hasChildren={hasChildren && canHaveChildren} isDark={isDark}
            />
            <AnimatePresence>
                {hasChildren && isExpanded && canHaveChildren && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative flex flex-col items-center mt-3"
                    >
                        {/* Level label */}
                        <div className="mb-3 flex items-center gap-2">
                            <div className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, ${isDark ? '#6B7280' : '#9CA3AF'})` }} />
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            }}>
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em] font-sans" style={{ color: POP.gold }}>
                                    ✦ Heaven {node.level + 1}
                                </span>
                                <span className="text-[9px] font-bold font-sans" style={{ 
                                    color: realChildCount >= 5 ? '#10B981' : isDark ? '#6B7280' : '#9CA3AF' 
                                }}>
                                    {realChildCount}/5
                                </span>
                            </div>
                            <div className="h-px w-8" style={{ background: `linear-gradient(to left, transparent, ${isDark ? '#6B7280' : '#9CA3AF'})` }} />
                        </div>

                        {/* Vertical trunk */}
                        <div className="absolute -top-3 left-1/2 w-px h-6 -translate-x-1/2"
                            style={{ background: `linear-gradient(to bottom, ${node.level === 0 ? POP.gold : parentColors.bg}, ${isDark ? '#6B7280' : '#9CA3AF'})` }}
                        />

                        {/* Children row */}
                        <div className="relative flex! justify-center! gap-3 md:gap-6 lg:gap-8 pt-5">
                            {/* Horizontal connector */}
                            <div className="absolute top-0 h-px" style={{
                                left: 'calc(10% + 20px)', right: 'calc(10% + 20px)',
                                background: `linear-gradient(to right, transparent, ${isDark ? '#6B7280' : '#9CA3AF'} 15%, ${isDark ? '#6B7280' : '#9CA3AF'} 85%, transparent)`,
                            }} />
                            
                            {paddedChildren.map((child, idx) => {
                                const childColors = getNodeStyle(child.status, isDark);
                                return (
                                    <motion.div 
                                        key={child.id} 
                                        className="relative flex flex-col items-center"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08, duration: 0.3 }}
                                    >
                                        <div className="absolute -top-5 left-1/2 w-px h-5 -translate-x-1/2"
                                            style={{
                                                background: child.status === 'EMPTY' 
                                                    ? `${isDark ? '#4B5563' : '#D1D5DB'}` 
                                                    : `linear-gradient(to bottom, ${isDark ? '#6B7280' : '#9CA3AF'}, ${childColors.bg})`,
                                            }}
                                        />
                                        <GalaxyTree node={child} onNodeClick={onNodeClick} isDark={isDark} depth={depth + 1} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- TOOLTIP ---
const GlobalTooltip = ({ node, rect, isDark }: { node: NetworkNode, rect: DOMRect, isDark: boolean }) => {
    const top = rect.top - 200; 
    const left = rect.left + rect.width / 2;
    const isActive = node.status === 'ACTIVE';
    const isEmpty = node.status === 'EMPTY';
    const colors = getNodeStyle(node.status, isDark);

        if (isEmpty) {
        const isRootChild = node.level === 1;
        return (
            <div className="fixed z-10000 pointer-events-none" style={{ top, left }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute -translate-x-1/2 w-56 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border font-sans text-center"
                    style={{
                        background: isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
                        borderColor: isDark ? '#374151' : '#E5E7EB',
                    }}
                >
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex! items-center! justify-center!" style={{
                        border: `2px dashed ${isDark ? '#4B5563' : '#D1D5DB'}`,
                        background: isDark ? '#1a1a2e' : '#f9fafb',
                    }}>
                        <UserPlus size={18} style={{ color: '#6B7280' }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>Open Slot</p>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#9CA3AF' }}>
                        {isRootChild 
                            ? 'Share your referral code to fill this position!' 
                            : (
                                <>
                                    <span className="font-semibold" style={{ color: POP.purple }}>{node.parentName}</span>
                                    {' '}needs to refer & activate a member to unlock this slot.
                                </>
                            )
                        }
                    </p>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r" style={{
                        background: isDark ? '#1a1a1a' : '#fff', borderColor: isDark ? '#374151' : '#E5E7EB',
                    }} />
                </motion.div>
            </div>
        );
    }

    const nextRankName = getNextHeavenName(node.level);
    let currentProgressCount = 0, progressLabel = "", target = 0;
    const directCount = node.children ? node.children.filter(c => c.status !== 'EMPTY').length : 0;

    if (directCount < 5) {
        currentProgressCount = directCount; target = 5; progressLabel = "Direct Souls";
    } else {
        const requiredDepth = (node.level === 0 ? 1 : node.level) + 1;
        currentProgressCount = countDescendantsAtDepth(node, requiredDepth);
        target = node.nextLevelTarget || Math.pow(5, requiredDepth);
        progressLabel = `Gen ${requiredDepth} Souls`;
    }
    const progressPercent = Math.min((currentProgressCount / target) * 100, 100);

    return (
        <div className="fixed z-10000 pointer-events-none" style={{ top, left }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute -translate-x-1/2 w-72 backdrop-blur-xl rounded-2xl shadow-2xl p-4 font-serif"
                style={{
                    background: isDark ? 'rgba(15,15,20,0.95)' : 'rgba(255,255,255,0.95)',
                    border: `1px solid ${colors.border}40`,
                }}
            >
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r" style={{
                    background: isDark ? '#0f0f14' : '#fff', borderColor: `${colors.border}40`,
                }} />
                <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}>
                    <div>
                        <h4 className="text-base font-bold font-sans" style={{ color: isDark ? '#fff' : '#111' }}>{node.name}</h4>
                        <div className="text-[10px] uppercase tracking-widest font-sans" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>Joined {node.joinedAt}</div>
                    </div>
                    <span className="text-[9px] font-bold px-3 py-1 rounded-full font-sans" style={{
                        background: `${colors.bg}18`, color: colors.bg, border: `1px solid ${colors.bg}30`,
                    }}>
                        {isActive ? '● ACTIVE' : '○ DORMANT'}
                    </span>
                </div>
                <div className="flex justify-between items-center text-center mb-3 gap-2">
                    <div className="rounded-lg p-2 flex-1" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb' }}>
                        <div className="text-sm font-bold font-sans" style={{ color: isDark ? '#E5E7EB' : '#374151' }}>{node.teamSize}</div>
                        <div className="text-[8px] uppercase font-sans tracking-wide" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>Network</div>
                    </div>
                    <div className="rounded-lg p-2 flex-1" style={{ background: `${colors.bg}10`, border: `1px solid ${colors.bg}20` }}>
                        <div className="text-xs font-bold font-sans whitespace-nowrap" style={{ color: colors.bg }}>{getHeavenName(node.level)}</div>
                        <div className="text-[8px] uppercase font-sans tracking-wide" style={{ color: colors.bg }}>Rank</div>
                    </div>
                </div>
                <div className="font-sans">
                    <div className="flex justify-between text-[9px] font-bold mb-1" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
                        <span className="uppercase tracking-wider">To {nextRankName}</span>
                        <span>{currentProgressCount}/{target} <span className="opacity-70 font-normal">{progressLabel}</span></span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1 }}
                            className="h-full rounded-full" style={{ background: `linear-gradient(to right, ${colors.bg}, ${colors.border})` }} />
                    </div>
                </div>
                {!isActive && (
                    <div className="mt-3 pt-2 text-[10px] leading-relaxed font-sans" style={{
                        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`, color: isDark ? '#9CA3AF' : '#6B7280'
                    }}>
                        <span className="font-bold uppercase tracking-wider" style={{ color: `${POP.pink}CC` }}>Dormant:</span>{' '}
                        Referred but hasn&apos;t joined 7th Heaven yet. Cannot share referrals or build a network until activated.
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// --- STATS RIBBON ---
const StatsRibbon = ({ data, isDark }: { data: NetworkNode, isDark: boolean }) => {
    const stats = useMemo(() => collectLevelStats(data), [data]);
    const totalActive = stats.reduce((a, s) => a + s.active, 0);
    const totalDormant = stats.reduce((a, s) => a + s.dormant, 0);

    return (
        <div className="flex items-center gap-2 py-2.5 px-4 overflow-x-auto" style={{
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            msOverflowStyle: 'none', scrollbarWidth: 'none',
        }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold font-sans shrink-0" style={{
                background: `${POP.purple}15`, color: POP.purpleLight, border: `1px solid ${POP.purple}25`,
            }}>
                <Star size={10} fill={POP.purple} /> {totalActive} Active
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold font-sans shrink-0" style={{
                background: `${POP.pink}15`, color: POP.pinkLight, border: `1px solid ${POP.pink}25`,
            }}>
                <User size={10} /> {totalDormant} Dormant
            </div>
            <div className="w-px h-5 shrink-0" style={{ background: isDark ? '#374151' : '#D1D5DB' }} />
            {stats.map(s => (
                <div key={s.level} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-sans shrink-0" style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
                }}>
                    <span className="font-bold" style={{ color: POP.gold }}>H{s.level}</span>
                    <span className="font-bold" style={{ color: s.active + s.dormant >= s.total ? '#10B981' : isDark ? '#9CA3AF' : '#6B7280' }}>
                        {s.active + s.dormant}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ═══ MAIN COMPONENT ═══
const NetworkGalaxy = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data?: NetworkNode | null }): React.JSX.Element | null => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<SelectedNodeState | null>(null);
    const [isDark, setIsDark] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const dragDistance = useRef(0);
    const lastPinchDist = useRef(0);
    const isPinching = useRef(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const treeData = data || ROOT_USER_DATA;

    useEffect(() => {
        if (isOpen) setPosition({ x: window.innerWidth / 2, y: 150 });
    }, [isOpen]);

    useEffect(() => {
        const navbar = document.getElementById('main-navbar');
        if (isOpen) { if (navbar) navbar.style.display = 'none'; }
        else { if (navbar) navbar.style.display = ''; }
        return () => { if (navbar) navbar.style.display = ''; };
    }, [isOpen]);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        setIsDragging(true);
        lastMousePos.current = { x: clientX, y: clientY };
        dragDistance.current = 0;
    }, []);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging || isPinching.current) return;
        const dx = clientX - lastMousePos.current.x;
        const dy = clientY - lastMousePos.current.y;
        dragDistance.current += Math.sqrt(dx * dx + dy * dy);
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: clientX, y: clientY };
    }, [isDragging]);

    const handleEnd = useCallback(() => {
        setTimeout(() => { setIsDragging(false); isPinching.current = false; }, 50);
    }, []);

    // Global mouse/touch events for panning + pinch zoom
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (lastPinchDist.current > 0) {
                    const delta = dist - lastPinchDist.current;
                    setScale(s => Math.min(Math.max(s + delta * 0.005, 0.2), 3));
                }
                lastPinchDist.current = dist;
                isPinching.current = true;
            } else if (e.touches.length === 1 && !isPinching.current) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const onUp = () => { lastPinchDist.current = 0; handleEnd(); };

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onUp);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [isDragging, handleMove, handleEnd]);

    // Mouse wheel zoom (desktop)
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        setScale(s => Math.min(Math.max(s - e.deltaY * 0.001, 0.2), 3));
    }, []);

    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
    const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.2));
    const resetView = () => { setScale(1); setPosition({ x: window.innerWidth / 2, y: 150 }); };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`fixed inset-0 z-9999 flex flex-col overflow-hidden font-serif transition-colors duration-500 ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-[#fcfaf7] text-gray-800'}`}
            >
                {/* Background effects */}
                {isDark && (
                    <>
                        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${POP.purple}08 0%, transparent 60%)` }} />
                        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 80% 80%, ${POP.pink}05 0%, transparent 50%)` }} />
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="absolute rounded-full" style={{
                                    width: Math.random() * 2.5 + 1 + 'px',
                                    height: Math.random() * 2.5 + 1 + 'px',
                                    background: [POP.purple, POP.gold, POP.pink, '#fff'][Math.floor(Math.random() * 4)],
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.4 + 0.1,
                                    animation: `starTwinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 3}s infinite`,
                                }} />
                            ))}
                        </div>
                    </>
                )}

                {/* HEADER */}
                <header className={`relative z-50 border-b backdrop-blur-md ${isDark ? 'bg-black/50 border-white/8' : 'bg-white/80 border-gray-100'}`}>
                    <div className="flex justify-between items-center p-4 md:p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex! items-center! justify-center! shadow-lg" style={{
                                background: `linear-gradient(135deg, ${POP.purple}, ${POP.gold})`,
                            }}>
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-base md:text-xl font-bold leading-tight" style={{
                                    background: `linear-gradient(135deg, ${POP.purple}, ${POP.gold}, ${POP.pink})`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                }}>
                                    Celestial Galaxy
                                </h2>
                                <p className="text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-[0.2em]" style={{ color: POP.gold }}>Network Explorer</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`w-10 h-10 rounded-full flex! items-center! justify-center! transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                            <X size={20} />
                        </button>
                    </div>
                    <StatsRibbon data={treeData} isDark={isDark} />
                </header>

                {/* MAIN CANVAS */}
                <main className="flex-1 relative flex touch-none">
                    {/* Legend */}
                    <div className="absolute left-3 top-3 z-40 pointer-events-none flex flex-col gap-1.5 select-none p-2 rounded-xl" style={{
                        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest font-sans mb-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>Guide</div>
                        {[
                            { icon: <Crown size={11} />, label: 'You', color: POP.gold },
                            { icon: <Star size={11} fill={POP.purple} />, label: 'Active', color: POP.purple },
                            { icon: <User size={11} />, label: 'Dormant', color: POP.pink },
                            { icon: <UserPlus size={11} />, label: 'Open', color: '#6B7280' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-1.5 opacity-80">
                                <div style={{ color: item.color }}>{item.icon}</div>
                                <span className="text-[9px] md:text-[10px] font-bold font-sans" style={{ color: isDark ? '#D1D5DB' : '#4B5563' }}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Canvas */}
                    <div 
                        ref={canvasRef}
                        className={`flex-1 relative overflow-hidden flex! items-center! justify-center! ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={(e) => e.button === 0 && handleStart(e.clientX, e.clientY)}
                        onTouchStart={(e) => {
                            if (e.touches.length === 2) {
                                const dx = e.touches[0].clientX - e.touches[1].clientX;
                                const dy = e.touches[0].clientY - e.touches[1].clientY;
                                lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
                                isPinching.current = true;
                                setIsDragging(true);
                            } else if (e.touches.length === 1) {
                                handleStart(e.touches[0].clientX, e.touches[0].clientY);
                            }
                        }}
                        onClick={() => dragDistance.current < 10 && setSelectedNode(null)} 
                    >
                        <motion.div 
                            animate={{ 
                                x: position.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0), 
                                y: position.y - 150,
                                scale: scale 
                            }}
                            transition={isDragging ? { type: 'spring', damping: 50, stiffness: 500, mass: 0.1 } : { type: 'spring', damping: 25, stiffness: 120 }}
                            className="absolute top-[150px] left-1/2 -translate-x-1/2 origin-top will-change-transform"
                        >
                            <GalaxyTree 
                                node={treeData} 
                                onNodeClick={(node, rect) => dragDistance.current < 10 && setSelectedNode({ node, rect })} 
                                isDark={isDark}
                            />
                        </motion.div>
                    </div>

                    {/* Controls */}
                    <div className="absolute right-3 top-4 md:right-6 md:top-6 z-40 flex flex-col gap-2 md:gap-3">
                        <button onClick={() => setIsDark(!isDark)}
                            className="w-11 h-11 rounded-xl flex! items-center! justify-center! border! shadow-lg! transition-all"
                            style={{ background: isDark ? '#fff' : '#0f0f0f', color: isDark ? '#000' : POP.gold, borderColor: isDark ? '#fff' : '#0f0f0f' }}>
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={resetView}
                            className="w-11 h-11 rounded-xl flex! items-center! justify-center! border! shadow-lg! transition-all"
                            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#fff', color: isDark ? '#fff' : '#374151', borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB' }}>
                            <LocateFixed size={18} />
                        </button>
                        <div className="flex flex-col rounded-xl shadow-lg border overflow-hidden" style={{
                            background: isDark ? 'rgba(0,0,0,0.5)' : '#fff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                        }}>
                            <button onClick={zoomIn} className="p-2.5 transition-colors border-b border-inherit" style={{ color: isDark ? '#fff' : '#374151' }}><Plus size={16} /></button>
                            <span className="py-1.5 px-2 text-[9px] font-mono text-center" style={{ opacity: 0.6 }}>{Math.round(scale * 100)}%</span>
                            <button onClick={zoomOut} className="p-2.5 transition-colors" style={{ color: isDark ? '#fff' : '#374151' }}><Minus size={16} /></button>
                        </div>
                    </div>
                </main>

                {/* Tooltip */}
                <AnimatePresence>
                    {selectedNode && !isDragging && (
                        <GlobalTooltip node={selectedNode.node} rect={selectedNode.rect} isDark={isDark} />
                    )}
                </AnimatePresence>

                {/* Animations */}
                <style jsx>{`
                    @keyframes emptyPulse {
                        0%, 100% { opacity: 0.4; transform: scale(1); }
                        50% { opacity: 0.65; transform: scale(1.04); }
                    }
                    @keyframes activeBreathing {
                        0%, 100% { transform: scale(1); opacity: 0.2; }
                        50% { transform: scale(1.12); opacity: 0.5; }
                    }
                    @keyframes rootPulse {
                        0%, 100% { transform: scale(1); opacity: 0.3; }
                        50% { transform: scale(1.15); opacity: 0.6; }
                    }
                    @keyframes starTwinkle {
                        0%, 100% { opacity: 0.1; transform: scale(0.8); }
                        50% { opacity: 0.7; transform: scale(1.3); }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default NetworkGalaxy;

// 'use client'
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   X, Plus, Minus, User, Crown, Star, 
//   Sparkles, Moon, Sun, LocateFixed 
// } from 'lucide-react';

// export interface NetworkNode {
//     id: string;
//     name: string;
//     level: number;
//     status: 'ACTIVE' | 'DORMANT';
//     joinedAt: string;
//     teamSize: number;
//     nextLevelTarget: number;
//     children?: NetworkNode[];
// }

// export interface SelectedNodeState {
//     node: NetworkNode;
//     rect: DOMRect;
// }

// // --- CONSTANTS & MOCK DATA ---
// const generateMockGalaxy = (depth: number = 1, maxDepth: number = 5): NetworkNode[] => {
//     if (depth > maxDepth) return [];
//     const maxChildren = depth < 3 ? 3 : 2;
//     const count = Math.floor(Math.random() * maxChildren) + 1; 
//     return Array.from({ length: count }).map((_, i) => ({
//         id: `node-${depth}-${i}-${Math.random().toString(36).substr(2, 9)}`,
//         name: `Angel ${depth}-${i}`,
//         level: depth,
//         status: Math.random() > 0.4 ? 'ACTIVE' : 'DORMANT',
//         joinedAt: 'Nov 2023',
//         teamSize: Math.floor(Math.random() * 40) + 1,
//         nextLevelTarget: 50 * depth,
//         children: generateMockGalaxy(depth + 1, maxDepth)
//     }));
// };

// const ROOT_USER_DATA: NetworkNode = {
//     id: 'root',
//     name: 'You (Creator)',
//     level: 0,
//     status: 'ACTIVE',
//     joinedAt: 'Jan 2024',
//     teamSize: 142,
//     nextLevelTarget: 200,
//     children: generateMockGalaxy(1, 4) 
// };

// const getHeavenName = (level: number) => {
//     if (level === 0) return "Ground Heaven";
//     return `${level}${getOrdinal(level)} Heaven`;
// };

// const getNextHeavenName = (level: number) => {
//     return getHeavenName(level + 1);
// };

// const countDescendantsAtDepth = (node: NetworkNode, targetDepth: number): number => {
//     if (targetDepth === 1) return node.children ? node.children.length : 0;
//     if (!node.children || node.children.length === 0) return 0;
//     return node.children.reduce((acc, child) => acc + countDescendantsAtDepth(child, targetDepth - 1), 0);
// };

// const getOrdinal = (n: number) => {
//     const s = ["th", "st", "nd", "rd"];
//     const v = n % 100;
//     return s[(v - 20) % 10] || s[v] || s[0];
// };

// // --- SUB-COMPONENTS ---

// const NodeOrb: React.FC<{
//     node: NetworkNode;
//     isRoot?: boolean;
//     onNodeClick: (node: NetworkNode, rect: DOMRect) => void;
//     onToggleExpand: () => void;
//     isExpanded: boolean;
//     hasChildren: boolean;
//     isDark: boolean;
// }> = ({ node, isRoot, onNodeClick, onToggleExpand, isExpanded, hasChildren, isDark }) => {
//     const isActive = node.status === 'ACTIVE';
//     const orbRef = useRef<HTMLDivElement>(null);

//     const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
//         if (e.type === 'click') e.stopPropagation();
//         if (orbRef.current) {
//             onNodeClick(node, orbRef.current.getBoundingClientRect());
//         }
//     };

//     return (
//         <div className="relative z-10 flex flex-col items-center group">
//             <motion.div 
//                 ref={orbRef}
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleInteraction}
//                 className={`
//                     w-16 h-16 rounded-full flex! items-center! justify-center! shadow-xl relative cursor-pointer transition-all duration-300
//                     ${isRoot 
//                         ? 'bg-linear-to-br from-[#ddb040] to-amber-700 text-white ring-4 ring-[#ddb040]/30' 
//                         : isActive 
//                             ? isDark ? 'bg-[#1a1a1a] border-2 border-[#ddb040] text-[#ddb040]' : 'bg-white border-2 border-[#ddb040] text-[#ddb040]' 
//                             : isDark ? 'bg-gray-800 border-2 border-gray-700 text-gray-600 grayscale' : 'bg-gray-200 border-2 border-gray-300 text-gray-400 grayscale'
//                     }
//                 `}
//             >
//                 {isActive && (
//                     <div className="absolute inset-0 rounded-full bg-[#ddb040]/30 animate-ping opacity-20 pointer-events-none" />
//                 )}
//                 {isRoot ? <Crown size={28} /> : (isActive ? <Star size={24} fill="currentColor" /> : <User size={24} />)}
//                 <div className={`absolute -bottom-1 -right-1 w-6 h-6 text-[10px] font-bold rounded-full flex! items-center! justify-center! border shadow-sm font-sans ${isDark ? 'bg-black text-[#ddb040] border-gray-700' : 'bg-[#1a1a1a] text-[#ddb040] border-white'}`}>
//                     {node.level}
//                 </div>
//             </motion.div>

//             {hasChildren && (
//                 <button 
//                     onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
//                     onMouseDown={(e) => e.stopPropagation()}
//                     onTouchStart={(e) => e.stopPropagation()}
//                     className={`mt-2 w-6 h-6 p-0 rounded-full border transition-colors z-20 flex! items-center! justify-center! ${isDark ? 'bg-[#ddb040] text-black border-[#ddb040] hover:bg-white' : 'bg-[#ddb040] text-white border-[#ddb040] hover:bg-[#b6902e]'}`}
//                 >
//                     {isExpanded ? <Minus size={12} /> : <Plus size={12} />}
//                 </button>
//             )}
//         </div>
//     );
// };

// const GalaxyTree = ({ node, onNodeClick, isDark }: { node: NetworkNode, onNodeClick: (n: NetworkNode, r: DOMRect) => void, isDark: boolean }) => {
//     const [isExpanded, setIsExpanded] = useState(true);
//     const hasChildren = node.children && node.children.length > 0;

//     return (
//         <div className="flex flex-col items-center">
//             <NodeOrb 
//                 node={node} isRoot={node.level === 0} onNodeClick={onNodeClick} 
//                 onToggleExpand={() => setIsExpanded(!isExpanded)} isExpanded={isExpanded} hasChildren={!!hasChildren} isDark={isDark}
//             />
//             <AnimatePresence>
//                 {hasChildren && isExpanded && (
//                     <motion.div 
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: 'auto' }}
//                         exit={{ opacity: 0, height: 0 }}
//                         className="relative flex! justify-center! gap-12 mt-4 pt-10"
//                     >
//                          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-6rem)] h-px bg-linear-to-r from-transparent ${isDark ? 'via-[#ddb040]/50' : 'via-[#ddb040]/30'} to-transparent`} />
//                          <div className={`absolute -top-6 left-1/2 w-px h-16 bg-linear-to-b from-transparent ${isDark ? 'via-[#ddb040]/50 to-[#ddb040]/50' : 'via-[#ddb040]/30 to-[#ddb040]/30'}`} />
//                         {node.children!.map((child) => (
//                             <div key={child.id} className="relative flex flex-col items-center">
//                                  <div className={`absolute -top-10 left-1/2 w-px h-10 bg-linear-to-b ${isDark ? 'from-[#ddb040]/50' : 'from-[#ddb040]/30'} to-transparent`} />
//                                 <GalaxyTree node={child} onNodeClick={onNodeClick} isDark={isDark} />
//                             </div>
//                         ))}
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// const GlobalTooltip = ({ node, rect, isDark }: { node: NetworkNode, rect: DOMRect, isDark: boolean }) => {
//     const top = rect.top - 180; 
//     const left = rect.left + rect.width / 2;
//     const isActive = node.status === 'ACTIVE';
//     const nextRankName = getNextHeavenName(node.level);
//     // --- SMART BOTTLENECK LOGIC ---
//     let currentProgressCount = 0;
//     let progressLabel = "";
//     let target = 0;
//     const directCount = node.children ? node.children.length : 0;
//     // PRIORITY 1: Directs (The Foundation)
//     // If you have less than 5 directs, your focus MUST be directs, no matter your 'Level' badge.
//     if (directCount < 5) {
//         currentProgressCount = directCount;
//         target = 5;
//         progressLabel = "Direct Souls";
//     } 
//     // PRIORITY 2: Structure (The Empire)
//     // If you have 5+ directs, your focus shifts to the Next Generation depth.
//     else {
//         // e.g. If Level 0, we need depth 1 (Directs) - covered above
//         // If Level 1, we need depth 2. If Level 2, we need depth 3.
//         const requiredDepth = (node.level === 0 ? 1 : node.level) + 1;
//         currentProgressCount = countDescendantsAtDepth(node, requiredDepth);
//         target = node.nextLevelTarget || Math.pow(5, requiredDepth);
//         progressLabel = `Gen ${requiredDepth} Souls`;
//     }
//     const progressPercent = Math.min((currentProgressCount / target) * 100, 100);
//     return (
//         <div className="fixed z-10000 pointer-events-none" style={{ top: top, left: left }}>
//             <motion.div 
//                 initial={{ opacity: 0, scale: 0.9, y: 10 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.9, y: 10 }}
//                 className={`absolute -translate-x-1/2 w-72 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border font-serif ${isDark ? 'bg-[#1a1a1a]/95 border-[#ddb040]/30 text-white' : 'bg-white/95 border-[#ddb040]/20 text-gray-800'}`}
//             >
//                 {/* Header Badge */}
//                 <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r ${isDark ? 'bg-[#1a1a1a] border-[#ddb040]/30' : 'bg-white border-[#ddb040]/20'}`}></div>
                
//                 <div className={`flex items-center justify-between mb-3 border-b pb-2 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
//                     <div>
//                         <h4 className={`text-lg font-bold font-sans ${isDark ? 'text-white' : 'text-gray-900'}`}>{node.name}</h4>
//                         <div className={`text-[10px] uppercase  tracking-widest font-sans ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Joined {node.joinedAt}</div>
//                     </div>
//                     <span className={`text-[9px] font-bold px-3 py-1 rounded-full border font-sans ${isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
//                         {isActive ? 'ACTIVE' : 'DORMANT'}
//                     </span>
//                 </div>
//                 {/* Stats Row */}
//                 <div className="flex justify-between items-center text-center mb-4 gap-2">
//                     <div className={`rounded-lg p-2 flex-1 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
//                         <div className={`text-sm font-bold font-sans ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{node.teamSize}</div>
//                         <div className="text-[8px] opacity-90 uppercase font-sans tracking-wide">Network Size</div>
//                     </div>
//                     <div className={`rounded-lg p-2 flex-1 border ${isDark ? 'bg-[#ddb040]/10 border-[#ddb040]/20' : 'bg-amber-50 border-amber-100'}`}>
//                         <div className="text-xs font-bold text-[#ddb040] font-sans whitespace-nowrap">{getHeavenName(node.level)}</div>
//                         <div className="text-[8px] text-[#ddb040] opacity-90 uppercase font-sans tracking-wide">Current Rank</div>
//                     </div>
//                 </div>
//                 {/* Progress Bar Row */}
//                 <div className="font-sans mb-1">
//                      <div className={`flex justify-between text-[9px] font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                         <span className="uppercase tracking-wider">To {nextRankName}</span>
//                         <span>{currentProgressCount}/{target} <span className="opacity-70 font-normal normal-case">{progressLabel}</span></span>
//                     </div>
//                     <div className="h-1.5 w-full bg-gray-500/20 rounded-full overflow-hidden">
//                         <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1 }} className="h-full bg-linear-to-r from-[#ddb040] to-amber-300 rounded-full" />
//                     </div>
//                 </div>
//                 {/* DORMANT STATUS EXPLANATION (Only shows if Dormant) */}
//                 {!isActive && (
//                     <div className={`mt-3 pt-2 border-t ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-100 text-gray-500'} text-[10px] leading-relaxed font-sans`}>
//                         <span className="font-bold uppercase tracking-wider text-red-400/80 mr-1">Dormant:</span>
//                         Visible but inactive. Has not entered 7th Heaven yet.
//                     </div>
//                 )}
//             </motion.div>
//         </div>
//     );
// };

// const NetworkGalaxy = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data?: NetworkNode | null }): React.JSX.Element | null => {
//     const [scale, setScale] = useState(1);
//     const [position, setPosition] = useState({ x: 0, y: 0 });
//     const [selectedNode, setSelectedNode] = useState<SelectedNodeState | null>(null);
//     const [isDark, setIsDark] = useState(true);

//     const [isDragging, setIsDragging] = useState(false);
//     const lastMousePos = useRef({ x: 0, y: 0 });
//     const dragDistance = useRef(0);

//     useEffect(() => {
//         if (isOpen) {
//             setPosition({ x: window.innerWidth / 2, y: 150 });
//         }
//     }, [isOpen]);

//     const handleStart = useCallback((clientX: number, clientY: number) => {
//         setIsDragging(true);
//         lastMousePos.current = { x: clientX, y: clientY };
//         dragDistance.current = 0;
//     }, []);

//     useEffect(() => {
//         if (isOpen) {
//             const navbar = document.getElementById('main-navbar');
            
//             if (navbar) {
//                 navbar.style.display = 'none';
//             }
//         } else {
//             const navbar = document.getElementById('main-navbar');
//             if (navbar) {
//                 navbar.style.display = '';
//             }
//         }
        
//         return () => {
//             const navbar = document.getElementById('main-navbar');
//             if (navbar) navbar.style.display = '';
//         };
//     }, [isOpen]);

//     const handleMove = useCallback((clientX: number, clientY: number) => {
//         if (!isDragging) return;
//         const dx = clientX - lastMousePos.current.x;
//         const dy = clientY - lastMousePos.current.y;
//         dragDistance.current += Math.sqrt(dx * dx + dy * dy);
//         setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
//         lastMousePos.current = { x: clientX, y: clientY };
//     }, [isDragging]);

//     const handleEnd = useCallback(() => {
//         setTimeout(() => setIsDragging(false), 50);
//     }, []);

//     useEffect(() => {
//         const onMouseMoveGlobal = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
//         const onTouchMoveGlobal = (e: TouchEvent) => {
//             if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY);
//         };
//         const onUpGlobal = () => handleEnd();

//         if (isDragging) {
//             window.addEventListener('mousemove', onMouseMoveGlobal);
//             window.addEventListener('mouseup', onUpGlobal);
//             window.addEventListener('touchmove', onTouchMoveGlobal, { passive: false });
//             window.addEventListener('touchend', onUpGlobal);
//         }
//         return () => {
//             window.removeEventListener('mousemove', onMouseMoveGlobal);
//             window.removeEventListener('mouseup', onUpGlobal);
//             window.removeEventListener('touchmove', onTouchMoveGlobal);
//             window.removeEventListener('touchend', onUpGlobal);
//         };
//     }, [isDragging, handleMove, handleEnd]);

//     const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
//     const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.2));
//     const resetView = () => {
//         setScale(1);
//         setPosition({ x: window.innerWidth / 2, y: 150 });
//     };

//     if (!isOpen) {
//         return null;
//     }

//     return (
//         <AnimatePresence>
//             <motion.div 
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className={`fixed inset-0 z-9999 flex flex-col overflow-hidden font-serif transition-colors duration-500 ${isDark ? 'bg-[#0f0f0f] text-white' : 'bg-[#fcfaf7] text-gray-800'}`}
//             >
//                 {/* Visual Textures */}
//                 <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-20'} bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply`} />
//                 {isDark && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-amber-500/5 via-[#0f0f0f] to-[#0f0f0f] pointer-events-none" />}

//                 {/* --- HEADER --- */}
//                 <header className={`relative z-50 flex justify-between items-center p-4 md:p-6 border-b backdrop-blur-md ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-gray-100'}`}>
//                     <div className="flex items-center gap-3 md:gap-4">
//                         <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex! items-center! justify-center! shadow-lg ${isDark ? 'bg-white/10 text-[#ddb040]' : 'bg-[#1a1a1a] text-[#ddb040]'}`}>
//                             <Sparkles size={20} />
//                         </div>
//                         <div>
//                             <h2 className={`text-base md:text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                                 Celestial Galaxy
//                             </h2>
//                             <p className="text-[8px] md:text-[10px] text-[#ddb040] font-sans font-bold uppercase tracking-[0.2em]">Network Explorer</p>
//                         </div>
//                     </div>
//                     <button onClick={onClose} className={`w-10 h-10 rounded-full flex! items-center! justify-center! transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
//                         <X size={20} />
//                     </button>
//                 </header>

//                 {/* --- MAIN INTERACTIVE STAGE --- */}
//                 <main className="flex-1 relative flex touch-none">
                    
//                     {/* Legend (Desktop only) */}
//                     <div className="absolute left-6 top-6 z-40 pointer-events-none hidden lg:flex flex-col gap-4">
//                          <div className="opacity-70">
//                             <strong className="block text-[10px] uppercase tracking-widest text-[#ddb040] mb-1">Root</strong>
//                             <div className="flex items-center gap-2">
//                                 <Crown size={14} className={isDark ? 'text-white' : 'text-black'} />
//                                 <span className="font-bold text-sm">Ground Heaven</span>
//                             </div>
//                          </div>
//                          <div className="opacity-70">
//                             <strong className="block text-[10px] uppercase tracking-widest text-[#ddb040] mb-1">Status</strong>
//                             <div className="flex items-center gap-2">
//                                 <Star size={14} className="text-[#ddb040]" />
//                                 <span className="font-bold text-sm">Active Soul</span>
//                             </div>
//                          </div>
//                     </div>

//                     <div className="absolute left-4 top-4 z-40 pointer-events-none flex flex-col gap-3 select-none">
//                         {/* Title for the guide */}
//                          <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
//                             Visual Guide
//                          </div>
//                          {/* Compact Legend Items */}
//                          <div className="flex flex-col gap-2">
//                              {/* Item 1 */}
//                              <div className="flex items-center gap-2 opacity-80">
//                                 <Crown size={12} className={isDark ? 'text-[#ddb040]' : 'text-amber-600'} />
//                                 <span className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
//                                     You (Root)
//                                 </span>
//                              </div>
//                              {/* Item 2 */}
//                              <div className="flex items-center gap-2 opacity-80">
//                                 <Star size={12} className={isDark ? 'text-[#ddb040]' : 'text-amber-600'} />
//                                 <span className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
//                                     Active Soul
//                                 </span>
//                              </div>
//                              {/* Item 3 */}
//                              <div className="flex items-center gap-2 opacity-60">
//                                 <User size={12} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
//                                 <span className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                                     Dormant
//                                 </span>
//                              </div>
//                          </div>
//                     </div>

//                     {/* CANVAS AREA */}
//                     <div 
//                         className={`flex-1 relative overflow-hidden flex! items-center! justify-center! ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
//                         onMouseDown={(e) => e.button === 0 && handleStart(e.clientX, e.clientY)}
//                         onTouchStart={(e) => e.touches.length === 1 && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
//                         onClick={() => dragDistance.current < 10 && setSelectedNode(null)} 
//                     >
//                          <motion.div 
//                             animate={{ 
//                                 x: position.x - (window.innerWidth / 2), 
//                                 y: position.y - 150,
//                                 scale: scale 
//                             }}
//                             transition={isDragging ? { type: 'spring', damping: 50, stiffness: 500, mass: 0.1 } : { type: 'spring', damping: 25, stiffness: 120 }}
//                             className="absolute top-[150px] left-1/2 -translate-x-1/2 origin-top will-change-transform"
//                          >
//                              <GalaxyTree 
//                                  node={data || ROOT_USER_DATA} 
//                                  onNodeClick={(node, rect) => dragDistance.current < 10 && setSelectedNode({ node, rect })} 
//                                  isDark={isDark}
//                             />
//                          </motion.div>
//                     </div>

//                     {/* CONTROL PANEL */}
//                     <div className="absolute right-3 top-16 md:right-6 md:top-20 z-40 flex flex-col gap-2 md:gap-3">
//                         <button 
//                             onClick={() => setIsDark(!isDark)}
//                             className={`w-12 h-12 rounded-xl flex! items-center! justify-center! border! shadow-lg! transition-all ${isDark ? 'bg-white text-black border-white' : 'bg-[#1a1a1a]! text-[#ddb040]! border-[#1a1a1a]'}`}
//                         >
//                             {isDark ? <Sun size={20} /> : <Moon size={20} />}
//                         </button>
//                         <button 
//                             onClick={resetView}
//                             className={`w-12 h-12 rounded-xl flex! items-center! justify-center! border! shadow-lg! transition-all ${isDark ? 'bg-white/10 text-white border-white/20' : 'bg-white text-gray-700 border-gray-200'}`}
//                         >
//                             <LocateFixed size={20} />
//                         </button>
//                         <div className={`flex flex-col rounded-xl shadow-lg border overflow-hidden ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200'}`}>
//                             <button onClick={zoomIn} className="p-3 hover:bg-black/5 transition-colors border-b border-inherit"><Plus size={20} /></button>
//                             <span className="p-2 text-[10px] font-mono text-center opacity-70">{Math.round(scale * 100)}%</span>
//                             <button onClick={zoomOut} className="p-3 hover:bg-black/5 transition-colors"><Minus size={20} /></button>
//                         </div>
//                     </div>
//                 </main>

//                 {/* OVERLAYS */}
//                 <AnimatePresence>
//                     {selectedNode && !isDragging && (
//                         <GlobalTooltip node={selectedNode.node} rect={selectedNode.rect} isDark={isDark} />
//                     )}
//                 </AnimatePresence>
//             </motion.div>
//         </AnimatePresence>
//     );
// };

// export default NetworkGalaxy;