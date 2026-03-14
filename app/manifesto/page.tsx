"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Swords, BrainCircuit, Rocket, ChevronRight, Zap, Target, Cpu, Users, Activity, Star } from "lucide-react";
import Link from "next/link";
import { LoopyMascot, LoopyMood } from "@/components/loopy/LoopyMascot";
import { soundManager } from "@/lib/sound";

// --- THE INFINITE STAGE COMPONENTS ---

const BackgroundDecoration = memo(({ color }: { color: string }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
                opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute top-[-10%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] bg-${color}-400/20`}
        />
        <motion.div 
            animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [360, 270, 180, 90, 0],
                opacity: [0.03, 0.08, 0.03]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className={`absolute bottom-[-10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] bg-${color}-500/10`}
        />
    </div>
));

const TypewriterDialogue = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    
    useEffect(() => {
        setDisplayedText("");
        let i = 0;
        const interval = setInterval(() => {
            if (i <= text.length) {
                setDisplayedText(text.slice(0, i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 30);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span className="relative">
            {displayedText}
            <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-1 h-3 md:w-1.5 md:h-5 bg-lime-400 ml-1 translate-y-0.5"
            />
        </span>
    );
};

const missions = [
    {
        id: "prologue",
        label: "01",
        title: "The Overwhelm",
        icon: Target,
        mood: "thinking" as LoopyMood,
        accent: "cyan",
        dialogue: "So many tabs. No meaningful progress.",
        headline: "LOST IN THE NOISE.",
        description: "95% of us quit because traditional learning is a sterile, lonely void. I don't need another dictionary; I need a map."
    },
    {
        id: "the-grind",
        label: "02",
        title: "The Wall",
        icon: Swords,
        mood: "annoyed" as LoopyMood,
        accent: "red",
        dialogue: "I'm stuck. Tutorial hell is real.",
        headline: "TUTORIAL HELL.",
        description: "Passive consumption is a trap that feels like progress. I'm ready to stop watching and start fighting for my mastery."
    },
    {
        id: "the-solution",
        label: "03",
        title: "The Spark",
        icon: Cpu,
        mood: "surprised" as LoopyMood,
        accent: "amber",
        dialogue: "Finally, this feels like real building.",
        headline: "THE ENGINE ALIGNS.",
        description: "Visceral feedback, multiplayer guilds, and AI tutors. Finally, a platform that speaks the language of my ambition."
    },
    {
        id: "epilogue",
        label: "04",
        title: "The Legend",
        icon: Rocket,
        mood: "celebrating" as LoopyMood,
        accent: "lime",
        dialogue: "I am ready. Let's play now.",
        headline: "LEVEL 01 AWAITS.",
        description: "Don't just learn to code. Conquer the loop. My journey into the engineering elite starts right here."
    }
];

export default function ManifestoPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleTabChange = useCallback((idx: number) => {
        if (idx === activeTab) return;
        soundManager.playClick(0.5);
        setIsTransitioning(true);
        setActiveTab(idx);
        setTimeout(() => setIsTransitioning(false), 400);
    }, [activeTab]);

    if (!isMounted) return null;

    const currentMission = missions[activeTab];

    return (
        <div className="h-full w-full relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
            
            <BackgroundDecoration color={currentMission.accent} />

            {/* THE INFINITE STAGE */}
            <div className="w-full max-w-7xl relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
                
                {/* LEFT: THE CHARACTER (DE-BOXED) */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative order-2 lg:order-1 shrink-0"
                >
                    <div className="relative group">
                        {/* Character Aura */}
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className={`absolute inset-0 blur-[60px] rounded-full bg-${currentMission.accent}-400/30 scale-150`}
                        />
                        
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10"
                        >
                            <LoopyMascot size={isMounted ? (window.innerWidth < 768 ? 160 : window.innerWidth < 1024 ? 240 : 380) : 380} mood={currentMission.mood} />
                        </motion.div>

                        {/* Speech Bubble (Open Style) */}
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute -top-24 left-1/2 -translate-x-1/2 md:-top-20 md:-right-20 md:left-auto md:translate-x-0 z-20 w-max"
                        >
                            <div className="bg-white border-2 md:border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-[4px_4px_0_0_#000] md:shadow-[8px_8px_0_0_#000] max-w-[200px] md:max-w-[280px]">
                                <div className="text-[8px] md:text-xs font-black uppercase tracking-widest mb-2 text-zinc-400">User Emotion</div>
                                <p className="font-black text-[10px] md:text-lg leading-tight italic">
                                    "<TypewriterDialogue text={currentMission.dialogue} />"
                                </p>
                                {/* Bubble Pointer */}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 w-3 h-3 md:w-4 md:h-4 bg-white border-r-2 md:border-r-4 border-b-2 md:border-b-4 border-black rotate-45" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* RIGHT: THE CONTENT (SPACIOUS) */}
                <div className="flex-1 order-1 lg:order-2 text-center lg:text-left w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="space-y-4 md:space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 md:gap-3 bg-black text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">
                                <Activity size={12} className="text-lime-400" />
                                Mission {currentMission.label}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-[7rem] font-black uppercase tracking-tighter leading-[0.9] md:leading-[0.85] text-black">
                                {currentMission.headline.split(' ').map((word, i) => (
                                    <span key={i} className={i === 1 ? `text-${currentMission.accent}-500` : ""}>
                                        {word}{" "}<br className="hidden md:block" />
                                    </span>
                                ))}
                            </h1>

                            <p className="text-base md:text-2xl lg:text-3xl font-bold text-zinc-500 max-w-2xl mx-auto lg:mx-0 leading-tight">
                                {currentMission.description}
                            </p>

                            {activeTab === 3 && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="pt-4 md:pt-8"
                                >
                                    <Link href="/signup">
                                        <button className="bg-lime-400 border-2 md:border-4 border-black px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-[2rem] text-xl md:text-3xl font-black uppercase tracking-tighter shadow-[6px_6px_0_0_#000] md:shadow-[12px_12px_0_0_#000] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                                            Start Quest
                                        </button>
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* MINIMALIST HUD NAVIGATION */}
            <div className="fixed bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4 md:gap-6">
                <div className="bg-white/40 backdrop-blur-xl border border-black/10 p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] flex gap-2 md:gap-3 shadow-2xl">
                    {missions.map((m, idx) => {
                        const bgColors: Record<string, string> = {
                            cyan: "bg-cyan-400",
                            red: "bg-red-400",
                            amber: "bg-amber-400",
                            lime: "bg-lime-400"
                        };
                        const activeBg = bgColors[m.accent] || "bg-black";

                        return (
                            <button
                                key={m.id}
                                onClick={() => handleTabChange(idx)}
                                className={`
                                    relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-[1.5rem] flex items-center justify-center transition-all group
                                    ${activeTab === idx 
                                        ? `${activeBg} text-black scale-110 shadow-lg` 
                                        : "bg-white/50 text-zinc-400 hover:bg-white hover:text-black hover:scale-105"}
                                `}
                            >
                                <m.icon size={isMounted ? (window.innerWidth < 768 ? 18 : 24) : 24} className={activeTab === idx ? "text-black" : ""} />
                                {activeTab === idx && (
                                    <motion.div 
                                        layoutId="hud-active"
                                        className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-4 md:h-4 bg-black border md:border-2 border-white rounded-full"
                                    />
                                )}
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        {m.title}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                
                <div className="flex items-center gap-2 text-zinc-400 font-black text-[10px] uppercase tracking-[0.4em] opacity-50">
                    <Star size={12} /> The Eternal Loop <Star size={12} />
                </div>
            </div>

            {/* TRANSITION OVERLAY (SCANLINES) */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.05 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black pointer-events-none flex items-center justify-center"
                    >
                        <div className="text-white font-mono text-4xl font-black uppercase animate-pulse">Loading Mission...</div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
