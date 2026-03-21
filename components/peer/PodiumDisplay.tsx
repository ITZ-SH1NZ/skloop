"use client";

import { Avatar } from "@/components/ui/Avatar";
import { FramerCounter } from "@/components/ui/FramerCounter";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface LeaderboardUser {
    id: string;
    rank: number;
    name: string;
    username: string;
    avatarUrl: string;
    xp: number;
    coins: number;
    streak: number;
    trend: "up" | "down" | "same";
}

// Custom Slime Pedestal SVG Gamified 3D Version
const SlimePedestal = ({ place }: { place: number }) => {
    // 1: Green, 2: Purple, 3: Orange
    const fills = {
        1: { top: "#D4F268", mid: "#84cc16", dark: "#3f6212", shadow: "#14532d", base: "#052e16" },
        2: { top: "#e9d5ff", mid: "#a855f7", dark: "#6b21a8", shadow: "#3b0764", base: "#1b0330" },
        3: { top: "#fed7aa", mid: "#f97316", dark: "#9a3412", shadow: "#431407", base: "#220a04" }
    };
    const c = fills[place as keyof typeof fills];

    return (
        <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-visible">
            <defs>
                {/* 3D Cylinder Gradient */}
                <linearGradient id={`cylGrad-${place}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.mid} />
                    <stop offset="50%" stopColor={c.dark} />
                    <stop offset="100%" stopColor={c.shadow} />
                </linearGradient>
                <linearGradient id={`topGrad-${place}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={c.top} />
                    <stop offset="100%" stopColor={c.mid} />
                </linearGradient>
                <filter id={`pedestalGlow-${place}`}>
                    <feGaussianBlur stdDeviation="15" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Glowing Floor Base rings with expansion animation */}
            <ellipse cx="100" cy="130" rx="85" ry="25" fill={c.base} opacity="0.9" filter={`url(#pedestalGlow-${place})`} />
            <ellipse cx="100" cy="130" rx="95" ry="30" fill="none" stroke={c.dark} strokeWidth="4" opacity="0.6" filter={`url(#pedestalGlow-${place})`}>
                <animate attributeName="rx" values="95; 100; 95" dur="4s" repeatCount="indefinite" />
                <animate attributeName="ry" values="30; 32; 30" dur="4s" repeatCount="indefinite" />
                <animate attributeName="stroke-width" values="4; 1; 4" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="100" cy="130" rx="85" ry="25" fill="none" stroke={c.mid} strokeWidth="1.5" opacity="0.8">
                <animate attributeName="opacity" values="0.8; 0.2; 0.8" dur="2s" repeatCount="indefinite" />
            </ellipse>

            {/* Main Column Body (Cylinder) */}
            <path 
                fill={`url(#cylGrad-${place})`} 
                d="M 30,50 A 70,20 0 0,0 170,50 L 170,130 A 70,20 0 0,1 30,130 Z" 
            />

            {/* Slime Drips oozing down independently */}
            <g fill={c.mid}>
                {/* Thick center drip */}
                <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,4; 0,0" dur="3s" repeatCount="indefinite" />
                    <path d="M 80,68 C 100,100 110,95 120,68 Z" />
                    <circle cx="105" cy="100" r="4" /> {/* detached dripping droplet */}
                </g>
                
                {/* Left side drip */}
                <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,2; 0,0" dur="2.2s" repeatCount="indefinite" />
                    <path d="M 40,55 C 50,80 50,90 60,70 Z" />
                </g>
                
                {/* Right side drip */}
                <g>
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,3; 0,0" dur="2.7s" repeatCount="indefinite" />
                    <path d="M 140,65 C 150,90 155,90 160,55 Z" />
                </g>
            </g>

            {/* High-tech Inner Cylinder Highlights shimmering */}
            <path 
                fill="none" stroke={c.top} strokeWidth="1" opacity="0.3"
                d="M 40,50 L 40,120 M 80,68 L 80,128 M 120,68 L 120,128 M 160,50 L 160,120" 
            >
                <animate attributeName="opacity" values="0.1; 0.5; 0.1" dur="2.5s" repeatCount="indefinite" />
            </path>

            {/* Top Surface (Ellipse) breathing/pulsing */}
            <ellipse cx="100" cy="50" rx="70" ry="20" fill={`url(#topGrad-${place})`}>
                <animate attributeName="ry" values="20; 21.5; 20" dur="4s" repeatCount="indefinite" />
            </ellipse>
            
            {/* Top Surface Highlights & Rims */}
            <ellipse cx="100" cy="50" rx="68" ry="18" fill="none" stroke="white" strokeWidth="2" opacity="0.5">
                <animate attributeName="ry" values="18; 19.5; 18" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <path d="M 50,45 Q 100,35 150,45 Q 100,40 50,45" fill="white" opacity="0.6" filter="blur(2px)">
                 <animate attributeName="opacity" values="0.4; 0.8; 0.4" dur="4s" repeatCount="indefinite" />
            </path>

            {/* Render rank number directly on the front body of the pedestal */}
            <text x="100" y="110" textAnchor="middle" fill={c.top} fontSize="42" fontWeight="900" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.05em' }}>
                <tspan dx="0" dy="0" filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.8))">#{place}</tspan>
            </text>

            {/* Sparkles ascending automatically for #1 */}
            {place === 1 && (
                <g fill={c.top} opacity="0.8">
                    <g>
                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-15; 0,0" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0; 1; 0" dur="2s" repeatCount="indefinite" />
                        <circle cx="20" cy="80" r="3" filter="blur(1px)" />
                    </g>
                    <g>
                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-20; 0,0" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0; 1; 0" dur="3s" repeatCount="indefinite" />
                        <circle cx="180" cy="60" r="2" filter="blur(1px)" />
                    </g>
                    <g>
                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" repeatCount="indefinite" />
                        <circle cx="160" cy="110" r="4" filter="blur(2px)" />
                    </g>
                    <g>
                        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-25; 0,0" dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0; 1; 0" dur="2.5s" repeatCount="indefinite" />
                        <circle cx="40" cy="120" r="2" />
                    </g>
                </g>
            )}
        </svg>
    );
};

