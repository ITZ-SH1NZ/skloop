"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Activity, Clock, Zap, Repeat, BarChart2 } from "lucide-react";

export default function StatsPage() {
    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl xl:text-5xl font-black mb-8">Statistics</h1>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Hours Banked" value="-- hrs" change="--%" trend="neutral" icon={Clock} color="bg-zinc-100 text-zinc-600" />
                <StatCard title="Community Impact" value="--" change="--%" trend="neutral" icon={Zap} color="bg-zinc-100 text-zinc-600" />
                <StatCard title="Skills Swapped" value="--" change="--%" trend="neutral" icon={Repeat} color="bg-zinc-100 text-zinc-600" />
                <StatCard title="Reputation Score" value="--" change="--%" trend="neutral" icon={BarChart2} color="bg-zinc-100 text-zinc-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                {/* Big Chart Area */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-96 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl">Overview</h3>
                        <select className="bg-gray-50 border-none rounded-lg px-3 py-1 text-sm font-bold text-gray-500 outline-none">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    {/* Fake Bar Chart - TODO: Connect to backend */}
                    <div className="flex items-end justify-between gap-2 h-64 w-full">
                        {Array(12).fill(0).map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                className="w-full bg-black rounded-t-lg hover:bg-primary transition-colors cursor-pointer group relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-gray-400">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                            <span key={m}>{m}</span>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="font-bold text-xl mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {/* TODO: Fetch recent activity */}
                        <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-gray-500">{title}</span>
                <div className={`p-2 rounded-xl ${color}`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="text-3xl font-black mb-1">{value}</div>
            <div className={`text-xs font-bold flex items-center gap-1 ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-zinc-400"}`}>
                {trend === "up" ? <ArrowUp size={12} /> : trend === "down" ? <ArrowDown size={12} /> : <Activity size={12} />}
                {change} from last month
            </div>
        </div>
    );
}
