"use client";

import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Check, Lock, Play, Star, Trophy, Zap, Cloud, ArrowRight } from "lucide-react";
import { useRef, useEffect, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { soundManager } from "@/lib/sound";

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

// Sub-component to handle parallax hooks correctly for each decoration
// MEMOIZED for performance
const BiomeDecoration = memo(function BiomeDecoration({ 
    xPos, 
    yPos, 
    scale, 
    parallaxSpeed, 
    scrollY, 
    assetType, 
    colorBase, 
    colorLight 
}: { 
    xPos: number, 
    yPos: number, 
    scale: number, 
    parallaxSpeed: number, 
    scrollY: any,
    assetType: 'cloud' | 'tree' | 'rock' | 'flower',
    colorBase: string,
    colorLight: string
}) {
    const yOffset = useTransform(scrollY, [0, 5000], [0, -500 * parallaxSpeed]);

    return (
        <motion.div
            className="absolute pointer-events-auto z-0 will-change-transform cursor-pointer"
            style={{
                left: `${xPos}%`,
                top: `${yPos}px`,
                scale,
                y: yOffset,
                transformZ: 0
            }}
            whileHover={{ 
                scale: scale * 1.1,
                rotate: [0, -2, 2, 0],
                transition: { duration: 0.3 }
            }}
            whileTap={{ scale: scale * 0.8, scaleY: 0.6, scaleX: 1.3 }}
            onClick={() => soundManager.playClick(0.4)}
        >
            {assetType === 'cloud' ? (
                <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="opacity-40 blur-[1px]">
                    <path d="M20 40 Q20 20 40 20 Q50 10 70 15 Q80 5 100 20 Q115 25 110 40 Z" fill="white" />
                    <circle cx="40" cy="35" r="15" fill="white" />
                    <circle cx="70" cy="30" r="20" fill="white" />
                    <circle cx="95" cy="35" r="15" fill="white" />
                </svg>
            ) : assetType === 'tree' ? (
                <motion.div
                    animate={{ rotate: [0, 1.5, -1.5, 0] }}
                    transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originY: "bottom" }}
                >
                    <svg width="100" height="120" viewBox="0 0 100 120" fill="none" className="drop-shadow-2xl">
                        <ellipse cx="50" cy="110" rx="25" ry="6" fill="black" fillOpacity="0.08" />
                        <path d="M44 112 Q50 116 56 112 L54 75 Q50 70 46 75 Z" fill="#451a03" />
                        <circle cx="50" cy="45" r="32" fill={colorBase} />
                        <circle cx="30" cy="65" r="22" fill={colorBase} />
                        <circle cx="70" cy="65" r="25" fill={colorBase} />
                        <circle cx="42" cy="35" r="15" fill={colorLight} opacity="0.4" />
                        <circle cx="28" cy="60" r="10" fill={colorLight} opacity="0.3" />
                        <circle cx="45" cy="50" r="3" fill="#f43f5e" />
                        <circle cx="65" cy="55" r="2.5" fill="#fbbf24" />
                        <circle cx="35" cy="75" r="3" fill="#f43f5e" />
                    </svg>
                </motion.div>
            ) : assetType === 'rock' ? (
                <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="opacity-80">
                    <path d="M10 35 L25 10 L45 15 L55 35 Z" fill="#94a3b8" />
                    <path d="M5 35 L20 20 L35 35 Z" fill="#64748b" />
                    <path d="M30 35 L45 25 L60 35 Z" fill="#cbd5e1" />
                </svg>
            ) : (
                <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                    <path d="M15 20 L15 10 M10 18 L5 12 M20 18 L25 12" stroke={colorBase} strokeWidth="2" strokeLinecap="round" />
                    <circle cx="15" cy="8" r="3" fill="#fbbf24" />
                    <circle cx="5" cy="11" r="2" fill="#f472b6" />
                    <circle cx="25" cy="11" r="2" fill="#60a5fa" />
                </svg>
            )}
        </motion.div>
    );
});

