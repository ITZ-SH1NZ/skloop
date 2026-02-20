"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PorcelainShell from "@/components/practice/PorcelainShell";
import DailyGame from "@/components/dashboard/DailyGame";
import DailyCodeleStats from "@/components/practice/DailyCodeleStats";
import DailyCodeleCalendar from "@/components/practice/DailyCodeleCalendar";
import DailyCodeleLeaderboard from "@/components/practice/DailyCodeleLeaderboard";
import { Gamepad2, Calendar, Trophy } from "lucide-react";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

type Tab = "play" | "archive" | "leaderboard";

// Mock word mapping for past dates (in real app, this would be deterministic based on date)
const getWordForDate = (date: string): string => {
    const words = ["REACT", "STACK", "QUEUE", "ASYNC", "CONST", "AWAIT", "FETCH", "BUILD", "DEBUG", "LOGIC"];
    // Use date as seed for consistent word per date
    const dateNum = new Date(date).getDate();
    return words[dateNum % words.length];
};

export default function Page() {
    const [activeTab, setActiveTab] = useState<Tab>("play");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [revealedWord, setRevealedWord] = useState<string | null>(null);

    const revealRef = useAutoScroll<HTMLDivElement>({
        trigger: revealedWord,
        offset: -20,
        behavior: "smooth"
    });

    const tabs = [
        { id: "play" as Tab, label: "Play Today", icon: Gamepad2 },
        { id: "archive" as Tab, label: "Archive", icon: Calendar },
        { id: "leaderboard" as Tab, label: "Leaderboard", icon: Trophy }
    ];

    return (
        <PorcelainShell
            title="Daily Codele"
            description="Guess the programming term. 6 attempts."
        >
            <div className="max-w-6xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl p-2 border border-zinc-100 shadow-sm w-full md:w-fit mx-auto overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative px-3 py-2 md:px-6 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider md:tracking-widest
                                transition-colors flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-1 md:flex-initial justify-center
                                ${activeTab === tab.id
                                    ? 'text-zinc-900'
                                    : 'text-zinc-500 hover:text-zinc-900'
                                }
                            `}
                        >
                            {/* Animated background indicator */}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-lime-500 rounded-xl shadow-md"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <tab.icon size={14} className="md:w-4 md:h-4 relative z-10" />
                            <span className="hidden sm:inline relative z-10">{tab.label}</span>
                            <span className="sm:hidden relative z-10">{tab.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "play" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start max-w-6xl mx-auto pt-4 md:pt-8">
                            {/* Game Column */}
                            <div className="flex justify-center lg:justify-end w-full">
                                <DailyGame isOpen={true} onClose={() => { }} inline={true} />
                            </div>

                            {/* Stats Column */}
                            <div className="flex justify-center lg:justify-start w-full">
                                <DailyCodeleStats />
                            </div>
                        </div>
                    )}

                    {activeTab === "archive" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <DailyCodeleCalendar onPlayPastPuzzle={(date) => {
                                setSelectedDate(date);
                                setRevealedWord(getWordForDate(date));
                            }} />

                            {/* Word Reveal Card */}
                            {revealedWord && selectedDate && (
                                <motion.div
                                    ref={revealRef}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-xl text-center space-y-6"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <h3 className="text-2xl font-black text-zinc-900 mb-2">The word was:</h3>
                                        <div className="inline-flex gap-2 mb-4">
                                            {revealedWord.split('').map((letter, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0, rotateY: 0 }}
                                                    animate={{ scale: 1, rotateY: [0, 360] }}
                                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                                    className="w-12 h-12 md:w-14 md:h-14 bg-lime-500 rounded-2xl flex items-center justify-center text-2xl font-black text-zinc-900 shadow-lg"
                                                >
                                                    {letter}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setRevealedWord(null);
                                            setSelectedDate(null);
                                            setActiveTab("play");
                                        }}
                                        className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        Play New Game
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {activeTab === "leaderboard" && (
                        <div className="max-w-2xl mx-auto">
                            <DailyCodeleLeaderboard />
                        </div>
                    )}
                </motion.div>
            </div>
        </PorcelainShell>
    );
}
