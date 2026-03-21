"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { STORY_CHAPTERS, StoryChapter, StoryChoice } from "@/lib/loopy-story";
import { SVGSynthDragon, SVGSlime, SVGGarbageKing, SVGSyntaxTree } from "@/components/loopy/StoryAssets";
import { Shield, Sparkles, Terminal, ChevronRight, Zap } from "lucide-react";

// Beautiful Backgrounds
const EnvironmentSVGs = {
    forest_dusk: () => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="60%" stopColor="#064e3b" />
                    <stop offset="100%" stopColor="#022c22" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#forestSky)" />
            {/* Silhouetted Trees - Deep parallax */}
            <path d="M 100 500 L 150 200 L 200 500 Z" fill="#042f2e" opacity="0.6" />
            <path d="M 300 500 L 400 150 L 500 500 Z" fill="#042f2e" opacity="0.4" />
            <path d="M 800 500 L 850 100 L 950 500 Z" fill="#042f2e" opacity="0.5" />
            
            {/* Foreground Trees */}
            <path d="M 0 500 L 50 100 L 100 500 Z" fill="#020617" opacity="0.9" />
            <path d="M 600 500 L 700 80 L 800 500 Z" fill="#020617" opacity="0.9" />
            
            {/* Fireflies Grid */}
            <circle cx="200" cy="300" r="4" fill="#6ee7b7" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="800" cy="250" r="5" fill="#34d399" className="animate-ping" style={{ animationDuration: '4s' }} />
            <circle cx="500" cy="400" r="3" fill="#6ee7b7" className="animate-ping" style={{ animationDuration: '2s' }} />
        </svg>
    ),
    neon_cave: () => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <rect width="100%" height="100%" fill="#1e1b4b" />
            {/* Glowing Crystal Formations */}
            <path d="M 0 0 L 200 150 L 300 50 L 400 200 L 700 0 Z" fill="#312e81" opacity="0.7" />
            <path d="M 400 0 L 500 300 L 800 100 L 1000 200 L 1000 0 Z" fill="#2e1065" opacity="0.6" />
            
            {/* Foreground jagged rocks */}
            <path d="M 0 500 L 150 300 L 300 500 Z" fill="#0f172a" />
            <path d="M 700 500 L 850 250 L 1000 500 Z" fill="#0f172a" />

            <path d="M 150 300 L 170 200 L 200 350 Z" fill="#c084fc" className="filter drop-shadow-[0_0_20px_#a855f7]" opacity="0.8" />
            <path d="M 850 250 L 870 150 L 900 300 Z" fill="#c084fc" className="filter drop-shadow-[0_0_20px_#a855f7]" opacity="0.8" />
        </svg>
    ),
    cyber_castle: () => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#450a0a" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#cyberSky)" />
            
            {/* Tron-like grid floor */}
            <path d="M 0 500 L 400 300 L 600 300 L 1000 500 Z" fill="#7f1d1d" opacity="0.3" />
            
            {/* Castle Pillars */}
            <rect x="200" y="100" width="80" height="400" fill="#2a0000" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
            <rect x="720" y="100" width="80" height="400" fill="#2a0000" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
            <rect x="400" y="50" width="200" height="250" fill="#1a0000" stroke="#fca5a5" strokeWidth="3" className="filter drop-shadow-[0_0_15px_#ef4444]" />
            <circle cx="500" cy="150" r="40" fill="#000" stroke="#ef4444" strokeWidth="4" />
        </svg>
    ),
    void_abyss: () => (
        <div className="w-full h-full bg-black">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        </div>
    )
};

const EnemyMap = {
    slime: SVGSlime,
    dragon: SVGSynthDragon,
    tree: SVGSyntaxTree,
    king: SVGGarbageKing
};