// Sub-component for individual glowing fireflies
const Firefly = memo(function Firefly({ index, scrollY, contentHeight }: { index: number, scrollY: any, contentHeight: number }) {
    // Random seed for this firefly
    const seed = index * 13.7;
    const startX = (seed * 7) % 100;
    const startY = (seed * 553) % contentHeight;
    
    // Parallax and random movement
    const yParallax = useTransform(scrollY, [0, 5000], [0, -400]);
    
    return (
        <motion.div
            className="absolute pointer-events-none z-10"
            style={{
                left: `${startX}%`,
                top: `${startY}px`,
                y: yParallax,
            }}
        >
            <motion.div
                animate={{ 
                    x: [0, 20, -20, 10, 0],
                    y: [0, -30, 10, -10, 0],
                    opacity: [0.2, 0.8, 0.4, 1, 0.2],
                    scale: [1, 1.2, 0.8, 1.1, 1]
                }}
                transition={{ 
                    duration: 5 + (index % 5), 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                className="w-1.5 h-1.5 bg-lime-300 rounded-full blur-[1px]"
                style={{ 
                    boxShadow: "0 0 8px 2px rgba(163, 230, 53, 0.6)",
                }}
            />
        </motion.div>
    );
});

// Sub-component for individual drifting environmental assets (Leaves, Crystals, etc.)
const DriftingAsset = memo(function DriftingAsset({ index, scrollY, contentHeight }: { index: number, scrollY: any, contentHeight: number }) {
    const startX = (index * 19.7) % 100;
    const startYPercent = (index * 13.3) % 100;
    const absY = (startYPercent / 100) * contentHeight;
    
    // Determine Biome based on vertical position
    const progress = absY / contentHeight;
    const isAutumn = progress > 0.4 && progress <= 0.7;
    const isNight = progress > 0.7;

    const isNearCenter = startX > 35 && startX < 65;
    const opacity = isNearCenter ? 0.1 : 0.4;
    
    const speed = 0.3 + (Math.sin(index) * 0.2);
    const y = useTransform(scrollY, [0, 5000], [absY, absY - 3000 * speed]);
    const x = useTransform(scrollY, [0, 5000], [`${startX}%`, `${startX + Math.sin(index) * 15}%`]);
    const rotate = useTransform(scrollY, [0, 5000], [0, 360]);

    return (
        <motion.div
            className="absolute pointer-events-none z-40 will-change-transform"
            style={{ x, y, rotate, opacity, transformZ: 0 }}
        >
            {isNight ? (
                // Glowing Crystal Shard for Night Biome
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="#22d3ee" opacity="0.8" />
                    <path d="M10 2 L14 10 L10 18 L6 10 Z" fill="#e0f2fe" opacity="0.9" />
                </svg>
            ) : isAutumn ? (
                // Maple Leaf for Autumn Biome
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2 L14 8 L20 7 L17 12 L22 16 L15 16 L12 22 L9 16 L2 16 L7 12 L4 7 L10 8 Z" fill="#d97706" />
                </svg>
            ) : (
                // Standard Leaf for Park Biome
                <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
                    <path d="M15 2 Q20 15 15 28 Q10 15 15 2" fill="#4d7c0f" />
                </svg>
            )}
        </motion.div>
    );
});

// Sub-component for managing environmental life like fireflies
function AmbientLife({ isMobile, scrollY, contentHeight }: { isMobile: boolean, scrollY: any, contentHeight: number }) {
    const fireflyCount = isMobile ? 5 : 15;
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(fireflyCount)].map((_, i) => (
                <Firefly key={`firefly-${i}`} index={i} scrollY={scrollY} contentHeight={contentHeight} />
            ))}
        </div>
    );
}

