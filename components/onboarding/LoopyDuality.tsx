"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Shield, Target, Cpu, MessageSquare } from "lucide-react";

export const LoopyDuality = () => {
    const [mode, setMode] = useState<"helpful" | "gamified">("helpful");

    return (
        <section className="py-24 md:py-40 px-8 bg-white overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col items-center text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full mb-8 shadow-xl">
                        <Cpu size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 italic">AI Sentinel Protocol</span>
                    </div>
                    <h2 className="text-[clamp(3rem,8vw,8rem)] font-black tracking-tighter mb-12 leading-none">
                        THE DUALITY OF <br />
                        <span className="text-primary italic italic">LOOPY AI.</span>
                    </h2>

                    {/* The Toggle Interface */}
                    <div className="flex items-center gap-3 md:gap-6 bg-zinc-100 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-zinc-200 shadow-inner relative z-20 scale-90 md:scale-110">
                        <button
                            onClick={() => setMode("helpful")}
                            className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${mode === "helpful" ? "bg-white text-zinc-900 shadow-xl" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                            Helpful Architect
                        </button>
                        <button
                            onClick={() => setMode("gamified")}
                            className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${mode === "gamified" ? "bg-zinc-900 text-primary shadow-xl" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                            Gamified Sentinel
                        </button>
                    </div>
                </div>

                <div className="relative h-auto lg:h-[600px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {mode === "helpful" ? (
                            <motion.div
                                key="helpful"
                                initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 1.1, rotateY: 20 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full"
                            >
                                <div className="order-2 lg:order-1">
                                    <div className="space-y-8">
                                        <DualityFeature
                                            icon={<Shield className="text-blue-500" />}
                                            title="Structural Integrity"
                                            desc="Focuses on code quality, design patterns, and clean architecture. Loopy acts as a steady hand for your production builds."
                                        />
                                        <DualityFeature
                                            icon={<Target className="text-emerald-500" />}
                                            title="Growth Roadmaps"
                                            desc="Generates logically sequenced paths through the Web Dev or DSA tracks based on your current performance metrics."
                                        />
                                    </div>
                                </div>
                                <div className="order-1 lg:order-2 flex justify-center">
                                    <div className="w-64 h-64 md:w-80 md:h-80 bg-zinc-900 rounded-[2.5rem] md:rounded-[3rem] shadow-3xl flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
                                        <Sparkles className="w-20 h-20 md:w-32 md:h-32 text-primary animate-pulse" />
                                        <div className="absolute bottom-6 font-mono text-[8px] md:text-[10px] text-zinc-500 tracking-widest uppercase">MODE: ARCHITECT_SYNCHRONIZED</div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="gamified"
                                initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 1.1, rotateY: -20 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full"
                            >
                                <div className="flex justify-center">
                                    <div className="w-64 h-64 md:w-80 md:h-80 bg-primary rounded-[2.5rem] md:rounded-[3rem] shadow-glow-primary flex items-center justify-center relative overflow-hidden group border-b-[8px] md:border-b-[12px] border-zinc-900/20 active:border-b-0">
                                        <Zap className="w-24 h-24 md:w-32 md:h-32 text-zinc-900 animate-bounce active:scale-95 transition-transform" />
                                        <div className="absolute bottom-6 font-mono text-[8px] md:text-[10px] text-zinc-900/40 tracking-widest uppercase font-black">MODE: SENTINEL_AGGRESSIVE</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="space-y-8">
                                        <DualityFeature
                                            icon={<Zap className="text-primary" />}
                                            title="XP Aggregator"
                                            desc="Gamified Loopy pushes for streaks, double-XP events, and relentless technical mastery. No time for logic-lag."
                                        />
                                        <DualityFeature
                                            icon={<MessageSquare className="text-primary" />}
                                            title="The Challenge Engine"
                                            desc="Active prompts, 5-minute sprints, and technical 'boss battles' that force your logic to its absolute breaking point."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

function DualityFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="group">
            <div className="flex items-center gap-6 mb-4">
                <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                    {icon}
                </div>
                <h4 className="text-3xl font-black tracking-tighter text-zinc-900">{title}</h4>
            </div>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed pl-18 border-l-4 border-zinc-100 italic">
                {desc}
            </p>
        </div>
    );
}
