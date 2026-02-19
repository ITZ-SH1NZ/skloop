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

export function LeaderboardTable({ users, metric = "xp" }: { users: LeaderboardUser[], metric?: "xp" | "coins" }) {
    return (
        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider w-20">Rank</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">{metric === "xp" ? "XP" : "Coins"}</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider w-24">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {users.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group hover:bg-zinc-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-bold text-zinc-500 text-sm w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        #{user.rank}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Avatar src={user.avatarUrl} fallback={user.name[0]} className="w-10 h-10 border border-zinc-100 mr-4" />
                                        <div>
                                            <div className="text-sm font-bold text-zinc-900">{user.name}</div>
                                            <div className="text-xs text-zinc-500 font-medium">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1.5 min-w-[100px] justify-end ${metric === "xp" ? "text-zinc-700 bg-zinc-100" : "text-yellow-700 bg-yellow-50"}`}>
                                        <FramerCounter value={metric === "xp" ? user.xp : user.coins} />
                                        <span>{metric === "xp" ? "XP" : "Coins"}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-zinc-400">
                                    {user.trend === "up" && <TrendingUp size={18} className="text-green-500 mx-auto" />}
                                    {user.trend === "down" && <TrendingDown size={18} className="text-red-400 mx-auto" />}
                                    {user.trend === "same" && <Minus size={18} className="text-zinc-300 mx-auto" />}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {users.length === 0 && (
                <div className="p-12 text-center text-zinc-400 text-sm">No users found</div>
            )}
        </div>
    );
}
