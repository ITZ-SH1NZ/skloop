"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { Trophy, Flame, Clock, BookOpen, BarChart3, Info } from "lucide-react";

const TERMS = [
    { term: "Hoisting", def: "In JavaScript, variable and function declarations are moved to the top of their containing scope during the compile phase." },
    { term: "Closure", def: "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment)." },
    { term: "Promise", def: "An object representing the eventual completion or failure of an asynchronous operation." },
    { term: "Event Loop", def: "The mechanism that allows JavaScript to perform non-blocking I/O operations despite being single-threaded." },
    { term: "Memoization", def: "An optimization technique used to speed up computer programs by storing the results of expensive function calls." }
];

export default function DailyCodeleStats() {
    const [termIndex, setTermIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const nextTerm = () => {
        setTermIndex((prev) => (prev + 1) % TERMS.length);
    };

    return (
        <div className="space-y-6 w-full max-w-md">

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center group hover:border-lime-200 transition-colors"
                >
                    <div className="mb-3 p-3 bg-lime-50 text-lime-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <Trophy size={20} />
                    </div>
                    <div className="text-3xl font-extrabold text-zinc-900">85%</div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Win Rate</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center group hover:border-lime-200 transition-colors"
                >
                    <div className="mb-3 p-3 bg-lime-50 text-lime-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <Flame size={20} />
                    </div>
                    <div className="text-3xl font-extrabold text-zinc-900">12</div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Day Streak</div>
                </motion.div>
            </div>

            {/* Word of the Day / Fact */}
            <motion.div
                key={termIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 rounded-[2rem] shadow-md shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <BookOpen size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Info size={16} strokeWidth={3} />
                        </span>
                        <h3 className="text-lg font-bold text-zinc-900">Did you know?</h3>
                    </div>

                    <div className="space-y-4 min-h-[120px]">
                        <div className="text-2xl font-black text-zinc-900 tracking-tight">
                            &quot;{TERMS[termIndex].term}&quot;
                        </div>
                        <p className="text-zinc-500 leading-relaxed font-medium">
                            {TERMS[termIndex].def}
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Random Term</span>
                        <button onClick={nextTerm} className="text-lime-600 font-bold text-sm hover:underline">Next Term &rarr;</button>
                    </div>
                </div>
            </motion.div>

            {/* Countdown / Next Puzzle */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl shadow-zinc-300 flex items-center justify-between relative overflow-hidden"
            >
                {/* Decorative glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-lime-500/20 blur-3xl rounded-full" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">Next Codele</div>
                        <div className="text-2xl font-mono font-bold tracking-wider">{timeLeft}</div>
                    </div>
                </div>
            </motion.div>

            {/* Guess Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-8 rounded-[2rem] shadow-md shadow-zinc-200/50 border border-zinc-100"
            >
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center text-lime-600">
                        <BarChart3 size={16} strokeWidth={3} />
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900">Guess Distribution</h3>
                </div>

                <div className="space-y-3">
                    {[
                        { guess: 1, count: 3, percentage: 12 },
                        { guess: 2, count: 8, percentage: 32 },
                        { guess: 3, count: 7, percentage: 28 },
                        { guess: 4, count: 5, percentage: 20 },
                        { guess: 5, count: 2, percentage: 8 },
                        { guess: 6, count: 0, percentage: 0 }
                    ].map((dist) => (
                        <div key={dist.guess} className="flex items-center gap-3">
                            <div className="text-sm font-bold text-zinc-600 w-4">{dist.guess}</div>
                            <div className="flex-1 h-8 bg-zinc-100 rounded-xl overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dist.percentage}%` }}
                                    transition={{ delay: 0.6 + dist.guess * 0.05, duration: 0.5 }}
                                    className="h-full bg-lime-500 flex items-center justify-end pr-3"
                                >
                                    {dist.count > 0 && (
                                        <span className="text-xs font-black text-zinc-900">{dist.count}</span>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
}
