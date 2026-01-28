'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Minus, User, Crown, Star, 
  Sparkles, Moon, Sun, LocateFixed 
} from 'lucide-react';

export interface NetworkNode {
    id: string;
    name: string;
    level: number;
    status: 'ACTIVE' | 'DORMANT';
    joinedAt: string;
    teamSize: number;
    nextLevelTarget: number;
    children?: NetworkNode[];
}

export interface SelectedNodeState {
    node: NetworkNode;
    rect: DOMRect;
}

// --- CONSTANTS & MOCK DATA ---
const generateMockGalaxy = (depth: number = 1, maxDepth: number = 5): NetworkNode[] => {
    if (depth > maxDepth) return [];
    const maxChildren = depth < 3 ? 3 : 2;
    const count = Math.floor(Math.random() * maxChildren) + 1; 
    return Array.from({ length: count }).map((_, i) => ({
        id: `node-${depth}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        name: `Angel ${depth}-${i}`,
        level: depth,
        status: Math.random() > 0.4 ? 'ACTIVE' : 'DORMANT',
        joinedAt: 'Nov 2023',
        teamSize: Math.floor(Math.random() * 40) + 1,
        nextLevelTarget: 50 * depth,
        children: generateMockGalaxy(depth + 1, maxDepth)
    }));
};

const ROOT_USER_DATA: NetworkNode = {
    id: 'root',
    name: 'You (Creator)',
    level: 0,
    status: 'ACTIVE',
    joinedAt: 'Jan 2024',
    teamSize: 142,
    nextLevelTarget: 200,
    children: generateMockGalaxy(1, 4) 
};

const getHeavenName = (level: number) => {
    if (level === 0) return "Ground Heaven";
    return `${level}${getOrdinal(level)} Heaven`;
};

const getNextHeavenName = (level: number) => {
    return getHeavenName(level + 1);
};

const countDescendantsAtDepth = (node: NetworkNode, targetDepth: number): number => {
    if (targetDepth === 1) return node.children ? node.children.length : 0;
    if (!node.children || node.children.length === 0) return 0;
    return node.children.reduce((acc, child) => acc + countDescendantsAtDepth(child, targetDepth - 1), 0);
};

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

// --- SUB-COMPONENTS ---

const NodeOrb: React.FC<{
    node: NetworkNode;
    isRoot?: boolean;
    onNodeClick: (node: NetworkNode, rect: DOMRect) => void;
    onToggleExpand: () => void;
    isExpanded: boolean;
    hasChildren: boolean;
    isDark: boolean;
}> = ({ node, isRoot, onNodeClick, onToggleExpand, isExpanded, hasChildren, isDark }) => {
    const isActive = node.status === 'ACTIVE';
    const orbRef = useRef<HTMLDivElement>(null);

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.type === 'click') e.stopPropagation();
        if (orbRef.current) {
            onNodeClick(node, orbRef.current.getBoundingClientRect());
        }
    };

    return (
        <div className="relative z-10 flex flex-col items-center group">
            <motion.div 
                ref={orbRef}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInteraction}
                className={`
                    w-16 h-16 rounded-full flex! items-center! justify-center! shadow-xl relative cursor-pointer transition-all duration-300
                    ${isRoot 
                        ? 'bg-linear-to-br from-[#ddb040] to-amber-700 text-white ring-4 ring-[#ddb040]/30' 
                        : isActive 
                            ? isDark ? 'bg-[#1a1a1a] border-2 border-[#ddb040] text-[#ddb040]' : 'bg-white border-2 border-[#ddb040] text-[#ddb040]' 
                            : isDark ? 'bg-gray-800 border-2 border-gray-700 text-gray-600 grayscale' : 'bg-gray-200 border-2 border-gray-300 text-gray-400 grayscale'
                    }
                `}
            >
                {isActive && (
                    <div className="absolute inset-0 rounded-full bg-[#ddb040]/30 animate-ping opacity-20 pointer-events-none" />
                )}
                {isRoot ? <Crown size={28} /> : (isActive ? <Star size={24} fill="currentColor" /> : <User size={24} />)}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 text-[10px] font-bold rounded-full flex! items-center! justify-center! border shadow-sm font-sans ${isDark ? 'bg-black text-[#ddb040] border-gray-700' : 'bg-[#1a1a1a] text-[#ddb040] border-white'}`}>
                    {node.level}
                </div>
            </motion.div>

            {hasChildren && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`mt-2 w-6 h-6 p-0 rounded-full border transition-colors z-20 flex! items-center! justify-center! ${isDark ? 'bg-[#ddb040] text-black border-[#ddb040] hover:bg-white' : 'bg-[#ddb040] text-white border-[#ddb040] hover:bg-[#b6902e]'}`}
                >
                    {isExpanded ? <Minus size={12} /> : <Plus size={12} />}
                </button>
            )}
        </div>
    );
};