export default function LoopyStoryPage() {
    const router = useRouter();
    const [chapterId, setChapterId] = useState("chap_1");
    const [xp, setXp] = useState(120);

    const chapter = STORY_CHAPTERS[chapterId] || STORY_CHAPTERS["chap_1"];
    const EnvSvg = EnvironmentSVGs[chapter.svgBackground as keyof typeof EnvironmentSVGs] || EnvironmentSVGs.forest_dusk;
    const EnemyComponent = chapter.enemySvg ? EnemyMap[chapter.enemySvg] : null;

    const handleChoice = (choice: StoryChoice) => {
        if (choice.nextChapterId === "home") {
            router.push("/loopy");
            return;
        }
        if (choice.xpReward) {
            setXp(prev => prev + choice.xpReward!);
        }
        setChapterId(choice.nextChapterId);
    };

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-[#050505] font-sans overflow-hidden relative">
            
            {/* Header overlay */}
            <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-30">
                <button onClick={() => router.push('/loopy')} className="text-white/40 hover:text-white font-bold transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-sm">
                    Escape Terminal
                </button>
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)] backdrop-blur-md">
                    <Sparkles size={14} />
                    {xp} XP
                </div>
            </header>

            {/* Top Half: Cinematic SVG Engine */}
            <div className="flex-1 relative overflow-hidden bg-black flex items-end justify-center pb-10">
                
                {/* Background Environment */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={chapter.svgBackground}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <EnvSvg />
                            {/* Cinematic Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/60 pointer-events-none" />
                        </motion.div>
                    </AnimatePresence>
                </div>
                
                {/* The Stage */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex justify-between items-end px-4 md:px-16 h-full">
                    
                    {/* The Protagonist: Loopy */}
                    <motion.div
                        key={"loopy" + chapter.loopyMood}
                        initial={{ x: -50, opacity: 0, scale: 0.9 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                        className="w-40 md:w-64 h-40 md:h-64 drop-shadow-2xl flex items-end justify-center origin-bottom z-20"
                    >
                        <div className="scale-[1.2] md:scale-[1.5] origin-bottom mb-4">
                            <LoopyMascot 
                                size={140} 
                                mood={chapter.loopyMood} 
                                hasCrown={true} 
                                hasSword={chapter.loopyMood === 'warrior'} 
                            />
                        </div>
                    </motion.div>

                    {/* The Enemy/Prop */}
                    <AnimatePresence mode="wait">
                        {EnemyComponent && (
                            <motion.div
                                key={"enemy" + chapter.enemySvg}
                                initial={{ x: 50, opacity: 0, scale: 0.8 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                exit={{ x: 50, opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                                className="w-56 md:w-80 h-56 md:h-80 drop-shadow-2xl flex items-end justify-center z-10 mb-8"
                            >
                                <EnemyComponent />
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* Bottom Half: Narrative & Interactive UI */}
            <div className="bg-[#050505] relative z-20 border-t border-white/10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,1)] px-4 py-8 md:px-12 md:py-10 flex flex-col shrink-0 min-h-[45dvh]">
                
                <div className="max-w-4xl mx-auto w-full flex flex-col h-full gap-8">
                    
                    {/* Story Dialogue Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={"desc" + chapter.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <h2 className="text-amber-500 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 flex items-center gap-2">
                                <Shield size={16} className="text-amber-400" />
                                {chapter.title}
                            </h2>
                            <p className="text-slate-200 text-lg md:text-2xl font-serif italic leading-relaxed md:leading-loose">
                                "{chapter.description}"
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Gamified Action Interface */}
                    <div className="flex-1 flex items-end">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={"choices" + chapter.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="w-full"
                            >
                                {/* Card Layout (The Attack Menu) */}
                                {chapter.choices[0]?.widgetType === 'card' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                        {chapter.choices.map((choice, idx) => (
                                            <button 
                                                key={choice.id}
                                                onClick={() => handleChoice(choice)}
                                                className={`group relative bg-zinc-900 border-2 rounded-2xl p-6 text-left transition-all hover:-translate-y-1 overflow-hidden flex flex-col justify-between h-36 md:h-40
                                                    ${idx === 0 ? "border-amber-500/30 hover:border-amber-400 hover:shadow-[0_15px_40px_-10px_rgba(245,158,11,0.3)] bg-gradient-to-br from-zinc-900 to-amber-950/20" 
                                                                : "border-zinc-700/50 hover:border-emerald-500/60 hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.2)] bg-gradient-to-br from-zinc-900 to-emerald-950/10"}
                                                `}
                                            >
                                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 blur-2xl transition-opacity group-hover:opacity-30 ${idx === 0 ? "bg-amber-400" : "bg-emerald-400"}`} />
                                                
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                        <Zap size={20} className={idx === 0 ? "fill-amber-400/50" : ""} />
                                                    </div>
                                                    <span className="text-slate-100 font-bold text-lg md:text-xl leading-snug">{choice.label}</span>
                                                </div>
                                                
                                                {choice.xpReward && (
                                                    <span className={`font-mono text-sm font-black self-end uppercase ${idx === 0 ? "text-amber-500" : "text-emerald-500"}`}>
                                                        + {choice.xpReward} XP
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Next Dialogue Array Layout */}
                                {chapter.choices[0]?.widgetType === 'dialogue_next' && (
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => handleChoice(chapter.choices[0])}
                                            className="bg-white hover:bg-zinc-200 text-black font-black py-4 px-8 rounded-full transition-all shadow-xl active:scale-95 flex items-center gap-3 group"
                                        >
                                            {chapter.choices[0].label}
                                            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {/* Standard Button Layout  */}
                                {chapter.choices[0]?.widgetType === 'button' && (
                                    <div className="flex flex-col gap-4">
                                        {chapter.choices.map(choice => (
                                            <button 
                                                key={choice.id}
                                                onClick={() => handleChoice(choice)}
                                                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-lg active:scale-95 text-center flex items-center justify-center text-lg"
                                            >
                                                {choice.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Terminal Hack Widget */}
                                {chapter.choices[0]?.widgetType === 'terminal_hack' && (
                                    <div className="w-full bg-[#0d1627] border-2 border-blue-500/30 rounded-2xl p-6 font-mono font-medium shadow-[0_0_40px_-10px_rgba(37,99,235,0.2)]">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2 text-xs text-blue-400/80">
                                                <Terminal size={16} /> <span className="uppercase tracking-widest">SYSTEM OVERRIDE</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">~/$</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Type override sequence..." 
                                                    className="w-full bg-black/60 border border-blue-500/30 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-blue-400 focus:shadow-[0_0_20px_-5px_rgba(96,165,250,0.4)] transition-all placeholder:text-blue-500/30 text-blue-100"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleChoice(chapter.choices[0])}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-black tracking-wider px-8 py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(37,99,235,0.6)] transition-all active:scale-95 shrink-0"
                                            >
                                                EXECUTE
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
