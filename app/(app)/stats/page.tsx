"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Activity, Clock, Zap, Repeat, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function StatsPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Mock data for initial design - in production this would come from Supabase
    const stats = {
        rank: "Pro Digi-Architect",
        xp: 12450,
        level: 42,
        streak: 14,
        codingHours: 156,
        completedQuests: 89,
        accuracy: 94,
        topTech: ["Next.js", "TypeScript", "Tailwind"]
    };

    const chartData = [45, 52, 38, 65, 48, 72, 55, 60, 42, 58, 62, 50];

    if (!isMounted) return null;

    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-7xl mx-auto min-h-screen">
            <h1 className="text-3xl md:text-4xl xl:text-5xl font-black mb-8">Statistics</h1>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Hours Banked" value={`${stats.codingHours} hrs`} change="+12%" trend="up" icon={Clock} color="bg-indigo-50 text-indigo-600" />
                <StatCard title="Quests Completed" value={stats.completedQuests.toString()} change="+5%" trend="up" icon={Zap} color="bg-emerald-50 text-emerald-600" />
                <StatCard title="Coding Accuracy" value={`${stats.accuracy}%`} change="-2%" trend="down" icon={Repeat} color="bg-rose-50 text-rose-600" />
                <StatCard title="Skill Level" value={stats.level.toString()} change="Rank: Pro" trend="neutral" icon={BarChart2} color="bg-amber-50 text-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                {/* Big Chart Area */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-96 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl">Monthly Activity</h3>
                        <div className="flex bg-gray-50 rounded-lg p-1">
                            <button className="px-3 py-1 text-xs font-bold bg-white rounded-md shadow-sm">XP</button>
                            <button className="px-3 py-1 text-xs font-bold text-gray-500">Quests</button>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-1.5 h-64 w-full px-2">
                        {chartData.map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05, type: "spring", damping: 15 }}
                                className="flex-1 bg-black rounded-t-xl hover:bg-[#D4F268] transition-colors cursor-pointer group relative"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10 pointer-events-none">
                                    {Math.round(h * 150)} XP
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                            <span key={m} className="flex-1 text-center">{m}</span>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold mb-6">Strengths</h2>
                    <div className="space-y-4 flex-1">
                        {stats.topTech.map((tech, i) => (
                            <div key={tech} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-gray-100">
                                        {tech[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{tech}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mastery: {90 - i * 5}%</p>
                                    </div>
                                </div>
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${90 - i * 5}%` }}
                                        className="h-full bg-indigo-500 rounded-full"
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-6 w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                        View Full Skill Tree
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
                <div className={`p-2.5 rounded-xl ${color} shadow-sm`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
            </div>
            <div className="text-3xl font-black mb-1 text-slate-900">{value}</div>
            <div className={`text-[10px] font-bold flex items-center gap-1 ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-zinc-400"}`}>
                {trend === "up" ? <ArrowUp size={12} /> : trend === "down" ? <ArrowDown size={12} /> : <Activity size={12} />}
                {change} from last month
            </div>
        </motion.div>
    );
}
