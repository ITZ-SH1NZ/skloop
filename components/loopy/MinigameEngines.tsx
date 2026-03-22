"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Zap, GitBranch, Play, AlertOctagon, Brain, ToggleLeft, Radio, Search, Battery } from "lucide-react";
import { PuzzleData } from "@/lib/loopy-story";

export interface EngineProps {
    puzzleData?: PuzzleData;
    onSuccess: () => void;
    onFail: () => void;
    safeChoiceLabel?: string;
    riskyChoiceLabel?: string;
    isLoading?: boolean;
}

// ==========================================
// 1. TERMINAL ENIGMA (terminal_hack)
// ==========================================
export function TerminalEnigma({ puzzleData, onSuccess, onFail, isLoading }: EngineProps) {
    const [input, setInput] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [succeeded, setSucceeded] = useState(false);

    const checkAnswer = () => {
        if (!input.trim() || succeeded) return;
        const expected = puzzleData?.expectedAnswer?.toLowerCase().trim() || "override";
        if (input.toLowerCase().trim() === expected || input.toLowerCase().includes(expected)) {
            setSucceeded(true);
            setTimeout(() => onSuccess(), 400);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setErrorMsg(`ERR: SEQUENCE INVALID — ${3 - newAttempts} ATTEMPT${3 - newAttempts === 1 ? '' : 'S'} REMAINING`);
            if (newAttempts >= 3) setTimeout(() => onFail(), 1000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            className="w-full max-w-lg mx-auto">

            {/* Hint nudge — no answer shown */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-4">
                <span className="text-white/30 text-xs tracking-wide">The keyword is hidden in the story above</span>
            </motion.div>

            {/* Feedback */}
            <div className="text-center mb-3 min-h-[1.2rem]">
                <AnimatePresence mode="wait">
                    {succeeded ? (
                        <motion.span key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-emerald-400 text-sm font-semibold">✓ Correct</motion.span>
                    ) : errorMsg ? (
                        <motion.span key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-red-400 text-xs">{errorMsg}</motion.span>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* Input + submit */}
            <div className="flex gap-2.5">
                <input
                    type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && checkAnswer()}
                    placeholder="Type the keyword…"
                    disabled={attempts >= 3 || succeeded || !!isLoading}
                    className="flex-1 bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 outline-none focus:border-white/40 focus:bg-white/12 transition-all placeholder:text-white/25 text-white text-sm tracking-wide disabled:opacity-40" />
                <button onClick={checkAnswer} disabled={attempts >= 3 || succeeded || !!isLoading || !input}
                    className="bg-white text-black font-semibold px-6 py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-30 hover:bg-white/90 text-sm whitespace-nowrap shadow-lg">
                    Submit
                </button>
            </div>

            {/* Bail-out — subtle link */}
            <div className="text-center mt-3">
                <button onClick={onFail} disabled={!!isLoading || succeeded}
                    className="text-white/25 hover:text-white/50 text-xs transition-colors">
                    Skip this
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// 2. CODE PATCH (code_patch)
// ==========================================

// Finds the first token that differs between two code strings
function findCorruptedToken(start: string, expected: string): { corrupted: string; index: number } | null {
    const sTokens = start.split(/(\s+|[=;,"'(){}[\]])/);
    const eTokens = expected.split(/(\s+|[=;,"'(){}[\]])/);
    for (let i = 0; i < sTokens.length; i++) {
        const s = sTokens[i].trim();
        const e = (eTokens[i] || "").trim();
        if (s && s !== e && s !== "//" && !s.startsWith("//")) {
            return { corrupted: s, index: i };
        }
    }
    return null;
}

// Renders code with the corrupted token highlighted in red
function HighlightedCode({ code, corruptedToken }: { code: string; corruptedToken: string }) {
    if (!corruptedToken) return <span className="text-zinc-300">{code}</span>;
    const parts = code.split(corruptedToken);
    return (
        <>
            {parts.map((part, i) => (
                <span key={i}>
                    <span className="text-zinc-400">{part}</span>
                    {i < parts.length - 1 && (
                        <span className="text-red-400 bg-red-500/20 rounded px-0.5 font-bold relative">
                            {corruptedToken}
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-red-400/70 whitespace-nowrap">CORRUPTED</span>
                        </span>
                    )}
                </span>
            ))}
        </>
    );
}

export function CodePatch({ puzzleData, onSuccess, onFail, riskyChoiceLabel = "Bypass", isLoading }: EngineProps) {
    const startingCode = puzzleData?.startingCode || "let value = false; // fix this";
    const expectedAnswer = puzzleData?.expectedAnswer || "let value = true;";
    const corruption = findCorruptedToken(startingCode, expectedAnswer);
    const corruptedToken = corruption?.corrupted || "";

    const [userInput, setUserInput] = useState(startingCode);
    const [attempts, setAttempts] = useState(0);
    const [feedback, setFeedback] = useState<"idle" | "error" | "ok">("idle");
    const [log, setLog] = useState<string[]>(["> System ready. Awaiting patch..."]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleRun = () => {
        if (feedback === "ok") return;
        const expected = expectedAnswer.replace(/\s/g, "");
        const current = userInput.replace(/\s/g, "");
        if (expected && current.includes(expected)) {
            setFeedback("ok");
            setLog(prev => [...prev, `> Running patch...`, `> ✓ PATCH ACCEPTED — signal restored.`]);
            setTimeout(() => onSuccess(), 900);
        } else {
            const next = attempts + 1;
            setAttempts(next);
            setFeedback("error");
            setLog(prev => [...prev, `> Running patch...`, `> ✗ ERROR: Patch rejected. ${next >= 3 ? "Failing..." : `${3 - next} attempt${3 - next === 1 ? "" : "s"} remaining.`}`]);
            setTimeout(() => setFeedback("idle"), 1000);
            if (next >= 3) setTimeout(() => onFail(), 1300);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-xl mx-auto flex flex-col gap-3">

            {/* Mission header */}
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                <Code size={15} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                    <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-0.5">Patch Required</p>
                    <p className="text-white/70 text-xs leading-relaxed">
                        Loopy detected a corruption:{" "}
                        <span className="text-red-400 font-mono font-bold">{corruptedToken || "unknown token"}</span>
                        {" "}has the wrong value. Fix the line below and compile it.
                    </p>
                </div>
            </div>

            {/* Corrupted code display */}
            <div className="bg-[#0d0d0d] border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
                    <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">corrupted_signal.ts</span>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-red-400/60 font-mono">CORRUPTED</span>
                    </div>
                </div>
                <div className="px-4 py-3 font-mono text-sm leading-relaxed">
                    <span className="text-zinc-600 select-none mr-4">1</span>
                    <HighlightedCode code={startingCode} corruptedToken={corruptedToken} />
                </div>
            </div>

            {/* Editable patch line */}
            <div className="bg-[#0d0d0d] border border-zinc-700 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-colors">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
                    <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">your_patch.ts</span>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-emerald-400/60 font-mono">EDITABLE</span>
                    </div>
                </div>
                <div className="flex items-center px-4 py-3">
                    <span className="text-zinc-600 font-mono text-sm select-none mr-4">1</span>
                    <input
                        ref={inputRef}
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleRun()}
                        disabled={feedback === "ok" || !!isLoading}
                        spellCheck={false}
                        className="flex-1 bg-transparent font-mono text-sm text-emerald-300 outline-none placeholder-zinc-600 disabled:opacity-50"
                    />
                </div>
            </div>

            {/* Console output */}
            <div className="bg-black/60 border border-zinc-800/60 rounded-xl px-4 py-3 font-mono text-[11px] text-zinc-500 max-h-20 overflow-y-auto flex flex-col gap-0.5">
                {log.map((line, i) => (
                    <span key={i} className={line.includes("✓") ? "text-emerald-400" : line.includes("✗") ? "text-red-400" : "text-zinc-500"}>
                        {line}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button onClick={onFail} disabled={feedback === "ok" || !!isLoading}
                    className="text-red-500/60 hover:text-red-400 text-xs font-bold transition-colors px-3 py-2.5 border border-red-500/20 rounded-xl hover:border-red-500/40 disabled:opacity-30">
                    {riskyChoiceLabel}
                </button>
                <button onClick={handleRun} disabled={feedback === "ok" || !!isLoading}
                    className={`flex-1 font-black text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-white
                        ${feedback === "ok" ? "bg-emerald-600" : feedback === "error" ? "bg-red-600" : "bg-emerald-700 hover:bg-emerald-600 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"}`}>
                    <Play size={13} fill="currentColor" />
                    {feedback === "ok" ? "Patch Accepted" : feedback === "error" ? "Rejected — try again" : "Compile & Run"}
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// 3. CIRCUIT BREAKER (timing_strike) — slowed down
// ==========================================
export function CircuitBreaker({ onSuccess, onFail, safeChoiceLabel = "Strike", isLoading }: EngineProps) {
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const requestRef = useRef<number>(null);
    const dirRef = useRef(1);
    const speed = 1.0; // was 2.5 — now much more playable

    const animate = useCallback(() => {
        if (!isPlaying) return;
        setPosition(prev => {
            let next = prev + speed * dirRef.current;
            if (next >= 100) { next = 100; dirRef.current = -1; }
            if (next <= 0) { next = 0; dirRef.current = 1; }
            return next;
        });
        requestRef.current = requestAnimationFrame(animate);
    }, [isPlaying]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [animate]);

    const handleStrike = () => {
        if (!isPlaying) return;
        setIsPlaying(false);
        if (position >= 38 && position <= 62) {
            setTimeout(() => onSuccess(), 500);
        } else {
            setTimeout(() => onFail(), 1000);
        }
    };

    const isHit = !isPlaying && position >= 38 && position <= 62;
    const isMiss = !isPlaying && !isHit;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col items-center gap-5">
            <div className="text-center">
                <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2">
                    <Zap size={14} /> Circuit Breaker
                </h3>
                <p className="text-zinc-400 text-xs mt-1">Hit the green zone to parry.</p>
            </div>

            {/* Track */}
            <div className="w-full h-10 md:h-12 bg-black rounded-full relative overflow-hidden border border-zinc-800 shadow-inner">
                <div className="absolute top-0 bottom-0 left-[38%] right-[38%] bg-emerald-500/25 border-x-2 border-emerald-500/70" />
                <motion.div
                    className={`absolute top-1.5 bottom-1.5 w-3 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.9)] ${isHit ? "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" : isMiss ? "bg-red-500" : "bg-white"}`}
                    style={{ left: `calc(${position}% - 6px)` }}
                    animate={isMiss ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <div className="flex gap-3 w-full">
                <button onClick={handleStrike} disabled={!isPlaying || !!isLoading}
                    className={`flex-1 font-black tracking-wider py-3 md:py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 text-white text-sm md:text-base uppercase ${isHit ? "bg-emerald-500" : isMiss ? "bg-red-500" : "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"}`}>
                    {isPlaying ? safeChoiceLabel : isHit ? "✓ Perfect" : "✗ Missed"}
                </button>
                <button onClick={onFail} disabled={!isPlaying || !!isLoading}
                    className="bg-red-950/40 hover:bg-red-900/70 border border-red-500/30 text-red-500 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0">
                    <AlertOctagon size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// 4. DATA ROUTER (node_graph)
// ==========================================
const CORRUPT_LABELS = ["Memory Leak", "Void Loop", "Null Core", "Corrupt Relay", "Dead Signal"];

export function DataRouter({ puzzleData, onSuccess, onFail, isLoading }: EngineProps) {
    const [nodeA, nodeB] = puzzleData?.nodesToConnect || ["Source", "Target"];
    const corruptLabel = useMemo(() => CORRUPT_LABELS[Math.floor(Math.random() * CORRUPT_LABELS.length)], []);

    // Tap-to-connect: player taps nodeA first, then nodeB. Tapping corrupt = instant fail.
    const [selected, setSelected] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const [failed, setFailed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleTap = (id: "a" | "b" | "corrupt") => {
        if (submitted || !!isLoading) return;

        if (id === "corrupt") {
            setFailed(true);
            setSubmitted(true);
            setTimeout(() => onFail(), 700);
            return;
        }

        if (!selected) {
            // First tap — must start from nodeA
            if (id === "a") setSelected("a");
            return;
        }

        if (selected === "a" && id === "b") {
            // Correct connection made
            setConnected(true);
            setSelected(null);
            setSubmitted(true);
            setTimeout(() => onSuccess(), 800);
            return;
        }

        // Tapped wrong node after selecting — deselect
        setSelected(null);
    };

    const nodeStyle = (id: "a" | "b" | "corrupt") => {
        if (id === "corrupt") {
            return failed
                ? "border-red-400 bg-red-500/30 text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.6)]"
                : "border-red-500/50 bg-red-950/40 text-red-400 hover:border-red-400 hover:bg-red-900/50";
        }
        if (id === "a") {
            if (connected) return "border-emerald-400 bg-emerald-900/40 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.5)]";
            if (selected === "a") return "border-blue-400 bg-blue-900/40 text-blue-200 shadow-[0_0_20px_rgba(96,165,250,0.6)] scale-105";
            return "border-blue-500/50 bg-blue-950/30 text-blue-300 hover:border-blue-400 hover:bg-blue-900/30";
        }
        // nodeB
        if (connected) return "border-emerald-400 bg-emerald-900/40 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.5)]";
        if (selected === "a") return "border-emerald-500/80 bg-emerald-950/40 text-emerald-300 animate-pulse";
        return "border-zinc-600 bg-zinc-800/60 text-zinc-400";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto bg-zinc-900 border border-blue-500/20 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col gap-5">

            {/* Header */}
            <div className="text-center">
                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <GitBranch size={14} /> Data Router
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                    {connected ? "Connection established!" : selected === "a" ? `Now tap ${nodeB} to complete the link` : `Tap ${nodeA} first, then ${nodeB}. Avoid the corruption.`}
                </p>
            </div>

            {/* Node layout — A on left, corrupt in middle, B on right */}
            <div className="flex items-center justify-between gap-3">

                {/* Node A */}
                <motion.button
                    onClick={() => handleTap("a")}
                    disabled={submitted || !!isLoading}
                    whileTap={!submitted ? { scale: 0.95 } : {}}
                    className={`flex-1 border-2 rounded-xl py-4 px-3 text-center font-bold text-sm transition-all duration-200 ${nodeStyle("a")}`}>
                    <div className="text-[10px] font-mono opacity-60 mb-1 uppercase tracking-widest">
                        {connected ? "✓ linked" : selected === "a" ? "selected" : "tap first"}
                    </div>
                    {nodeA}
                </motion.button>

                {/* Arrow / connection indicator */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <motion.div
                        animate={connected ? { opacity: 1, scaleX: 1 } : { opacity: 0.2, scaleX: 0.7 }}
                        className={`h-0.5 w-10 md:w-14 rounded-full origin-left ${connected ? "bg-emerald-400" : "bg-zinc-600"}`}
                    />
                    <span className="text-[9px] text-zinc-600 font-mono">route</span>
                </div>

                {/* Node B */}
                <motion.button
                    onClick={() => handleTap("b")}
                    disabled={submitted || selected !== "a" || !!isLoading}
                    whileTap={selected === "a" ? { scale: 0.95 } : {}}
                    className={`flex-1 border-2 rounded-xl py-4 px-3 text-center font-bold text-sm transition-all duration-200 ${nodeStyle("b")}`}>
                    <div className="text-[10px] font-mono opacity-60 mb-1 uppercase tracking-widest">
                        {connected ? "✓ linked" : selected === "a" ? "tap now" : "tap second"}
                    </div>
                    {nodeB}
                </motion.button>
            </div>

            {/* Corrupt node — clearly separated below as a threat */}
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                    <div className="flex-1 h-px bg-zinc-800" />
                    do not connect
                    <div className="flex-1 h-px bg-zinc-800" />
                </div>
                <motion.button
                    onClick={() => handleTap("corrupt")}
                    disabled={submitted || !!isLoading}
                    whileTap={{ scale: 0.97 }}
                    animate={failed ? { x: [0, -10, 10, -8, 8, 0] } : {}}
                    className={`w-full border-2 rounded-xl py-3 px-4 text-center font-bold text-sm transition-all duration-200 ${nodeStyle("corrupt")}`}>
                    <span className="mr-2 opacity-60">☠</span>
                    {corruptLabel}
                </motion.button>
            </div>

            {/* Skip */}
            <div className="flex justify-end">
                <button onClick={onFail} disabled={submitted || !!isLoading}
                    className="text-zinc-600 hover:text-red-400 text-xs transition-colors px-2 py-1 disabled:opacity-30">
                    Flee
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// 5. MEMORY PULSE (memory_pulse) — Simon Says
// ==========================================
export function MemoryPulse({ puzzleData, onSuccess, onFail, isLoading }: EngineProps) {
    const sequence = puzzleData?.sequence || [0, 2, 4, 6];
    const gridSize = puzzleData?.gridSize || 3;
    const totalCells = gridSize * gridSize;

    const [phase, setPhase] = useState<"watch" | "repeat" | "done">("watch");
    const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [failCell, setFailCell] = useState<number | null>(null);

    // Play back the sequence
    useEffect(() => {
        if (phase !== "watch") return;
        let cancelled = false;
        const runSequence = async () => {
            await new Promise(r => setTimeout(r, 800));
            for (let i = 0; i < sequence.length; i++) {
                if (cancelled) return;
                setHighlightedCell(sequence[i]);
                await new Promise(r => setTimeout(r, 700));
                if (cancelled) return;
                setHighlightedCell(null);
                await new Promise(r => setTimeout(r, 250));
            }
            if (!cancelled) setPhase("repeat");
        };
        runSequence();
        return () => { cancelled = true; };
    }, [phase, sequence]);

    const handleCellTap = (idx: number) => {
        if (phase !== "repeat" || !!isLoading) return;
        const pos = userSequence.length;
        const expected = sequence[pos];
        if (idx === expected) {
            const newSeq = [...userSequence, idx];
            setUserSequence(newSeq);
            setHighlightedCell(idx);
            setTimeout(() => setHighlightedCell(null), 300);
            if (newSeq.length === sequence.length) {
                setPhase("done");
                setTimeout(() => onSuccess(), 500);
            }
        } else {
            setFailCell(idx);
            setTimeout(() => { setFailCell(null); onFail(); }, 800);
        }
    };

    const cellColors = Array.from({ length: totalCells }, (_, i) => {
        if (i === failCell) return "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-95";
        if (i === highlightedCell) return "bg-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.9)] scale-105";
        if (phase === "repeat" && userSequence.includes(i)) return "bg-emerald-500/50 border-emerald-400/60";
        return "bg-zinc-800/80 border-zinc-700/60 hover:bg-zinc-700/80 hover:border-zinc-500";
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-sm mx-auto bg-zinc-900 border border-purple-500/30 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col items-center gap-5">
            <div className="text-center">
                <h3 className="text-purple-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Brain size={14} /> Memory Pulse
                </h3>
                <AnimatePresence mode="wait">
                    <motion.p key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-400 text-xs mt-1">
                        {phase === "watch" ? "Watch the sequence…" : phase === "repeat" ? `Repeat it — ${userSequence.length}/${sequence.length} tapped` : "✓ Perfect recall!"}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Grid */}
            <div
                className="grid gap-2 md:gap-3"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, width: "min(100%, 240px)" }}>
                {Array.from({ length: totalCells }, (_, i) => (
                    <motion.button
                        key={i}
                        onClick={() => handleCellTap(i)}
                        disabled={phase !== "repeat" || !!isLoading}
                        whileTap={phase === "repeat" ? { scale: 0.92 } : {}}
                        className={`aspect-square rounded-xl border-2 transition-all duration-150 min-h-[44px] ${cellColors[i]} disabled:cursor-default`}
                    />
                ))}
            </div>

            <button onClick={onFail} disabled={!!isLoading || phase === "done"}
                className="text-red-400/60 text-xs font-bold hover:text-red-400 transition-colors uppercase tracking-wider">
                Give Up
            </button>
        </motion.div>
    );
}

// ==========================================
// 6. BINARY FLIP (binary_flip)
// ==========================================
const MEMORIZE_MS = 2500;
const FLIP_TIMER_S = 20;

function randomizePattern(base: boolean[]): boolean[] {
    // Keep the same number of ON switches as the authored pattern, but shuffle positions
    const onCount = base.filter(Boolean).length;
    const result = Array(base.length).fill(false);
    const indices = Array.from({ length: base.length }, (_, i) => i);
    // Fisher-Yates shuffle then pick first onCount indices
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    indices.slice(0, onCount).forEach(i => { result[i] = true; });
    return result;
}

export function BinaryFlip({ puzzleData, onSuccess, onFail, safeChoiceLabel = "Confirm", isLoading }: EngineProps) {
    const authored = puzzleData?.targetPattern || [true, false, true, true, false, true];
    // Randomize on mount so every playthrough is unique
    const target = useMemo(() => randomizePattern(authored), []); // eslint-disable-line react-hooks/exhaustive-deps
    const [switches, setSwitches] = useState<boolean[]>(Array(target.length).fill(false));
    const [attempts, setAttempts] = useState(0);
    const [shake, setShake] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    // memorize phase: target shown for MEMORIZE_MS, then hidden
    const [showTarget, setShowTarget] = useState(true);
    const [timeLeft, setTimeLeft] = useState(FLIP_TIMER_S);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // After memorize window, start countdown
    useEffect(() => {
        const hide = setTimeout(() => setShowTarget(false), MEMORIZE_MS);
        return () => clearTimeout(hide);
    }, []);

    useEffect(() => {
        if (showTarget || confirmed) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setTimeout(() => onFail(), 200);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [showTarget, confirmed, onFail]);

    const toggle = (i: number) => {
        if (confirmed || showTarget || !!isLoading) return;
        setSwitches(prev => prev.map((v, idx) => idx === i ? !v : v));
    };

    const handleConfirm = () => {
        if (confirmed || showTarget) return;
        const correct = switches.every((v, i) => v === target[i]);
        if (correct) {
            clearInterval(timerRef.current!);
            setConfirmed(true);
            setTimeout(() => onSuccess(), 400);
        } else {
            const next = attempts + 1;
            setAttempts(next);
            setShake(true);
            setTimeout(() => setShake(false), 600);
            if (next >= 2) {
                clearInterval(timerRef.current!);
                setTimeout(() => onFail(), 700);
            }
        }
    };

    const timerPct = (timeLeft / FLIP_TIMER_S) * 100;
    const timerColor = timeLeft > 10 ? "bg-amber-400" : timeLeft > 5 ? "bg-orange-500" : "bg-red-500";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm mx-auto bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col items-center gap-4">

            <div className="text-center">
                <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <ToggleLeft size={14} /> Binary Flip
                </h3>
                {showTarget ? (
                    <p className="text-amber-300/80 text-xs mt-1 animate-pulse">Memorise the pattern...</p>
                ) : (
                    <p className="text-zinc-400 text-xs mt-1">Strikes: {attempts}/2</p>
                )}
            </div>

            {/* Target indicators — visible during memorise, hidden after */}
            <AnimatePresence>
                {showTarget && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-1.5">
                        <div className="flex gap-2 md:gap-3">
                            {target.map((on: boolean, i: number) => (
                                <motion.div
                                    key={i}
                                    animate={on ? { boxShadow: ["0 0 6px rgba(251,191,36,0.6)", "0 0_16px_rgba(251,191,36,1)", "0 0 6px rgba(251,191,36,0.6)"] } : {}}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className={`w-4 h-4 rounded-full border-2 ${on ? "bg-amber-400 border-amber-300" : "bg-zinc-700 border-zinc-600"}`}
                                />
                            ))}
                        </div>
                        <p className="text-zinc-500 text-[10px]">↑ memorise this</p>
                    </motion.div>
                )}
                {!showTarget && !confirmed && (
                    <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">time</span>
                            <span className={timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-zinc-400"}>{timeLeft}s</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${timerColor} transition-colors duration-500`}
                                animate={{ width: `${timerPct}%` }}
                                transition={{ duration: 0.9, ease: "linear" }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Switches */}
            <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
                {switches.map((on, i) => (
                    <motion.button
                        key={i}
                        onClick={() => toggle(i)}
                        whileTap={!showTarget ? { scale: 0.9 } : {}}
                        disabled={confirmed || showTarget || !!isLoading}
                        className="flex flex-col items-center gap-2">
                        <div className={`relative w-10 h-20 rounded-full border-2 transition-all duration-200 ${on ? "bg-amber-500/20 border-amber-400/60 shadow-[0_0_16px_rgba(251,191,36,0.4)]" : "bg-zinc-800 border-zinc-700"} ${showTarget ? "opacity-40" : ""}`}>
                            <motion.div
                                animate={{ y: on ? 4 : 48 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`absolute left-1 right-1 h-7 rounded-full ${on ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" : "bg-zinc-600"}`}
                            />
                        </div>
                        <span className={`text-xs font-bold ${on ? "text-amber-400" : "text-zinc-600"}`}>{on ? "ON" : "OFF"}</span>
                    </motion.button>
                ))}
            </div>

            <div className="flex gap-3 w-full">
                <button onClick={handleConfirm} disabled={confirmed || showTarget || !!isLoading}
                    className={`flex-1 font-black tracking-wider py-3 rounded-xl transition-all active:scale-95 text-sm uppercase text-white ${confirmed ? "bg-emerald-600" : showTarget ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]"}`}>
                    {confirmed ? "✓ Matched" : showTarget ? "Memorising..." : safeChoiceLabel}
                </button>
                <button onClick={onFail} disabled={confirmed || !!isLoading}
                    className="bg-red-950/40 border border-red-500/30 text-red-500 px-4 rounded-xl hover:bg-red-900/60 transition-all active:scale-95">
                    <AlertOctagon size={16} />
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// 7. SIGNAL LOCK (signal_lock)
// ==========================================
const RING_SYMBOLS = ["{", "}", "$", ">", "<", "/"];

export function SignalLock({ puzzleData, onSuccess, onFail, isLoading }: EngineProps) {
    const targetSymbols = puzzleData?.targetSymbols || ["$", "}", ">"];
    const speeds = [0.25, 0.35, 0.45]; // slowed: each symbol stays visible ~4-6 seconds

    // Each ring stores an angle (0-360), spinning = whether it's still going
    const [angles, setAngles] = useState([0, 0, 0]);
    const [spinning, setSpinning] = useState([true, true, true]);
    const [submitted, setSubmitted] = useState(false);
    const rafRef = useRef<number>(null);

    const tick = useCallback(() => {
        setAngles(prev => prev.map((a, i) => spinning[i] ? (a + speeds[i]) % 360 : a));
        rafRef.current = requestAnimationFrame(tick);
    }, [spinning]);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current!);
    }, [tick]);

    const getSymbol = (angle: number) => {
        const idx = Math.floor((angle / 360) * RING_SYMBOLS.length) % RING_SYMBOLS.length;
        return RING_SYMBOLS[idx];
    };

    const stopRing = (i: number) => {
        if (!spinning[i] || submitted || !!isLoading) return;
        setSpinning(prev => prev.map((v, idx) => idx === i ? false : v));
    };

    const handleSubmit = () => {
        if (submitted) return;
        const allStopped = spinning.every(s => !s);
        if (!allStopped) return;
        setSubmitted(true);
        const current = angles.map(a => getSymbol(a));
        const correct = current.every((s, i) => s === targetSymbols[i]);
        setTimeout(() => correct ? onSuccess() : onFail(), 400);
    };

    const allStopped = spinning.every(s => !s);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-sm mx-auto bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col items-center gap-5">
            <div className="text-center">
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Radio size={14} /> Signal Lock
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                    {allStopped ? "Verify alignment" : "Tap each ring to stop it"}
                </p>
            </div>

            {/* Target hint */}
            <div className="flex gap-4 items-center text-xs text-zinc-500">
                <span>Target:</span>
                {targetSymbols.map((s, i) => (
                    <span key={i} className="font-black text-lg text-cyan-400 font-mono w-8 h-8 flex items-center justify-center border border-cyan-500/30 rounded-lg bg-cyan-950/30">
                        {s}
                    </span>
                ))}
            </div>

            {/* Rings */}
            <div className="flex gap-4 md:gap-6">
                {[0, 1, 2].map(i => {
                    const sym = getSymbol(angles[i]);
                    const stopped = !spinning[i];
                    const correct = stopped && sym === targetSymbols[i];
                    return (
                        <motion.button
                            key={i}
                            onClick={() => stopRing(i)}
                            disabled={stopped || submitted || !!isLoading}
                            whileTap={!stopped ? { scale: 0.93 } : {}}
                            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${stopped ? (correct ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(52,211,153,0.5)]" : "border-red-500 bg-red-950/30") : "border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-400 shadow-[0_0_14px_-4px_rgba(34,211,238,0.4)]"}`}>
                            <motion.span
                                animate={!stopped ? { rotate: angles[i] * 2 } : {}}
                                transition={{ duration: 0 }}
                                className={`font-black text-2xl md:text-3xl font-mono ${stopped ? (correct ? "text-emerald-300" : "text-red-400") : "text-cyan-300"}`}>
                                {sym}
                            </motion.span>
                            {!stopped && <span className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping opacity-30" />}
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex gap-3 w-full">
                <button onClick={handleSubmit} disabled={!allStopped || submitted || !!isLoading}
                    className={`flex-1 font-black tracking-wider py-3 rounded-xl transition-all active:scale-95 text-sm uppercase text-white ${!allStopped ? "bg-zinc-700 opacity-50 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)]"}`}>
                    Verify Alignment
                </button>
                <button onClick={onFail} disabled={submitted || !!isLoading}
                    className="bg-red-950/40 border border-red-500/30 text-red-500 px-4 rounded-xl hover:bg-red-900/60 transition-all active:scale-95">
                    <AlertOctagon size={16} />
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// 8. GLITCH HUNTER (glitch_hunter)
// ==========================================
export function GlitchHunter({ puzzleData, onSuccess, onFail, isLoading }: EngineProps) {
    const text = puzzleData?.corruptedText || "The XZQR world cannot be BRKN without a key";
    const glitchedIdx = puzzleData?.glitchedIndices || [1, 5];

    // Dynamic time: ~700ms to read each word + 2s per word to tap + 5s flat buffer
    const words = text.split(" ");
    const timeLimit = words.length * 700 + glitchedIdx.length * 2000 + 5000;

    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<"idle" | "ok" | "fail">("idle");

    useEffect(() => {
        if (submitted) return;
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 100) {
                    clearInterval(id);
                    setSubmitted(true);
                    setResult("fail");
                    setTimeout(() => onFail(), 600);
                    return 0;
                }
                return prev - 100;
            });
        }, 100);
        return () => clearInterval(id);
    }, [submitted, onFail]);

    const toggleWord = (i: number) => {
        if (submitted || !!isLoading) return;
        setSelected(prev => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    };

    const handleConfirm = () => {
        if (submitted) return;
        setSubmitted(true);
        const correct = glitchedIdx.length === selected.size && glitchedIdx.every(i => selected.has(i));
        setResult(correct ? "ok" : "fail");
        setTimeout(() => correct ? onSuccess() : onFail(), 500);
    };

    const pct = (timeLeft / timeLimit) * 100;
    const timerColor = pct > 50 ? "bg-emerald-500" : pct > 25 ? "bg-amber-500" : "bg-red-500";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto bg-zinc-900 border border-rose-500/30 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col gap-5">
            <div className="text-center">
                <h3 className="text-rose-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Search size={14} /> Glitch Hunter
                </h3>
                <p className="text-zinc-400 text-xs mt-1">Tap the corrupted words before time runs out.</p>
            </div>

            {/* Timer bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full transition-colors duration-300 ${timerColor}`}
                    style={{ width: `${pct}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Word chips */}
            <div className="flex flex-wrap gap-2 justify-center">
                {words.map((word, i) => {
                    const sel = selected.has(i);
                    const isGlitch = glitchedIdx.includes(i);
                    const animating = sel && !submitted;
                    return (
                        <motion.button
                            key={i}
                            onClick={() => toggleWord(i)}
                            disabled={submitted || !!isLoading}
                            whileTap={{ scale: 0.93 }}
                            animate={result === "ok" && isGlitch ? { scale: [1, 1.2, 1] } : {}}
                            className={`px-3 py-1.5 rounded-lg border-2 font-mono text-sm md:text-base font-bold transition-all min-h-[36px] min-w-[44px] ${
                                sel
                                    ? "bg-rose-500/30 border-rose-400 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                                    : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-zinc-500"
                            } ${animating ? "animate-pulse" : ""}`}>
                            {word}
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex gap-3 w-full">
                <button onClick={handleConfirm} disabled={submitted || selected.size === 0 || !!isLoading}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black tracking-wider py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm uppercase shadow-[0_0_20px_-5px_rgba(244,63,94,0.5)]">
                    Confirm Selection
                </button>
                <button onClick={onFail} disabled={submitted || !!isLoading}
                    className="bg-red-950/40 border border-red-500/30 text-red-500 px-4 rounded-xl hover:bg-red-900/60 transition-all active:scale-95">
                    <AlertOctagon size={16} />
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// 9. ENERGY SURGE (energy_surge)
// ==========================================
export function EnergySurge({ puzzleData, onSuccess, onFail, isLoading }: EngineProps) {
    const { min = 60, max = 80 } = puzzleData?.targetRange || {};
    const FILL_SPEED = 22; // % per second — steady and readable

    const [charge, setCharge] = useState(0);
    const [holding, setHolding] = useState(false);
    const [released, setReleased] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [result, setResult] = useState<"idle" | "ok" | "fail">("idle");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startHold = () => {
        if (released || holding || !!isLoading) return;
        setHolding(true);
        intervalRef.current = setInterval(() => {
            setCharge(prev => {
                if (prev >= 100) {
                    clearInterval(intervalRef.current!);
                    return 100;
                }
                return prev + FILL_SPEED / 10;
            });
        }, 100);
    };

    const endHold = () => {
        if (!holding || released) return;
        clearInterval(intervalRef.current!);
        setHolding(false);
        setReleased(true);
        const inZone = charge >= min && charge <= max;
        setResult(inZone ? "ok" : "fail");
        if (inZone) {
            setTimeout(() => onSuccess(), 600);
        } else {
            const next = attempts + 1;
            setAttempts(next);
            if (next >= 3) {
                setTimeout(() => onFail(), 700);
            } else {
                setTimeout(() => {
                    setCharge(0);
                    setReleased(false);
                    setResult("idle");
                }, 1200);
            }
        }
    };

    const inZone = charge >= min && charge <= max;
    const barColor = result === "ok" ? "bg-emerald-400" : result === "fail" ? "bg-red-400" : inZone ? "bg-emerald-400" : charge > max ? "bg-red-400" : "bg-amber-400";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-sm mx-auto bg-zinc-900 border border-yellow-500/30 rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col items-center gap-5">
            <div className="text-center">
                <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Battery size={14} /> Energy Surge
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                    {released ? (result === "ok" ? "✓ Perfect release!" : `Too ${charge < min ? "low" : "high"} — ${3 - attempts} tries left`) : holding ? "Hold…" : "Hold the button — release in the green zone"}
                </p>
            </div>

            {/* Vertical meter */}
            <div className="relative w-14 md:w-16 h-48 md:h-56 bg-zinc-800 rounded-full border border-zinc-700 overflow-hidden">
                {/* Target zone highlight */}
                <div
                    className="absolute left-0 right-0 bg-emerald-500/20 border-y border-emerald-500/40"
                    style={{ bottom: `${min}%`, height: `${max - min}%` }}
                />
                {/* Charge fill */}
                <motion.div
                    className={`absolute bottom-0 left-0 right-0 rounded-full transition-colors duration-200 ${barColor}`}
                    style={{ height: `${charge}%` }}
                    animate={result === "ok" ? { opacity: [1, 0.6, 1] } : {}}
                    transition={{ duration: 0.4, repeat: result === "ok" ? 2 : 0 }}
                />
                {/* % label */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-black font-mono drop-shadow-lg ${charge > 30 ? "text-black/70" : "text-zinc-500"}`}>
                        {Math.round(charge)}%
                    </span>
                </div>
            </div>

            <div className="flex gap-3 w-full">
                <motion.button
                    onPointerDown={startHold}
                    onPointerUp={endHold}
                    onPointerLeave={holding ? endHold : undefined}
                    disabled={released && result !== "idle" || !!isLoading}
                    whileTap={{ scale: 0.95 }}
                    animate={holding ? { boxShadow: ["0 0 10px rgba(234,179,8,0.3)", "0 0 25px rgba(234,179,8,0.7)", "0 0 10px rgba(234,179,8,0.3)"] } : {}}
                    transition={holding ? { duration: 0.6, repeat: Infinity } : {}}
                    className={`flex-1 font-black tracking-wider py-3 md:py-4 rounded-xl text-white text-sm uppercase transition-all select-none touch-none ${holding ? "bg-yellow-500" : "bg-yellow-600 hover:bg-yellow-500"} shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)] active:scale-95 disabled:opacity-50`}>
                    {holding ? "Holding…" : "HOLD"}
                </motion.button>
                <button onClick={onFail} disabled={!!isLoading}
                    className="bg-red-950/40 border border-red-500/30 text-red-500 px-4 rounded-xl hover:bg-red-900/60 transition-all active:scale-95">
                    <AlertOctagon size={16} />
                </button>
            </div>
        </motion.div>
    );
}
