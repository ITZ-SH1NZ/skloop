"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Settings, RotateCcw } from "lucide-react";
import { DSA_DATA, Algorithm } from "@/lib/dsa-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SortingVisualizer } from "@/components/dsa/visualizers/SortingVisualizer";
import { StructureVisualizer } from "@/components/dsa/visualizers/StructureVisualizer";
import { GraphVisualizer } from "@/components/dsa/visualizers/GraphVisualizer";
import { TreeVisualizer } from "@/components/dsa/visualizers/TreeVisualizer";
import { DPVisualizer } from "@/components/dsa/visualizers/DPVisualizer";
import { StringVisualizer } from "@/components/dsa/visualizers/StringVisualizer";
import { MathVisualizer } from "@/components/dsa/visualizers/MathVisualizer";


export default function DSADetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params in React 19
    const resolvedParams = use(params);
    const algorithm = DSA_DATA.find((a) => a.id === resolvedParams.id);

    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [resetKey, setResetKey] = useState(0); // bump to force remount visualizer
    const [activeLang, setActiveLang] = useState<keyof Algorithm['implementations']>('python');

    if (!algorithm) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <ArrowLeft className="w-8 h-8 text-zinc-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Algorithm Not Found</h1>
                <p className="text-zinc-500 mb-6">The visualizer you're looking for doesn't exist.</p>
                <Link href="/dsa" className="px-6 py-2 bg-black text-primary font-bold rounded-full">
                    Return to Library
                </Link>
            </div>
        );
    }

    // Determine which visualizer to use based on category
    const renderVisualizer = () => {
        const props = {
            algorithmId: algorithm.id,
            isPlaying,
            speed,
            onSimulationComplete: () => setIsPlaying(false)
        };

        switch (algorithm.category) {
            case "Sorting":
                return <SortingVisualizer key={resetKey} {...props} />;
            case "Trees":
                return <TreeVisualizer key={resetKey} {...props} />;
            case "Graphs":
                return <GraphVisualizer key={resetKey} {...props} />;
            case "Linear":
                return <StructureVisualizer key={resetKey} {...props} />;
            case "Dynamic Programming":
                return <DPVisualizer key={resetKey} {...props} />;
            case "Math":
                return <MathVisualizer key={resetKey} {...props} />;
            case "String":
                return <StringVisualizer key={resetKey} {...props} />;
            default:
                return <StructureVisualizer key={resetKey} {...props} />;
        }
    };

    const formatText = (text: string) => {
        if (!text) return null;
        // The Python script may have generated literal '\n' characters. We split by both literal '\n' and actual newlines.
        return text.split(/\\n|\n/).map((line, i) => (
            <span key={i} className="block min-h-[1em]">
                {line}
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col pt-[calc(4rem+env(safe-area-inset-top,0px))] md:pt-0">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-zinc-100 px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dsa" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-zinc-900" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 hidden md:block">{algorithm.title}</h1>
                            <div className="hidden md:flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200" title="Time Complexity">
                                    ⏱ {algorithm.timeComplexity}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200" title="Space Complexity">
                                    💾 {algorithm.spaceComplexity}
                                </span>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-zinc-500">{algorithm.category} • {algorithm.difficulty}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Side: Visualizer Area (Takes priority on up to desktop) */}
                <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 relative bg-zinc-50">
                    
                    {/* Visualizer Canvas */}
                    <div className="flex-1 relative overflow-hidden">
                        {renderVisualizer()}
                    </div>

                    {/* Bottom Control Bar - "Bottom Sheet" style on mobile */}
                    <div className="bg-white border-t border-zinc-100 p-4 md:px-8 md:py-6 relative z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            
                            {/* Playback Controls */}
                            <div className="flex items-center gap-2 md:gap-4 bg-zinc-50 rounded-full p-1.5 border border-zinc-200 shadow-sm w-full md:w-auto justify-center">
                                <button 
                                    className="p-2 md:p-3 rounded-full hover:bg-white hover:shadow-sm text-zinc-700 transition-all active:scale-95"
                                    onClick={() => {
                                        setIsPlaying(false);
                                        setResetKey(k => k + 1); // remount visualizer = clean reset
                                    }}
                                >
                                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button 
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-primary"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-black" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-black ml-1" />}
                                </button>
                                <button className="p-2 md:p-3 rounded-full text-zinc-300 transition-all cursor-not-allowed">
                                    <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>

                            {/* Speed Slider */}
                            <div className="flex items-center gap-4 flex-1 w-full px-4 md:px-0 opacity-100">
                                <span className="text-xs font-semibold text-zinc-400 w-10">Slow</span>
                                <input 
                                    type="range" 
                                    min="1" max="100" 
                                    value={speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-xs font-semibold text-zinc-400 w-10">Fast</span>
                            </div>
                            
                        </div>
                    </div>
                </div>

                {/* Right Side: Educational Content (Scrollable) */}
                <div className="w-full lg:w-[450px] xl:w-[500px] border-l border-zinc-100 bg-white flex flex-col h-[50dvh] lg:h-auto overflow-hidden">
                    
                    {/* Tabs */}
                    <div className="flex whitespace-nowrap overflow-x-auto hide-scrollbar border-b border-zinc-100 p-2">
                        {['python', 'javascript', 'java', 'cpp', 'c'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang as keyof Algorithm['implementations'])}
                                className={cn(
                                    "px-4 py-2 text-sm font-semibold rounded-lg transition-colors capitalize",
                                    activeLang === lang 
                                        ? "bg-zinc-100 text-zinc-900" 
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                )}
                            >
                                {lang === 'cpp' ? 'C++' : lang}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Explanation */}
                        <section>
                            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                How it works
                            </h2>
                            <div className="text-zinc-600 leading-relaxed text-sm md:text-base">
                                {formatText(algorithm.description)}
                            </div>
                        </section>

                        {/* Code Implementations */}
                        <section className="space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pseudocode</h3>
                                <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl overflow-x-auto text-xs md:text-sm font-mono leading-relaxed border border-zinc-800 shadow-inner">
                                    <code>{formatText(algorithm.pseudocode)}</code>
                                </pre>
                            </div>
                            
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeLang}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Implementation</h3>
                                    <pre className="bg-zinc-50 text-zinc-900 p-4 rounded-xl overflow-x-auto text-xs md:text-sm font-mono leading-relaxed border border-zinc-200">
                                        <code>{formatText(algorithm.implementations[activeLang])}</code>
                                    </pre>
                                </motion.div>
                            </AnimatePresence>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
