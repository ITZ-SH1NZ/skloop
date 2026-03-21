"use client";

import { Avatar } from "@/components/ui/Avatar";
import { FramerCounter } from "@/components/ui/FramerCounter";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardUser {
    id: string;
    rank: number;
    name: string;
    username: string;
    avatarUrl: string;
    xp: number;
    coins: number;
    streak: number;
    trend: "up" | "down" | "same";
}

// Sleek dark circular badge for Rank
const RankBadge = ({ rank }: { rank: number }) => (
    <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-white/5 flex items-center justify-center shrink-0">
        <span className="font-black text-sm text-zinc-400">#{rank}</span>
    </div>
);

export function LeaderboardTable({
    users,
    metric = "xp",
    currentUserId,
}: {
    users: LeaderboardUser[];
    metric?: "xp" | "coins";
    currentUserId?: string | null;
}) {
    // Only display up to Rank 15 in this lower list (which means taking up to 12 users since top 3 are in Podium)
    const displayUsers = users.slice(0, 12);

    if (displayUsers.length === 0) {
        return <div className="p-12 text-center text-zinc-500 font-medium bg-zinc-900/40 rounded-[2rem] border border-white/5">No users found</div>;
    }

    const maxMetric = Math.max(...displayUsers.map(u => metric === "xp" ? u.xp : u.coins), 1);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[2rem] p-4 md:p-8 shadow-2xl border border-white/5 overflow-hidden max-w-4xl mx-auto mb-16">
            <div className="flex text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">
                <div className="w-12">Rank</div>
                <div className="flex-1 ml-2">User</div>
                <div className="w-40 text-right pr-4">{metric === "xp" ? "XP" : "Coins"}</div>
                <div className="w-12 text-center">Trend</div>
            </div>

            <div className="flex flex-col">
                {displayUsers.map((user, index) => {
                    const isMe = user.id === currentUserId;
                    const value = metric === "xp" ? user.xp : user.coins;
                    const progressWidth = Math.max(5, Math.min(100, (value / maxMetric) * 100));

                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03, ease: "easeOut" }}
                            className={`group flex items-center gap-4 py-4 px-2 md:px-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-xl ${
                                isMe ? "bg-white/5 border-white/10" : ""
                            }`}
                        >
                            <RankBadge rank={user.rank} />

                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <Avatar src={user.avatarUrl} fallback={user.name[0]} className="w-10 h-10 md:w-12 md:h-12 border border-zinc-700 shadow-sm shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <div className="text-sm md:text-base font-bold text-white flex items-center gap-2 truncate">
                                        <span className="truncate">{user.name}</span>
                                        {isMe && (
                                            <span className="text-[9px] font-black bg-[#D4F268] text-zinc-950 px-1.5 py-0.5 rounded-sm uppercase tracking-widest shrink-0">
                                                YOU
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-400 font-medium truncate">@{user.username}</div>
                                </div>
                            </div>

                            {/* Neon Progress Pill */}
                            <div className="hidden md:flex relative w-40 h-8 bg-black/40 border border-white/5 rounded-full overflow-hidden items-center justify-end px-3 shrink-0">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressWidth}%` }}
                                    transition={{ duration: 1, delay: 0.2 + index * 0.05, ease: "easeOut" }}
                                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#84cc16]/80 to-[#D4F268]"
                                />
                                <span className={`relative z-10 text-xs font-black tracking-wide ${progressWidth > 80 ? "text-zinc-950" : "text-white"}`}>
                                    <FramerCounter value={value} /> {metric === "xp" ? "XP" : "Coins"}
                                </span>
                            </div>

                            <div className="w-12 flex justify-center shrink-0">
                                {user.trend === "up" && <TrendingUp size={16} className="text-[#D4F268]" />}
                                {user.trend === "down" && <TrendingDown size={16} className="text-red-400" />}
                                {user.trend === "same" && <Minus size={16} className="text-zinc-500" />}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
