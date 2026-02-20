"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

const COURSES = [
    { title: "Next.js Mastery", author: "Lee Rob", color: "bg-blue-500" },
    { title: "Rust Systems", author: "ThePrimeagen", color: "bg-orange-600" },
    { title: "CSS Art", author: "Lynn Fisher", color: "bg-pink-500" },
    { title: "AI Agents", author: "LangChain", color: "bg-green-500" },
];

export default function GlassTrends() {
    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-xs font-bold text-white/40 uppercase mb-4 px-1">Trending Now</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {COURSES.map((course, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group"
                    >
                        <div className={`w-12 h-12 rounded-xl ${course.color} shadow-lg flex items-center justify-center shrink-0`}>
                            <Play size={16} className="text-white fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{course.title}</div>
                            <div className="text-xs text-white/50">{course.author}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
