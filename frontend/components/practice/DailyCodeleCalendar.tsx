"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";

interface GameHistory {
    date: string;
    won: boolean;
    guesses: number;
}

// Generate mock history for last 30 days
const generateMockHistory = (): GameHistory[] => {
    const history: GameHistory[] = [];
    const today = new Date();

    for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const won = Math.random() > 0.2; // 80% win rate
        history.push({
            date: date.toISOString().split('T')[0],
            won,
            guesses: won ? Math.floor(Math.random() * 5) + 1 : 6
        });
    }
    return history;
};

export default function DailyCodeleCalendar({ onPlayPastPuzzle }: { onPlayPastPuzzle?: (date: string) => void }) {
    const [history] = useState<GameHistory[]>(generateMockHistory());

    const getStatusColor = (game?: GameHistory) => {
        if (!game) return "bg-zinc-100 hover:bg-zinc-200";
        if (game.won) return "bg-lime-400 hover:bg-lime-500";
        return "bg-amber-400 hover:bg-amber-500";
    };

    const today = new Date();
    const daysToShow = 30;
    const days = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const game = history.find(g => g.date === dateStr);
        days.push({ date: dateStr, game, dayNum: date.getDate() });
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-lime-100 flex items-center justify-center text-lime-600">
                    <CalendarIcon size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-zinc-900">Archive Calendar</h3>
                    <p className="text-sm text-zinc-500">Play past puzzles</p>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-6 text-xs font-bold text-zinc-600">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-lime-400"></div>
                    <span>Won</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-400"></div>
                    <span>Lost</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-100"></div>
                    <span>Not Played</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, i) => (
                    <motion.button
                        key={day.date}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.01 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPlayPastPuzzle?.(day.date)}
                        className={`
                            aspect-square rounded-xl ${getStatusColor(day.game)}
                            flex flex-col items-center justify-center
                            transition-all cursor-pointer relative
                            border-2 border-transparent hover:border-zinc-300
                        `}
                    >
                        <span className="text-sm font-bold text-zinc-900">{day.dayNum}</span>
                        {day.game && day.game.won && (
                            <span className="text-[10px] font-black text-zinc-700">{day.game.guesses}/6</span>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-black text-zinc-900">
                            {history.filter(g => g.won).length}
                        </div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Wins</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-zinc-900">
                            {Math.round((history.filter(g => g.won).length / history.length) * 100)}%
                        </div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Win Rate</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-zinc-900">
                            {history.length}
                        </div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Played</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
