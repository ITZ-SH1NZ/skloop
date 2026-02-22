"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, Sparkles, Sword } from "lucide-react";

type ServerEvent = {
    id: number;
    type: "system" | "combat" | "achievement" | "loot";
    message: React.ReactNode;
    time: string;
};

const INITIAL_EVENTS: ServerEvent[] = [
    { id: 1, type: "system", message: <span>Server connection established. Welcome to the Arena.</span>, time: "10:00:00" },
    { id: 2, type: "combat", message: <span><strong className="text-lime-400">ByteNinja</strong> defeated Boss: <strong className="text-red-400">Memory Leak</strong></span>, time: "10:02:14" },
    { id: 3, type: "achievement", message: <span><strong className="text-cyan-400">NeoHakr</strong> reached a 7-day Codele Streak!</span>, time: "10:05:42" },
];

const RANDOM_MESSAGES = [
    { type: "loot" as const, getMsg: () => <span><strong className="text-yellow-400">Player_77</strong> found a rare item: [Mechanical Keyboard Switch]</span> },
    { type: "combat" as const, getMsg: () => <span><strong className="text-lime-400">SyntaxError</strong> was slain by <strong className="text-blue-400">DevChad</strong></span> },
    { type: "achievement" as const, getMsg: () => <span><strong className="text-purple-400">AlgorithmMaster</strong> unlocked the badge: [O(n) Time Complexity]</span> },
    { type: "system" as const, getMsg: () => <span>[SYSTEM ALERT]: New Daily Quest available in the Dashboard.</span> },
    { type: "combat" as const, getMsg: () => <span><strong className="text-lime-400">CodeWizard</strong> successfully performed a <strong className="text-orange-400">Git Rebase</strong></span> },
];

export default function LiveServerLog() {
    const [events, setEvents] = useState<ServerEvent[]>(INITIAL_EVENTS);
    const [counter, setCounter] = useState(4);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomMsg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            const newEvent: ServerEvent = {
                id: counter,
                type: randomMsg.type,
                message: randomMsg.getMsg(),
                time: timeStr
            };

            setEvents(prev => [...prev.slice(-4), newEvent]); // Keep only last 5
            setCounter(prev => prev + 1);
        }, 3500); // New event every 3.5 seconds

        return () => clearInterval(interval);
    }, [counter]);

    const getIcon = (type: string) => {
        switch (type) {
            case "system": return <Terminal className="w-4 h-4 text-zinc-500" />;
            case "combat": return <Sword className="w-4 h-4 text-red-500" />;
            case "achievement": return <Sparkles className="w-4 h-4 text-yellow-500" />;
            case "loot": return <ShieldAlert className="w-4 h-4 text-cyan-500" />;
            default: return <Terminal className="w-4 h-4" />;
        }
    };

    return (
        <section className="relative w-full max-w-5xl mx-auto px-2 md:px-6">
            <div className="text-center mb-8 md:mb-10">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-block px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-black uppercase tracking-widest mb-4 border-2 border-black shadow-[2px_2px_0_0_#000]"
                >
                    Live Server
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase">The Arena Is Open</h2>
                <p className="text-zinc-600 font-bold mt-4 text-balance">Watch thousands of developers level up in real time.</p>
            </div>

            <div className="bg-zinc-950 border-4 md:border-8 border-black rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-[12px_12px_0_0_#000] overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b-2 border-zinc-800 pb-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                        <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    </div>
                    <div className="flex items-center gap-2 text-lime-400 font-mono text-xs font-bold uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                        Global Feed
                    </div>
                </div>

                <div className="flex flex-col gap-2 font-mono text-sm md:text-base h-[280px] md:h-[320px] overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: "auto" }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ type: "spring", bounce: 0.4 }}
                                className="flex items-start gap-4 p-2 rounded hover:bg-zinc-900 transition-colors"
                            >
                                <span className="text-zinc-600 shrink-0 select-none">[{event.time}]</span>
                                <div className="shrink-0 mt-0.5">{getIcon(event.type)}</div>
                                <div className="text-zinc-300">
                                    {event.message}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