// Sub-component for Foreground elements (vines, leaves, and "lens" effects)
function ForegroundLayer({ scrollY, isMobile, contentHeight }: { scrollY: any, isMobile: boolean, contentHeight: number }) {
    const y1 = useTransform(scrollY, [0, 5000], [0, -1500]);
    const y2 = useTransform(scrollY, [0, 5000], [0, -2000]);
    const zipY = useTransform(scrollY, [0, 5000], [0, -4000]);

    return (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {!isMobile && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(132,204,22,0.05)_100%)]" />}
            {[...Array(isMobile ? 12 : 40)].map((_, i) => (
                <DriftingAsset key={i} index={i} scrollY={scrollY} contentHeight={contentHeight} />
            ))}
            {!isMobile && (
                <>
                    <motion.div style={{ y: zipY }} className="absolute -left-20 top-[500px] opacity-20 blur-[8px] scale-[3] rotate-45 will-change-transform">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                            <path d="M50 0 Q100 50 50 100 Q0 50 50 0" fill="#1a2e05" />
                        </svg>
                    </motion.div>
                    <motion.div style={{ y: zipY }} className="absolute -right-20 top-[1500px] opacity-20 blur-[12px] scale-[4] -rotate-12 will-change-transform">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                            <path d="M50 0 Q100 50 50 100 Q0 50 50 0" fill="#365314" />
                        </svg>
                    </motion.div>
                </>
            )}
            {!isMobile && (
                <>
                    <motion.div style={{ y: y1 }} className="absolute -left-10 top-[200px] opacity-90 blur-[1px] will-change-transform">
                        <svg width="150" height="400" viewBox="0 0 150 400" fill="none">
                            <path d="M20 0 C20 100 60 150 40 250 C30 300 80 350 50 400" stroke="#365314" strokeWidth="8" strokeLinecap="round" />
                            <ellipse cx="40" cy="100" rx="20" ry="10" fill="#4d7c0f" />
                            <ellipse cx="60" cy="180" rx="25" ry="12" fill="#3f6212" />
                            <ellipse cx="35" cy="280" rx="22" ry="11" fill="#4d7c0f" />
                            <ellipse cx="55" cy="360" rx="18" ry="9" fill="#3f6212" />
                        </svg>
                    </motion.div>
                    <motion.div style={{ y: y2 }} className="absolute -right-10 top-[800px] opacity-80 blur-[2px] will-change-transform">
                        <svg width="120" height="500" viewBox="0 0 120 500" fill="none">
                            <path d="M80 0 C80 150 30 250 60 400 C70 450 40 500 50 600" stroke="#1a2e05" strokeWidth="6" strokeLinecap="round" />
                            <ellipse cx="70" cy="120" rx="15" ry="8" fill="#365314" />
                            <ellipse cx="45" cy="220" rx="20" ry="10" fill="#4d7c0f" />
                            <ellipse cx="65" cy="350" rx="18" ry="9" fill="#365314" />
                        </svg>
                    </motion.div>
                </>
            )}
        </div>
    );
}

