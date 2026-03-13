"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Terminal, BookOpen, Brain, Keyboard, Map, UserPlus, FolderOpen, Flame, Gift, CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { fetchDailyQuests } from "@/lib/swr-fetchers";
import { useUser } from "@/context/UserContext";

const ICON_MAP: Record<string, any> = {
    'sunrise': Sunrise,
    'terminal': Terminal,
    'book-open': BookOpen,
    'brain': Brain,
    'keyboard': Keyboard,
    'map': Map,
    'user-plus': UserPlus,
    'folder': FolderOpen,
    'flame': Flame,
    'trophy': Gift,
};

type TabType = "daily" | "weekly" | "monthly";

export function QuestsModule() {
    const { user, refreshProfile } = useUser();
    const { mutate } = useSWRConfig();
    const [activeTab, setActiveTab] = useState<TabType>("daily");
    
    const { data, isLoading } = useSWR(
        user?.id ? ['dailyQuests', user.id] : null,
        fetchDailyQuests as any,
        { revalidateOnFocus: false }
    );

    const questsData = data?.questsData || { daily: [], weekly: [], monthly: [] };
    const lastCourseSlug = data?.lastCourseSlug || null;

    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [claimFeedback, setClaimFeedback] = useState<{ id: string; message: string } | null>(null);

    const handleClaimQuest = async (questId: string) => {
        if (!user || claimingId) return;

        setClaimingId(questId);
        try {
            const { claimDailyQuest } = await import('@/actions/task-actions');
            const result = await claimDailyQuest(user.id, questId);

            setClaimFeedback({ id: questId, message: result.message });
            if (result.success) {
                // Mutate the quests cache to reflect changes immediately
                mutate(['dailyQuests', user.id]);
                await refreshProfile();
            }
            setTimeout(() => setClaimFeedback(null), 3000);
        } finally {
            setClaimingId(null);
        }
    };

    const quests = questsData[activeTab] || [];

    // Calculate chest progress based on completions for the current visible tab
    const completedCount = quests.filter((q: any) => q.is_completed).length;
    const requiredForChest = 3;
    const chestProgress = Math.min(completedCount, requiredForChest);

    const chestColor = activeTab === 'daily' ? 'bg-[#9db44d]' : activeTab === 'weekly' ? 'bg-blue-500' : 'bg-amber-500';
    const chestLabel = activeTab === 'daily' ? 'Common Chest' : activeTab === 'weekly' ? 'Rare Chest' : 'Legendary Chest';

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Background flourish */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Quests & Rewards</h2>
                    <p className="text-slate-500 mt-1">Complete objectives to earn XP, Coins, and cosmetic Chests.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-full">
                    {(["daily", "weekly", "monthly"] as TabType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chest Progress Header */}
            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 relative">
                    <Gift size={32} className={chestProgress >= requiredForChest ? "text-[#D4F268]" : "text-slate-400"} />
                    {chestProgress >= requiredForChest && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#D4F268] text-slate-900 text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                            ✓
                        </span>
                    )}
                </div>
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-slate-700">{chestLabel} Progress</span>
                        <span className="text-sm font-bold text-slate-500">{chestProgress} / {requiredForChest} Quests</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                        {Array.from({ length: requiredForChest }).map((_, i) => (
                            <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${i < chestProgress ? chestColor : 'bg-transparent'}`} />
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {chestProgress >= requiredForChest
                            ? "Chest earned! Check your Trophy Case."
                            : `Complete ${requiredForChest - chestProgress} more ${activeTab} quests to unlock.`}
                    </p>
                </div>
            </div>

            {/* Quests List */}
            <div className="space-y-4 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-slate-50 rounded-2xl w-full" />
                            ))}
                        </div>
                    ) : quests.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No quests found for this cycle.
                        </div>
                    ) : (
                        [...quests]
                            .sort((a, b) => Number(a.is_completed) - Number(b.is_completed))
                            .map((quest) => {
                                const Icon = ICON_MAP[quest.icon] || Gift;
                                const isDone = quest.is_completed;

                                // For weekly/monthly, they might have auto_progress targets > 1 we can display
                                // but our db schema `auto_progress` is currently a raw count (e.g. 5/15)
                                // We don't store the exact target internally on the frontend except loosely, 
                                // but -1 means fully done.
                                const progressRaw = quest.auto_progress === -1 ? 1 : quest.auto_progress;
                                // Small heuristic: if > 1, show a mini counter badge. 

                                let hrefProps = {};
                                if (!isDone) {
                                    if (quest.key === 'codele') hrefProps = { href: '/practice/daily-codele' };
                                    else if (quest.key === 'type_race') hrefProps = { href: '/practice/typing-speed' };
                                    else if (quest.key === 'quiz_attempt') hrefProps = { href: '/practice/dsa-quiz' };
                                    else if (quest.key === 'lesson') hrefProps = { href: lastCourseSlug ? `/course/${lastCourseSlug}` : '/course' };
                                }

                                return (
                                    <motion.div
                                        key={quest.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`
                                        flex items-center justify-between p-4 rounded-2xl border transition-all
                                        ${isDone ? 'bg-slate-50 border-transparent opacity-80' : 'bg-white border-slate-200'}
                                    `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${isDone ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-700'}`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${isDone ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
                                                    {quest.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 line-clamp-1">{quest.description}</p>

                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                        +{quest.xp_reward} XP
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                                                        +{quest.coins_reward} COINS
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 pr-2">
                                            {isDone ? (
                                                <CheckCircle2 className="text-[#D4F268]" size={28} fill="#18181b" />
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    {/* Feedback Message */}
                                                    <AnimatePresence>
                                                        {claimingId === quest.key && claimFeedback && (
                                                            <motion.span
                                                                initial={{ opacity: 0, x: 10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -10 }}
                                                                className="text-xs font-bold text-emerald-600 absolute right-32"
                                                            >
                                                                {claimFeedback.message}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Claim Button for login (daily) */}
                                                    {!isDone && quest.key === 'login' && activeTab === 'daily' ? (
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => { e.stopPropagation(); handleClaimQuest(quest.key); }}
                                                            disabled={claimingId === quest.key}
                                                            className="text-xs font-bold bg-[#D4F268] text-slate-900 px-3 py-1.5 rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-70 flex items-center gap-1"
                                                        >
                                                            {claimingId === quest.key ? 'Claiming...' : <><Sparkles size={14} /> Claim</>}
                                                        </motion.button>
                                                    ) : (
                                                        Object.keys(hrefProps).length > 0 && (
                                                            <a {...hrefProps as any} className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-1">
                                                                Go <ArrowRight size={14} />
                                                            </a>
                                                        )
                                                    )}
                                                    <Circle className="text-slate-300" size={28} />
                                                </div>
                                            )}
                                            {!isDone && progressRaw > 0 && quest.type !== 'daily' && (
                                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                    Progress: {progressRaw}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
