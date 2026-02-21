"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, PlusSquare, ArrowRight, Play, Keyboard } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

type LetterState = "empty" | "absent" | "present" | "correct";
type KeyState = "absent" | "present" | "correct" | undefined;

const TARGET_WORD = "REACT";
const MAX_ATTEMPTS = 1; // Only one try for the demo

export default function EmbeddedCodal() {
    const [word, setWord] = useState("");
    const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
    const [hasGuessed, setHasGuessed] = useState(false);
    const [letterStates, setLetterStates] = useState<LetterState[]>(Array(5).fill("empty"));
    const [keyboardState, setKeyboardState] = useState<Record<string, KeyState>>({});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== "playing") return;
            if (hasGuessed) return;

            if (e.key === "Enter") {
                submitGuess();
            } else if (e.key === "Backspace") {
                setWord((prev) => prev.slice(0, -1));
            } else if (/^[a-zA-Z]$/.test(e.key) && word.length < 5) {
                setWord((prev) => (prev + e.key).toUpperCase());
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [word, gameState, hasGuessed]);

    const submitGuess = () => {
        if (word.length !== 5) return;
        setHasGuessed(true);

        const newStates: LetterState[] = Array(5).fill("absent");
        const newKeyboardState = { ...keyboardState };
        const targetChars = TARGET_WORD.split("");

        // First pass: correct letters
        for (let i = 0; i < 5; i++) {
            if (word[i] === targetChars[i]) {
                newStates[i] = "correct";
                newKeyboardState[word[i]] = "correct";
                targetChars[i] = " ";
            }
        }

        // Second pass: present letters
        for (let i = 0; i < 5; i++) {
            if (newStates[i] !== "correct" && targetChars.includes(word[i])) {
                newStates[i] = "present";
                newKeyboardState[word[i]] = newKeyboardState[word[i]] === "correct" ? "correct" : "present";
                targetChars[targetChars.indexOf(word[i])] = " ";
            } else if (newStates[i] !== "correct") {
                newKeyboardState[word[i]] = newKeyboardState[word[i]] === "correct" ? "correct" : newKeyboardState[word[i]] === "present" ? "present" : "absent";
            }
        }

        setLetterStates(newStates);
        setKeyboardState(newKeyboardState);

        setTimeout(() => {
            if (word === TARGET_WORD) {
                setGameState("won");
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } else {
                setGameState("lost");
            }
        }, 1500); // Wait for flip animations
    };

    const startGame = () => setGameState("playing");

    const renderGridRow = () => {
        return (
            <div className="flex gap-2 justify-center mb-6">
                {[0, 1, 2, 3, 4].map((i) => {
                    const char = word[i] || "";
                    const state = letterStates[i];

                    let bgClass = "bg-zinc-800 border-zinc-700";
                    if (hasGuessed) {
                        if (state === "correct") bgClass = "bg-lime-500 border-lime-400 text-black";
                        else if (state === "present") bgClass = "bg-yellow-500 border-yellow-400 text-black";
                        else if (state === "absent") bgClass = "bg-zinc-900 border-zinc-800 text-zinc-500";
                    } else if (char) {
                        bgClass = "bg-zinc-700 border-zinc-500 shadow-[0_4px_0_0_#3f3f46]";
                    }

                    return (
                        <motion.div
                            key={i}
                            animate={
                                hasGuessed
                                    ? { rotateX: [0, 90, 0] }
                                    : char ? { scale: [1, 1.1, 1] } : {}
                            }
                            transition={{
                                duration: hasGuessed ? 0.4 : 0.1,
                                delay: hasGuessed ? i * 0.2 : 0
                            }}
                            className={`w-12 h-12 md:w-16 md:h-16 border-4 rounded-xl flex items-center justify-center font-black text-2xl md:text-3xl uppercase transition-colors ${bgClass}`}
                        >
                            {char}
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    // Render simple onscreen keyboard
    const renderKeyboardRow = (keys: string[]) => (
        <div className="flex justify-center gap-1 mb-1">
            {keys.map((k) => {
                const state = keyboardState[k];
                let bg = "bg-zinc-800 border-zinc-700 text-white";
                if (state === "correct") bg = "bg-lime-500 border-lime-600 text-black";
                if (state === "present") bg = "bg-yellow-500 border-yellow-600 text-black";
                if (state === "absent") bg = "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50";

                return (
                    <div key={k} className={`px-2 md:px-3 py-3 md:py-4 rounded-lg border-b-4 font-bold text-xs md:text-sm ${bg}`}>
                        {k}
                    </div>
                )
            })}
        </div>
    );

    return (
        <section className="relative w-full max-w-5xl mx-auto px-2 md:px-6 mb-20">
            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black uppercase">Daily Brain Teaser</h2>
                <p className="text-zinc-600 font-bold mt-4 text-balance text-lg">
                    Train your logic skills with <span className="text-black bg-lime-300 px-2 rounded">Codal</span>.
                    Can you guess the frontend library in one try?
                </p>
            </div>

            <div className="bg-zinc-950 border-4 md:border-8 border-black rounded-[2rem] p-6 shadow-[12px_12px_0_0_#000] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">

                {/* Visual Area */}
                <div className="w-full md:w-1/2 flex flex-col items-center border-r-0 md:border-r-4 md:border-zinc-800 pt-4 md:pr-8">
                    {gameState === "idle" ? (
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-lime-400 rounded-2xl flex items-center justify-center font-black text-5xl border-4 border-black mb-6 shadow-[4px_4px_0_0_#000]">
                                <motion.span animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1 }}>?</motion.span>
                            </div>
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-full border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                            >
                                <Play className="w-5 h-5 fill-white" /> Play Demo
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            {renderGridRow()}

                            <div className="w-full max-w-sm mt-4">
                                {renderKeyboardRow("QWERTYUIOP".split(""))}
                                {renderKeyboardRow("ASDFGHJKL".split(""))}
                                {renderKeyboardRow("ZXCVBNM".split(""))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status/Results Area */}
                <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left h-full">
                    <AnimatePresence mode="wait">
                        {gameState === "playing" && (
                            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-400 font-mono flex flex-col items-center md:items-start text-sm">
                                <Keyboard className="w-8 h-8 mb-4 text-zinc-600" />
                                <p className="mb-2">1. Use your physical keyboard to type a 5-letter technical word.</p>
                                <p>2. Press <kbd className="bg-zinc-800 text-lime-400 px-2 py-0.5 rounded border border-zinc-700 shadow-sm mx-1">Enter</kbd> to submit your guess.</p>
                            </motion.div>
                        )}

                        {(gameState === "won" || gameState === "lost") && (
                            <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center md:items-start">
                                <h3 className={`text-5xl font-black uppercase tracking-tighter mb-4 ${gameState === "won" ? "text-lime-400" : "text-red-500"}`}>
                                    {gameState === "won" ? "Nice Logic." : "Syntax Error."}
                                </h3>
                                <p className="text-zinc-300 font-bold mb-8 text-lg">
                                    {gameState === "won"
                                        ? "You cracked the puzzle. In Skloop, daily puzzle streaks earn massive XP multipliers."
                                        : "Tough luck. In Skloop, you get 6 tries to crack the daily puzzle."}
                                </p>
                                <Link href="/signup">
                                    <button className="px-8 py-4 bg-lime-400 text-black text-xl font-black uppercase tracking-widest rounded-full border-4 border-black shadow-[4px_4px_0_0_#4d7c0f] hover:-translate-y-1 hover:shadow-[4px_8px_0_0_#4d7c0f] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-3">
                                        Join The Streak <ArrowRight className="w-6 h-6" />
                                    </button>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
