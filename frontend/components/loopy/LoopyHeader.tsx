"use client";

import { Bot, ChevronLeft, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoopyHeaderProps {
    mode: "select" | "helpful" | "story";
    setMode: (mode: "select" | "helpful" | "story") => void;
    rank: string;
    xp: number;
}

export function LoopyHeader({ mode, setMode, rank, xp }: LoopyHeaderProps) {
    return (
        <header className="px-6 py-4 flex items-center justify-between z-20 sticky top-0 backdrop-blur-md bg-[#FDFCF8]/90 border-b border-transparent">
            <div className="flex items-center gap-4">
                {mode !== "select" && (
                    <button
                        onClick={() => setMode("select")}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-zinc-200 shadow-[0_4px_0_0_#e4e4e7] hover:shadow-[0_2px_0_0_#e4e4e7] hover:translate-y-[2px] transition-all text-zinc-600 active:shadow-none active:translate-y-[4px]"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                )}
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.1)] transform rotate-3 transition-colors",
                        mode === 'story' ? 'bg-amber-400' : 'bg-[#D4F268]'
                    )}>
                        <Bot size={24} className="text-[#1A1A1A]" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl text-slate-900 tracking-tight leading-none">Loopy</h1>
                        <p className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            mode === 'story' ? 'text-amber-500' : 'text-lime-600'
                        )}>
                            {mode === "select" ? "Select Mode" : mode === "helpful" ? "Helpful Guide" : "Story Mode"}
                        </p>
                    </div>
                </div>
            </div>

            {mode === "story" && (
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-zinc-100 shadow-sm">
                        <Crown size={16} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-black text-slate-700">{rank}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1A1A1A] px-4 py-2 rounded-2xl shadow-lg shadow-black/10">
                        <div className="flex flex-col items-end min-w-[80px]">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-1">XP Points</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-white leading-none">{xp}</span>
                                <span className="text-xs font-bold text-zinc-500">/ 500</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center bg-amber-400/20">
                            <Zap size={16} className="text-amber-400 fill-amber-400" />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
