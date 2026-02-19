"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Network, Sparkles, ArrowRight } from "lucide-react";
import PorcelainShell from "@/components/practice/PorcelainShell";
import GamifiedPath from "@/components/roadmap/GamifiedPath";
import TechnicalGraph from "@/components/roadmap/TechnicalGraph";

type ViewMode = "gamified" | "technical";

export default function RoadmapPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("gamified");

    return (
        <PorcelainShell
            title="Your Learning Roadmap"
            description="Follow your path or explore new territories"
        >
            {/* View Toggle */}
            <div className="flex justify-center mb-6 md:mb-8 sticky top-0 z-20 py-2 bg-surface/80 backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent">
                <div className="bg-zinc-100/80 backdrop-blur-md p-1.5 rounded-2xl shadow-inner border border-zinc-200/50 inline-flex relative w-full md:w-auto">
                    {(["gamified", "technical"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`
                                relative flex-1 md:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-colors duration-200
                                ${viewMode === mode ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}
                            `}
                        >
                            {viewMode === mode && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-lime-400 rounded-xl shadow-lg shadow-lime-400/20 border border-lime-500"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} // Faster transition
                                />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {mode === "gamified" ? <Map size={16} /> : <Network size={16} />}
                                {mode === "gamified" ? "Gamified Path" : "Technical Graph"}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Views */}
            <AnimatePresence mode="wait">
                {viewMode === "gamified" ? (
                    <motion.div
                        key="gamified"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }} // Simplified transition
                    >
                        <GamifiedPath />
                    </motion.div>
                ) : (
                    <motion.div
                        key="technical"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }} // Simplified transition
                    >
                        <TechnicalGraph />
                    </motion.div>
                )}
            </AnimatePresence>
        </PorcelainShell>
    );
}
