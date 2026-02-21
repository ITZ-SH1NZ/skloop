"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Sparkles, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const TARGET_CODE = "fixBug();";
const TIME_LIMIT = 5; // seconds

export default function PlayableBossFight() {
    const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Timer logic
    useEffect(() => {
        if (gameState !== "playing") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    clearInterval(timer);
                    setGameState("lost");
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [gameState]);

    // Win condition check
    useEffect(() => {
        if (gameState === "playing" && input === TARGET_CODE) {
            setGameState("won");
            triggerConfetti();
        }
    }, [input, gameState]);

    const startGame = () => {
        setGameState("playing");
        setTimeLeft(TIME_LIMIT);
        setInput("");
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#A3E635', '#ffffff'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#A3E635', '#ffffff'] });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    return (
        <section className="relative w-full max-w-4xl mx-auto px-2 md:px-6 mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase mb-8">Boss Encounter</h2>

            <div className="bg-black border-4 md:border-8 border-red-500 rounded-[2rem] p-6 md:p-12 shadow-[10px_10px_0_0_#ef4444] relative overflow-hidden transition-all duration-300">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

                <AnimatePresence mode="wait">
                    {/* IDLE STATE */}
                    {gameState === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center relative z-10"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-24 h-24 bg-red-500 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_#000] mb-6"
                            >
                                <Bug className="w-12 h-12 text-black" />
                            </motion.div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Wild Syntax Error Appeared!</h3>
                            <p className="text-zinc-400 font-bold mb-8">You have 5 seconds to type <span className="text-lime-400 font-mono px-2 py-1 bg-zinc-900 rounded border border-zinc-700">{TARGET_CODE}</span> to defeat it.</p>

                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-red-500 text-white font-black uppercase tracking-widest rounded-full border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                            >
                                <Shield className="w-5 h-5" /> Engage Combat
                            </button>
                        </motion.div>
                    )}

                    {/* PLAYING STATE */}
                    {gameState === "playing" && (
                        <motion.div
                            key="playing"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="flex flex-col items-center justify-center relative z-10"
                        >
                            {/* The Enemy */}
                            <motion.div
                                animate={{ x: [-5, 5, -5] }}
                                transition={{ repeat: Infinity, duration: 0.1 }}
                                className="w-32 h-32 bg-red-500 rounded-xl flex items-center justify-center border-4 border-black mb-6"
                                style={{ filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))" }}
                            >
                                <Bug className="w-16 h-16 text-black" />
                            </motion.div>

                            {/* Health Bar (Timer) */}
                            <div className="w-full max-w-md h-6 bg-zinc-900 border-4 border-black rounded-full overflow-hidden mb-6 shadow-[4px_4px_0_0_#000]">
                                <motion.div
                                    className="h-full bg-red-500 border-r-4 border-black"
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                                    transition={{ ease: "linear", duration: 0.1 }}
                                />
                            </div>

                            <div className="font-mono text-3xl font-black text-white mb-2">
                                {timeLeft.toFixed(1)}s
                            </div>
                            <div className="text-zinc-500 font-mono text-sm mb-6">Type: <span className="text-lime-400">{TARGET_CODE}</span></div>

                            {/* Input Field */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full max-w-md bg-zinc-900 border-4 border-black text-lime-400 font-mono text-3xl text-center rounded-xl py-4 focus:outline-none focus:border-lime-500 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] tracking-widest"
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </motion.div>
                    )}

                    {/* WON STATE */}
                    {gameState === "won" && (
                        <motion.div
                            key="won"
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            className="flex flex-col items-center justify-center relative z-10"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,242,104,0.3)_0%,transparent_70%)] pointer-events-none" />

                            <Sparkles className="w-20 h-20 text-lime-400 mb-6 animate-pulse" />

                            <h3 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Victory!</h3>
                            <p className="text-zinc-300 font-bold mb-8 max-w-sm">The bug has been squashed. You've proven your reflexes. Now claim your reward.</p>

                            <Link href="/signup">
                                <button className="px-10 py-5 bg-lime-400 text-black text-2xl font-black uppercase tracking-widest rounded-full border-4 border-black shadow-[0_8px_0_0_#A3E635] hover:-translate-y-2 hover:shadow-[0_12px_0_0_#A3E635] active:translate-y-[6px] active:shadow-[0_2px_0_0_#A3E635] transition-all flex items-center gap-3 group">
                                    Claim Loot <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </Link>
                        </motion.div>
                    )}

                    {/* LOST STATE */}
                    {gameState === "lost" && (
                        <motion.div
                            key="lost"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center relative z-10"
                        >
                            <h3 className="text-5xl font-black text-red-500 uppercase tracking-tighter mb-4">Defeat.</h3>
                            <p className="text-zinc-400 font-bold mb-8">The bug escaped to production. Your tech lead is disappointed.</p>

                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-full border-2 border-zinc-600 hover:bg-zinc-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
