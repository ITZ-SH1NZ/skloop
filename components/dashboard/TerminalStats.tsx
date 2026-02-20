"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/ui/CountUp";

export default function TerminalStats({ label, value, sub }: { label: string; value: number; sub: string }) {
    return (
        <div className="group relative overflow-hidden border border-white/10 bg-black/50 backdrop-blur-sm p-6 hover:bg-white/5 transition-colors">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />

            <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
                    <div className="w-2 h-2 bg-[#D4F268] rounded-full opacity-50 group-hover:opacity-100 animate-pulse" />
                </div>
                <div>
                    <div className="text-4xl font-black text-white tracking-tighter tabular-nums mb-1">
                        <CountUp to={value} />
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                        {sub}
                    </div>
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full -translate-y-full group-hover:animate-scanline pointer-events-none" />
        </div>
    );
}
