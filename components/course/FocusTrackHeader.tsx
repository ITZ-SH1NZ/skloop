"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface FocusTrackHeaderProps {
    title: string;
    progress: number;
    totalModules: number;
    completedModules: number;
}

export default function FocusTrackHeader({ title, progress, totalModules, completedModules }: FocusTrackHeaderProps) {
    return (
        <div className="pt-8 pb-8 mb-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                <span className="font-bold text-sm">Back to Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge variant="outline" className="mb-3 bg-lime-100/50 text-lime-700 border-lime-200 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold">
                        <Flame size={12} className="mr-1 fill-lime-500" /> Career Path
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
                        {title}
                    </h1>
                </div>

                {/* Premium Progress Stats */}
                <div className="flex items-center gap-6 bg-gradient-to-br from-white to-zinc-50 p-4 rounded-2xl border border-zinc-200/50 shadow-lg shadow-zinc-200/20">
                    <div className="flex flex-col">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Progress</div>
                        <div className="font-black text-2xl text-zinc-900">
                            {progress}<span className="text-zinc-400 text-sm font-medium">%</span>
                        </div>
                    </div>

                    {/* Milestone Dots */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalModules }).map((_, idx) => {
                                const isCompleted = idx < completedModules;
                                return (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all ${isCompleted
                                                ? "bg-[#D4F268] ring-2 ring-lime-200 scale-110"
                                                : "bg-zinc-200"
                                            }`}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-[9px] font-bold text-zinc-400 tracking-wide">
                            {completedModules} of {totalModules} modules
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
