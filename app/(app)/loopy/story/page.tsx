"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { CHAPTER_1, StoryChapter, StoryChoice, InventoryItem } from "@/lib/loopy-story";
import { EnemyComponentMap, EnvironmentSVGs } from "@/components/loopy/StoryAssets";
import { TerminalEnigma, CodePatch, CircuitBreaker, DataRouter, MemoryPulse, BinaryFlip, SignalLock, GlitchHunter, EnergySurge } from "@/components/loopy/MinigameEngines";
import { Sparkles, ChevronRight, Zap, Loader2, Heart, Backpack, SkipForward } from "lucide-react";

type HistoryEntry = { title: string; choice: string; wasRisky: boolean };

export default function LoopyStoryPage() {
    const router = useRouter();
    const [chapter, setChapter] = useState<StoryChapter>(CHAPTER_1);
    const [xp, setXp] = useState(0);
    const [health, setHealth] = useState(3);
    const [maxHealth, setMaxHealth] = useState(3);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [chapterNumber, setChapterNumber] = useState(1);
    const [cycleDecisions, setCycleDecisions] = useState<string[]>([]);
    
    const [isGameOver, setIsGameOver] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

    // Loopy Glitch State
    const [isGlitching, setIsGlitching] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const glitchTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial load of checkpoint
    useEffect(() => {
        setIsMounted(true);
        const loadCheckpoint = async () => {
            try {
                const res = await fetch("/api/loopy-story/checkpoint");
                const data = await res.json();
                if (data.checkpoint) {
                    setChapter(data.checkpoint.current_chapter_data);
                    setHistory(data.checkpoint.history);
                    setCycleDecisions(data.checkpoint.cycle_decisions);
                    setChapterNumber(data.checkpoint.chapter_number);
                    setXp(data.checkpoint.xp || 0);
                    setHealth(data.checkpoint.health || 3);
                    setMaxHealth(data.checkpoint.max_health || 3);
                    setInventory(data.checkpoint.inventory || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsInitializing(false);
            }
        };
        loadCheckpoint();

        return () => {
            if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
        };
    }, []);

    // Random glitch effect that increases in frequency with deeper chapters
    useEffect(() => {
        if (!isMounted || chapterNumber < 5 || isInitializing) return;

        const scheduleGlitch = () => {
            const baseInterval = Math.max(2000, 10000 - (chapterNumber * 500));
            const randomDelay = baseInterval + Math.random() * 4000;

            glitchTimerRef.current = setTimeout(() => {
                setIsGlitching(true);
                setTimeout(() => {
                    if (isMounted) setIsGlitching(false);
                    scheduleGlitch();
                }, 150 + Math.random() * 150);
            }, randomDelay);
        };

        scheduleGlitch();

        return () => {
            if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
        };
    }, [chapterNumber, isMounted, isInitializing]);

    // Derived corrupted text rendering
    const getCorruptedText = (text: string, forceCorrupt = false) => {
        if (!isMounted || (chapterNumber < 5 && !forceCorrupt)) return text;
        const corruptionChance = Math.min(0.15, (chapterNumber - 4) * 0.02);
        
        let corrupted = text.split('').map(char => {
            if (char === ' ' || char === '\n') return char;
            return Math.random() < corruptionChance ? '▒' : char;
        }).join('');

        if (Math.random() < (corruptionChance * 2)) {
            const anomalies = [' null', ' undefined', ' [OBJECT_ORPHANED]', ' NaN'];
            corrupted += anomalies[Math.floor(Math.random() * anomalies.length)];
        }
        return corrupted;
    };

    const EnvComponent = EnvironmentSVGs[chapter.svgBackground] || EnvironmentSVGs.forest_dusk;
    const EnemyComponent = chapter.enemySvg ? EnemyComponentMap[chapter.enemySvg] : null;
    const enemyVariant = chapter.enemyVariant || "normal";

    const handleChoice = useCallback(async (choice: StoryChoice) => {
        if (choice.nextChapterId === "home") { router.push("/loopy"); return; }

        setIsLoading(true);

        const allRewards = chapter.choices.map(c => c.xpReward || 0);
        const maxReward = Math.max(...allRewards);
        const wasRisky = (choice.xpReward || 0) < maxReward;

        let newHealth = health;
        if (wasRisky) {
            newHealth = Math.max(0, health - 1);
            setHealth(newHealth);
        }

        if (newHealth <= 0) {
            setIsGameOver(true);
            setIsLoading(false);
            return;
        }

        const newXp = xp + (choice.xpReward || 0);
        setXp(newXp);

        const newInventory = [...inventory];
        if (chapter.grantedItem && !inventory.find(i => i.id === chapter.grantedItem!.id)) {
            newInventory.push(chapter.grantedItem);
            setInventory(newInventory);
        }

        const newHistory: HistoryEntry = {
            title: chapter.title,
            choice: choice.label,
            wasRisky,
        };

        let newCycleDecisions = cycleDecisions;
        if (wasRisky) {
            newCycleDecisions = [...cycleDecisions, `Chose ${choice.label} at ${chapter.title}`];
            setCycleDecisions(newCycleDecisions);
        }

        try {
            const res = await fetch("/api/loopy-story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nextChapterId: choice.nextChapterId,
                    lastChoice: { label: choice.label, chapterTitle: chapter.title, chapterDescription: chapter.description, wasRisky },
                    history: [...history, newHistory],
                    chapterNumber: chapterNumber + 1,
                    cycleDecisions: newCycleDecisions,
                    xp: newXp,
                    health: newHealth,
                    maxHealth: maxHealth,
                    inventory: newInventory
                }),
            });

            if (!res.ok) throw new Error("API failed");
            const data = await res.json();

            setChapter(data.chapter);
            setHistory(prev => [...prev, newHistory]);
            setChapterNumber(prev => prev + 1);

            // Handle death / Reset
            if (newHealth <= 0 && data.chapter?.id !== "death_screen") {
                // You could explicitly overwrite the chapter returned with a "Game Over" layout.
                // For now, let the AI's narrative dictate player death.
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [chapter, history, chapterNumber, cycleDecisions, health, xp, inventory, maxHealth, router]);

    // Helpers to quickly map choices to win/loss handlers for Minigames
    const getWinChoice = () => chapter.choices.find(c => !c.isRisky) ?? chapter.choices[0];
    const getFailChoice = () => chapter.choices.find(c => c.isRisky) ?? chapter.choices[1] ?? chapter.choices[0];

    const handleRestart = async () => {
        await fetch("/api/loopy-story/checkpoint", { method: "DELETE" });
        setChapter(CHAPTER_1);
        setHealth(3); setXp(0); setHistory([]);
        setChapterNumber(1); setCycleDecisions([]);
        setInventory([]); setIsGameOver(false);
    };

    if (isInitializing) {
        return (
            <div className="flex h-[100dvh] w-full bg-[#050505] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-white/30" size={40} />
                    <p className="text-white/30 font-mono tracking-widest text-sm">INITIALIZING SYSTEM MEMORY...</p>
                </div>
            </div>
        );
    }

    const winChoice = getWinChoice();
    const failChoice = getFailChoice();

    // ── Lore Scene (full-screen cinematic) ────────────────────────────────────
    if (chapter.isLoreScene) {
        const EnvBg = EnvironmentSVGs[chapter.svgBackground] || EnvironmentSVGs.corrupted_blank;
        return (
            <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-between p-6 md:p-14 z-[200]">
                {/* Background — heavy overlay so sidebar/chrome can't bleed through */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <EnvBg />
                    <div className="absolute inset-0 bg-black/80" />
                </div>

                {/* Loopy */}
                <div className="relative z-10 flex justify-center pt-2 md:pt-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                        className="drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                            <LoopyMascot size={80} mood={chapter.loopyMood} hasCrown />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Paragraphs — clean modern sans-serif */}
                <motion.div
                    className="relative z-10 flex flex-col items-center gap-5 md:gap-7 max-w-xl mx-auto text-center px-2"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 1.0 } } }}>
                    {(chapter.loreText || [chapter.description]).map((para, i) => (
                        <motion.p
                            key={i}
                            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="text-white/85 text-base md:text-lg lg:text-xl font-sans font-normal leading-relaxed tracking-wide">
                            {para}
                        </motion.p>
                    ))}
                </motion.div>

                {/* Continue button */}
                <motion.div
                    className="relative z-10 pb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (chapter.loreText?.length || 1) * 1.0 + 0.8, duration: 0.5 }}>
                    <button
                        onClick={() => handleChoice(chapter.choices[0])}
                        disabled={isLoading}
                        className="bg-white text-black font-semibold py-3 px-10 rounded-full transition-all active:scale-95 flex items-center gap-2.5 disabled:opacity-50 hover:bg-white/90 shadow-lg text-sm tracking-wide">
                        {isLoading ? <Loader2 size={15} className="animate-spin" /> : <SkipForward size={15} />}
                        {chapter.choices[0]?.label || "Continue"}
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-[#050505] font-sans overflow-hidden relative">

            {/* Game Over Overlay */}
            <AnimatePresence>
                {isGameOver && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center gap-6 md:gap-8 px-6">
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                            <LoopyMascot mood="huddled" size={100} hasCrown />
                        </motion.div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                            className="text-center space-y-2">
                            <h2 className="text-red-400 text-2xl md:text-3xl font-black tracking-widest uppercase drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]">
                                System Failure
                            </h2>
                            <p className="text-white/40 text-sm">Loopy&apos;s signal has gone dark.</p>
                        </motion.div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                            className="flex flex-col gap-3 w-full max-w-xs">
                            <button onClick={handleRestart}
                                className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl tracking-widest uppercase text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                                Restart
                            </button>
                            <button onClick={() => router.push("/loopy")}
                                className="border border-white/20 text-white/50 hover:text-white hover:border-white/40 py-3.5 rounded-xl text-sm transition-all active:scale-95">
                                Exit
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-30">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.push("/loopy")}
                        className="text-white/40 hover:text-white font-bold transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-sm">
                        Escape Terminal
                    </button>
                    <AnimatePresence mode="wait">
                        {confirmReset ? (
                            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-1.5">
                                <span className="text-white/50 text-xs hidden sm:block">Reset progress?</span>
                                <button onClick={() => { handleRestart(); setConfirmReset(false); }}
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95">
                                    Yes
                                </button>
                                <button onClick={() => setConfirmReset(false)}
                                    className="bg-white/10 hover:bg-white/20 text-white/60 text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95">
                                    No
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setConfirmReset(true)}
                                className="text-white/25 hover:text-red-400/70 transition-colors text-xs px-2 py-1.5"
                                title="Reset story progress">
                                Reset
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-3">
                    {/* Health Bar */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md">
                        {[...Array(maxHealth)].map((_, i) => (
                            <Heart key={i} size={14} className={i < health ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-red-500/30"} />
                        ))}
                    </div>

                    {/* Inventory Items */}
                    {inventory.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md text-indigo-300">
                            <Backpack size={14} />
                            <div className="flex gap-1">
                                {inventory.map((item, idx) => (
                                    <div key={idx} className="w-5 h-5 rounded overflow-hidden bg-indigo-500/20 flex items-center justify-center text-[10px]" title={item.name}>
                                        {item.icon || "💎"}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold backdrop-blur-md hidden sm:flex">
                            <Loader2 size={12} className="animate-spin" /> Generating...
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)] backdrop-blur-md">
                        <Sparkles size={14} />
                        {xp} XP
                    </div>
                </div>
            </header>

            {/* Top: Cinematic stage */}
            <div className="flex-1 relative overflow-hidden bg-black flex items-end justify-center pb-10">

                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={chapter.svgBackground + (chapter.backgroundTint || "")}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0">
                            <EnvComponent tint={chapter.backgroundTint} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/60 pointer-events-none" />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Stage — Loopy + Enemy */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex justify-between items-end px-4 md:px-16 h-full">

                    {/* Loopy */}
                    <motion.div key={"loopy-container-" + chapter.loopyMood}
                        initial={{ x: -50, opacity: 0, scale: 0.9 }}
                        animate={{ x: 0, opacity: isGlitching ? 0.7 : 1, scale: 1, filter: isGlitching ? 'hue-rotate(90deg) blur(2px)' : 'none' }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                        className="w-40 md:w-64 h-40 md:h-64 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-end justify-center origin-bottom z-20">
                        <motion.div 
                            animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className={`scale-[1.2] md:scale-[1.5] origin-bottom mb-4 ${isGlitching ? 'animate-pulse' : ''}`}>
                            <LoopyMascot size={140} mood={isGlitching ? "huddled" : (chapter.loopyMood as any)} hasCrown={true}
                                hasSword={!isGlitching && chapter.loopyMood === "warrior"} />
                        </motion.div>
                    </motion.div>

                    {/* Enemy */}
                    <AnimatePresence mode="wait">
                        {EnemyComponent && !isLoading && (
                            <motion.div key={"enemy" + chapter.enemySvg + enemyVariant}
                                initial={{ x: 50, opacity: 0, scale: 0.8 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                exit={{ x: 50, opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                                className="w-56 md:w-80 h-56 md:h-80 drop-shadow-2xl flex items-end justify-center z-10 mb-8">
                                <EnemyComponent variant={enemyVariant} />
                            </motion.div>
                        )}
                        {isLoading && (
                            <motion.div key="loading-enemy"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="w-56 md:w-80 h-56 md:h-80 flex items-center justify-center z-10 mb-8">
                                <div className="flex flex-col items-center gap-4">
                                    <motion.div className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white/80"
                                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                                    <p className="text-white/30 text-xs font-mono">Loading next chapter...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom: Narrative + choices */}
            <div className="bg-[#050505] relative z-20 border-t border-white/10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,1)] px-4 py-8 md:px-12 md:py-10 flex flex-col shrink-0 min-h-[45dvh]">
                <div className="max-w-4xl mx-auto w-full flex flex-col h-full gap-8">

                    {/* Dialogue */}
                    <AnimatePresence mode="wait">
                        <motion.div key={"desc" + chapter.id + chapterNumber}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
                            className="relative">
                            <div className="relative bg-black/50 border border-white/[0.07] rounded-2xl p-5 md:p-7 backdrop-blur-xl overflow-hidden">
                                {/* Mood-tinted ambient glow */}
                                <div className={`absolute inset-0 opacity-[0.05] pointer-events-none rounded-2xl ${
                                    chapter.loopyMood === 'warrior' ? 'bg-red-500' :
                                    chapter.loopyMood === 'happy' ? 'bg-emerald-500' :
                                    chapter.loopyMood === 'huddled' ? 'bg-violet-500' : 'bg-sky-500'
                                }`} />
                                {/* Chapter meta */}
                                <div className="flex items-center gap-2.5 mb-4">
                                    <span className="font-mono text-[9px] md:text-[10px] text-white/25 tracking-[0.3em] uppercase">
                                        CH.{String(chapterNumber).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                    <span className="font-mono text-[9px] md:text-[10px] text-white/20 tracking-[0.2em] uppercase">
                                        {chapter.svgBackground.replace(/_/g, '-')}
                                    </span>
                                </div>
                                {/* Title */}
                                <h2 className="text-white font-bold text-base md:text-lg mb-3 leading-snug tracking-tight">
                                    {chapter.title}
                                </h2>
                                {/* Description */}
                                <p className="text-white/60 text-sm md:text-base leading-relaxed">
                                    {getCorruptedText(chapter.description, isGlitching)}
                                </p>
                                {/* Loopy dialogue */}
                                {chapter.loopyDialogue && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                        className="mt-4 flex items-start gap-3">
                                        <div className="w-px self-stretch bg-amber-400/25 flex-shrink-0" />
                                        <p className="text-amber-300/55 text-xs md:text-sm italic leading-relaxed">
                                            &ldquo;{chapter.loopyDialogue}&rdquo;
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Choices & Minigames Engine Render */}
                    <div className="flex-1 flex items-end">
                        <AnimatePresence mode="wait">
                            <motion.div key={"choices" + chapter.id + chapterNumber}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="w-full">

                                {/* Card layout (Standard) */}
                                {chapter.choices[0]?.widgetType === "card" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                        {chapter.choices.map((choice, idx) => (
                                            <button key={choice.id} onClick={() => handleChoice(choice)} disabled={isLoading}
                                                className={`group relative bg-zinc-900 border-2 rounded-2xl p-6 text-left transition-all hover:-translate-y-1 overflow-hidden flex flex-col justify-between h-36 md:h-40 disabled:opacity-50 disabled:cursor-not-allowed
                                                    ${idx === 0
                                                        ? "border-amber-500/30 hover:border-amber-400 hover:shadow-[0_15px_40px_-10px_rgba(245,158,11,0.3)] bg-gradient-to-br from-zinc-900 to-amber-950/20"
                                                        : "border-zinc-700/50 hover:border-emerald-500/60 hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.2)] bg-gradient-to-br from-zinc-900 to-emerald-950/10"}`}>
                                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 blur-2xl transition-opacity group-hover:opacity-30 ${idx === 0 ? "bg-amber-400" : "bg-emerald-400"}`} />
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${idx === 0 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
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

                                {/* Dialogue next (Standard) */}
                                {chapter.choices[0]?.widgetType === "dialogue_next" && (
                                    <div className="flex justify-end">
                                        <button onClick={() => handleChoice(chapter.choices[0])} disabled={isLoading}
                                            className="bg-white hover:bg-zinc-200 text-black font-black py-4 px-8 rounded-full transition-all shadow-xl active:scale-95 flex items-center gap-3 group disabled:opacity-50">
                                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                                            {chapter.choices[0].label}
                                            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {/* Button layout (Standard) */}
                                {chapter.choices[0]?.widgetType === "button" && (
                                    <div className="flex flex-col gap-4">
                                        {chapter.choices.map(choice => (
                                            <button key={choice.id} onClick={() => handleChoice(choice)} disabled={isLoading}
                                                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-lg active:scale-95 text-center flex items-center justify-center text-lg disabled:opacity-50">
                                                {choice.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* WIDGET ENGINE 1: Terminal Enigma */}
                                {chapter.choices[0]?.widgetType === "terminal_hack" && (
                                    <TerminalEnigma 
                                        puzzleData={winChoice.puzzleData} 
                                        safeChoiceLabel={winChoice.label} riskyChoiceLabel={failChoice.label}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)} 
                                    />
                                )}

                                {/* WIDGET ENGINE 2: Code Patch */}
                                {chapter.choices[0]?.widgetType === "code_patch" && (
                                    <CodePatch 
                                        puzzleData={winChoice.puzzleData} 
                                        safeChoiceLabel={winChoice.label} riskyChoiceLabel={failChoice.label}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)} 
                                    />
                                )}

                                {/* WIDGET ENGINE 3: Circuit Breaker */}
                                {chapter.choices[0]?.widgetType === "timing_strike" && (
                                    <CircuitBreaker 
                                        puzzleData={winChoice.puzzleData} 
                                        safeChoiceLabel={winChoice.label} riskyChoiceLabel={failChoice.label}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)} 
                                    />
                                )}

                                {/* WIDGET ENGINE 4: Data Router */}
                                {chapter.choices[0]?.widgetType === "node_graph" && (
                                    <DataRouter
                                        puzzleData={winChoice.puzzleData}
                                        safeChoiceLabel={winChoice.label} riskyChoiceLabel={failChoice.label}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)}
                                    />
                                )}

                                {/* WIDGET ENGINE 5: Memory Pulse */}
                                {chapter.choices[0]?.widgetType === "memory_pulse" && (
                                    <MemoryPulse
                                        puzzleData={winChoice.puzzleData}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)}
                                    />
                                )}

                                {/* WIDGET ENGINE 6: Binary Flip */}
                                {chapter.choices[0]?.widgetType === "binary_flip" && (
                                    <BinaryFlip
                                        puzzleData={winChoice.puzzleData}
                                        safeChoiceLabel={winChoice.label}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)}
                                    />
                                )}

                                {/* WIDGET ENGINE 7: Signal Lock */}
                                {chapter.choices[0]?.widgetType === "signal_lock" && (
                                    <SignalLock
                                        puzzleData={winChoice.puzzleData}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)}
                                    />
                                )}

                                {/* WIDGET ENGINE 8: Glitch Hunter */}
                                {chapter.choices[0]?.widgetType === "glitch_hunter" && (
                                    <GlitchHunter
                                        puzzleData={winChoice.puzzleData}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)}
                                    />
                                )}

                                {/* WIDGET ENGINE 9: Energy Surge */}
                                {chapter.choices[0]?.widgetType === "energy_surge" && (
                                    <EnergySurge
                                        puzzleData={winChoice.puzzleData}
                                        isLoading={isLoading}
                                        onSuccess={() => handleChoice(winChoice)} onFail={() => handleChoice(failChoice)}
                                    />
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}