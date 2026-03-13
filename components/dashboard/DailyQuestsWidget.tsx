"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Flame, Terminal, Gift, ArrowRight, Sparkles, BookOpen, Brain, Keyboard, Map, UserPlus, FolderOpen, Sunrise, FastForward } from "lucide-react";
import Link from "next/link";
import { claimDailyQuest } from "@/actions/task-actions";
import { skipQuestWithConsumable, QuestProgress } from "@/actions/quest-actions";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchDailyQuests } from "@/lib/swr-fetchers";

// Map string icon names from DB to Lucide components
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
    'trophy': Gift, // fallback
};

type TabType = "daily" | "weekly" | "monthly";

export default function DailyQuestsWidget({ refreshKey = 0 }: { refreshKey?: number }) {
    const { profile, user, refreshProfile } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("daily");
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [claimFeedback, setClaimFeedback] = useState<{ id: string; message: string } | null>(null);

    const { data, isLoading, mutate } = useSWR(
        user?.id ? ['dailyQuests', user.id] : null,
        fetchDailyQuests as any,
        { revalidateOnFocus: false }
    );

    const questsData = data?.questsData || { daily: [], weekly: [], monthly: [] };
    const chestCount = data?.chestCount || 0;
    const lastCourseSlug = data?.lastCourseSlug || null;

    const quests = questsData[activeTab] || [];

    const handleClaimQuest = async (questId: string) => {
        if (!user?.id || claimingId) return;
        setClaimingId(questId);
        try {
            const result = await claimDailyQuest(user.id, questId);
            if (result.success) {
                setClaimFeedback({ id: questId, message: result.message });
                await mutate(); // revalidate SWR cache
                await refreshProfile();
                setTimeout(() => setClaimFeedback(null), 3000);
            } else {
                setClaimFeedback({ id: questId, message: result.message });
                setTimeout(() => setClaimFeedback(null), 3000);
            }
        } finally {
            setClaimingId(null);
        }
    };

    const handleSkipQuest = async (questKey: string) => {
        if (!user || claimingId) return;
        setClaimingId(questKey);
        try {
            const result = await skipQuestWithConsumable(user.id, questKey, activeTab);
            if (result.success) {
                setClaimFeedback({ id: questKey, message: "Quest Skipped! ⚡" });
                await mutate(); // revalidate SWR cache
                await refreshProfile();
                setTimeout(() => setClaimFeedback(null), 3000);
            } else {
                const errorMsg = typeof result.error === 'string' ? result.error : "Failed to skip.";
                setClaimFeedback({ id: questKey, message: errorMsg });
                setTimeout(() => setClaimFeedback(null), 3000);
            }
        } finally {
            setClaimingId(null);
        }
    };

    const completedCount = quests.filter((q: any) => q.is_completed).length;
    const requiredForChest = 3;
    const chestProgress = Math.min(completedCount, requiredForChest);
    const chestReady = chestProgress === requiredForChest;
    const hasUnopenedChests = chestCount > 0;

    const chestColor = activeTab === 'daily' ? 'bg-[#9db44d]' : activeTab === 'weekly' ? 'bg-blue-500' : 'bg-amber-500';
    const chestLabel = activeTab === 'daily' ? 'Common Chest' : activeTab === 'weekly' ? 'Rare Chest' : 'Legendary Chest';

    return (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group w-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-20 opacity-50 z-0"></div>

            <div className="relative z-10 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Quests
                            {chestReady && (
                                <span className={`text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm ${chestColor}`}>
                                    Ready
                                </span>
                            )}
                        </h3>
                        {activeTab === 'daily' && <p className="text-sm text-slate-500 font-medium mt-1">Reset in {24 - new Date().getHours()} hours</p>}
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-full">
                        {(["daily", "weekly", "monthly"] as TabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 min-h-[250px] relative">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 space-y-4"
                            >
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-slate-50 rounded-2xl w-full animate-pulse" />
                                ))}
                            </motion.div>
                        ) : quests.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center text-slate-400"
                            >
                                No quests found for this cycle.
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-3 w-full"
                            >
                                {[...quests]
                                    .sort((a, b) => Number(a.is_completed) - Number(b.is_completed))
                                    .map((quest) => {
                                        const Icon = ICON_MAP[quest.icon] || Gift;
                                        const isDone = quest.is_completed;
                                        const isClaiming = claimingId === quest.key;
                                        const feedback = claimFeedback?.id === quest.key ? claimFeedback?.message : null;
                                        const progressRaw = quest.auto_progress === -1 ? 1 : quest.auto_progress;

                                        let hrefProps = {};
                                        if (!isDone) {
                                            if (quest.key === 'codele') hrefProps = { href: '/practice/daily-codele' };
                                            else if (quest.key === 'type_race') hrefProps = { href: '/practice/typing-speed' };
                                            else if (quest.key === 'quiz_attempt') hrefProps = { href: '/practice/dsa-quiz' };
                                            else if (quest.key === 'lesson') hrefProps = { href: lastCourseSlug ? `/course/${lastCourseSlug}` : '/course' };
                                        }

                                        return (
                                            <div key={quest.id} className="block w-full">
                                                <div className={`
                                                    flex items-center justify-between p-4 rounded-2xl transition-all w-full
                                                    ${isDone ? 'bg-slate-50 border border-transparent cursor-default' : 'bg-white border hover:border-slate-300 hover:shadow-sm border-slate-200'}
                                                `}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-xl flex-shrink-0 ${isDone ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-700'}`}>
                                                            <Icon size={20} />
                                                        </div>
                                                        <div className={`flex flex-col items-start ${isDone ? 'opacity-50' : ''}`}>
                                                            <h4 className={`font-bold text-sm ${isDone ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
                                                                {quest.title}
                                                            </h4>
                                                            <div className="flex gap-2 items-center mt-1">
                                                                <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">+{quest.xp_reward} XP</span>
                                                                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">+{quest.coins_reward} COINS</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <AnimatePresence>
                                                            {feedback && (
                                                                <motion.span
                                                                    initial={{ opacity: 0, x: 10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: -10 }}
                                                                    className="text-xs font-bold text-emerald-600"
                                                                >
                                                                    {feedback}
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>

                                                        {!isDone && quest.key === 'login' && activeTab === 'daily' ? (
                                                            <motion.button
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={(e) => { e.stopPropagation(); handleClaimQuest(quest.key); }}
                                                                disabled={isClaiming}
                                                                className="text-xs font-bold bg-[#D4F268] text-slate-900 px-3 py-1.5 rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-70 flex items-center gap-1"
                                                            >
                                                                {isClaiming ? 'Claiming...' : <><Sparkles size={12} /> Claim</>}
                                                            </motion.button>
                                                        ) : !isDone && Object.keys(hrefProps).length > 0 ? (
                                                            <div className="flex gap-2">
                                                                {profile?.inventory?.includes('item_daily_skip') && (
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={(e) => { e.stopPropagation(); handleSkipQuest(quest.key); }}
                                                                        className="text-[10px] md:text-xs font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 px-2 md:px-3 py-1.5 rounded-xl inline-flex items-center gap-1 transition-colors group/skip"
                                                                        title="Use Daily Skip"
                                                                    >
                                                                        <FastForward size={14} className="text-zinc-400 group-hover/skip:text-zinc-600" />
                                                                        <span className="hidden sm:inline">Skip</span>
                                                                    </motion.button>
                                                                )}
                                                                <Link href={(hrefProps as any).href} className="text-[10px] md:text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 md:px-3 py-1.5 rounded-xl inline-flex items-center gap-1 transition-colors">
                                                                    <span>Go</span> <ArrowRight size={14} />
                                                                </Link>
                                                            </div>
                                                        ) : null}

                                                        <div className="flex flex-col items-end pl-2 border-l border-slate-100 ml-2">
                                                            {isDone ? (
                                                                <CheckCircle2 className="text-[#D4F268]" size={24} fill="#18181b" />
                                                            ) : (
                                                                <Circle className="text-slate-300" size={24} />
                                                            )}
                                                            {!isDone && progressRaw > 0 && quest.type !== 'daily' && (
                                                                <span className="text-[10px] font-bold text-slate-400 mt-1">
                                                                    {progressRaw}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Chest Progress Strip at Bottom */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{chestLabel}</span>
                        <span className="text-xs font-bold text-slate-800">{chestProgress} / {requiredForChest}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        {Array.from({ length: requiredForChest }).map((_, i) => (
                            <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${i < chestProgress ? chestColor : 'bg-transparent'}`} />
                        ))}
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: hasUnopenedChests ? 1.05 : 1 }}
                    whileTap={{ scale: hasUnopenedChests ? 0.95 : 1 }}
                    disabled={!hasUnopenedChests}
                    onClick={() => router.push('/profile')}
                    className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm relative transition-colors duration-300
                        ${hasUnopenedChests ? 'bg-amber-100 border-2 border-amber-300 text-amber-600 animate-pulse cursor-pointer' : 'bg-slate-50 border border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'}
                        ${chestReady && !hasUnopenedChests ? `${chestColor} border-none text-white opacity-50` : ''}
                    `}
                >
                    <Gift size={24} className={hasUnopenedChests ? 'animate-bounce' : ''} />
                    {hasUnopenedChests && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {chestCount}
                        </span>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
