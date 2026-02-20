"use client";

import { useEffect, useState } from "react";
import { delay, motion } from "framer-motion";
import { CheckCircle2, Circle, Flame, Terminal, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Quest {
    id: string;
    title: string;
    description: string;
    icon: any;
    xp: number;
    coins: number;
    completed: boolean;
    href?: string;
    onClick?: () => void;
}

export default function DailyQuestsWidget({ onOpenCodele }: { onOpenCodele?: () => void }) {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuests = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const todayStr = new Date().toISOString().split('T')[0];

            let loginCompleted = false;
            const { data: activity } = await supabase
                .from('activity_logs')
                .select('id')
                .eq('user_id', user.id)
                .gte('activity_date', todayStr)
                .limit(1)
                .single();

            if (activity) {
                loginCompleted = true;
            } else {
                // To keep it simple, log their "login" for today right now if it's missing
                await supabase.from('activity_logs').insert({
                    user_id: user.id,
                    activity_date: todayStr,
                    hours_spent: 0.1, // Minimal
                    focus_area: 'Dashboard Login'
                });
                loginCompleted = true;

                // Grant initial login XP/Coins if we just inserted
                const { data: profile } = await supabase.from('profiles').select('xp, coins, streak').eq('id', user.id).single();
                if (profile) {
                    await supabase.from('profiles').update({
                        xp: (profile.xp || 0) + 10,
                        coins: (profile.coins || 0) + 5,
                        streak: (profile.streak || 0) + 1
                    }).eq('id', user.id);
                }
            }

            let codeleCompleted = false;
            const { data: dailyPuzzle } = await supabase
                .from('daily_puzzles')
                .select('id')
                .eq('puzzle_date', todayStr)
                .single();

            if (dailyPuzzle) {
                const { data: puzzleAttempt } = await supabase
                    .from('user_puzzle_attempts')
                    .select('status')
                    .eq('user_id', user.id)
                    .eq('puzzle_id', dailyPuzzle.id)
                    .single();

                if (puzzleAttempt && puzzleAttempt.status !== 'playing') {
                    codeleCompleted = true; // Win or lose, the quest is to 'Play'
                }
            }

            setQuests([
                {
                    id: "login",
                    title: "Daily Login",
                    description: "Log in to Skloop and view your dashboard.",
                    icon: Flame,
                    xp: 10,
                    coins: 5,
                    completed: loginCompleted
                },
                {
                    id: "codele",
                    title: "Play Daily Codele",
                    description: "Guess today's programming-related 5-letter word.",
                    icon: Terminal,
                    xp: 50,
                    coins: 10,
                    completed: codeleCompleted,
                    onClick: onOpenCodele,
                    href: onOpenCodele ? undefined : "/practice/daily-codele"
                }
            ]);
            setIsLoading(false);
        };
        fetchQuests();
    }, [onOpenCodele]);

    const allCompleted = quests.length > 0 && quests.every(q => q.completed);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-48 w-full">
                <div className="w-1/3 h-6 bg-slate-200 rounded-lg mb-6" />
                <div className="space-y-4">
                    <div className="w-full h-12 bg-slate-50 rounded-xl" />
                    <div className="w-full h-12 bg-slate-50 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group w-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-20 opacity-50 z-0"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Daily Quests
                            {allCompleted && (
                                <span className="bg-[#D4F268] text-slate-900 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">
                                    Done
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Reset in {24 - new Date().getHours()} hours</p>
                    </div>
                    {allCompleted && (
                        <div className="w-12 h-12 rounded-2xl bg-[#D4F268]/20 flex items-center justify-center text-[#9db44d]">
                            <Gift size={24} />
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {quests.map((quest, i) => {
                        const Icon = quest.icon;
                        const isDone = quest.completed;
                        const isLink = !!quest.href;

                        const innerContent = (
                            <div className={`
                                flex items-center justify-between p-4 rounded-2xl transition-all w-full
                                ${isDone ? 'bg-slate-50 border border-transparent cursor-default' : 'bg-white border hover:border-slate-300 hover:shadow-sm border-slate-200 cursor-pointer'}
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
                                            <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">+{quest.xp} XP</span>
                                            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">+{quest.coins} COINS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isDone && (quest.onClick || quest.href) && (
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 hidden md:inline-flex items-center gap-1 transition-colors">
                                            Go <ArrowRight size={14} />
                                        </span>
                                    )}
                                    {isDone ? (
                                        <CheckCircle2 className="text-[#D4F268] flex-shrink-0" size={24} fill="#18181b" />
                                    ) : (
                                        <Circle className="text-slate-300 flex-shrink-0" size={24} />
                                    )}
                                </div>
                            </div>
                        );

                        if (isLink && !isDone) {
                            return (
                                <Link key={quest.id} href={quest.href as string} className="block w-full">
                                    {innerContent}
                                </Link>
                            );
                        }

                        if (!isDone && quest.onClick) {
                            return (
                                <motion.div key={quest.id} onClick={quest.onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="block w-full">
                                    {innerContent}
                                </motion.div>
                            );
                        }

                        return <div key={quest.id} className="block w-full">{innerContent}</div>;
                    })}
                </div>

                {allCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-slate-900 rounded-xl text-center shadow-lg shadow-slate-900/20"
                    >
                        <p className="text-[#D4F268] font-bold text-sm">All daily quests completed!</p>
                        <p className="text-slate-400 text-xs mt-1">Come back tomorrow for more rewards.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