// High-fidelity SVG Mascots for Loopy (Ultra-Smooth Emotional Slime)
const LoopyMascot = ({ size = 80, mood = "happy" }: { size?: number, mood?: "happy" | "surprised" | "annoyed" }) => {
    // Mood-based configurations for interpolation
    const moodConfigs = {
        happy: { 
            colorTop: "#d9f99d", colorMid: "#a3e635", colorBottom: "#4d7c0f", 
            glow: "rgba(163, 230, 53, 0.3)",
            eyeR: 7, eyeY: 55, mouthD: "M44 70 Q50 75 56 70",
            shake: 0
        },
        surprised: { 
            colorTop: "#fef08a", colorMid: "#facc15", colorBottom: "#a16207", 
            glow: "rgba(250, 204, 21, 0.3)",
            eyeR: 9, eyeY: 55, mouthD: "M46 72 Q50 78 54 72",
            shake: 0
        },
        annoyed: { 
            colorTop: "#fecaca", colorMid: "#f87171", colorBottom: "#991b1b", 
            glow: "rgba(248, 113, 113, 0.4)",
            eyeR: 6, eyeY: 53, mouthD: "M44 74 Q50 72 56 74",
            shake: 2
        }
    };

    const config = moodConfigs[mood];

    return (
        <motion.div 
            style={{ width: size, height: size }}
            className="relative"
            animate={{ 
                x: mood === "annoyed" ? [0, -1, 1, -1, 1, 0] : 0 
            }}
            transition={{ duration: 0.1, repeat: mood === "annoyed" ? Infinity : 0 }}
        >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="loopyDynamicGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <motion.stop offset="0%" animate={{ stopColor: config.colorTop }} />
                        <motion.stop offset="60%" animate={{ stopColor: config.colorMid }} />
                        <motion.stop offset="100%" animate={{ stopColor: config.colorBottom }} />
                    </radialGradient>
                </defs>

                {/* Body with breathing loop that respects mood transition */}
                <motion.path 
                    animate={{ 
                        d: mood === "surprised" 
                            ? "M50 15 C75 15 90 35 90 60 C90 85 75 90 50 90 C25 90 10 85 10 60 C10 35 25 15 50 15Z" // Tall surprised
                            : [
                                "M50 20 C70 20 85 35 85 60 C85 80 70 85 50 85 C30 85 15 80 15 60 C15 35 30 20 50 20Z", // Normal
                                "M50 22 C72 22 87 37 87 62 C87 82 72 87 50 87 C28 87 13 82 13 62 C13 37 28 22 50 22Z"  // Slight breathe
                              ],
                        fill: "url(#loopyDynamicGrad)",
                        stroke: config.colorBottom
                    }}
                    transition={{ 
                        d: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                        stroke: { duration: 0.5 }
                    }}
                    strokeWidth="1.5"
                />

                {/* Surface Shine */}
                <path d="M35 35 Q40 30 50 32" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

                {/* Eyes */}
                <motion.g animate={{ y: mood === "annoyed" ? -2 : 0 }}>
                    {/* Left Eye */}
                    <motion.circle 
                        cx="38" animate={{ cy: config.eyeY, r: config.eyeR }} 
                        fill="white" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <motion.circle 
                        cx="39" animate={{ cy: config.eyeY, r: config.eyeR / 2 }} 
                        fill="#1a2e05" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    
                    {/* Right Eye */}
                    <motion.circle 
                        cx="62" animate={{ cy: config.eyeY, r: config.eyeR }} 
                        fill="white" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <motion.circle 
                        cx="61" animate={{ cy: config.eyeY, r: config.eyeR / 2 }} 
                        fill="#1a2e05" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />

                    {/* Annoyed Lids - Smooth fade */}
                    <motion.g animate={{ opacity: mood === "annoyed" ? 1 : 0 }} transition={{ duration: 0.3 }}>
                        <path d="M30 48 L46 52" stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round" />
                        <path d="M70 48 L54 52" stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round" />
                    </motion.g>
                </motion.g>

                {/* Mouth */}
                <motion.path 
                    animate={{ d: config.mouthD }} 
                    stroke="#1a2e05" strokeWidth="2.5" strokeLinecap="round" 
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
            </svg>
            
            {/* Ambient Glow */}
            <motion.div 
                className="absolute inset-0 rounded-full blur-2xl -z-10"
                animate={{ 
                    background: config.glow,
                    scale: [1, 1.2, 1] 
                }}
                transition={{ 
                    background: { duration: 0.5 },
                    scale: { duration: 3, repeat: Infinity }
                }}
            />
        </motion.div>
    );
};

