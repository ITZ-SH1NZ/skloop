"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, ChevronDown, Award } from "lucide-react";
import LessonItem, { LessonProps } from "./LessonItem";

interface FocusModuleProps {
    moduleNumber: number;
    title: string;
    description: string;
    lessons: LessonProps[];
    status: "locked" | "in-progress" | "completed";
    isActive: boolean;
    onClick: () => void;
    onToggleLesson?: (lessonId: string) => void;
}

export default function FocusModule({ moduleNumber, title, description, lessons, status, isActive, onClick, onToggleLesson }: FocusModuleProps) {
    const isLocked = status === "locked";
    const isCompleted = status === "completed";
    // Detect mobile for performance optimization - defined outside component to avoid recreation
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Calculate module progress
    const completedCount = lessons.filter(l => l.isCompleted).length;
    const progressPercent = Math.round((completedCount / lessons.length) * 100);

    return (
        <motion.div
            layout={!isMobile}
            onClick={!isLocked ? onClick : undefined}
            className={`
                relative overflow-hidden cursor-pointer group mb-3 md:mb-5
                ${isActive
                    ? "bg-white rounded-2xl md:rounded-[2.5rem] ring-4 ring-[#D4F268]/20 shadow-xl shadow-zinc-200/50 py-5 md:py-8 px-4 md:px-10 z-10"
                    : "bg-white/40 hover:bg-white rounded-xl border border-zinc-100 hover:border-[#D4F268]/50 hover:shadow-lg hover:shadow-[#D4F268]/5 py-3 md:py-5 px-4 md:px-8"
                }
                ${isLocked ? "opacity-60 grayscale cursor-not-allowed bg-zinc-50/50 border-zinc-50" : ""}
            `}
            transition={isMobile ? { duration: 0.15 } : { duration: 0.3, ease: "easeInOut" }}
        >
            {/* Header Row */}
            <motion.div layout={!isMobile ? "position" : false} className="flex items-center gap-3 md:gap-6">
                {/* Number / Status Icon */}
                <motion.div
                    layout={!isMobile}
                    className={`
                        relative flex-shrink-0 rounded-full flex items-center justify-center font-black border-2
                        ${isActive
                            ? "w-12 h-12 md:w-16 md:h-16 text-lg md:text-2xl bg-[#D4F268] text-zinc-900 border-[#D4F268] shadow-[0_0_15px_rgba(212,242,104,0.4)]"
                            : isCompleted
                                ? "w-10 h-10 md:w-12 md:h-12 text-sm md:text-base bg-zinc-900 text-[#D4F268] border-zinc-900"
                                : "w-10 h-10 md:w-12 md:h-12 text-sm md:text-base bg-white text-zinc-300 border-zinc-100 group-hover:border-zinc-200"
                        }
                    `}
                >
                    {isCompleted ? <Check size={isActive ? 24 : 18} /> : isLocked ? <Lock size={16} /> : moduleNumber}

                    {/* Active Pulse Ring */}
                    {isActive && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 rounded-full bg-[#D4F268] -z-10"
                        />
                    )}
                </motion.div>

                {/* Title Section */}
                <div className="flex-1 min-w-0">
                    <motion.div layout={!isMobile} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center gap-2">
                            <h2 className={`font-bold tracking-tight ${isActive ? "text-xl md:text-3xl text-zinc-900" : "text-base md:text-xl text-zinc-500 group-hover:text-zinc-900"} truncate transition-colors`}>
                                {title}
                            </h2>
                            {/* Chevron for inactive state */}
                            {!isActive && !isLocked && (
                                <ChevronDown size={20} className="flex-shrink-0 text-zinc-300 group-hover:text-[#D4F268] transition-colors" />
                            )}
                        </div>

                        {/* Mini Progress Bar for In-Progress/Active */}
                        {(!isLocked && !isCompleted) && (
                            <div className="w-full max-w-[120px] h-1 bg-zinc-100 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    className="h-full bg-[#D4F268]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Description - Only visible when active */}
                    <AnimatePresence>
                        {isActive && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={isMobile ? { duration: 0.15 } : { duration: 0.25 }}
                                className="text-zinc-500 mt-1.5 md:mt-2 text-sm md:text-lg leading-relaxed max-w-2xl"
                            >
                                {description}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Expanded Content (Lessons) */}
            <AnimatePresence mode="wait">
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={isMobile ? { duration: 0.2 } : { duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 md:pt-10 mt-6 md:mt-8 border-t border-zinc-100 relative">
                            {/* Watermark Number */}
                            <div className="hidden md:block absolute top-0 right-10 text-[10rem] font-black text-[#D4F268] opacity-[0.1] pointer-events-none select-none leading-none rotate-12 transform origin-top-right">
                                {String(moduleNumber).padStart(2, '0')}
                            </div>

                            <div className="grid md:grid-cols-1 gap-2 md:gap-3 relative z-10">
                                <div className="flex items-center justify-between mb-2 md:mb-4 px-2">
                                    <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400">
                                        Module Content
                                    </div>
                                    <div className="text-[10px] md:text-xs font-bold text-[#D4F268] bg-zinc-900 px-2 py-0.5 rounded-md">
                                        +500 XP Available
                                    </div>
                                </div>
                                {lessons.map((lesson) => (
                                    <LessonItem
                                        key={lesson.id}
                                        {...lesson}
                                        onToggle={() => onToggleLesson?.(lesson.id)}
                                    />
                                ))}
                            </div>

                            {/* Module Footer Actions */}
                            <div className="mt-6 md:mt-8 flex justify-end">
                                {isCompleted ? (
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs md:text-sm bg-[#D4F268] px-4 py-2 rounded-full shadow-lg shadow-[#D4F268]/20">
                                        <Award size={16} /> <span className="hidden sm:inline">Module Completed</span><span className="sm:hidden">Done</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                                        <div className="text-zinc-600 text-xs md:text-sm font-bold">
                                            {completedCount}/{lessons.length}
                                        </div>
                                        <div className="w-16 md:w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                            <div style={{ width: `${progressPercent}%` }} className="h-full bg-[#D4F268] rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Highlight Glow (Bottom) */}
            {isActive && (
                <motion.div
                    layoutId="activeGlow"
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-400/20 to-transparent"
                />
            )}
        </motion.div>
    );
}
