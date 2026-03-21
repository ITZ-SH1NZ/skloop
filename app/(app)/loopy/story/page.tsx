"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { CHAPTER_1, StoryChapter, StoryChoice } from "@/lib/loopy-story";
import { EnemyComponentMap, EnvironmentSVGs } from "@/components/loopy/StoryAssets";
import { Shield, Sparkles, Terminal, ChevronRight, Zap, Loader2 } from "lucide-react";

type HistoryEntry = { title: string; choice: string; wasRisky: boolean };

export default function LoopyStoryPage() {
    const router = useRouter();
    const [chapter, setChapter] = useState<StoryChapter>(CHAPTER_1);
    const [xp, setXp] = useState(120);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [chapterNumber, setChapterNumber] = useState(1);

    const EnvComponent = EnvironmentSVGs[chapter.svgBackground] || EnvironmentSVGs.forest_dusk;
    const EnemyComponent = chapter.enemySvg ? EnemyComponentMap[chapter.enemySvg] : null;
    const enemyVariant = chapter.enemyVariant || "normal";

    const handleChoice = useCallback(async (choice: StoryChoice) => {
        if (choice.nextChapterId === "home") { router.push("/loopy"); return; }

        // Award XP immediately
        if (choice.xpReward) setXp(prev => prev + choice.xpReward!);

        // If it's a static chapter transition (fail states etc.) — handle locally
        if (choice.nextChapterId !== "ai_next") {
            // Legacy static chapters no longer exist, so just trigger AI
        }

        // Determine if this was the "risky" choice (lower xpReward)
        const allRewards = chapter.choices.map(c => c.xpReward || 0);
        const maxReward = Math.max(...allRewards);
        const wasRisky = (choice.xpReward || 0) < maxReward;

        const newHistory: HistoryEntry = {
            title: chapter.title,
            choice: choice.label,
            wasRisky,
        };

        setIsLoading(true);

        try {
            const res = await fetch("/api/loopy-story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lastChoice: { label: choice.label, chapterTitle: chapter.title, wasRisky },
                    history: [...history, newHistory],
                    chapterNumber: chapterNumber + 1,
                }),
            });

            if (!res.ok) throw new Error("API failed");
            const data = await res.json();

            setChapter(data.chapter);
            setHistory(prev => [...prev, newHistory]);
            setChapterNumber(prev => prev + 1);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [chapter, history, chapterNumber, router]);

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-[#050505] font-sans overflow-hidden relative">

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-30">
                <button onClick={() => router.push("/loopy")}
                    className="text-white/40 hover:text-white font-bold transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-sm">
                    Escape Terminal
                </button>
                <div className="flex items-center gap-3">
                    {isLoading && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold backdrop-blur-md">
                            <Loader2 size={12} className="animate-spin" />
                            Generating...
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
                    <motion.div key={"loopy" + chapter.loopyMood}
                        initial={{ x: -50, opacity: 0, scale: 0.9 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                        className="w-40 md:w-64 h-40 md:h-64 drop-shadow-2xl flex items-end justify-center origin-bottom z-20">
                        <div className="scale-[1.2] md:scale-[1.5] origin-bottom mb-4">
                            <LoopyMascot size={140} mood={chapter.loopyMood as any} hasCrown={true}
                                hasSword={chapter.loopyMood === "warrior"} />
                        </div>
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
                            className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <h2 className="text-amber-500 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 flex items-center gap-2">
                                <Shield size={16} className="text-amber-400" />
                                {chapter.title}
                            </h2>
                            <p className="text-slate-200 text-lg md:text-2xl font-serif italic leading-relaxed md:leading-loose">
                                &ldquo;{chapter.description}&rdquo;
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Choices */}
                    <div className="flex-1 flex items-end">
                        <AnimatePresence mode="wait">
                            <motion.div key={"choices" + chapter.id + chapterNumber}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="w-full">

                                {/* Card layout */}
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

                                {/* Dialogue next */}
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

                                {/* Button layout */}
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

                                {/* Terminal hack */}
                                {chapter.choices[0]?.widgetType === "terminal_hack" && (
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
                                            <div className="flex-1 relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">~/$</span>
                                                <input type="text" placeholder="Type override sequence..."
                                                    className="w-full bg-black/60 border border-blue-500/30 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-blue-400 transition-all placeholder:text-blue-500/30 text-blue-100" />
                                            </div>
                                            <button onClick={() => handleChoice(chapter.choices[0])} disabled={isLoading}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-black tracking-wider px-8 py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(37,99,235,0.6)] transition-all active:scale-95 shrink-0 disabled:opacity-50">
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