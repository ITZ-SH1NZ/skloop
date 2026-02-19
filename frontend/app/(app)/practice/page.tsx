"use client";

import { motion } from "framer-motion";
import { Crown, Keyboard, BrainCircuit, Zap, Trophy, Flame } from "lucide-react";
import Link from "next/link";
import PorcelainShell from "@/components/practice/PorcelainShell";
import { ReactNode } from "react";

const BENTO_ITEMS = [
    {
        title: "Daily Codele",
        desc: "Crack the daily code. 6 attempts.",
        icon: <Crown size={28} className="text-amber-600" />,
        href: "/practice/daily-codele",
        colSpan: "md:col-span-2",
        bg: "bg-white",
        iconBg: "bg-amber-100",
        stat: "Play Now",
        statColor: "text-amber-700 bg-amber-50"
    },
    {
        title: "Syntax Speed Run",
        desc: "Race against the compiler.",
        icon: <Keyboard size={28} className="text-lime-600" />,
        href: "/practice/typing-speed",
        colSpan: "md:col-span-1",
        bg: "bg-white",
        iconBg: "bg-lime-100",
        stat: "-- WPM",
        statColor: "text-lime-700 bg-lime-50"
    },
    {
        title: "DSA Rapid Fire",
        desc: "5 min brain workout.",
        icon: <BrainCircuit size={28} className="text-emerald-600" />,
        href: "/practice/dsa-quiz",
        colSpan: "md:col-span-1",
        bg: "bg-white",
        iconBg: "bg-emerald-100",
        stat: "Test Yourself",
        statColor: "text-emerald-700 bg-emerald-50"
    },
    {
        title: "System Design",
        desc: "Architect scalable systems. (Coming Soon)",
        icon: <Zap size={28} className="text-zinc-400" />,
        href: "#",
        colSpan: "md:col-span-2",
        bg: "bg-zinc-50 border-dashed border-2 border-zinc-200 shadow-none",
        iconBg: "bg-zinc-200",
        stat: "Locked",
        statColor: "text-zinc-500 bg-zinc-200"
    }
];

function StatCard({ label, value, icon, bg, color }: { label: string, value: string, icon: ReactNode, bg: string, color: string }) {
    return (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
            <div className={`p-4 rounded-2xl ${bg} ${color}`}>
                {icon}
            </div>
            <div>
                <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">{value}</div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}

export default function PracticeHub() {
    return (
        <PorcelainShell
            title="Practice Arena"
            description="Focus. Learn. Improve."
        >
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left: Stats Column */}
                <div className="lg:w-1/3 space-y-6">
                    {/* User Player Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-zinc-100" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-zinc-300">
                                    AL
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900">Alex Decor</h3>
                                    <div className="flex items-center gap-2 text-zinc-500 font-medium bg-zinc-100 px-3 py-1 rounded-full w-fit mt-1">
                                        <Trophy size={14} />
                                        <span className="text-sm">Level 12 Architect</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <StatCard label="Current Streak" value="--" icon={<Flame size={20} />} bg="bg-lime-100" color="text-lime-600" />
                                <StatCard label="Total XP" value="--" icon={<Zap size={20} />} bg="bg-zinc-100" color="text-zinc-600" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Daily Tip */}
                    <div className="p-8 rounded-[2.5rem] bg-lime-50/50 border border-lime-100 text-lime-900/80 text-lg leading-relaxed font-medium">
                        "Make it work, make it right, make it fast."
                    </div>
                </div>

                {/* Right: Games Grid */}
                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-[220px]">
                    {BENTO_ITEMS.map((item, i) => (
                        <Link href={item.href} key={i} className={`${item.colSpan} group`}>
                            <motion.div
                                whileHover={{ y: -6, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)" }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    h-full w-full rounded-[2.5rem] p-8 flex flex-col justify-between
                                    shadow-md shadow-zinc-200/40 border-zinc-100
                                    ${item.bg} transition-all duration-300 ease-out
                                    ${item.href === "#" ? "" : "hover:border-zinc-300 border"}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-4 rounded-2xl ${item.iconBg}`}>
                                        {item.icon}
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.statColor}`}>
                                        {item.stat}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">{item.title}</h3>
                                    <p className="text-zinc-500 font-medium">{item.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

            </div>
        </PorcelainShell>
    );
}
