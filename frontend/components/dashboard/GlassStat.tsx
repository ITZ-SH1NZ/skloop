"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/ui/CountUp";
import { LucideIcon } from "lucide-react";

export default function GlassStat({ icon: Icon, label, value, color = "text-white" }: { icon: LucideIcon, label: string, value: number, color?: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between h-32 group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start relative z-10">
                <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
                    <Icon size={20} />
                </div>
                {/* Micro chart mock */}
                <div className="flex gap-0.5 items-end h-6">
                    {[40, 70, 50, 90, 60].map((h, i) => (
                        <div key={i} className="w-1 bg-white/20 rounded-full" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>

            <div className="relative z-10">
                <div className="text-3xl font-medium text-white tracking-tight">
                    <CountUp to={value} />
                </div>
                <div className="text-xs font-medium text-white/50">{label}</div>
            </div>
        </motion.div>
    );
}
