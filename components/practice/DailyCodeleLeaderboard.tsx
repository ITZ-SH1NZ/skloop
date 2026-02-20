"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Crown } from "lucide-react";

interface LeaderboardEntry {
    rank: number;
    username: string;
    streak: number;
    winRate: number;
    avgTime: number;
    isCurrentUser?: boolean;
}

// TODO: Fetch leaderboard from backend
const MOCK_LEADERBOARD: LeaderboardEntry[] = [];

export default function DailyCodeleLeaderboard() {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Trophy size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-zinc-900">Global Leaderboard</h3>
                    <p className="text-sm text-zinc-500">Top performers this month</p>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
                {MOCK_LEADERBOARD.length > 0 ? (
                    MOCK_LEADERBOARD.map((entry, i) => (
                        <motion.div
                            key={entry.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`
                                p-4 rounded-2xl flex items-center gap-4
                                ${entry.isCurrentUser
                                    ? 'bg-lime-50 border-2 border-lime-300 shadow-md'
                                    : 'bg-white border border-zinc-100 hover:border-zinc-200'
                                }
                                transition-all
                            `}
                        >
                            {/* Rank Badge */}
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg
                                ${entry.rank === 1 ? 'bg-amber-400 text-white' :
                                    entry.rank === 2 ? 'bg-zinc-300 text-zinc-800' :
                                        entry.rank === 3 ? 'bg-amber-600 text-white' :
                                            'bg-zinc-100 text-zinc-600'}
                            `}>
                                {entry.rank <= 3 && <Crown size={16} className="mr-0.5" />}
                                {entry.rank > 3 && entry.rank}
                            </div>

                            {/* Username */}
                            <div className="flex-1">
                                <div className="font-bold text-zinc-900 flex items-center gap-2">
                                    {entry.username}
                                    {entry.isCurrentUser && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-lime-200 text-lime-800 font-black">YOU</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="hidden md:flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-lime-600">
                                    <Flame size={16} />
                                    <span className="font-bold">{entry.streak}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-600">
                                    <Trophy size={16} />
                                    <span className="font-bold">{entry.winRate}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-600">
                                    <Zap size={16} />
                                    <span className="font-bold">{entry.avgTime}s</span>
                                </div>
                            </div>

                            {/* Mobile Stats (Compact) */}
                            <div className="md:hidden text-xs font-bold text-zinc-600">
                                {entry.winRate}% • {entry.streak}🔥
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        <Trophy className="mx-auto text-zinc-300 mb-2" size={32} />
                        <p className="text-zinc-500 font-medium">No rankings available for today yet.</p>
                        <p className="text-xs text-zinc-400">Be the first to play!</p>
                    </div>
                )}
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-zinc-50 rounded-2xl text-center">
                <p className="text-xs text-zinc-500 font-medium">
                    Rankings update daily at midnight • Keep your streak alive!
                </p>
            </div>
        </div>
    );
}
