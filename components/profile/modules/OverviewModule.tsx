"use client";

import { ActivityHeatmap } from "../charts/ActivityHeatmap";
import { Zap, Target, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DailyQuestsWidget from "@/components/dashboard/DailyQuestsWidget";
import { useUser } from "@/context/UserContext";

export function OverviewModule() {
    const supabase = createClient();
    const { profile, user } = useUser();
    const [stats, setStats] = useState({ streak: 0, lessonsCompleted: 0, problemsSolved: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                // Streak comes from profile context
                const streak = profile?.streak || 0;

                // Problems Solved (Quizzes + Codele Wins)
                const { count: dsaCount } = await supabase
                    .from('user_quiz_attempts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id)
                    .eq('passed', true);

                const { count: codeleCount } = await supabase
                    .from('user_puzzle_attempts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id)
                    .eq('status', 'won');

                const problemsSolved = (dsaCount || 0) + (codeleCount || 0);

                // Lessons Completed
                const { count: lessonsCount } = await supabase
                    .from('user_topic_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id)
                    .eq('status', 'completed');

                setStats({
                    streak,
                    problemsSolved,
                    lessonsCompleted: lessonsCount || 0
                });
            }
        };
        fetchStats();
    }, [profile, user]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-zinc-100 p-8 rounded-[2rem] text-center">
                    <h3 className="text-xl font-bold text-zinc-900">No Active Quest</h3>
                    <p className="text-zinc-500 mb-4">Start a new track to begin your journey.</p>
                    <Button className="bg-black text-white hover:bg-zinc-800 border-none font-bold">
                        Find a Quest <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>

                {/* Daily Quests */}
                <DailyQuestsWidget />

                {/* Recent Activity */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Activity</h2>
                    <div className="bg-white p-6 rounded-[2rem] border shadow-sm overflow-x-auto">
                        <ActivityHeatmap />
                    </div>
                </div>
            </div>

            {/* Right Column (Side Stats) */}
            <div className="space-y-6">
                <div className="bg-white border p-6 rounded-[2rem] space-y-6 shadow-sm">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Quick Stats</h3>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-indigo-900">{stats.streak}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">Current Streak</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-900">{stats.problemsSolved}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">Problems Solved</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-900">{stats.lessonsCompleted}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase">Lessons Completed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

