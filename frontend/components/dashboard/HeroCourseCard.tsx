"use client";

import { Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroCourseCard() {

    return (
        <div className="bg-[#1A1C1E] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-200 group">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4F268] opacity-5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-6 max-w-lg">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#D4F268]/20 text-[#D4F268] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            Current Focus
                        </span>
                        {/* TODO: specific progress */}
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                        Continue<br />
                        Your<br />
                        Learning
                    </h2>

                    <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                        Pick up where you left off.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                            className="h-full bg-[#D4F268] rounded-full shadow-[0_0_10px_rgba(212,242,104,0.5)]"
                        />
                    </div>
                </div>

                <Link href="/course/react-patterns">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#D4F268] text-[#1A1C1E] px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(212,242,104,0.3)] hover:shadow-[0_0_30px_rgba(212,242,104,0.5)] transition-shadow"
                    >
                        <Play className="fill-current w-4 h-4" />
                        Continue Learning
                    </motion.button>
                </Link>
            </div>
        </div>
    );
}