// Sub-component for Loopy, the character guide
function LoopyCompanion({ activeNode, index, totalNodes }: { activeNode: PathNode, index: number, totalNodes: number }) {
    const [clickCount, setClickCount] = useState(0);
    const [mood, setMood] = useState<"happy" | "surprised" | "annoyed">("happy");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isCalming, setIsCalming] = useState(false);

    // Progress percentage
    const progress = totalNodes > 0 ? index / totalNodes : 0;

    const getPhrases = () => {
        if (isCalming) {
            return ["Okay, I'm calm now...", "Sorry I got grumpy!", "Let's focus again!", "Ready to learn?", "You're the boss!"];
        }

        if (mood === "annoyed") {
            return ["STOP IT!", "I'm not a toy!", "Click the LESSON!", "Grrr...", "Seriously??", "I'm going on strike!"];
        }

        if (mood === "surprised") {
            return ["Whoa!", "Easy there!", "You're fast!", "What was that?", "Energy overload!", "Slow down!"];
        }

        // Context-aware Happy Phrases
        if (progress < 0.2) {
            return ["A long road ahead!", "Ready to start?", "First steps are key!", "Let's build roots!", "Exciting start!"];
        } else if (progress < 0.5) {
            return ["Moving right along!", "You've got rhythm!", "Mid-way soon!", "Building strength!", "The loop grows!"];
        } else if (progress < 0.8) {
            return ["Look at you go!", "Almost an expert!", "Mastering the loop!", "Strong progress!", "So much growth!"];
        } else {
            return ["The finish line!", "Mastery awaits!", "Legendary work!", "Final stretch!", "You're a pro!"];
        }
    };

    const currentPhrases = getPhrases();

    // Auto-calm down effect with Story Arc
    useEffect(() => {
        if (clickCount > 0) {
            const timer = setTimeout(() => {
                if (mood === "annoyed") {
                    setIsCalming(true);
                    setMood("happy");
                    setPhraseIndex(0);
                    // Reset calming state after a few seconds
                    setTimeout(() => {
                        setIsCalming(false);
                        setClickCount(0);
                    }, 4000);
                } else {
                    setClickCount(0);
                    setMood("happy");
                    setIsCalming(false);
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [clickCount, mood]);

    const handleInteraction = () => {
        if (isCalming) return; // Don't interrupt the apology

        soundManager.playClick(mood === "annoyed" ? 1.0 : 0.8);
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount > 10) setMood("annoyed");
        else if (newCount > 4) setMood("surprised");
        else setMood("happy");

        setPhraseIndex((prev) => (prev + 1) % currentPhrases.length);
    };

    const isGoingRight = Math.sin((index + 1) * Math.PI / 2) > 0;
    const isLabelLeftOfNode = activeNode.position.x > 50 || (activeNode.position.x === 50 && isGoingRight);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                x: [0, 5, -5, 0],
                y: [0, -10, 0],
            }}
            transition={{
                opacity: { duration: 0.5 },
                scale: { type: "spring", bounce: 0.5 },
                x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute z-40 pointer-events-auto cursor-pointer"
            style={{
                left: `${activeNode.position.x}%`,
                top: `${activeNode.position.y}px`,
                marginLeft: isLabelLeftOfNode ? '60px' : '-140px',
                marginTop: '-40px'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8, scaleY: 0.6, scaleX: 1.3 }}
            onClick={handleInteraction}
        >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-black/10 blur-md rounded-full -z-10" />
            
            <LoopyMascot size={80} mood={mood} />
            
            {/* Thought Bubble */}
            <motion.div 
                key={`${mood}-${phraseIndex}-${isCalming}`}
                initial={{ opacity: 0, y: 5, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-2xl shadow-lg border whitespace-nowrap z-50 transition-all duration-300
                    ${isCalming ? 'bg-blue-50 border-blue-200 text-blue-800' :
                      mood === 'annoyed' ? 'bg-red-50 border-red-200 text-red-800' : 
                      mood === 'surprised' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
                      'bg-white border-zinc-100 text-zinc-800'}
                `}
            >
                <p className="text-[10px] font-black uppercase tracking-tighter">
                    {currentPhrases[phraseIndex % currentPhrases.length]}
                </p>
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b transition-all duration-300
                    ${isCalming ? 'bg-blue-50 border-blue-200' :
                      mood === 'annoyed' ? 'bg-red-50 border-red-200' : 
                      mood === 'surprised' ? 'bg-amber-50 border-amber-200' : 
                      'bg-white border-zinc-100'}
                `} />
            </motion.div>
        </motion.div>
    );
}

// Sub-component for Module/Chapter Headers in the background
const ChapterHeader = memo(function ChapterHeader({ title, yPos, index }: { title: string, yPos: number, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="absolute left-0 right-0 flex flex-col items-center pointer-events-none z-0"
            style={{ top: `${yPos - 120}px` }}
        >
            <div className="flex items-center gap-4 w-full px-10">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-lime-200/50" />
                <div className="text-center">
                    <span className="block text-[10px] font-black text-lime-600/40 uppercase tracking-[0.3em] mb-1">
                        Chapter {index + 1}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black text-lime-900/10 uppercase italic tracking-tighter">
                        {title}
                    </h2>
                </div>
                <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-lime-200/50" />
            </div>
        </motion.div>
    );
});

export default function GamifiedPath() {
    const supabase = createClient();
    const { user: authUser, profile } = useUser();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isMounted, setIsMounted] = useState(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
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
            const { data: modules } = await supabase
                .from("modules")
                .select("*")
                .eq("track_id", currentTrackId)
                .order("order_index");

            if (!modules) return;
            setModules(modules);

            const { data: topics } = await supabase
                .from("topics")
                .select("*")
                .in("module_id", modules.map(m => m.id))
                .order("order_index", { ascending: true });

            if (!topics) return;

            const { data: progress } = authUser ? await supabase
                .from("user_topic_progress")
                .select("topic_id, status")
                .eq("user_id", authUser.id) : { data: [] };

            const nodes: PathNode[] = [];
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

                const amplitude = 30;
                const frequency = Math.PI / 2;
                const xOffset = Math.sin(idx * frequency) * amplitude;

                const x = topic.position_x || (50 + xOffset);
                const y = idx * 220 + 150;

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

    useEffect(() => {
        fetchPath();
    }, [fetchPath]);

    useEffect(() => {
        const timer = setTimeout(() => {
            componentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const activeNodeIndex = pathData.findIndex(n => n.status === "active");
    const completedPathPoints = pathData.slice(0, activeNodeIndex + 1);

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

    const activeNodeRef = useAutoScroll<HTMLButtonElement>({
        trigger: activeNodeIndex,
        containerId: "app-scroll-container",
        offset: -250,
        behavior: "smooth",
        delay: 500
    });

    const scrollY = useMotionValue(0);
    const parallaxY = useTransform(scrollY, [0, 5000], [0, -300]);

    useEffect(() => {
        const container = document.getElementById("app-scroll-container");
        if (!container) return;
        const handleScroll = () => scrollY.set(container.scrollTop);
        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [scrollY]);

    const contentHeight = pathData.length > 0 ? pathData[pathData.length - 1].position.y + 200 : 800;

    const generateSmoothPath = (points: PathNode[]) => {
        if (points.length < 2) return "";
        const getX = (p: PathNode) => p.position.x * 10;
        const getY = (p: PathNode) => p.position.y;
        let d = `M ${getX(points[0])} ${getY(points[0])}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const p0x = getX(p0);
            const p0y = getY(p0);
            const p1x = getX(p1);
            const p1y = getY(p1);
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

    const renderBiomeDecorations = (isMobile: boolean) => {
        const decorations: React.ReactNode[] = [];
        const rows = Math.ceil(contentHeight / (isMobile ? 250 : 150));
        const cols = isMobile ? 2 : 4;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const seed = row * cols + col;
                const rand = Math.abs(Math.sin(seed * 12.3));
                const threshold = isMobile ? 0.5 : 0.7;
                if (rand > threshold) continue;
                const xBase = (col / cols) * 100 + (100 / cols / 2);
                const xJitter = (Math.sin(seed * 4.5) * (100 / cols / 3));
                const xPos = xBase + xJitter;
                if (xPos > 35 && xPos < 65) continue;
                const yBase = row * 150 + 75;
                const yJitter = Math.cos(seed * 3.2) * 50;
                const yPos = yBase + yJitter;
                const progress = yPos / contentHeight;
                let colorBase = "#65a30d";
                let colorLight = "#a3e635";
                if (progress > 0.4) { colorBase = "#d97706"; colorLight = "#fbbf24"; }
                if (progress > 0.7) { colorBase = "#4f46e5"; colorLight = "#818cf8"; }
                const scale = 0.5 + (Math.abs(Math.sin(seed * 8.8)) * 0.6);
                const parallaxSpeed = 0.1 + (Math.abs(Math.cos(seed * 2.2)) * 0.2);
                const assetRand = Math.abs(Math.sin(seed * 9.9));
                const assetType: 'cloud' | 'tree' | 'rock' | 'flower' = 
                    assetRand > 0.8 ? 'cloud' : 
                    assetRand > 0.3 ? 'tree' : 
                    assetRand > 0.15 ? 'rock' : 'flower';
                decorations.push(
                    <BiomeDecoration
                        key={`grid-dec-${row}-${col}`}
                        xPos={xPos}
                        yPos={yPos}
                        scale={scale}
                        parallaxSpeed={parallaxSpeed}
                        scrollY={scrollY}
                        assetType={assetType}
                        colorBase={colorBase}
                        colorLight={colorLight}
                    />
                );
            }
        }
        return decorations;
    };

    return (
        <div ref={componentRef} className="relative">
            <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-8 items-center justify-between">
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

            <div
                className="bg-gradient-to-b from-[#ecfccb] via-[#f7fee7] to-[#ecfccb] rounded-[2.5rem] border border-lime-200/50 shadow-xl shadow-lime-900/5 overflow-hidden relative"
            >
                <div className="relative w-full" style={{ height: contentHeight, contentVisibility: 'auto' }}>
                    <style>{`
                        @keyframes march {
                            to { stroke-dashoffset: -30; }
                        }
                        .animate-path-dash {
                            animation: march 3s linear infinite;
                        }
                    `}</style>

                    <div className="absolute inset-0 pointer-events-none sticky top-0 h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] [background-size:32px_32px] opacity-[0.07]" />
                    </div>

                    <motion.div style={{ y: parallaxY }} className="absolute inset-0 z-0 pointer-events-none">
                        {isMounted && pathData.length > 0 && renderBiomeDecorations(isMobile)}
                        {isMounted && pathData.length > 0 && (
                            <AmbientLife isMobile={isMobile} scrollY={scrollY} contentHeight={contentHeight} />
                        )}
                    </motion.div>

                    {isMounted && <ForegroundLayer scrollY={scrollY} isMobile={isMobile} contentHeight={contentHeight} />}

                    {/* Loopy Guide - Follows the active node */}
                    {isMounted && activeNodeIndex !== -1 && (
                        <LoopyCompanion 
                            activeNode={pathData[activeNodeIndex]} 
                            index={activeNodeIndex}
                            totalNodes={pathData.length}
                        />
                    )}

                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox={`0 0 1000 ${contentHeight}`}
                        preserveAspectRatio="none"
                        style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.08))" }}
                    >
                        <path
                            d={generateSmoothPath(pathData)}
                            stroke="#d4d4d8"
                            strokeWidth="24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                            opacity={0.3}
                            transform="translate(0, 8)"
                        />
                        <path
                            d={generateSmoothPath(pathData)}
                            stroke="#e4e4e7"
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                        />
                        <path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#84cc16"
                            strokeWidth="24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            opacity={0.3}
                            vectorEffect="non-scaling-stroke"
                            transform="translate(0, 4)"
                        />
                        <path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#a3e635"
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                        />
                        <path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#ffffff"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="12 24"
                            fill="none"
                            className="animate-path-dash"
                            vectorEffect="non-scaling-stroke"
                            opacity={0.8}
                        />
                        <motion.path
                            d={generateSmoothPath(completedPathPoints)}
                            stroke="#bef264"
                            strokeWidth="32"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    {/* Fog of War (Refined Frosted Glass) */}
                    {activeNodeIndex !== -1 && activeNodeIndex < pathData.length - 1 && (
                        <div
                            className="absolute left-0 right-0 bottom-0 pointer-events-none transition-all duration-1000 z-10"
                            style={{ top: `${pathData[activeNodeIndex].position.y + 150}px` }}
                        >
                            <div
                                className={`absolute inset-0 backdrop-blur-xl transition-colors duration-1000
                                    ${activeNodeIndex / pathData.length > 0.7 ? 'bg-indigo-50/30' : 
                                      activeNodeIndex / pathData.length > 0.4 ? 'bg-orange-50/20' : 
                                      'bg-white/20'}
                                `}
                                style={{
                                    maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 150px, black 450px)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 150px, black 450px)'
                                }}
                            />
                        </div>
                    )}

                    {/* Chapter Milestone Headers */}
                    {isMounted && pathData.map((node, index) => {
                        const isFirstInModule = index === 0 || pathData[index - 1].module_id !== node.module_id;
                        if (isFirstInModule) {
                            const module = modules.find(m => m.id === node.module_id);
                            const moduleIndex = modules.findIndex(m => m.id === node.module_id);
                            return (
                                <ChapterHeader 
                                    key={`chapter-${node.module_id}`} 
                                    title={module?.title || "New Module"} 
                                    yPos={node.position.y}
                                    index={moduleIndex}
                                />
                            );
                        }
                        return null;
                    })}

                    {pathData.map((node, index) => {
                        const isGoingRight = Math.sin((index + 1) * Math.PI / 2) > 0;
                        const isLabelLeftOfNode = node.position.x > 50 || (node.position.x === 50 && isGoingRight);

                        return (
                            <div
                                key={node.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 hover:z-20"
                                style={{
                                    left: `${node.position.x}%`,
                                    top: `${node.position.y}px`,
                                }}
                            >
                                <motion.button
                                    ref={node.status === "active" ? activeNodeRef : null}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        y: node.status === "active" ? [0, -8, 0] : 0
                                    }}
                                    transition={{
                                        scale: { type: "spring", bounce: 0.5, duration: 0.6 },
                                        opacity: { duration: 0.4 },
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
                                                type: "tween"
                                            },
                                            scale: {
                                                type: "spring",
                                                bounce: 0.6
                                            }
                                        }
                                    } : {}}
                                    whileTap={node.status !== "locked" ? { scale: 0.92, y: 4 } : {}}
                                    onClick={() => {
                                        if (node.status !== "locked") {
                                            soundManager.playClick(0.6);
                                            setSelectedNode(node);
                                        }
                                    }}
                                    disabled={node.status === "locked"}
                                    className={`
                                    w-14 h-14 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center
                                    relative group z-10
                                    ${node.status === "locked" ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
                                `}
                                >
                                    <motion.div 
                                        layoutId={`node-bg-${node.id}`}
                                        className="absolute inset-0 rounded-[2rem] z-0 shadow-lg"
                                        style={{ 
                                            background: node.status === 'completed' ? '#84cc16' : 
                                                        node.status === 'active' ? '#ffffff' : '#e4e4e7' 
                                        }}
                                    />

                                    {node.status === "active" && (
                                        <>
                                            <motion.div
                                                className="absolute -inset-8 bg-lime-400/20 rounded-full z-0"
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                            <div className="absolute -inset-4 bg-lime-400/40 blur-xl rounded-full z-0" />
                                        </>
                                    )}

                                    <div className="relative w-full h-full z-10">
                                        <div className={`absolute inset-0 top-2 rounded-[2rem] transition-colors duration-300
                                        ${node.status === "completed" ? "bg-lime-600" :
                                                node.status === "active" ? "bg-lime-500" : "bg-zinc-300"}
                                    `} />

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

                                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-0
                                    ${node.status === "active" ? "opacity-100" : "opacity-60"}
                                `}>
                                    <div className={`text-[10px] font-black uppercase tracking-widest py-1 px-2 rounded-lg transform -translate-y-1/2
                                        ${node.status === "active" ? "bg-amber-100/80 text-amber-800 shadow-sm border border-amber-200/50" : "text-zinc-400 bg-white/50 border border-zinc-100/50"}
                                    `}>
                                        {node.status === "active" ? "Current Level" : `Lvl ${index + 1}`}
                                    </div>
                                </div>

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
                            layoutId={`node-bg-${selectedNode.id}`}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.1 }}
                                className={`absolute inset-0 pointer-events-none ${selectedNode.status === 'completed' ? 'bg-lime-500' : 'bg-lime-400'}`} 
                            />
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="relative z-10"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -15 }} 
                                        animate={{ scale: 1, rotate: 0 }} 
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center ${getNodeColor(selectedNode.status)} shadow-xl shadow-lime-900/10`}
                                    >
                                        {getIcon(selectedNode.status)}
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-zinc-900 leading-tight">{selectedNode.title}</h3>
                                        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1 opacity-60">
                                            {selectedNode.type} Lesson • {selectedNode.xp_reward} XP
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Objective</div>
                                            <div className="text-sm font-bold text-zinc-600">Master {selectedNode.title} basics</div>
                                        </div>
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100">
                                            <Trophy size={16} className="text-lime-600" />
                                        </div>
                                    </div>

                                    <button
                                        className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95 group flex items-center justify-center gap-2"
                                        onClick={() => router.push(`/lesson/${selectedNode.id}`)}
                                    >
                                        {selectedNode.status === "completed" ? "Review Content" : "Start Learning"}
                                        <motion.div
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <ArrowRight size={18} />
                                        </motion.div>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