export function PodiumDisplay({ users, metric = "xp" }: { users: LeaderboardUser[], metric?: "xp" | "coins" }) {
    if (!users || users.length === 0) return null;

    const first = users.find(u => u.rank === 1);
    const second = users.find(u => u.rank === 2);
    const third = users.find(u => u.rank === 3);

    if (!first) return null;

    return (
        <div className="flex items-end justify-center gap-2 md:gap-6 mb-16 min-h-[350px] pt-24 relative z-20">
            {/* 2nd Place */}
            {second && <PodiumStep user={second} place={2} delay={0.2} metric={metric} />}

            {/* 1st Place */}
            <PodiumStep user={first} place={1} delay={0} isFirst metric={metric} />

            {/* 3rd Place */}
            {third && <PodiumStep user={third} place={3} delay={0.4} metric={metric} />}
        </div>
    );
}

function PodiumStep({ user, place, delay, isFirst = false, metric }: { user: LeaderboardUser, place: number, delay: number, isFirst?: boolean, metric: "xp" | "coins" }) {
    const value = metric === "xp" ? user.xp : user.coins;
    const label = metric === "xp" ? "XP" : "Coins";

    // Pedestal sizing
    const pedestalClasses = isFirst ? "w-44 h-32 md:w-56 md:h-40" : "w-32 h-24 md:w-40 md:h-28";
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
            className={`flex flex-col items-center relative ${isFirst ? "z-30" : "z-20 opacity-90"}`}
        >
            {/* The Floating Info Tag */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.5 }}
                className="absolute -top-24 md:-top-28 flex flex-col items-center z-50 pointer-events-none"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl px-4 py-2 rounded-2xl flex flex-col items-center mb-2">
                    <span className="font-bold text-white text-sm whitespace-nowrap">{user.name}</span>
                    <span className="text-xs text-zinc-300 font-medium">
                        <FramerCounter value={value} /> <span className="opacity-80">{label}</span>
                    </span>
                </div>
                {/* Connector line (optional, but looks nice connecting tag to avatar) */}
                <div className="w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>

            {/* The Avatar Hovering */}
            <motion.div
                className="relative z-40"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: place * 0.5 }}
            >
                {/* Crown for #1 */}
                {isFirst && (
                    <motion.div 
                        initial={{ rotate: -15, scale: 0, x: "-50%" }}
                        animate={{ rotate: 15, scale: 1, x: "-50%" }}
                        transition={{ delay: 1, type: "spring", bounce: 0.6 }}
                        className="absolute -top-7 left-1/2 origin-bottom text-[#D4F268] z-50 drop-shadow-[0_0_15px_rgba(212,242,104,0.8)]"
                    >
                        <Crown size={32} fill="currentColor" />
                    </motion.div>
                )}

                <div className={`relative p-1 rounded-full bg-zinc-900 shadow-2xl ${isFirst ? "" : place === 2 ? "border border-white/10 shadow-purple-500/30" : "border border-white/10 shadow-orange-500/30"} overflow-hidden z-20`}>
                    
                    {/* Animated Neon Border for #1 */}
                    {isFirst && (
                        <div className="absolute inset-[-50%] z-0 animate-[spin_4s_linear_infinite]" 
                             style={{ background: `conic-gradient(from 0deg, transparent 0 250deg, #D4F268 360deg)` }} 
                        />
                    )}
                    {isFirst && (
                        <div className="absolute inset-[2px] bg-zinc-950 z-10 rounded-full" />
                    )}

                    <div className="relative z-20 border-[3px] border-zinc-900 rounded-full">
                        <Avatar
                            src={user.avatarUrl}
                            fallback={user.name[0]}
                            className={`${isFirst ? "w-20 h-20 md:w-24 md:h-24" : "w-14 h-14 md:w-16 md:h-16"} object-cover border-2 border-zinc-800 bg-zinc-950`}
                        />
                    </div>
                </div>
            </motion.div>

            {/* The Slime Pedestal and Underlying Spotlight */}
            <div className={`relative ${pedestalClasses} -mt-4 md:-mt-8 flex justify-center`}>
                {/* Spotlight Upward Glow */}
                <div className={`absolute bottom-0 w-24 md:w-32 h-48 rounded-full blur-[40px] opacity-30 pointer-events-none -z-10 ${
                    isFirst ? "bg-[#b1f142]" : place === 2 ? "bg-purple-500" : "bg-orange-500"
                }`} style={{ transform: "scaleY(1.5)" }} />

                <SlimePedestal place={place} />
            </div>
        </motion.div>
    );
}
