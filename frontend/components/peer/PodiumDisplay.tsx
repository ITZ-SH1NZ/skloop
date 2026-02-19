"use client";

import { Avatar } from "@/components/ui/Avatar";
import { FramerCounter } from "@/components/ui/FramerCounter";
import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";

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

export function PodiumDisplay({ users, metric = "xp" }: { users: LeaderboardUser[], metric?: "xp" | "coins" }) {
    if (users.length < 3) return null;

    const [first, second, third] = [
        users.find(u => u.rank === 1),
        users.find(u => u.rank === 2),
        users.find(u => u.rank === 3)
    ];

    if (!first || !second || !third) return null;

    return (
        <div className="flex items-end justify-center gap-4 md:gap-8 mb-12 min-h-[240px]">
            {/* 2nd Place */}
            <PodiumStep user={second} place={2} color="text-zinc-400" bg="bg-zinc-100" delay={0.2} metric={metric} />

            {/* 1st Place */}
            <PodiumStep user={first} place={1} color={metric === "xp" ? "text-amber-400" : "text-yellow-400"} bg={metric === "xp" ? "bg-amber-50" : "bg-yellow-50"} delay={0} isFirst metric={metric} />

            {/* 3rd Place */}
            <PodiumStep user={third} place={3} color={metric === "xp" ? "text-orange-400" : "text-yellow-600"} bg={metric === "xp" ? "bg-orange-50" : "bg-yellow-50/50"} delay={0.4} metric={metric} />
        </div>
    );
}

function PodiumStep({ user, place, color, bg, delay, isFirst = false, metric }: { user: LeaderboardUser, place: number, color: string, bg: string, delay: number, isFirst?: boolean, metric: "xp" | "coins" }) {

    const value = metric === "xp" ? user.xp : user.coins;
    const label = metric === "xp" ? "XP" : "Coins";

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
            className={`flex flex-col items-center ${isFirst ? "-mt-8 z-10" : ""}`}
        >
            {/* Avatar & Badge */}
            <motion.div
                className="relative mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: isFirst ? 0 : place === 2 ? 1 : 2
                }}
            >
                <div className={`rounded-full p-1 ${isFirst ? (metric === "xp" ? "bg-gradient-to-br from-amber-300 to-yellow-500 shadow-xl shadow-amber-500/20" : "bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-xl shadow-yellow-500/20") : "bg-white shadow-lg"}`}>
                    <Avatar
                        src={user.avatarUrl}
                        fallback={user.name[0]}
                        className={`${isFirst ? "w-24 h-24 md:w-32 md:h-32 border-4" : "w-20 h-20 md:w-24 md:h-24 border-2"} border-white object-cover`}
                    />
                </div>
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${isFirst ? (metric === "xp" ? "text-amber-500" : "text-yellow-500") : "text-zinc-400"}`}>
                    {isFirst ? <Crown size={32} fill="currentColor" /> : place === 2 ? <Medal size={24} /> : <Medal size={24} />}
                </div>
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-md ${place === 1 ? (metric === "xp" ? "bg-amber-500 text-white" : "bg-yellow-500 text-white") : place === 2 ? "bg-zinc-400 text-white" : (metric === "xp" ? "bg-orange-400 text-white" : "bg-yellow-700 text-white")}`}>
                    #{place}
                </div>
            </motion.div>

            {/* Info */}
            <div className="text-center">
                <h3 className={`font-bold text-zinc-900 ${isFirst ? "text-lg md:text-xl" : "text-base md:text-lg"}`}>{user.name}</h3>
                <p className="text-zinc-500 text-xs md:text-sm font-medium">@{user.username}</p>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${bg} ${color}`}>
                    <FramerCounter value={value} /> <span className="ml-1">{label}</span>
                </div>
            </div>
        </motion.div>
    );
}
