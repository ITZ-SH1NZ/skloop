"use client";

import { BadgeGrid } from "../gamification/BadgeGrid";
import { ActivityHeatmap } from "../charts/ActivityHeatmap";
import { Zap, Target, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DailyQuestsWidget from "@/components/dashboard/DailyQuestsWidget";

export function OverviewModule() {
    const supabase = createClient();
    const [stats, setStats] = useState({ streak: 0, lessonsCompleted: 0, problemsSolved: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Streak
                const { data } = await supabase
                    .from('profiles')
                    .select('streak')
                    .eq('id', user.id)
                    .single();

                // Problems Solved (Quizzes + Codele Wins)
                const { count: dsaCount } = await supabase
                    .from('user_quiz_attempts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('passed', true);

                const { count: codeleCount } = await supabase
                    .from('user_puzzle_attempts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'won');

                const problemsSolved = (dsaCount || 0) + (codeleCount || 0);

                // Lessons Completed
                const { data: coursesData } = await supabase
                    .from('user_courses')
                    .select('completed_lessons')
                    .eq('user_id', user.id);

                const lessonsCompleted = coursesData ? coursesData.reduce((acc, curr) => acc + (curr.completed_lessons || 0), 0) : 0;

                setStats({
                    streak: data?.streak || 0,
                    problemsSolved,
                    lessonsCompleted
                });
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
                {/* Current Quest (Featured) */}
                {/* Current Quest (Featured) - TODO: Fetch active quest */}
                {/* <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-[2rem] relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-widest text-green-400">Active Quest</div>
                        </div>
                        <h3 className="text-3xl font-black mb-2">No Active Quest</h3>
                        <p className="text-gray-400 mb-6 max-w-lg leading-relaxed">Start a new track to begin your journey.</p>

                        <Button className="bg-white text-black hover:bg-gray-200 border-none font-bold">
                            Find a Quest <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                </div> */}
                <div className="bg-zinc-100 p-8 rounded-[2rem] text-center">
                    <h3 className="text-xl font-bold text-zinc-900">No Active Quest</h3>
                    <p className="text-zinc-500 mb-4">Start a new track to begin your journey.</p>
                    <Button className="bg-black text-white hover:bg-zinc-800 border-none font-bold">
                        Find a Quest <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>

                {/* Daily Quests */}
                <DailyQuestsWidget />

                {/* Badges Section */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Trophy Case</h2>
                        <span className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-black">View All</span>
                    </div>
                    <BadgeGrid />
                </div>

                {/* Recent Activity (New Section) */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Activity</h2>
                    <div className="bg-white p-6 rounded-[2rem] border shadow-sm overflow-x-auto">
                        <ActivityHeatmap />
                    </div>
                </div>
            </div>

            {/* Right Column (Side Stats) */}
            <div className="space-y-6">
                {/* Quick Stats Grid */}
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

                {/* Pinned Project (Mini) - TODO: Fetch pinned project */}
                {/* <div className="bg-white border p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold">Pinned Project</h3>
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                    </div>

                    <div className="aspect-video rounded-xl bg-gray-100 mb-4 overflow-hidden">
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Project</div>
                    </div>
                    <h4 className="font-bold text-lg leading-tight">--</h4>
                    <p className="text-xs text-muted-foreground mt-1">--</p>
                </div> */}
            </div>
        </div>
    );
}
