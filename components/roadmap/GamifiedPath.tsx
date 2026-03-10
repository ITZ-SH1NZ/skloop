"use client";

import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Check, Lock, Play, Star, Trophy, Zap, Cloud } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";

interface Track {
    id: string;
    title: string;
    slug: string;
}

interface Module {
    id: string;
    title: string;
    description: string;
    order_index: number;
}

interface Topic {
    id: string;
    module_id: string;
    title: string;
    type: "video" | "quiz" | "article" | "challenge";
    order_index: number;
    position_x: number;
    position_y_index: number;
    xp_reward: number;
    content_data: any;
}

interface PathNode extends Topic {
    status: "completed" | "active" | "locked";
    position: { x: number; y: number };
}

export default function GamifiedPath() {
    const supabase = createClient();
    const { user: authUser, profile } = useUser();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
    const [pathData, setPathData] = useState<PathNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchPath = useCallback(async () => {
        if (!currentTrackId) return;
        setIsLoading(true);
        try {
            // Fetch modules
            const { data: modules } = await supabase
                .from("modules")
                .select("*")
                .eq("track_id", currentTrackId)
                .order("order_index");

            if (!modules) return;

            // Fetch topics
            const { data: topics } = await supabase
                .from("topics")
                .select("*")
                .in("module_id", modules.map(m => m.id))
                .order("order_index", { ascending: true }); // We'll re-sort by module then topic

            if (!topics) return;

            // Fetch progress
            const { data: progress } = authUser ? await supabase
                .from("user_topic_progress")
                .select("topic_id, status")
                .eq("user_id", authUser.id) : { data: [] };

            // Process Nodes and Layout
            const nodes: PathNode[] = [];

            // Sort topics by module order then topic order
            const sortedTopics = topics.sort((a, b) => {
                const modA = modules.find(m => m.id === a.module_id)?.order_index || 0;
                const modB = modules.find(m => m.id === b.module_id)?.order_index || 0;
                if (modA !== modB) return modA - modB;
                return a.order_index - b.order_index;
            });

            sortedTopics.forEach((topic, idx) => {
                const prog = progress?.find(p => p.topic_id === topic.id);
                let status: PathNode["status"] = "locked";

                if (prog?.status === "completed") {
                    status = "completed";
                } else if (idx === 0 || nodes[idx - 1]?.status === "completed") {
                    status = "active";
                }

                // S-Curve Infinity calculation if not in DB
                const amplitude = 30; // Curve width (50 ± 30 = 20% to 80%)
                const frequency = Math.PI / 2; // Curve period length
                const xOffset = Math.sin(idx * frequency) * amplitude;

                const x = topic.position_x || (50 + xOffset);
                const y = idx * 220 + 150; // 220px vertical spacing, start at 150px

                nodes.push({
                    ...topic,
                    status,
                    position: { x, y }
                });
            });

            setPathData(nodes);
        } finally {
            setIsLoading(false);
        }
    }, [currentTrackId, authUser, supabase]);

    // 1. Fetch Tracks on Mount
    useEffect(() => {
        const fetchTracks = async () => {
            const { data, error } = await supabase
                .from("tracks")
                .select("id, title, slug")
                .order("order_index");

            if (!error && data) {
                setTracks(data);
                if (data.length > 0) setCurrentTrackId(data[0].id);
            }
        };
        fetchTracks();
    }, [supabase]);

    // 2. Fetch Modules & Topics for Current Track
    useEffect(() => {
        fetchPath();
    }, [fetchPath]);

    // Scroll to this component on mount (page-level scroll)
    useEffect(() => {
        // Short delay to ensure layout is ready and to allow smooth transition
        const timer = setTimeout(() => {
            componentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const activeNodeIndex = pathData.findIndex(n => n.status === "active");
    const completedPathPoints = pathData.slice(0, activeNodeIndex + 1);
    const remainingPathPoints = pathData.slice(activeNodeIndex === -1 ? 0 : activeNodeIndex);

    const getNodeColor = (status: PathNode["status"]) => {
        switch (status) {
            case "completed": return "bg-lime-500 border-lime-600 text-zinc-900";
            case "active": return "bg-white border-lime-400 text-zinc-900 ring-4 ring-lime-200";
            case "locked": return "bg-zinc-200 border-zinc-300 text-zinc-400";
        }
    };

    const getIcon = (status: PathNode["status"]) => {
        switch (status) {
            case "completed": return <Check size={28} className="text-white" strokeWidth={3} />;
            case "active": return <Play size={28} className="fill-lime-500 text-lime-500 ml-1" />;
            case "locked": return <Lock size={20} className="text-zinc-400" />;
        }
    };

    // Auto-scroll hook
    const activeNodeRef = useAutoScroll<HTMLButtonElement>({
        trigger: activeNodeIndex,
        containerId: "app-scroll-container",
        offset: -250, // Center the active node
        behavior: "smooth",
        delay: 500 // Wait for animations
    });

    // Parallax logic
    const scrollY = useMotionValue(0);
    const parallaxY = useTransform(scrollY, [0, 5000], [0, -300]); // Clouds and trees drift up

    useEffect(() => {
        const container = document.getElementById("app-scroll-container");
        if (!container) return;
        const handleScroll = () => scrollY.set(container.scrollTop);
        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [scrollY]);

    // Height based directly on node unscaled absolute Y coordinates
    const contentHeight = pathData.length > 0 ? pathData[pathData.length - 1].position.y + 200 : 800;

    // Helper to generate smooth curve through points
    const generateSmoothPath = (points: PathNode[]) => {
        if (points.length < 2) return "";

        // Map X percentage (0-100) to logical SVG coordinate (0-1000)
        // Keep Y as absolute pixel value mapped to SVG coordinate Space
        const getX = (p: PathNode) => p.position.x * 10;
        const getY = (p: PathNode) => p.position.y;

        // Start point
        let d = `M ${getX(points[0])} ${getY(points[0])}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            const p0x = getX(p0);
            const p0y = getY(p0);
            const p1x = getX(p1);
            const p1y = getY(p1);

            // Control points for vertical curve
            const tension = 0.45;
            const dy = p1y - p0y;

            const cp1x = p0x;
            const cp1y = p0y + dy * tension;

            const cp2x = p1x;
            const cp2y = p1y - dy * tension;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1x} ${p1y}`;
        }

        return d;
    };

    // Render deterministic SVG layers (Premium, abstract geometric biome styling)
    const renderBiomeDecorations = () => {
        return pathData.flatMap((node, i) => {
            const isGoingRight = Math.sin((i + 1) * Math.PI / 2) > 0;

            return [0, 1, 2].map(decIdx => {
                const decRand = Math.abs(Math.sin(i * 3.3 + decIdx * 4.4));
                const offsetDirection = (decIdx % 2 === 0) ? (isGoingRight ? -1 : 1) : (isGoingRight ? 1 : -1);

                // Keep them gracefully near the edges
                const xOffset = 20 + (decRand * 25);
                const xPos = node.position.x + (xOffset * offsetDirection);

                if (xPos < -5 || xPos > 105) return null; // Allow slight overflow for depth

                const yPos = node.position.y + ((decRand - 0.5) * 200) + (decIdx * 40);
                const progress = i / pathData.length;

                // Premium Color Palettes (Rich, vibrant Skloop colors)
                let color1 = "#a3e635"; // lime-400
                let color2 = "#10b981"; // emerald-500
                if (progress > 0.4) { color1 = "#fbbf24"; color2 = "#f43f5e"; } // amber to rose (Mystic)
                if (progress > 0.7) { color1 = "#22d3ee"; color2 = "#6366f1"; } // cyan to indigo (Crystal)

                const isFirefly = decRand > 0.85;
                const isBush = decRand < 0.4;
                const scale = 0.5 + decRand * 0.8;
                const key = `dec-${i}-${decIdx}`;

                return (
                    <div key={key} className="absolute pointer-events-none transition-transform duration-1000 z-0"
                        style={{ left: `${xPos}%`, top: `${yPos}px`, transform: `scale(${scale})` }}>

                        {isFirefly ? (
                            <div className="w-4 h-4 rounded-full blur-[3px] opacity-60 mix-blend-screen"
                                style={{ background: color1, boxShadow: `0 0 20px 4px ${color1}` }} />
                        ) : isBush ? (
                            // Geometric layered bush
                            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="drop-shadow-xl opacity-90">
                                <defs>
                                    <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                                        <stop stopColor={color1} stopOpacity="0.8" />
                                        <stop offset="1" stopColor={color2} stopOpacity="0.6" />
                                    </linearGradient>
                                </defs>
                                <circle cx="30" cy="20" r="20" fill={`url(#grad-${key})`} />
                                <circle cx="15" cy="25" r="15" fill={`url(#grad-${key})`} />
                                <circle cx="45" cy="25" r="15" fill={`url(#grad-${key})`} />
                            </svg>
                        ) : (
                            // Sleek geometric pine/crystal
                            <svg width="40" height="60" viewBox="0 0 40 60" fill="none" className="drop-shadow-2xl opacity-90">
                                <defs>
                                    <linearGradient id={`grad-${key}`} x1="20" y1="0" x2="20" y2="60" gradientUnits="userSpaceOnUse">
                                        <stop stopColor={color1} stopOpacity="0.9" />
                                        <stop offset="1" stopColor={color2} stopOpacity="0.4" />
                                    </linearGradient>
                                </defs>
                                <rect x="18" y="40" width="4" height="20" rx="2" fill="#e4e4e7" className="opacity-50" />
                                <path d="M20 0 L40 45 Q20 50 0 45 Z" fill={`url(#grad-${key})`} />
                            </svg>
                        )}
                    </div>
                )
            });
        });
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
                            {tracks.find(t => t.id === currentTrackId)?.slug === "web-development" ? <Zap size={16} className="text-yellow-400" /> : <Trophy size={16} className="text-lime-400" />}
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Track</div>
                            <div className="font-bold leading-tight">{tracks.find(t => t.id === currentTrackId)?.title || "Select Track"}</div>
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
                                    {tracks.map(track => (
                                        <button
                                            key={track.id}
                                            onClick={() => { setCurrentTrackId(track.id); setIsFilterOpen(false); }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTrackId === track.id ? "bg-lime-50 border border-lime-100" : "hover:bg-zinc-50"}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentTrackId === track.id ? "bg-lime-100 text-lime-700" : "bg-zinc-100 text-zinc-500"}`}>
                                                {track.slug === "web-development" ? <Zap size={16} /> : <Trophy size={16} />}
                                            </div>
                                            <div className="text-left flex-1">
                                                <div className={`font-bold text-sm ${currentTrackId === track.id ? "text-zinc-900" : "text-zinc-600"}`}>{track.title}</div>
                                                <div className="text-[10px] text-zinc-400">{track.slug === "web-development" ? "Frontend & Backend" : "Algorithms & Structures"}</div>
                                            </div>
                                            {currentTrackId === track.id && <Check size={16} className="text-lime-600" />}
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
                            <div className="text-lg font-black text-zinc-900">{profile?.xp?.toLocaleString() || 0}</div>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-2.5 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3 flex-shrink-0">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                            <Zap size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Streak</div>
                            <div className="text-lg font-black text-zinc-900">{profile?.streak || 0} {profile?.streak === 1 ? 'Day' : 'Days'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Path Container - No local scroll, let the page handle it */}
            <div
                className="bg-[#FDFCF8] rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden relative"
            >
                {/* Content Area */}
                <div className="relative w-full" style={{ height: contentHeight }}>

                    {/* Performance Animation Styles */}
                    <style>{`
                        @keyframes march {
                            to {
                                stroke-dashoffset: -30;
                            }
                        }
                        .animate-path-dash {
                            animation: march 3s linear infinite;
                        }
                    `}</style>

                    {/* Modern Dot Pattern Background (Lightened for Biome visibility) */}
                    <div className="absolute inset-0 pointer-events-none sticky top-0 h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] [background-size:32px_32px] opacity-[0.07]" />
                    </div>

                    {/* Parallax Biome Ecosystem Layer */}
                    <motion.div style={{ y: parallaxY }} className="absolute inset-0 z-0 pointer-events-none">
                        {renderBiomeDecorations()}
                    </motion.div>

                    {/* SVG Layer */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox={`0 0 1000 ${contentHeight}`}
                        preserveAspectRatio="none"
                        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))" }}
                    >
                        {/* 1. Underlying Base Path */}
                        <path
                            d={generateSmoothPath(pathData)}
                            stroke="#e4e4e7" // zinc-200
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* 2. Completed/Active Path Structure */}
                        <path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#bef264" // lime-200 wide glow
                            strokeWidth="24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            opacity={0.5}
                            vectorEffect="non-scaling-stroke"
                        />
                        <path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#84cc16" // lime-500 core
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* 3. Fast CSS Dash Animation (No Filters) */}
                        <path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#ffffff" // white dashes
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="10 20"
                            fill="none"
                            className="animate-path-dash"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    {/* Fog of War (Frosted glass fade out over locked nodes) */}
                    {activeNodeIndex !== -1 && activeNodeIndex < pathData.length - 1 && (
                        <div
                            className="absolute left-0 right-0 bottom-0 pointer-events-none transition-all duration-1000 z-10"
                            style={{ top: `${pathData[activeNodeIndex].position.y + 180}px` }}
                        >
                            <div
                                className="absolute inset-0 backdrop-blur-md bg-[#FDFCF8]/60"
                                style={{
                                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 300px)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 300px)'
                                }}
                            />
                        </div>
                    )}

                    {/* Nodes z-20 (Higher than Fog) */}
                    {pathData.map((node, index) => {
                        const isGoingRight = Math.sin((index + 1) * Math.PI / 2) > 0;
                        const isLabelLeftOfNode = node.position.x > 50 || (node.position.x === 50 && isGoingRight);

                        return (
                            <div
                                key={node.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 hover:z-20"
                                style={{
                                    left: `${node.position.x}%`,
                                    top: `${node.position.y}px`, // Y is already mapped to absolute pixel coords
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
                                        ${node.status === "completed" ? "bg-lime-600" :
                                                node.status === "active" ? "bg-lime-500" : "bg-zinc-300"}
                                    `} />

                                        {/* Main Body Layer */}
                                        <div className={`absolute inset-0 rounded-[2rem] border-b-[6px] flex items-center justify-center transition-all duration-300 active:translate-y-1.5 active:border-b-0
                                        ${node.status === "completed" ? "bg-gradient-to-b from-lime-400 to-lime-500 border-lime-600 text-white shadow-inner" :
                                                node.status === "active" ? "bg-gradient-to-b from-white to-lime-50 border-lime-500 text-lime-600 shadow-[inset_0_-4px_12px_rgba(132,204,22,0.15)]" : "bg-gradient-to-b from-zinc-50 to-zinc-100 border-zinc-300 text-zinc-400"}
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
                                            {node.xp_reward}
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
                                    className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col justify-center
                                    ${isLabelLeftOfNode ? "right-full mr-3 md:mr-8" : "left-full ml-3 md:ml-8"}
                                `}
                                    animate={node.status === "active" ? { y: [0, -3, 0] } : {}}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className={`text-[10px] md:text-sm font-bold px-3 py-2 md:px-4 md:py-2.5 rounded-2xl shadow-xl shadow-zinc-200/50 border backdrop-blur-md transition-colors duration-300 relative max-w-[110px] sm:max-w-none overflow-hidden text-ellipsis
                                        ${node.status === "active" ? "bg-lime-500 text-white border-lime-400 scale-110" : "bg-white/95 text-zinc-600 border-zinc-200"}
                                        ${isLabelLeftOfNode ? "origin-right text-right" : "origin-left text-left"}
                                    `}>
                                        {/* Small arrow pointing to node */}
                                        <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 rotate-45 border backdrop-blur-md
                                        ${node.status === "active" ? "bg-lime-500 border-lime-400" : "bg-white/95 border-zinc-200"}
                                        ${isLabelLeftOfNode
                                                ? "-right-1 md:-right-1.5 border-l-0 border-b-0"
                                                : "-left-1 md:-left-1.5 border-r-0 border-t-0"
                                            }
                                    `}
                                            style={isLabelLeftOfNode ? { clipPath: 'polygon(100% 0, 0 0, 100% 100%)' } : { clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
                                        />

                                        <span className="relative z-10 block line-clamp-2 md:whitespace-nowrap">{node.title}</span>
                                        {node.type && (
                                            <span className={`relative z-10 block text-[8px] md:text-[9px] uppercase tracking-widest mt-0.5 opacity-70 font-black
                                            ${node.status === "active" ? "text-lime-100" : "text-zinc-400"}
                                        `}>
                                                {node.type} Lesson
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )
                    })}
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
                                    <p className="text-zinc-500 capitalize">{selectedNode.type} Lesson</p>
                                </div>
                            </div>

                            <div className="bg-zinc-50 rounded-2xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Reward</span>
                                    <span className="text-xl font-black text-lime-600 flex items-center gap-1">
                                        <Star size={16} className="fill-lime-400 text-lime-400" />
                                        {selectedNode.xp_reward} XP
                                    </span>
                                </div>
                            </div>

                            <button
                                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                                onClick={() => router.push(`/lesson/${selectedNode.id}`)}
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
