"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock, Check, Zap } from "lucide-react";
import LessonItem, { LessonProps } from "./LessonItem";

interface ModuleCardProps {
    moduleNumber: number;
    title: string;
    description: string;
    progress: number;
    status: "locked" | "in-progress" | "completed";
    lessons: LessonProps[];
    initiallyExpanded?: boolean;
}

export default function ModuleCard({ moduleNumber, title, description, progress, status, lessons, initiallyExpanded = false }: ModuleCardProps) {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded || status === "in-progress");

    const isLocked = status === "locked";
    const isCompleted = status === "completed";

    return (
        <div className={`
            group relative bg-white rounded-[2rem] border transition-all duration-300
            ${isLocked
                ? "border-zinc-100 opacity-60 cursor-not-allowed"
                : "border-zinc-200 shadow-sm hover:shadow-lg hover:shadow-zinc-200/50 hover:border-zinc-300"
            }
        `}>
            {/* Main Card Header */}
            <div
                onClick={() => !isLocked && setIsExpanded(!isExpanded)}
                className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 relative z-10 ${!isLocked ? "cursor-pointer" : ""}`}
            >
                {/* Visual Indicator / Number */}
                <div className="flex-shrink-0">
                    <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border
                        ${isCompleted
                            ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                            : status === 'in-progress'
                                ? "bg-zinc-900 text-[#D4F268] border-zinc-900 shadow-lg shadow-lime-200/50"
                                : "bg-zinc-100 text-zinc-400 border-zinc-200"
                        }
                    `}>
                        {isCompleted ? <Check size={28} /> : isLocked ? <Lock size={24} /> : moduleNumber}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-xl font-extrabold tracking-tight ${isLocked ? "text-zinc-400" : "text-zinc-900"}`}>
                            {title}
                        </h3>
                        {!isLocked && (
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                className="text-zinc-400 p-1 rounded-full hover:bg-zinc-100"
                            >
                                <ChevronDown size={24} />
                            </motion.div>
                        )}
                    </div>

                    <p className={`text-sm md:text-base leading-relaxed mb-4 max-w-xl ${isLocked ? "text-zinc-400" : "text-zinc-500"}`}>
                        {description}
                    </p>

                    {/* Progress Bar (Only if active or completed) */}
                    {!isLocked && (
                        <div className="w-full max-w-sm">
                            <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                <span>{progress}% Complete</span>
                                <span className={isCompleted ? "text-emerald-500" : "text-zinc-500"}>
                                    {lessons.filter(l => l.isCompleted).length}/{lessons.length} Itemss
                                </span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-zinc-900"}`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Expandable Lessons Area */}
            <AnimatePresence>
                {isExpanded && !isLocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-zinc-50/50 rounded-b-[2rem] border-t border-zinc-100"
                    >
                        <div className="p-2 md:p-4 space-y-1">
                            {lessons.map((lesson, idx) => (
                                <LessonItem key={lesson.id} {...lesson} />
                            ))}
                        </div>

                        {/* "Continue" Quick Action if expanded and in progress */}
                        {status === "in-progress" && (
                            <div className="p-4 bg-white border-t border-zinc-100 rounded-b-[2rem] flex justify-center">
                                <button className="flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-lime-600 transition-colors">
                                    <Zap size={16} className="fill-current" /> Continue to next lesson
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