const GalaxyTree = ({ node, onNodeClick, isDark }: { node: NetworkNode, onNodeClick: (n: NetworkNode, r: DOMRect) => void, isDark: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            <NodeOrb 
                node={node} isRoot={node.level === 0} onNodeClick={onNodeClick} 
                onToggleExpand={() => setIsExpanded(!isExpanded)} isExpanded={isExpanded} hasChildren={!!hasChildren} isDark={isDark}
            />
            <AnimatePresence>
                {hasChildren && isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative flex! justify-center! gap-12 mt-4 pt-10"
                    >
                         <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-6rem)] h-px bg-linear-to-r from-transparent ${isDark ? 'via-[#ddb040]/50' : 'via-[#ddb040]/30'} to-transparent`} />
                         <div className={`absolute -top-6 left-1/2 w-px h-16 bg-linear-to-b from-transparent ${isDark ? 'via-[#ddb040]/50 to-[#ddb040]/50' : 'via-[#ddb040]/30 to-[#ddb040]/30'}`} />
                        {node.children!.map((child) => (
                            <div key={child.id} className="relative flex flex-col items-center">
                                 <div className={`absolute -top-10 left-1/2 w-px h-10 bg-linear-to-b ${isDark ? 'from-[#ddb040]/50' : 'from-[#ddb040]/30'} to-transparent`} />
                                <GalaxyTree node={child} onNodeClick={onNodeClick} isDark={isDark} />
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GlobalTooltip = ({ node, rect, isDark }: { node: NetworkNode, rect: DOMRect, isDark: boolean }) => {
    const top = rect.top - 180; 
    const left = rect.left + rect.width / 2;
    const isActive = node.status === 'ACTIVE';
    const nextRankName = getNextHeavenName(node.level);
    // --- SMART BOTTLENECK LOGIC ---
    let currentProgressCount = 0;
    let progressLabel = "";
    let target = 0;
    const directCount = node.children ? node.children.length : 0;
    // PRIORITY 1: Directs (The Foundation)
    // If you have less than 5 directs, your focus MUST be directs, no matter your 'Level' badge.
    if (directCount < 5) {
        currentProgressCount = directCount;
        target = 5;
        progressLabel = "Direct Souls";
    } 
    // PRIORITY 2: Structure (The Empire)
    // If you have 5+ directs, your focus shifts to the Next Generation depth.
    else {
        // e.g. If Level 0, we need depth 1 (Directs) - covered above
        // If Level 1, we need depth 2. If Level 2, we need depth 3.
        const requiredDepth = (node.level === 0 ? 1 : node.level) + 1;
        currentProgressCount = countDescendantsAtDepth(node, requiredDepth);
        target = node.nextLevelTarget || Math.pow(5, requiredDepth);
        progressLabel = `Gen ${requiredDepth} Souls`;
    }
    const progressPercent = Math.min((currentProgressCount / target) * 100, 100);
    return (
        <div className="fixed z-10000 pointer-events-none" style={{ top: top, left: left }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={`absolute -translate-x-1/2 w-72 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border font-serif ${isDark ? 'bg-[#1a1a1a]/95 border-[#ddb040]/30 text-white' : 'bg-white/95 border-[#ddb040]/20 text-gray-800'}`}
            >
                {/* Header Badge */}
                <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r ${isDark ? 'bg-[#1a1a1a] border-[#ddb040]/30' : 'bg-white border-[#ddb040]/20'}`}></div>
                
                <div className={`flex items-center justify-between mb-3 border-b pb-2 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <div>
                        <h4 className={`text-lg font-bold font-sans ${isDark ? 'text-white' : 'text-gray-900'}`}>{node.name}</h4>
                        <div className={`text-[10px] uppercase  tracking-widest font-sans ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Joined {node.joinedAt}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full border font-sans ${isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                        {isActive ? 'ACTIVE' : 'DORMANT'}
                    </span>
                </div>
                {/* Stats Row */}
                <div className="flex justify-between items-center text-center mb-4 gap-2">
                    <div className={`rounded-lg p-2 flex-1 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className={`text-sm font-bold font-sans ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{node.teamSize}</div>
                        <div className="text-[8px] opacity-90 uppercase font-sans tracking-wide">Network Size</div>
                    </div>
                    <div className={`rounded-lg p-2 flex-1 border ${isDark ? 'bg-[#ddb040]/10 border-[#ddb040]/20' : 'bg-amber-50 border-amber-100'}`}>
                        <div className="text-xs font-bold text-[#ddb040] font-sans whitespace-nowrap">{getHeavenName(node.level)}</div>
                        <div className="text-[8px] text-[#ddb040] opacity-90 uppercase font-sans tracking-wide">Current Rank</div>
                    </div>
                </div>
                {/* Progress Bar Row */}
                <div className="font-sans mb-1">
                     <div className={`flex justify-between text-[9px] font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="uppercase tracking-wider">To {nextRankName}</span>
                        <span>{currentProgressCount}/{target} <span className="opacity-70 font-normal normal-case">{progressLabel}</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-500/20 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1 }} className="h-full bg-linear-to-r from-[#ddb040] to-amber-300 rounded-full" />
                    </div>
                </div>
                {/* DORMANT STATUS EXPLANATION (Only shows if Dormant) */}
                {!isActive && (
                    <div className={`mt-3 pt-2 border-t ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-100 text-gray-500'} text-[10px] leading-relaxed font-sans`}>
                        <span className="font-bold uppercase tracking-wider text-red-400/80 mr-1">Dormant:</span>
                        Visible but inactive. Has not entered 7th Heaven yet.
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const NetworkGalaxy = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data?: NetworkNode | null }): React.JSX.Element | null => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<SelectedNodeState | null>(null);
    const [isDark, setIsDark] = useState(true);

    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const dragDistance = useRef(0);

    useEffect(() => {
        if (isOpen) {
            setPosition({ x: window.innerWidth / 2, y: 150 });
        }
    }, [isOpen]);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        setIsDragging(true);
        lastMousePos.current = { x: clientX, y: clientY };
        dragDistance.current = 0;
    }, []);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;
        const dx = clientX - lastMousePos.current.x;
        const dy = clientY - lastMousePos.current.y;
        dragDistance.current += Math.sqrt(dx * dx + dy * dy);
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: clientX, y: clientY };
    }, [isDragging]);

    const handleEnd = useCallback(() => {
        setTimeout(() => setIsDragging(false), 50);
    }, []);

    useEffect(() => {
        const onMouseMoveGlobal = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onTouchMoveGlobal = (e: TouchEvent) => {
            if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onUpGlobal = () => handleEnd();

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMoveGlobal);
            window.addEventListener('mouseup', onUpGlobal);
            window.addEventListener('touchmove', onTouchMoveGlobal, { passive: false });
            window.addEventListener('touchend', onUpGlobal);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMoveGlobal);
            window.removeEventListener('mouseup', onUpGlobal);
            window.removeEventListener('touchmove', onTouchMoveGlobal);
            window.removeEventListener('touchend', onUpGlobal);
        };
    }, [isDragging, handleMove, handleEnd]);

    const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
    const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.2));
    const resetView = () => {
        setScale(1);
        setPosition({ x: window.innerWidth / 2, y: 150 });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`fixed inset-0 z-9999 flex flex-col overflow-hidden font-serif transition-colors duration-500 ${isDark ? 'bg-[#0f0f0f] text-white' : 'bg-[#fcfaf7] text-gray-800'}`}
            >
                {/* Visual Textures */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-20'} bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply`} />
                {isDark && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-[#0f0f0f] to-[#0f0f0f] pointer-events-none" />}

                {/* --- HEADER --- */}
                <header className={`relative z-50 flex justify-between items-center p-4 md:p-6 border-b backdrop-blur-md ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-gray-100'}`}>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex! items-center! justify-center! shadow-lg ${isDark ? 'bg-white/10 text-[#ddb040]' : 'bg-[#1a1a1a] text-[#ddb040]'}`}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className={`text-base md:text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Celestial Galaxy
                            </h2>
                            <p className="text-[8px] md:text-[10px] text-[#ddb040] font-sans font-bold uppercase tracking-[0.2em]">Network Explorer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`w-10 h-10 rounded-full flex! items-center! justify-center! transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                        <X size={20} />
                    </button>
                </header>

                {/* --- MAIN INTERACTIVE STAGE --- */}
                <main className="flex-1 relative flex touch-none">
                    
                    {/* Legend (Desktop only) */}
                    <div className="absolute left-6 top-6 z-40 pointer-events-none hidden lg:flex flex-col gap-4">
                         <div className="opacity-70">
                            <strong className="block text-[10px] uppercase tracking-widest text-[#ddb040] mb-1">Root</strong>
                            <div className="flex items-center gap-2">
                                <Crown size={14} className={isDark ? 'text-white' : 'text-black'} />
                                <span className="font-bold text-sm">Ground Heaven</span>
                            </div>
                         </div>
                         <div className="opacity-70">
                            <strong className="block text-[10px] uppercase tracking-widest text-[#ddb040] mb-1">Status</strong>
                            <div className="flex items-center gap-2">
                                <Star size={14} className="text-[#ddb040]" />
                                <span className="font-bold text-sm">Active Soul</span>
                            </div>
                         </div>
                    </div>

                    <div className="absolute left-4 top-4 z-40 pointer-events-none flex flex-col gap-3 select-none">
                        {/* Title for the guide */}
                         <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                            Visual Guide
                         </div>
                         {/* Compact Legend Items */}
                         <div className="flex flex-col gap-2">
                             {/* Item 1 */}
                             <div className="flex items-center gap-2 opacity-80">
                                <Crown size={12} className={isDark ? 'text-[#ddb040]' : 'text-amber-600'} />
                                <span className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    You (Root)
                                </span>
                             </div>
                             {/* Item 2 */}
                             <div className="flex items-center gap-2 opacity-80">
                                <Star size={12} className={isDark ? 'text-[#ddb040]' : 'text-amber-600'} />
                                <span className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Active Soul
                                </span>
                             </div>
                             {/* Item 3 */}
                             <div className="flex items-center gap-2 opacity-60">
                                <User size={12} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                                <span className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Dormant
                                </span>
                             </div>
                         </div>
                    </div>

                    {/* CANVAS AREA */}
                    <div 
                        className={`flex-1 relative overflow-hidden flex! items-center! justify-center! ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={(e) => e.button === 0 && handleStart(e.clientX, e.clientY)}
                        onTouchStart={(e) => e.touches.length === 1 && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                        onClick={() => dragDistance.current < 10 && setSelectedNode(null)} 
                    >
                         <motion.div 
                            animate={{ 
                                x: position.x - (window.innerWidth / 2), 
                                y: position.y - 150,
                                scale: scale 
                            }}
                            transition={isDragging ? { type: 'spring', damping: 50, stiffness: 500, mass: 0.1 } : { type: 'spring', damping: 25, stiffness: 120 }}
                            className="absolute top-[150px] left-1/2 -translate-x-1/2 origin-top will-change-transform"
                         >
                             <GalaxyTree 
                                 node={data || ROOT_USER_DATA} 
                                 onNodeClick={(node, rect) => dragDistance.current < 10 && setSelectedNode({ node, rect })} 
                                 isDark={isDark}
                            />
                         </motion.div>
                    </div>

                    {/* CONTROL PANEL */}
                    <div className="absolute right-3 top-16 md:right-6 md:top-20 z-40 flex flex-col gap-2 md:gap-3">
                        <button 
                            onClick={() => setIsDark(!isDark)}
                            className={`w-12 h-12 rounded-xl flex! items-center! justify-center! border! shadow-lg! transition-all ${isDark ? 'bg-white text-black border-white' : 'bg-[#1a1a1a]! text-[#ddb040]! border-[#1a1a1a]'}`}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button 
                            onClick={resetView}
                            className={`w-12 h-12 rounded-xl flex! items-center! justify-center! border! shadow-lg! transition-all ${isDark ? 'bg-white/10 text-white border-white/20' : 'bg-white text-gray-700 border-gray-200'}`}
                        >
                            <LocateFixed size={20} />
                        </button>
                        <div className={`flex flex-col rounded-xl shadow-lg border overflow-hidden ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-200'}`}>
                            <button onClick={zoomIn} className="p-3 hover:bg-black/5 transition-colors border-b border-inherit"><Plus size={20} /></button>
                            <span className="p-2 text-[10px] font-mono text-center opacity-70">{Math.round(scale * 100)}%</span>
                            <button onClick={zoomOut} className="p-3 hover:bg-black/5 transition-colors"><Minus size={20} /></button>
                        </div>
                    </div>
                </main>

                {/* OVERLAYS */}
                <AnimatePresence>
                    {selectedNode && !isDragging && (
                        <GlobalTooltip node={selectedNode.node} rect={selectedNode.rect} isDark={isDark} />
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

export default NetworkGalaxy;