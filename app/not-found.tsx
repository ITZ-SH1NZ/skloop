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

            {/* 3. Main Content Container - Scaled down for desktop for "tighter" feel */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] scale-75 md:scale-[0.85] lg:scale-90 transition-transform">
                
                {/* Unified Physical Group (Island + Loopy) */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ 
                        y: [0, -25, 0],
                        scaleY: [1, 0.98, 1],
                        scaleX: [1, 1.02, 1],
                        opacity: 1
                    }}
                    whileHover={{ scale: 1.05, rotate: [-1, 1, -1] }}
                    transition={{ 
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        scaleY: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        scaleX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 0.5, repeat: 0 },
                        opacity: { duration: 0.8 }
                    }}
                    className="relative group cursor-pointer"
                >
                    {/* Synchronized Shadow */}
                    <motion.div 
                        animate={{ 
                            scale: [1, 0.75, 1], 
                            opacity: [0.1, 0.04, 0.1] 
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-12 bg-black/20 rounded-[100%] blur-3xl group-hover:blur-2xl transition-all"
                    />

                    {/* Island Core (Grounded & Unified) */}
                    <div className="w-[280px] h-[100px] md:w-[500px] md:h-[180px] bg-white border-[10px] md:border-[16px] border-black rounded-[4rem] md:rounded-[5rem] flex flex-col items-center justify-end pb-4 shadow-[0_20px_0_0_#000] md:shadow-[0_25px_0_0_#000] relative group-hover:translate-y-2 group-hover:shadow-[0_15px_0_0_#000] transition-all">
                        {/* Grounding Fix: Signpost post is behind the island body */}
                        <div className="absolute -left-8 md:-left-12 bottom-4 md:bottom-6 w-32 h-40 pointer-events-none z-0">
                            <div className="absolute left-1/2 bottom-0 w-3 h-24 bg-[#1a2e05] -translate-x-1/2 rounded-full opacity-20 blur-sm translate-y-2" />
                            <div className="absolute left-1/2 bottom-0 w-2.5 h-32 bg-stone-800 -translate-x-1/2 rounded-full border-r border-stone-700" />
                            <motion.div 
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -left-8 md:-left-4 w-32 md:w-40 h-16 md:h-20 bg-white border-[6px] border-black rounded-2xl md:rounded-3xl shadow-[8px_8px_0_0_#000] flex items-center justify-center -rotate-6 scale-75 md:scale-90"
                            >
                                <Compass className="w-6 h-6 md:w-10 md:h-10 text-lime-600 mr-2 md:mr-3 animate-spin-slow" />
                                <span className="font-black text-sm md:text-xl uppercase tracking-tighter">No Way</span>
                            </motion.div>
                        </div>

                        {/* Island Core */}
                        <div className="absolute inset-0 bg-stone-200 border-x-8 border-b-8 border-black rounded-b-[4rem] shadow-[20px_20px_0_0_#000] z-10">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20" />
                            <div className="absolute top-4 left-8 right-8 h-4 bg-black/10 rounded-full" />
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-6 bg-lime-400 border-b-4 border-black z-10 overflow-hidden rounded-t-[3rem] md:rounded-t-[4rem]">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:10px_10px]" />
                        </div>
                        
                        {/* Bouncy Grass Blades */}
                        {isMounted && [...Array(10)].map((_, i) => (
                            <motion.div
                                key={`grass-${i}`}
                                animate={{ rotate: [-12, 12, -12] }}
                                transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                style={{ left: `${8 + i * 9}%` }}
                                className="absolute top-2 w-2 h-7 bg-lime-700 rounded-full origin-bottom border-x-2 border-black/30 z-20"
                            />
                        ))}
                        

                        {/* Floating Bits Sync with Island */}
                        <div className="absolute top-10 right-20 flex gap-4 z-10 scale-75 md:scale-100">
                            <motion.div animate={{ y: [0, -10, 0], rotate: 360 }} transition={{ duration: 4, repeat: Infinity }} className="text-lime-500"><Star className="w-8 h-8 fill-lime-400" /></motion.div>
                            <motion.div animate={{ y: [-10, 0, -10], scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-zinc-200 opacity-50"><Sparkles className="w-10 h-10" /></motion.div>
                        </div>
                    </div>

                    {/* Loopy - Unified Position & Scale */}
                    <div className="absolute -top-32 md:-top-48 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                        <motion.div 
                            animate={{ 
                                y: [0, 5, 0],
                                rotate: [0, -2, 2, 0] 
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="drop-shadow-[0_20px_0_rgba(0,0,0,0.1)] scale-75 md:scale-100"
                        >
                            <LoopyMascot mood="surprised" size={180} />
                        </motion.div>
                    </div>
                </motion.div>

                {/* 4. Text Content (The "Bomb" Sticker Header) */}
                <div className="mt-20 md:mt-28 text-center relative select-none px-4">
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
