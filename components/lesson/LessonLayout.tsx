"use client";

import { ArrowLeft, CheckCircle, Heart } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LessonLayoutProps {
    title: string;
    type: "video" | "article" | "quiz" | "challenge";
    moduleTitle: string;
    nextLessonId?: string;
    onComplete?: () => void;
    isCompleted?: boolean;
    children: ReactNode;
    trackSlug?: string;
    hearts?: number;
    maxHearts?: number;
    currentStep?: number;
    totalSteps?: number;
}

export default function LessonLayout({
    title,
    type,
    moduleTitle,
    onComplete,
    isCompleted,
    children,
    trackSlug = "web-development",
    hearts,
    maxHearts = 3,
    currentStep,
    totalSteps
}: LessonLayoutProps) {
    const showProgress = currentStep !== undefined && totalSteps !== undefined;

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
            {/* Progress Bar */}
            {showProgress && (
                <div className="h-1.5 w-full bg-zinc-100 fixed top-0 left-0 right-0 z-[60]">
                    <motion.div
                        className="h-full bg-[#D4F268] rounded-r-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep! / totalSteps!) * 100}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                </div>
            )}

            {/* Header */}
            <header className={`h-14 md:h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky z-50 flex items-center justify-between px-4 md:px-6 ${showProgress ? "top-1.5" : "top-0"}`}>
                <div className="flex items-center gap-4">
                    <Link
                        href={`/course/${trackSlug}`}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors group"
                        title="Back to Roadmap"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                            {moduleTitle}
                        </div>
                        <h1 className="text-sm md:text-base font-bold text-zinc-900 truncate max-w-[200px] md:max-w-md">
                            {title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Hearts Display */}
                    {hearts !== undefined && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm rounded-full border border-zinc-200/60">
                            {[...Array(maxHearts)].map((_, i) => {
                                const isFilled = i < hearts;
                                return (
                                    <div key={i} className="relative w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                                        <AnimatePresence mode="popLayout">
                                            {isFilled ? (
                                                <motion.div
                                                    key="filled"
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 1.5, opacity: 0, filter: "blur(4px)", rotate: -15, y: 10 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                                    className="absolute inset-0 flex items-center justify-center text-red-500 drop-shadow-sm"
                                                >
                                                    <Heart size={20} fill="currentColor" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="empty"
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="absolute inset-0 flex items-center justify-center text-zinc-300"
                                                >
                                                    <Heart size={20} strokeWidth={2.5} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* The top right Mark Complete button was removed to enforce sequential progression and content interaction */}
                    {isCompleted && (
                        <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold bg-zinc-100 text-zinc-900">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span className="hidden md:inline">Completed</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {children}
            </main>
        </div>
    );
}
