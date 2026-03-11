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
    trackSlug?: string;
}

export default function LessonLayout({
    title,
    type,
    moduleTitle,
    onComplete,
    isCompleted,
    children,
    trackSlug = "web-development"
}: LessonLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
            {/* Header */}
            <header className="h-14 md:h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-6">
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
