"use client";

import { motion } from "framer-motion";
import { PieChart, Palette, Type } from "lucide-react";

interface StatItem {
    title: string;
    progress: number;
    color: string;
    icon: any;
    bg: string;
    text: string;
}

export function StatsRow() {
    const stats: StatItem[] = [
        { title: "Marketing", progress: 90, color: "text-primary", icon: PieChart, bg: "bg-gray-900", text: "text-white" },
        { title: "Typography", progress: 60, color: "text-yellow-400", icon: Type, bg: "bg-white", text: "text-gray-800" },
        { title: "Colors", progress: 30, color: "text-purple-400", icon: Palette, bg: "bg-white", text: "text-gray-800" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
                <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className={`${stat.bg} ${stat.text} p-5 rounded-[2.5rem] shadow-float flex flex-col items-center justify-center text-center relative overflow-hidden aspect-square`}
                >
                    {/* Circular Progress Mock */}
                    <div className="relative h-20 w-20 mb-3 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path className={stat.bg === "bg-gray-900" ? "text-gray-700" : "text-gray-100"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            <path className={stat.color} strokeDasharray={`${stat.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-xl font-black">{stat.progress}%</span>
                    </div>
                    <h3 className="font-bold text-sm tracking-wide">{stat.title}</h3>
                </motion.div>
            ))}
        </div>
    );
}
