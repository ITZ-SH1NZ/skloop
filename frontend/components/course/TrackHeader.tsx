"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Flame } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface TrackHeaderProps {
    title: string;
    description: string;
    progress: number;
    totalModules: number;
    completedModules: number;
    totalHours: number;
}

export default function TrackHeader({ title, description, progress, totalModules, completedModules, totalHours }: TrackHeaderProps) {
    return (
        <div className="relative pt-8 pb-12 mb-8 select-none">
            {/* Back Link */}
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                <span className="font-bold text-sm">Back to Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="mb-4 bg-lime-100/50 text-lime-700 border-lime-200 px-3 py-1">
                            <Flame size={14} className="mr-1 fill-lime-500" /> Career Path
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4 leading-tight text-balance">
                            {title}
                        </h1>
                        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl leading-relaxed text-balance">
                            {description}
                        </p>
                    </motion.div>
                </div>

                {/* Stats Pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex-shrink-0 bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50"
                >
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Progress</div>
                            <div className="text-3xl font-black text-lime-600">{progress}%</div>
                        </div>
                        <div className="w-px h-10 bg-zinc-100" />
                        <div className="text-center">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Modules</div>
                            <div className="text-3xl font-black text-zinc-900">{completedModules}<span className="text-zinc-300 text-2xl font-bold">/{totalModules}</span></div>
                        </div>
                        <div className="w-px h-10 bg-zinc-100 hidden md:block" />
                        <div className="text-center hidden md:block">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Hours</div>
                            <div className="text-3xl font-black text-zinc-900 flex items-center gap-1">
                                {totalHours} <span className="text-sm font-bold text-zinc-400">hrs</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
