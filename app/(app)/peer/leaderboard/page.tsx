"use client";

import { useState, useEffect } from "react";
import { PodiumDisplay } from "@/components/peer/PodiumDisplay";
import { LeaderboardTable } from "@/components/peer/LeaderboardTable";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Trophy, Globe, Users, Coins, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

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

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
    const [metric, setMetric] = useState<"xp" | "coins">("xp");

    const [globalData, setGlobalData] = useState<LeaderboardUser[]>([]);
    const [friendsData, setFriendsData] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);

            // Fetch Top 50 Global
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, role, xp, coins, streak')
                .order(metric, { ascending: false })
                .limit(50);

            if (profiles) {
                const formattedGlobal = profiles.map((p, index) => ({
                    id: p.id,
                    rank: index + 1,
                    name: p.full_name || p.username || 'User',
                    username: p.username || '',
                    avatarUrl: p.avatar_url,
                    xp: p.xp || 0,
                    coins: p.coins || 0,
                    streak: p.streak || 0,
                    trend: "same" as const // Could calculate from history if available
                }));
                setGlobalData(formattedGlobal);

                if (user) {
                    // Fetch Friends to filter
                    const { data: connections } = await supabase
                        .from('connections')
                        .select('*')
                        .eq('status', 'accepted')
                        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

                    if (connections) {
                        const friendIds = new Set(connections.map(c => c.requester_id === user.id ? c.recipient_id : c.requester_id));
                        friendIds.add(user.id); // Include self

                        // Filter the global top 50 for friends. If a friend is not in top 50, we might need a separate query, 
                        // but for this MVP, just filtering the fetched global list is acceptable or fetching them specifically.
                        // Let's fetch them specifically to ensure accurate local rankings.
                        const { data: friendsProfiles } = await supabase
                            .from('profiles')
                            .select('id, username, full_name, avatar_url, role, xp, coins, streak')
                            .in('id', Array.from(friendIds))
                            .order(metric, { ascending: false });

                        if (friendsProfiles) {
                            const formattedFriends = friendsProfiles.map((p, index) => ({
                                id: p.id,
                                rank: index + 1,
                                name: p.full_name || p.username || 'User',
                                username: p.username || '',
                                avatarUrl: p.avatar_url,
                                xp: p.xp || 0,
                                coins: p.coins || 0,
                                streak: p.streak || 0,
                                trend: "same" as const
                            }));
                            setFriendsData(formattedFriends);
                        }
                    }
                }
            }
            setIsLoading(false);
        };

        fetchLeaderboard();
    }, [metric]); // Re-fetch when metric changes

    const data = activeTab === "global" ? globalData : friendsData;
    const topThree = data.filter(u => u.rank <= 3);
    const rest = data.filter(u => u.rank > 3);

    const currentUserRank = data.find(u => u.id === currentUserId);

    return (
        <div className="flex flex-col h-full bg-zinc-50/50">
            {/* Header with Totals */}
            <div className="bg-white border-b border-zinc-100 px-6 py-8 md:px-10 md:py-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2 flex items-center justify-center gap-3">
                        <Trophy className="text-amber-500" fill="currentColor" />
                        Leaderboard
                    </h1>
                    <p className="text-zinc-500 font-medium mb-8">Compete with the best. Rise to the top.</p>

                    <div className="flex flex-col items-center gap-4">
                        {/* Metric Switcher */}
                        <div className="inline-flex bg-zinc-50 p-1 rounded-xl border border-zinc-100 mb-2">
                            <button
                                onClick={() => setMetric("xp")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${metric === "xp" ? "bg-white shadow-sm text-amber-600" : "text-zinc-400 hover:text-zinc-600"}`}
                            >
                                <Zap size={14} /> XP
                            </button>
                            <button
                                onClick={() => setMetric("coins")}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${metric === "coins" ? "bg-white shadow-sm text-yellow-600" : "text-zinc-400 hover:text-zinc-600"}`}
                            >
                                <Coins size={14} /> Coins
                            </button>
                        </div>

                        {/* Tab Switcher */}
                        <div className="inline-flex bg-zinc-100 p-1.5 rounded-full relative">
                            <button
                                onClick={() => setActiveTab("global")}
                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === "global" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                            >
                                <span className="flex items-center gap-2"><Globe size={16} /> Global</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("friends")}
                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === "friends" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                            >
                                <span className="flex items-center gap-2"><Users size={16} /> Friends</span>
                            </button>

                            {/* Sliding Background */}
                            <motion.div
                                layoutId="tabTarget"
                                className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-white shadow-sm"
                                initial={false}
                                animate={{
                                    x: activeTab === "global" ? 0 : "100%",
                                    width: "50%"
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
                <div className="max-w-4xl mx-auto pb-20 md:pb-6 relative">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                        </div>
                    ) : data.length > 0 ? (
                        <>
                            {/* Podium */}
                            <PodiumDisplay users={topThree} metric={metric} />

                            {/* Table */}
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-zinc-900 mb-4 px-2">Rankings</h3>
                                <LeaderboardTable users={rest} metric={metric} />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="text-zinc-400" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900">No rankings yet</h3>
                            <p className="text-zinc-500">Be the first to climb the leaderboard!</p>
                        </div>
                    )}

                    {/* User's Static Rank Bar (Sticky Bottom)  */}
                    {currentUserRank && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 hidden md:block">
                            <div className="bg-zinc-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-zinc-700/50">
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold ${metric === "xp" ? "text-amber-500" : "text-yellow-400"}`}>#{currentUserRank.rank}</span>
                                    <div className="flex items-center gap-3">
                                        <Avatar src={currentUserRank.avatarUrl} className="w-10 h-10 border-2 border-zinc-700" fallback={currentUserRank.name.charAt(0)} />
                                        <div>
                                            <div className="font-bold text-sm">You</div>
                                            <div className="text-xs text-zinc-400">
                                                {metric === "xp" ? `${currentUserRank.xp} XP` : `${currentUserRank.coins} Coins`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">Active</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
