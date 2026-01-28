'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight, User, Sparkles, Lock } from 'lucide-react';
// --- Types ---
interface NetworkNode {
    id: string;
    name: string;
    level: number;
    status: 'ACTIVE' | 'INACTIVE';
    joinedAt: string;
    teamSize: number;
    avatar?: string;
    children?: NetworkNode[];
}
// --- Mock Data Generator (For Demo) ---
const generateMockGalaxy = (depth: number = 1, maxDepth: number = 3): NetworkNode[] => {
    if (depth > maxDepth) return [];
    
    // Generate 2-4 children per node to simulate a tree
    const count = Math.floor(Math.random() * 3) + 2; 
    
    return Array.from({ length: count }).map((_, i) => ({
        id: `node-${depth}-${i}-${Math.random()}`,
        name: `Angel ${depth}-${i}`,
        level: depth,
        status: Math.random() > 0.3 ? 'ACTIVE' : 'INACTIVE',
        joinedAt: new Date().toLocaleDateString(),
        teamSize: Math.floor(Math.random() * 50) * (maxDepth - depth + 1),
        children: generateMockGalaxy(depth + 1, maxDepth)
    }));
};
const ROOT_USER: NetworkNode = {
    id: 'root',
    name: 'You',
    level: 0,
    status: 'ACTIVE',
    joinedAt: '2024-01-01',
    teamSize: 128,
    children: generateMockGalaxy(1, 3) 
};
// --- Components ---
const Orb = ({ node, isRoot = false, onClick }: { node: NetworkNode, isRoot?: boolean, onClick: () => void }) => {
    const isActive = node.status === 'ACTIVE';
    
    return (
        <div className="flex flex-col items-center relative group z-10" onClick={onClick}>
            {/* Halo / Glow Effect for Active Users */}
            {isActive && (
                <motion.div 
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-[#ddb040]/30 blur-md pointer-events-none"
                />
            )}
            
            {/* The Orb Itself */}
            <motion.div 
                whileHover={{ scale: 1.1 }}
                className={`
                    message-orb w-12 h-12 rounded-full flex items-center justify-center 
                    border-2 shadow-lg cursor-pointer transition-all duration-300 relative
                    ${isRoot 
                        ? 'bg-gradient-to-br from-[#ddb040] to-[#b6902e] border-white ring-4 ring-[#ddb040]/20' 
                        : isActive 
                            ? 'bg-white border-[#ddb040] text-[#ddb040]' 
                            : 'bg-gray-200 border-gray-300 text-gray-400 grayscale'
                    }
                `}
            >
                {isRoot ? <Sparkles className="w-6 h-6 text-white" /> : <User className="w-5 h-5" />}
                
                {/* Level Badge */}
                {!isRoot && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1a1a1a] text-[#ddb040] text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                        {node.level}
                    </div>
                )}
            </motion.div>
            {/* Name Label */}
            <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity absolute top-full w-32 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="bg-[#1a1a1a] text-white text-xs py-1 px-2 rounded shadow-xl border border-[#ddb040]/30">
                    <p className="font-bold text-[#ddb040]">{node.name}</p>
                    <p className="text-[10px] text-gray-400">Team: {node.teamSize}</p>
                </div>
            </div>
        </div>
    );
};
const ConnectingLine = () => (
    <div className="w-px h-8 bg-gradient-to-b from-[#ddb040]/50 to-transparent my-1"></div>
);
// Recursive Tree Renderer
const GalaxyTree = ({ node }: { node: NetworkNode }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    return (
        <div className="flex flex-col items-center">
            <Orb node={node} isRoot={node.level === 0} onClick={() => setExpanded(!expanded)} />
            
            {hasChildren && expanded && (
                <>
                    <ConnectingLine />
                    <div className="flex gap-4 md:gap-8 items-start relative pt-4">
                        {/* Horizontal Connector Line */}
                        {node.children!.length > 1 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] h-px bg-gradient-to-r from-transparent via-[#ddb040]/30 to-transparent" />
                        )}
                        
                        {node.children!.map((child) => (
                            <div key={child.id} className="flex flex-col items-center">
                                {/* Vertical connector from horizontal line to child */}
                                <div className="h-4 w-px bg-[#ddb040]/20 absolute top-0" /> 
                                <GalaxyTree node={child} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
export default function NetworkGalaxy({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    if (!isOpen) return null;
    return (
         <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-xl"
            >
                {/* --- Background Ambience --- */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-slate-50 pointer-events-none" />
                
                {/* --- Header --- */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-[#1a1a1a]">Celestial Network</h2>
                        <p className="text-amber-600/80 text-sm tracking-widest uppercase">The 7th Heaven Galaxy</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-lg flex items-center justify-center hover:rotate-90 transition-transform duration-300 group"
                    >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                    </button>
                </div>
                {/* --- Galaxy Canvas (Scrollable) --- */}
                <div className="w-full h-full overflow-auto pt-32 pb-20 cursor-grab active:cursor-grabbing hide-scrollbar flex justify-center">
                    <div className="min-w-[100vw] min-h-[100vh] flex justify-center p-10 transform scale-90 md:scale-100 origin-top">
                        <GalaxyTree node={ROOT_USER} />
                    </div>
                </div>
                {/* --- Footer / Legend --- */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/50">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ddb040] shadow-[0_0_10px_#ddb040]"></div>
                        <span className="text-xs font-bold text-gray-600">Active Soul</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        <span className="text-xs font-bold text-gray-400">Dormant</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}