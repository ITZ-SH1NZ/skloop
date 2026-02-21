"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Terminal, CheckCircle2, XCircle, Zap, MousePointer2, ArrowRight } from "lucide-react";
import Link from "next/link";

export const QuickSandbox = () => {
    const [code, setCode] = useState("function sum(a, b) {\n  return a - b;\n}");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const verifyCode = () => {
        if (code.includes("return a + b;")) {
            setStatus("success");
            setMessage("PROTOCOL_VERIFIED: +500 XP");
        } else {
            setStatus("error");
            setMessage("LOGIC_LAG_DETECTED: MISMATCH");
            setTimeout(() => setStatus("idle"), 2000);
        }
    };

    return (
        <section className="py-24 md:py-60 px-8 bg-[#FDFCF8] relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full mb-8 shadow-xl">
                            <Terminal size={14} className="text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 italic">Active Implementation</span>
                        </div>
                        <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black tracking-tighter mb-12 leading-none">
                            THE 3-LINE <br />
                            <span className="text-primary italic italic">QUEST.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed mb-12">
                            Physicality is everything. Fix the logic lag in the sandbox to earned your first Mastery Protocol badge.
                        </p>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                <Code2 className="text-zinc-400" />
                                <div className="text-xs font-bold text-zinc-600">MISSION: FIX_SUM_LOGIC</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-zinc-950 rounded-[2rem] md:rounded-[3rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="relative bg-zinc-900 rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-zinc-800 p-6 md:p-8 shadow-3xl overflow-hidden min-h-[400px] md:min-h-[460px] flex flex-col">
                            {/* Window Header */}
                            <div className="flex items-center justify-between mb-8 opacity-40">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                </div>
                                <div className="text-[9px] font-mono tracking-widest text-zinc-500">TERMINAL_001</div>
                            </div>

                            {/* Code Area */}
                            <div className="flex-1 font-mono text-lg text-white">
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full bg-transparent outline-none resize-none h-32 md:h-40 border-l-4 border-zinc-800 focus:border-primary transition-colors spellcheck-false text-sm md:text-lg pl-4 md:pl-6"
                                    spellCheck={false}
                                />
                                <div className="mt-8 text-zinc-600 text-[10px] italic">
                                    // Task: Change return a - b to return a + b
                                </div>
                            </div>

                            {/* Feedback Overlay */}
                            <AnimatePresence>
                                {status !== "idle" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md ${status === 'success' ? 'bg-primary/20' : 'bg-red-500/10'}`}
                                    >
                                        <div className={`p-6 rounded-full ${status === 'success' ? 'bg-primary' : 'bg-red-500'} mb-6 shadow-2xl`}>
                                            {status === "success" ? <CheckCircle2 size={48} className="text-zinc-900" /> : <XCircle size={48} className="text-white" />}
                                        </div>
                                        <div className={`font-black uppercase tracking-[0.3em] text-sm ${status === 'success' ? 'text-zinc-900' : 'text-red-500'} mb-8`}>
                                            {message}
                                        </div>
                                        {status === "success" && (
                                            <Link href="/signup">
                                                <motion.button
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
                                                >
                                                    CONTINUE_MASTERY <ArrowRight size={14} />
                                                </motion.button>
                                            </Link>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Verification Button */}
                            <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Compiler: Ready</div>
                                <button
                                    onClick={verifyCode}
                                    className="px-6 md:px-8 py-2 md:py-3 bg-white text-zinc-900 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 group-hover:scale-105 active:scale-95 shadow-xl"
                                >
                                    VERIFY_LOGIC <MousePointer2 size={12} className="md:w-3.5 md:h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Floating XP Badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-6 -right-6 w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-glow-primary rotate-12 z-10"
                        >
                            <Zap size={32} className="text-zinc-900" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
