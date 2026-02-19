"use client";

import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface LessonLayoutProps {
    title: string;
    type: "video" | "article" | "quiz" | "challenge";
    moduleTitle: string;
    nextLessonId?: string;
    onComplete?: () => void;
    isCompleted?: boolean;
    children: ReactNode;
}

export default function LessonLayout({
    title,
    type,
    moduleTitle,
    onComplete,
    isCompleted,
    children
}: LessonLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
            {/* Header */}
            <header className="h-14 md:h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/course/web-dev"
                        className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
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
                    {onComplete && (
                        <button
                            onClick={onComplete}
                            className={`
                                flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all
                                ${isCompleted
                                    ? "bg-zinc-100 text-zinc-900"
                                    : "bg-[#D4F268] text-zinc-900 shadow-lg shadow-[#D4F268]/20 hover:scale-105 active:scale-95"
                                }
                            `}
                        >
                            {isCompleted ? (
                                <>
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span className="hidden md:inline">Completed</span>
                                </>
                            ) : (
                                "Mark Complete"
                            )}
                        </button>
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
