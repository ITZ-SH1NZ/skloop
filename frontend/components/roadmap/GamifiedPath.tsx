"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Play, Star, Trophy, Zap } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface PathNode {
    id: string;
    title: string;
    description: string;
    status: "completed" | "active" | "locked";
    xp: number;
    position: { x: number; y: number };
}

// Static Course Data for different tracks
// TODO: Fetch track data from backend
const TRACKS_DATA: Record<string, PathNode[]> = {
    "Web Dev": [],
    "DSA": []
};

import { useAutoScroll } from "@/hooks/use-auto-scroll";

export default function GamifiedPath() {
    const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);
    const [currentTrack, setCurrentTrack] = useState<"Web Dev" | "DSA">("Web Dev");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    // Scroll to this component on mount (page-level scroll)
    useEffect(() => {
        // Short delay to ensure layout is ready and to allow smooth transition
        const timer = setTimeout(() => {
            componentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const pathData = TRACKS_DATA[currentTrack];
    const activeNodeIndex = pathData.findIndex(n => n.status === "active");
    const completedPathPoints = pathData.slice(0, activeNodeIndex + 1);
    const remainingPathPoints = pathData.slice(activeNodeIndex);

    const getNodeColor = (status: PathNode["status"]) => {
        switch (status) {
            case "completed": return "bg-lime-500 border-lime-600 text-zinc-900";
            case "active": return "bg-white border-lime-400 text-zinc-900 ring-4 ring-lime-200";
            case "locked": return "bg-zinc-200 border-zinc-300 text-zinc-400";
        }
    };

    const getIcon = (status: PathNode["status"]) => {
        switch (status) {
            case "completed": return <Check size={20} className="text-zinc-900" />;
            case "active": return <Play size={20} className="text-lime-600" />;
            case "locked": return <Lock size={16} className="text-zinc-400" />;
        }
    };

    // Auto-scroll hook
    const activeNodeRef = useAutoScroll<HTMLButtonElement>({
        trigger: activeNodeIndex,
        containerId: "gamified-path-container",
        offset: -250, // Center the active node
        behavior: "smooth",
        delay: 500 // Wait for animations
    });

    // Calculate dynamic height based on nodes (approx 150px per node)
    const contentHeight = Math.max(600, pathData.length * 150 + 200);

    // Helper to generate smooth curve through points
    const generateSmoothPath = (points: PathNode[]) => {
        if (points.length < 2) return "";

        // Scale percentages to pixels for the SVG path
        const getX = (p: PathNode) => p.position.x; // Keep x as % (0-100)
        const getY = (p: PathNode) => (p.position.y / 100) * contentHeight; // distinct Y in pixels

        // Start point
        let d = `M ${getX(points[0])} ${getY(points[0])}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            const p0x = getX(p0);
            const p0y = getY(p0);
            const p1x = getX(p1);
            const p1y = getY(p1);

            // Control points for vertical curve (Duolingo style)
            const cp1x = p0x;
            const cp1y = p0y + (p1y - p0y) * 0.5;

            const cp2x = p1x;
            const cp2y = p0y + (p1y - p0y) * 0.5;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1x} ${p1y}`;
        }

        return d;
    };

    return (
        <div ref={componentRef} className="relative">
            {/* Header: Track Selector & Stats */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-8 items-center justify-between">

                {/* Track Filter Button */}
                <div className="relative z-30">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="bg-zinc-900 text-white pl-4 pr-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-all active:scale-95"
                    >
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                            {currentTrack === "Web Dev" ? <Zap size={16} className="text-yellow-400" /> : <Trophy size={16} className="text-lime-400" />}
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Track</div>
                            <div className="font-bold leading-tight">{currentTrack}</div>
                        </div>
                        <motion.div animate={{ rotate: isFilterOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </motion.div>
                    </button>

                    {/* Filter Popup */}
                    <AnimatePresence>
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 p-2 z-30 overflow-hidden"
                                >
                                    <div className="text-xs font-bold text-zinc-400 px-3 py-2 uppercase tracking-wider">Switch Roadmap</div>
                                    {(Object.keys(TRACKS_DATA) as Array<"Web Dev" | "DSA">).map(track => (
                                        <button
                                            key={track}
                                            onClick={() => { setCurrentTrack(track); setIsFilterOpen(false); }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTrack === track ? "bg-lime-50 border border-lime-100" : "hover:bg-zinc-50"}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentTrack === track ? "bg-lime-100 text-lime-700" : "bg-zinc-100 text-zinc-500"}`}>
                                                {track === "Web Dev" ? <Zap size={16} /> : <Trophy size={16} />}
                                            </div>
                                            <div className="text-left flex-1">
                                                <div className={`font-bold text-sm ${currentTrack === track ? "text-zinc-900" : "text-zinc-600"}`}>{track}</div>
                                                <div className="text-[10px] text-zinc-400">{track === "Web Dev" ? "Frontend & Backend" : "Algorithms & Structures"}</div>
                                            </div>
                                            {currentTrack === track && <Check size={16} className="text-lime-600" />}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Stats */}
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <div className="bg-white px-5 py-2.5 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3 flex-shrink-0">
                        <div className="p-1.5 bg-lime-100 rounded-lg">
                            <Trophy size={16} className="text-lime-600" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total XP</div>
                            <div className="text-lg font-black text-zinc-900">450</div>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-2.5 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3 flex-shrink-0">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                            <Zap size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Streak</div>
                            <div className="text-lg font-black text-zinc-900">7 Days</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Path Container - Scrollable Wrapper */}
            <div
                id="gamified-path-container"
                className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-y-auto overflow-x-hidden relative h-[600px] scroll-smooth"
            >
                {/* Scrollable Content Area */}
                <div className="relative w-full" style={{ height: contentHeight }}>

                    {/* Map Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none sticky top-0 h-full"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* SVG Layer */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox={`0 0 100 ${contentHeight}`}
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#84cc16" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#84cc16" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>

                        {/* 1. Underlying Grey Path */}
                        <path
                            d={generateSmoothPath(pathData)}
                            stroke="rgba(0,0,0,0.05)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="4 3"
                            fill="none"
                        />

                        {/* 2. Remaining Path */}
                        <path
                            d={generateSmoothPath(remainingPathPoints)}
                            stroke="rgba(0,0,0,0.1)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="6 4"
                            fill="none"
                        />

                        {/* 3. Completed/Active Path (Green, Slow Fill Animation) */}
                        <motion.path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="url(#pathGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }} // Slower fill
                            style={{ stroke: "rgba(132, 204, 22, 0.4)" }}
                        />
                        <motion.path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#84cc16"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }} // Slower fill
                        />
                        <motion.path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="4 6"
                            fill="none"
                            initial={{ strokeDashoffset: 0 }}
                            animate={{ strokeDashoffset: -10 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>

                    {/* Nodes */}
                    {pathData.map((node, index) => (
                        <div
                            key={node.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 hover:z-20"
                            style={{
                                left: `${node.position.x}%`,
                                top: `${(node.position.y / 100) * contentHeight}px`, // Map % to pixel height
                            }}
                        >
                            <motion.button
                                ref={node.status === "active" ? activeNodeRef : null}
                                layoutId={`node-${node.id}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                    y: node.status === "active" ? [0, -8, 0] : 0
                                }}
                                transition={{
                                    // Main layout transition
                                    layout: { type: "spring", bounce: 0.4, duration: 0.6 },
                                    // Entrance animation
                                    scale: { type: "spring", bounce: 0.5, duration: 0.6 },
                                    opacity: { duration: 0.4 },
                                    // Active state float (KEYFRAME FIX: needs duration/repeat, not spring)
                                    y: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        type: "tween"
                                    }
                                }}
                                whileHover={node.status !== "locked" ? {
                                    scale: 1.1,
                                    rotate: [0, -5, 5, 0],
                                    transition: {
                                        rotate: {
                                            duration: 0.4,
                                            ease: "easeInOut",
                                            type: "tween" // Explicitly use tween for keyframes
                                        },
                                        scale: {
                                            type: "spring",
                                            bounce: 0.6 // Bouncy scale is fine
                                        }
                                    }
                                } : {}}
                                whileTap={node.status !== "locked" ? { scale: 0.9 } : {}}
                                onClick={() => node.status !== "locked" && setSelectedNode(node)}
                                disabled={node.status === "locked"}
                                className={`
                                    w-14 h-14 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center
                                    relative group z-10
                                    ${node.status === "locked" ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
                                `}
                            >
                                {/* Active Node Glows - Behind everything */}
                                {node.status === "active" && (
                                    <>
                                        {/* Outer Ripple 1 */}
                                        <motion.div
                                            className="absolute -inset-8 bg-lime-400/20 rounded-full z-0"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        {/* Outer Ripple 2 (Delayed) */}
                                        <motion.div
                                            className="absolute -inset-8 bg-lime-400/20 rounded-full z-0"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        />
                                        {/* Inner Glow */}
                                        <div className="absolute -inset-4 bg-lime-400/40 blur-xl rounded-full z-0" />
                                    </>
                                )}

                                {/* 3D Button Components - Wrapper for z-index */}
                                <div className="relative w-full h-full z-10">
                                    {/* Shadow Layer */}
                                    <div className={`absolute inset-0 top-2 rounded-[2rem] transition-colors duration-300
                                        ${node.status === "completed" ? "bg-lime-700" :
                                            node.status === "active" ? "bg-lime-600" : "bg-zinc-300"}
                                    `} />

                                    {/* Main Body Layer */}
                                    <div className={`absolute inset-0 rounded-[2rem] border-b-[6px] flex items-center justify-center transition-all duration-300 active:translate-y-1.5 active:border-b-0
                                        ${node.status === "completed" ? "bg-lime-500 border-lime-700" :
                                            node.status === "active" ? "bg-lime-400 border-lime-600 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]" : "bg-zinc-100 border-zinc-300"}
                                    `}>
                                        <motion.div
                                            animate={node.status === "active" ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            {getIcon(node.status)}
                                        </motion.div>
                                    </div>
                                </div>

                                {/* XP Badge - Floating */}
                                <motion.div
                                    className="absolute -top-3 -right-3 z-30"
                                    animate={node.status === "active" ? { y: [0, -3, 0] } : {}}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <div className={`
                                        text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-0.5 shadow-xl border-[3px] border-white
                                        ${node.status === "active" ? "bg-amber-400 text-amber-900 rotate-6 scale-110" : "bg-zinc-900 text-white"}
                                    `}>
                                        <Star size={8} className={`${node.status === "active" ? "fill-amber-800 text-amber-800" : "fill-yellow-400 text-yellow-400"}`} />
                                        {node.xp}
                                    </div>
                                </motion.div>
                            </motion.button>

                            {/* Level Indicator - FIXED POSITION */}
                            <div className={`absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-0
                                    ${node.status === "active" ? "opacity-100" : "opacity-60"}
                                `}>
                                <div className={`text-[10px] font-black uppercase tracking-widest py-1 px-2 rounded-lg transform -translate-y-1/2
                                        ${node.status === "active" ? "bg-amber-100/80 text-amber-800 shadow-sm border border-amber-200/50" : "text-zinc-400 bg-white/50 border border-zinc-100/50"}
                                    `}>
                                    {node.status === "active" ? "Current Level" : `Lvl ${index + 1}`}
                                </div>
                            </div>

                            {/* Label */}
                            <motion.div
                                className="absolute top-full mt-3 left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none z-20"
                                animate={node.status === "active" ? { y: [0, 3, 0] } : {}}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className={`text-xs md:text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg border backdrop-blur-md transition-colors duration-300
                                        ${node.status === "active" ? "bg-lime-500 text-white border-lime-400 scale-110" : "bg-white/95 text-zinc-600 border-zinc-200"}
                                    `}>
                                    {node.title}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedNode(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center ${getNodeColor(selectedNode.status)}`}>
                                    {getIcon(selectedNode.status)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-zinc-900">{selectedNode.title}</h3>
                                    <p className="text-zinc-500">{selectedNode.description}</p>
                                </div>
                            </div>

                            <div className="bg-zinc-50 rounded-2xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Reward</span>
                                    <span className="text-xl font-black text-lime-600 flex items-center gap-1">
                                        <Star size={16} className="fill-lime-400 text-lime-400" />
                                        {selectedNode.xp} XP
                                    </span>
                                </div>
                            </div>

                            <button
                                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                                onClick={() => setSelectedNode(null)}
                            >
                                {selectedNode.status === "completed" ? "Review" : "Start Learning"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
