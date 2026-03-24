"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, Settings, ChevronRight, Bot } from "lucide-react";
import { DSA_DATA, Algorithm } from "@/lib/dsa-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SortingVisualizer, StepInfo } from "@/components/dsa/visualizers/SortingVisualizer";
import { StructureVisualizer } from "@/components/dsa/visualizers/StructureVisualizer";
import { GraphVisualizer } from "@/components/dsa/visualizers/GraphVisualizer";
import { TreeVisualizer } from "@/components/dsa/visualizers/TreeVisualizer";
import { DPVisualizer } from "@/components/dsa/visualizers/DPVisualizer";
import { StringVisualizer } from "@/components/dsa/visualizers/StringVisualizer";
import { MathVisualizer } from "@/components/dsa/visualizers/MathVisualizer";
import { DSALoopyPanel } from "@/components/dsa/DSALoopyPanel";
import { ComplexityChart } from "@/components/dsa/ComplexityChart";
import { DSASettingsPopover } from "@/components/dsa/DSASettingsPopover";

export default function DSADetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const algorithm = DSA_DATA.find((a) => a.id === resolvedParams.id);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [resetKey, setResetKey] = useState(0);

    // Feature settings
    const [stepMode, setStepMode] = useState(false);
    const [stepSignal, setStepSignal] = useState(0);
    const [soundOn, setSoundOn] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Live operation counter (updated via onStep)
    const [ops, setOps] = useState({ comparisons: 0, swaps: 0 });

    // Pseudocode active line
    const [activeLine, setActiveLine] = useState(-1);
    const [stepDesc, setStepDesc] = useState("");

    // Right-panel tabs: lang tabs + "loopy" + "complexity"
    const [activeTab, setActiveTab] = useState<"python"|"javascript"|"java"|"cpp"|"c"|"loopy"|"complexity">("python");

    const settingsRef = useRef<HTMLDivElement>(null);

    const handleStep = useCallback((info: StepInfo) => {
        setActiveLine(info.line);
        setStepDesc(info.description);
        setOps({ comparisons: info.comparisons, swaps: info.swaps });
    }, []);

    const handleReset = () => {
        setIsPlaying(false);
        setResetKey(k => k + 1);
        setOps({ comparisons: 0, swaps: 0 });
        setActiveLine(-1);
        setStepDesc("");
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't fire when typing in inputs
            if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
            if (e.code === "Space") { e.preventDefault(); setIsPlaying(p => !p); }
            else if (e.code === "KeyR") { e.preventDefault(); handleReset(); }
            else if (e.code === "KeyS") { e.preventDefault(); setStepMode(p => !p); }
            else if (e.code === "KeyN") { e.preventDefault(); if (stepMode) setStepSignal(p => p + 1); }
            else if (e.code === "KeyM") { e.preventDefault(); setSoundOn(p => !p); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [stepMode]);

    if (!algorithm) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <ArrowLeft className="w-8 h-8 text-zinc-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Algorithm Not Found</h1>
                <p className="text-zinc-500 mb-6">The visualizer you&#39;re looking for doesn&#39;t exist.</p>
                <Link href="/dsa" className="px-6 py-2 bg-black text-primary font-bold rounded-full">
                    Return to Library
                </Link>
            </div>
        );
    }

    const renderVisualizer = () => {
        const commonProps = { algorithmId: algorithm.id, isPlaying, speed, onSimulationComplete: () => setIsPlaying(false) };
        const sortingProps = { ...commonProps, onStep: handleStep, stepSignal, stepMode, soundOn };

        switch (algorithm.category) {
            case "Sorting": return <SortingVisualizer key={resetKey} {...sortingProps} />;
            case "Trees": return <TreeVisualizer key={resetKey} {...commonProps} />;
            case "Graphs": return <GraphVisualizer key={resetKey} {...commonProps} />;
            case "Linear": return <StructureVisualizer key={resetKey} {...commonProps} />;
            case "Dynamic Programming": return <DPVisualizer key={resetKey} {...commonProps} />;
            case "Math": return <MathVisualizer key={resetKey} {...commonProps} />;
            case "String": return <StringVisualizer key={resetKey} {...commonProps} />;
            default: return <StructureVisualizer key={resetKey} {...commonProps} />;
        }
    };

    // Split pseudocode into lines for line-by-line highlighting
    const pseudoLines = (algorithm.pseudocode || "").split(/\\n|\n/).filter(Boolean);

    const formatText = (text: string) => {
        if (!text) return null;
        return text.split(/\\n|\n/).map((line, i) => (
            <span key={i} className="block min-h-[1em]">{line}</span>
        ));
    };

    const LANG_TABS = ["python", "javascript", "java", "cpp", "c"] as const;

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
                                    T: {algorithm.timeComplexity}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200" title="Space Complexity">
                                    S: {algorithm.spaceComplexity}
                                </span>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-zinc-500">{algorithm.category} • {algorithm.difficulty}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Settings button */}
                    <div className="relative" ref={settingsRef}>
                        <button
                            className={cn("p-2 rounded-full transition-colors", settingsOpen ? "bg-zinc-100 text-zinc-900" : "hover:bg-zinc-100 text-zinc-600")}
                            onClick={() => setSettingsOpen(o => !o)}
                            title="Settings (S)"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <DSASettingsPopover
                            stepMode={stepMode}
                            soundOn={soundOn}
                            onStepModeToggle={() => setStepMode(p => !p)}
                            onSoundToggle={() => setSoundOn(p => !p)}
                            isOpen={settingsOpen}
                            onClose={() => setSettingsOpen(false)}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Visualizer */}
                <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 relative bg-zinc-50">

                    <div className="flex-1 relative overflow-hidden">
                        {renderVisualizer()}
                    </div>

                    {/* Control Bar */}
                    <div className="bg-white border-t border-zinc-100 p-4 md:px-8 md:py-5 relative z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        <div className="max-w-3xl mx-auto flex flex-col gap-3">
                            <div className="flex items-center gap-3 md:gap-6">
                                {/* Playback buttons */}
                                <div className="flex items-center gap-2 bg-zinc-50 rounded-full p-1.5 border border-zinc-200 shadow-sm shrink-0">
                                    <button
                                        className="p-2 md:p-2.5 rounded-full hover:bg-white hover:shadow-sm text-zinc-700 transition-all active:scale-95"
                                        onClick={handleReset}
                                        title="Reset (R)"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-primary"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        title="Play/Pause (Space)"
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                                    </button>
                                    {/* Step forward button — active only in step mode */}
                                    <button
                                        className={cn(
                                            "p-2 md:p-2.5 rounded-full transition-all active:scale-95",
                                            stepMode && isPlaying
                                                ? "hover:bg-white hover:shadow-sm text-zinc-700 cursor-pointer"
                                                : "text-zinc-300 cursor-not-allowed"
                                        )}
                                        onClick={() => { if (stepMode && isPlaying) setStepSignal(p => p + 1); }}
                                        title="Next Step (N)"
                                        disabled={!stepMode || !isPlaying}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Speed slider */}
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-xs font-semibold text-zinc-400 shrink-0">Slow</span>
                                    <input
                                        type="range"
                                        min="1" max="100"
                                        value={speed}
                                        onChange={(e) => setSpeed(Number(e.target.value))}
                                        className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className="text-xs font-semibold text-zinc-400 shrink-0">Fast</span>
                                </div>

                                {/* Live operation counter (sorting only) */}
                                {algorithm.category === "Sorting" && (
                                    <div className="hidden md:flex items-center gap-2 shrink-0">
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-xs font-mono font-bold">
                                            CMP {ops.comparisons}
                                        </span>
                                        <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-100 text-xs font-mono font-bold">
                                            SWP {ops.swaps}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Mobile op counter */}
                            {algorithm.category === "Sorting" && (
                                <div className="flex md:hidden items-center gap-2 justify-center">
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-xs font-mono font-bold">CMP {ops.comparisons}</span>
                                    <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-100 text-xs font-mono font-bold">SWP {ops.swaps}</span>
                                </div>
                            )}

                            {/* Step mode banner */}
                            {stepMode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-center text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5"
                                >
                                    Step mode ON — press <kbd className="font-mono bg-amber-100 px-1 rounded">N</kbd> or click › to advance one step
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right panel: tabs */}
                <div className="w-full lg:w-[450px] xl:w-[500px] border-l border-zinc-100 bg-white flex flex-col h-[50dvh] lg:h-auto overflow-hidden">

                    {/* Tab bar */}
                    <div className="flex whitespace-nowrap overflow-x-auto hide-scrollbar border-b border-zinc-100 p-2 gap-1 shrink-0">
                        {LANG_TABS.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveTab(lang)}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors capitalize shrink-0",
                                    activeTab === lang ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                )}
                            >
                                {lang === 'cpp' ? 'C++' : lang}
                            </button>
                        ))}
                        <div className="w-px bg-zinc-100 mx-1 shrink-0" />
                        <button
                            onClick={() => setActiveTab("loopy")}
                            className={cn(
                                "px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5",
                                activeTab === "loopy" ? "bg-primary/10 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                            )}
                        >
                            Loopy AI
                        </button>
                        <button
                            onClick={() => setActiveTab("complexity")}
                            className={cn(
                                "px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors shrink-0",
                                activeTab === "complexity" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                            )}
                        >
                            Big-O
                        </button>
                    </div>

                    {/* Panel content */}
                    <div className="flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === "loopy" ? (
                                <motion.div key="loopy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                    <DSALoopyPanel
                                        algorithmTitle={algorithm.title}
                                        category={algorithm.category}
                                        timeComplexity={algorithm.timeComplexity}
                                        description={algorithm.description}
                                    />
                                </motion.div>
                            ) : activeTab === "complexity" ? (
                                <motion.div key="complexity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto p-6 space-y-6">
                                    <section>
                                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            How it works
                                        </h2>
                                        <div className="text-zinc-600 leading-relaxed text-sm">
                                            {formatText(algorithm.description)}
                                        </div>
                                    </section>
                                    <ComplexityChart timeComplexity={algorithm.timeComplexity} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 text-center">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Time</p>
                                            <p className="text-lg font-mono font-black text-zinc-900">{algorithm.timeComplexity}</p>
                                        </div>
                                        <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 text-center">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Space</p>
                                            <p className="text-lg font-mono font-black text-zinc-900">{algorithm.spaceComplexity}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto p-6 space-y-6">
                                    {/* Pseudocode with line highlighting */}
                                    <section>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pseudocode</h3>
                                        <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-zinc-800 shadow-inner">
                                            {pseudoLines.length > 0 ? pseudoLines.map((line, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "px-2 py-0.5 rounded transition-colors duration-150 min-h-[1.4em]",
                                                        i === activeLine ? "bg-primary/25 text-primary border-l-2 border-primary pl-1.5" : ""
                                                    )}
                                                >
                                                    <span className="text-zinc-600 mr-3 select-none">{String(i + 1).padStart(2, " ")}</span>
                                                    {line}
                                                </div>
                                            )) : (
                                                <code>{formatText(algorithm.pseudocode)}</code>
                                            )}
                                        </div>
                                    </section>

                                    {/* Implementation code */}
                                    <section>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Implementation</h3>
                                        <pre className="bg-zinc-50 text-zinc-900 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-zinc-200">
                                            <code>{formatText(algorithm.implementations[activeTab as keyof Algorithm["implementations"]])}</code>
                                        </pre>
                                    </section>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
