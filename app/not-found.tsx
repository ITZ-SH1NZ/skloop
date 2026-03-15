"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Star, Sparkles, Compass, RefreshCw } from "lucide-react";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";

export default function NotFound() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Memoize random values to prevent shifts even after mount
    const blobs = useMemo(() => {
        return [...Array(15)].map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 40, // Reduced relative jitter
            y: (Math.random() - 0.5) * 40,
            scale: [1, 1.3, 0.7, 1],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 15 + Math.random() * 15, // Slower, more oozy
            delay: Math.random() * -30, // Random start positions
            size: 150 + Math.random() * 250 // Varied sizes
        }));
    }, []);

    const particles = useMemo(() => {
        return [...Array(12)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 4,
            x: (Math.random() - 0.5) * 60
        }));
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-6 overflow-hidden relative">
            
            {/* 1. Gooey SVG Filter Definition */}
            <svg className="hidden">
                <defs>
                    <filter id="gooey">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                        {/* Higher contrast matrix to ensure gooey effect works on high alpha */}
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            {/* 2. Bubbly Slime Background - Using a specific opacity on the container to fix "glitch" */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-soft-light"
                style={{ filter: "url(#gooey)" }}
            >
                {/* Increased density and added inner glow blobs */}
                {isMounted && [...Array(15)].map((_, i) => (
                    <motion.div
                        key={`slime-bg-${i}`}
                        className="absolute bg-[#D4F268] rounded-full"
                        style={{
                            width: blobs[i].size,
                            height: blobs[i].size,
                            left: blobs[i].left,
                            top: blobs[i].top,
                            boxShadow: "inset 0 0 40px rgba(0,0,0,0.1)", // Inner glow/depth
                        }}
                        animate={{
                            x: [0, 60, -60, 0],
                            y: [0, -60, 60, 0],
                            scale: [1, 1.2, 0.8, 1],
                        }}
                        transition={{
                            duration: blobs[i].duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: blobs[i].delay,
                        }}
                    />
                ))}
            </div>

            {/* 3. Main Content Container - Tighter scaling for "premium" feel */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] scale-75 md:scale-90 lg:scale-[0.85] transition-transform">
                
                {/* 4. Unified Physical Group (Island + Loopy) */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ 
                        y: [0, -20, 0],
                        scaleY: [1, 0.98, 1],
                        scaleX: [1, 1.02, 1],
                        opacity: 1
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ 
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        scaleY: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        scaleX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 0.8 }
                    }}
                    className="relative group cursor-pointer"
                >
                    {/* Synchronized Shadow */}
                    <motion.div 
                        animate={{ 
                            scale: [1, 0.8, 1], 
                            opacity: [0.15, 0.08, 0.15] 
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 md:w-80 h-12 bg-black/30 rounded-[100%] blur-3xl"
                    />

                    {/* The Island Assembly */}
                    <div className="relative flex flex-col items-center">
                        
                        {/* Signpost - Grounded BEHIND the island */}
                        <div className="absolute -left-12 md:-left-20 bottom-8 md:bottom-12 w-40 h-48 pointer-events-none z-0">
                            <div className="absolute left-1/2 bottom-0 w-3 h-20 bg-black/20 -translate-x-1/2 rounded-full blur-md" />
                            <div className="absolute left-1/2 bottom-0 w-3 h-40 bg-stone-800 -translate-x-1/2 rounded-full border-r-2 border-stone-700" />
                            <motion.div 
                                animate={{ rotate: [-6, 6, -6] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -left-6 md:-left-10 w-32 md:w-44 h-16 md:h-24 bg-white border-[6px] md:border-[10px] border-black rounded-2xl md:rounded-3xl shadow-[10px_10px_0_0_#000] flex flex-col items-center justify-center -rotate-6"
                            >
                                <Compass className="w-8 h-8 md:w-14 md:h-14 text-lime-500 mb-1 animate-spin-slow" />
                                <span className="font-black text-xs md:text-xl uppercase tracking-tighter">No Way</span>
                            </motion.div>
                        </div>

                        {/* Loopy - Floating above island */}
                        <div className="absolute -top-32 md:-top-48 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                            <motion.div 
                                animate={{ 
                                    x: [-4, 4, -4],
                                    rotate: [-3, 3, -3] 
                                }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="drop-shadow-[0_25px_0_rgba(0,0,0,0.1)]"
                            >
                                <LoopyMascot mood="surprised" size={isMounted ? (window.innerWidth < 768 ? 140 : 200) : 200} isStatic={true} />
                            </motion.div>
                        </div>

                        {/* Island Body (Stone/Soil Layer) */}
                        <div className="relative w-[260px] h-[100px] md:w-[500px] md:h-[200px] bg-white border-[10px] md:border-[16px] border-black rounded-[4rem] md:rounded-[5rem] shadow-[20px_20px_0_0_#000] md:shadow-[30px_30px_0_0_#000] overflow-hidden group-hover:translate-y-2 group-hover:shadow-[10px_10px_0_0_#000] transition-all duration-300">
                            {/* Inner Soil Pattern */}
                            <div className="absolute inset-0 bg-stone-100" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-stone-50/50" />
                            
                            {/* The Grass Cap (Lime Layer) */}
                            <div className="absolute top-0 left-0 right-0 h-10 md:h-16 bg-lime-400 border-b-[8px] md:border-b-[12px] border-black z-20 flex items-center justify-around px-8">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={`grass-${i}`}
                                        animate={{ rotate: [-10, 10, -10] }}
                                        transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                        className="w-2.5 h-10 bg-lime-700/30 rounded-full"
                                    />
                                ))}
                            </div>

                            {/* Decorative Floating Dots for Texture */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                        </div>

                        {/* Floating Decorative Assets */}
                        <div className="absolute -top-10 -right-10 md:-top-20 md:-right-20 flex flex-col gap-6 md:gap-10 pointer-events-none z-20">
                            <motion.div animate={{ rotate: 360, y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity }} className="text-lime-500 opacity-80"><Star className="w-8 h-8 md:w-16 md:h-16 fill-lime-400 border-2 border-black rounded-full p-1" /></motion.div>
                            <motion.div animate={{ scale: [1, 1.4, 1], y: [10, -10, 10] }} transition={{ duration: 4, repeat: Infinity }} className="text-zinc-300"><Sparkles className="w-6 h-6 md:w-12 md:h-12" /></motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* 5. Text Content (The "Bomb" Sticker Header) */}
                <div className="mt-24 md:mt-32 text-center relative select-none px-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.6, delay: 0.4 }}
                    >
                        <div className="relative inline-block mb-8 group">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                className="bg-white border-[8px] md:border-[12px] border-black rounded-[2.5rem] md:rounded-[4rem] px-8 md:px-12 py-4 md:py-8 shadow-[15px_15px_0_0_#000] md:shadow-[25px_25px_0_0_#000] relative z-10 cursor-default"
                            >
                                <h1 className="text-7xl md:text-[11rem] font-black text-zinc-900 tracking-tighter leading-none uppercase">
                                    404
                                </h1>
                            </motion.div>
                            <motion.div 
                                animate={{ scale: [1, 1.15, 1], rotate: [12, 18, 12] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute -top-8 md:-top-12 -right-8 md:-right-16 bg-lime-400 border-[6px] md:border-[10px] border-black text-black px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-3xl font-black text-xl md:text-4xl uppercase italic rotate-12 shadow-[5px_5px_0_0_#000] md:shadow-[8px_8px_0_0_#000] z-20 pointer-events-none"
                            >
                                Lost!
                            </motion.div>
                        </div>
                        
                        <h2 className="text-3xl md:text-6xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6 leading-tight">
                            Wandered off base?
                        </h2>
                        <p className="text-zinc-500 font-bold text-lg md:text-2xl max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed">
                            Looks like you've navigated into unrendered territory. <br className="hidden md:block" />
                            Don't worry, even the legends hit a null loop.
                        </p>
                    </motion.div>

                    {/* 5. Navigation Actions (Tactile Bomb Buttons) */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 px-4 w-full">
                        <Link href="/" className="w-full md:w-auto">
                            <motion.button 
                                whileHover={{ scale: 1.1, y: -8 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full h-16 md:h-20 px-8 md:px-12 rounded-[2rem] md:rounded-[2.5rem] bg-lime-400 border-[6px] md:border-[8px] border-black text-black font-black text-xl md:text-2xl flex items-center justify-center gap-4 shadow-[0_12px_0_0_#000] md:shadow-[0_15px_0_0_#000] active:shadow-none active:translate-y-3 transition-all uppercase"
                            >
                                <Home className="w-6 h-6 md:w-8 md:h-8" />
                                Base Camp
                            </motion.button>
                        </Link>
                        
                        <Link href="/manifesto" className="w-full md:w-auto">
                            <motion.button 
                                whileHover={{ scale: 1.1, y: -8 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full h-16 md:h-20 px-8 md:px-12 rounded-[2rem] md:rounded-[2.5rem] bg-white border-[6px] md:border-[8px] border-black text-black font-black text-xl md:text-2xl flex items-center justify-center gap-4 shadow-[10px_10px_0_0_#000] active:shadow-none active:translate-x-3 active:translate-y-3 transition-all uppercase"
                            >
                                <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                                The Lore
                            </motion.button>
                        </Link>
                    </div>
                </div>

            </div>

            {/* loopy's Surprise Bubble */}
            <AnimatePresence>
                {isMounted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: 2, type: "spring" }}
                        className="fixed bottom-12 right-12 bg-zinc-900 border-[6px] border-lime-400 text-white px-8 py-4 rounded-[2rem] font-black text-lg uppercase tracking-widest hidden lg:flex items-center gap-3 shadow-2xl z-50"
                    >
                        <RefreshCw className="w-6 h-6 animate-spin text-lime-400" />
                        Where are we??
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Floating Particles */}
            {isMounted && particles.map(p => (
                <motion.div
                    key={p.id}
                    animate={{
                        y: [0, -150, 0],
                        x: [0, p.x, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0, 1.5, 0],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                    style={{
                        left: p.left,
                        top: p.top,
                    }}
                    className="absolute w-4 h-4 rounded-full bg-lime-400 mix-blend-multiply opacity-30 select-none pointer-events-none"
                />
            ))}

            <style jsx global>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
