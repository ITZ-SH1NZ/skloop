"use client";

import { motion } from "framer-motion";
import { PlayCircle, FileText, CheckCircle, Lock, Braces } from "lucide-react";
import { useRouter } from "next/navigation";

// ... imports

export type LessonType = "video" | "article" | "quiz" | "challenge";

export interface LessonProps {
    id: string;
    title: string;
    type: LessonType;
    duration: string;
    isCompleted: boolean;
    isLocked: boolean;
    isCurrent?: boolean;
    onClick?: () => void;
    onToggle?: () => void;
}

export default function LessonItem({ id, title, type, duration, isCompleted, isLocked, isCurrent, onClick, onToggle }: LessonProps) {
    const router = useRouter();

    const getIcon = () => {
        // ... (same as before)
        if (isLocked) return <Lock size={12} className="flex-shrink-0 text-zinc-300 md:w-4 md:h-4" />;
        // Specific completion checkmark for non-locked items
        if (isCompleted) return <CheckCircle size={16} className="md:w-5 md:h-5 text-[#D4F268] fill-zinc-900" />;

        switch (type) {
            case "video": return <PlayCircle size={16} />;
            case "article": return <FileText size={16} />;
            case "quiz": return <Braces size={16} />;
            case "challenge": return <Braces size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const handleNavigation = () => {
        if (!isLocked) {
            router.push(`/lesson/${id}`);
        }
    };

    const Content = (
        <div className="flex-1 min-w-0">
            <div className={`text-xs md:text-sm font-bold truncate ${isCurrent ? "text-zinc-900" : "text-zinc-600"} group-hover/item:text-zinc-900 transition-colors`}>
                {title}
            </div>
            <div className="text-[10px] md:text-xs text-zinc-400 font-medium mt-0.5 capitalize flex items-center gap-1.5 md:gap-2">
                <span>{type}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span>{duration}</span>
            </div>
        </div>
    );

    return (
        <motion.div
            whileHover={!isLocked ? { x: 4, backgroundColor: "rgba(250, 250, 250, 1)" } : {}}
            onClick={handleNavigation}
            className={`
                flex items-center gap-2 md:gap-3 py-2 md:py-3 px-2 md:px-3 rounded-xl border-b border-zinc-50 last:border-0 transition-colors cursor-pointer group/item
                ${isCurrent ? "bg-lime-50/50 border-lime-100" : "hover:bg-zinc-50"}
                ${isLocked ? "opacity-50 cursor-not-allowed grayscale" : ""}
            `}
        >
            <div
                className="flex-shrink-0 w-6 md:w-8 flex justify-center cursor-pointer hover:scale-110 transition-transform active:scale-95 z-20"
                onClick={(e) => {
                    if (!isLocked && onToggle) {
                        e.stopPropagation();
                        // e.preventDefault() not needed for div click, but good practice if it was button
                        onToggle();
                    }
                }}
            >
                {getIcon()}
            </div>

            {/* Content Area - Now clickable via parent onClick */}
            <div className="flex-1 min-w-0 flex items-center justify-between pointer-events-none">
                {/* pointer-events-none ensures clicks bubble to parent, but selecting text might be hard? 
                    Actually, if parent has onClick, children don't need pointer events unless they have *their own* handlers.
                    Let's remove pointer-events-none to allow text selection if needed, but for a clickable list item it's usually fine.
                */}
                <div className="flex-1 min-w-0">
                    <div className={`text-xs md:text-sm font-bold truncate ${isCurrent ? "text-zinc-900" : "text-zinc-600"} group-hover/item:text-zinc-900 transition-colors`}>
                        {title}
                    </div>
                    <div className="text-[10px] md:text-xs text-zinc-400 font-medium mt-0.5 capitalize flex items-center gap-1.5 md:gap-2">
                        <span>{type}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span>{duration}</span>
                    </div>
                </div>

                {isCurrent && (
                    <div className="text-[10px] md:text-xs font-bold text-lime-600 bg-lime-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md uppercase tracking-wide ml-2">
                        Now
                    </div>
                )}
            </div>
        </motion.div>
    );
}
