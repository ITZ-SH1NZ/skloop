"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X, Trophy, Zap, ShieldAlert, Target, TerminalSquare, Swords, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export interface TestResult {
    passed: boolean;
    expected: string;
    actual: string;
    timeMs: number;
    ruleType: string;
    isHidden?: boolean;
}

interface TestResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: TestResult[];
}

export default function TestResultsModal({ isOpen, onClose, results }: TestResultsModalProps) {
    const [expandedCases, setExpandedCases] = useState<Set<number>>(new Set([0])); // First case expanded by default

    if (!isOpen) return null;

    const toggleCase = (index: number) => {
        const newExpanded = new Set(expandedCases);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedCases(newExpanded);
    };

    const avgTime = results.length > 0 ? (results.reduce((acc, r) => acc + r.timeMs, 0) / results.length).toFixed(2) : "0.00";
    const maxTime = results.length > 0 ? Math.max(...results.map(r => r.timeMs)).toFixed(2) : "0.00";
    
    // In our current implementation, we assume all rules are "shown" unless explicitly marked hidden.
    const shownResults = results.filter(r => !r.isHidden);
    const hiddenResults = results.filter(r => r.isHidden);

    const shownPassed = shownResults.filter(r => r.passed).length;
    const hiddenPassed = hiddenResults.filter(r => r.passed).length;

    const allPassed = results.every(r => r.passed);

    // Variants for staggered list
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 md:p-6 lg:p-12"
                    onWheelCapture={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40, rotateX: -15 }}
                        transition={{ type: "spring", damping: 20, stiffness: 200 }}
                        className={`w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative rounded-2xl border-2 shadow-2xl ${
                            allPassed 
                                ? "bg-slate-900 shadow-[0_0_40px_rgba(212,242,104,0.15)] border-[#D4F268]/30" 
                                : "bg-slate-900 shadow-[0_0_40px_rgba(239,68,68,0.15)] border-red-500/30"
                        }`}
                        style={{ perspective: "1000px" }}
                    >
                        {/* Glow effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-[#D4F268]/10 to-transparent blur-3xl pointer-events-none" />

                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 rounded-full transition-all hover:scale-110 flex items-center justify-center shadow-lg border border-slate-700"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>

                        {/* Gamified Header */}
                        <div className={`p-6 md:p-8 flex items-center gap-4 border-b ${allPassed ? 'border-[#D4F268]/20 bg-gradient-to-r from-[#D4F268]/10 to-transparent' : 'border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent'}`}>
                            <div className={`p-4 rounded-xl shadow-lg border ${allPassed ? 'bg-[#D4F268]/20 border-[#D4F268]/50 text-[#D4F268]' : 'bg-red-500/20 border-red-500/50 text-red-500'}`}>
                                {allPassed ? <Trophy size={32} /> : <ShieldAlert size={32} />}
                            </div>
                            <div>
                                <h1 className={`text-3xl font-black uppercase tracking-widest ${allPassed ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4F268] to-emerald-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500'}`}>
                                    {allPassed ? "Quest Cleared!" : "Validation Failed"}
                                </h1>
                                <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-wider">
                                    {allPassed ? "All logic nodes verified successfully" : "Bugs detected in system registry"}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900/50 [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                            
                            {/* Dashboard Stats */}
                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                {/* Timing Card */}
                                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex justify-between items-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Zap size={12} className="text-cyan-400" /> Latency Avg
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white font-mono">{(parseFloat(avgTime) / 1000).toFixed(3)}s</span>
                                        </div>
                                        <div className="text-cyan-400/80 font-mono text-xs mt-0.5">{avgTime}ms</div>
                                    </div>
                                    
                                    <div className="h-8 w-px bg-slate-800 mx-4 hidden md:block" />

                                    <div className="relative z-10">
                                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Target size={12} className="text-fuchsia-400" /> Peak Load
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white font-mono">{(parseFloat(maxTime) / 1000).toFixed(3)}s</span>
                                        </div>
                                        <div className="text-fuchsia-400/80 font-mono text-xs mt-0.5">{maxTime}ms</div>
                                    </div>
                                </div>

                                {/* Results Summary Card */}
                                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-center gap-3 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4F268]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${shownPassed === shownResults.length ? 'bg-[#D4F268]/20 text-[#D4F268] border border-[#D4F268]/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'}`}>
                                            <Swords size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Public Cases</span>
                                            <span className="text-white font-bold font-mono">
                                                <span className={shownPassed === shownResults.length ? 'text-[#D4F268]' : 'text-orange-500'}>{shownPassed}</span> / {shownResults.length} Exterminated
                                            </span>
                                        </div>
                                    </div>

                                    {hiddenResults.length > 0 && (
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${hiddenPassed === hiddenResults.length ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                                                <Sparkles size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Secret Cases</span>
                                                <span className="text-white font-bold font-mono">
                                                    <span className={hiddenPassed === hiddenResults.length ? 'text-indigo-400' : 'text-red-500'}>{hiddenPassed}</span> / {hiddenResults.length} Discovered
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Test Cases List */}
                            <motion.div 
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col gap-3"
                            >
                                {shownResults.map((result, index) => {
                                    const isExpanded = expandedCases.has(index);
                                    const isSuccess = result.passed;

                                    return (
                                        <motion.div 
                                            variants={itemVariant}
                                            key={index} 
                                            className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                                                isSuccess 
                                                    ? isExpanded ? 'border-[#D4F268]/40 bg-slate-900 shadow-[0_4px_20px_rgba(212,242,104,0.05)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                                                    : isExpanded ? 'border-red-500/40 bg-slate-900 shadow-[0_4px_20px_rgba(239,68,68,0.1)]' : 'border-red-500/20 bg-red-950/20 hover:border-red-500/40 hover:bg-red-900/30'
                                            }`}
                                        >
                                            {/* Accordion Header */}
                                            <div 
                                                className="px-5 py-4 flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleCase(index)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl rounded-tl-sm flex items-center justify-center shadow-inner ${
                                                        isSuccess 
                                                            ? 'bg-gradient-to-br from-[#D4F268] to-emerald-500 text-slate-900' 
                                                            : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                                                    }`}>
                                                        {isSuccess ? <CheckCircle2 size={24} stroke="none" fill="currentColor" className="text-slate-900" /> : <X size={20} strokeWidth={4}/>}
                                                    </div>
                                                    
                                                    <div className="flex flex-col">
                                                        <span className="text-white text-lg font-black uppercase tracking-wider font-mono">Test Node 0{index + 1}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <TerminalSquare size={12} className="text-slate-500" />
                                                            <span className={`text-[10px] uppercase tracking-widest font-bold ${isSuccess ? 'text-[#D4F268]/70' : 'text-red-400'}`}>
                                                                {isSuccess ? 'Verification Passed' : 'Anomaly Detected'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold hidden sm:block ${
                                                        isSuccess 
                                                            ? 'bg-[#D4F268]/10 text-[#D4F268] border-[#D4F268]/20' 
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                        {result.timeMs.toFixed(0)}MS
                                                    </div>
                                                    <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-slate-800 text-white' : 'text-slate-500 bg-transparent'}`}>
                                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Accordion Body */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-slate-950 border-t border-slate-800/50"
                                                    >
                                                        <div className="px-6 py-6 flex flex-col md:flex-row gap-6 relative">
                                                            {/* Vertical connecting line for aesthetics */}
                                                            <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-slate-800 -translate-x-1/2" />

                                                            {/* Expected Output */}
                                                            <div className="flex-1 relative">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                                                        <Target size={14} /> Expected Registry
                                                                    </h4>
                                                                    <div className="bg-cyan-950 px-2 py-0.5 rounded text-cyan-500 font-mono text-[10px] uppercase font-bold border border-cyan-900">
                                                                        {result.ruleType === 'text-match' ? 'Text Match' : 
                                                                         result.ruleType === 'css-prop' ? 'Style Check' : 
                                                                         (result.ruleType === 'functional' ? 'Logic Block' : 'DOM Assert')}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap break-words min-h-[80px]">
                                                                    {result.expected}
                                                                </div>
                                                            </div>

                                                            {/* Actual Output */}
                                                            <div className="flex-1 relative">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <h4 className={`font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${isSuccess ? 'text-[#D4F268]' : 'text-red-400'}`}>
                                                                        <TerminalSquare size={14} /> Output Stream
                                                                    </h4>
                                                                    <div className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold border ${
                                                                        isSuccess ? 'bg-[#D4F268]/10 text-[#D4F268] border-[#D4F268]/20' : 'bg-red-950 text-red-500 border-red-900'
                                                                    }`}>
                                                                        {isSuccess ? 'Perfect Match' : 'Corrupted Data'}
                                                                    </div>
                                                                </div>
                                                                <div className={`bg-slate-900 border rounded-xl p-4 font-mono text-sm whitespace-pre-wrap break-words min-h-[80px] ${
                                                                    isSuccess ? 'border-slate-800 text-slate-300' : 'border-red-900/50 text-red-200 bg-red-950/20'
                                                                }`}>
                                                                    {result.actual}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                            
                            {/* Run Result Action Button */}
                            <div className="mt-8 flex justify-center pb-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className={`relative overflow-hidden group px-12 py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${
                                        allPassed
                                            ? 'bg-[#D4F268] text-slate-900 hover:shadow-[0_0_30px_rgba(212,242,104,0.4)]'
                                            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                                    }`}
                                >
                                    {allPassed && (
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                    )}
                                    <span className="relative z-10">{allPassed ? "Claim Reward" : "Return to Editor"}</span>
                                    {allPassed && <Sparkles className="relative z-10" size={20} />}
                                </motion.button>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
