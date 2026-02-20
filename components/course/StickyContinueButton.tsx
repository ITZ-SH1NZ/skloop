"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useState, useEffect } from "react";

interface StickyContinueButtonProps {
    lessonTitle: string;
    onClick: () => void;
}

export default function StickyContinueButton({ lessonTitle, onClick }: StickyContinueButtonProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Always show the button after a short delay for entrance animation
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50 pointer-events-none"
                >
                    <div className="pointer-events-auto bg-zinc-900/90 backdrop-blur-md text-white p-1.5 pl-4 pr-1.5 md:p-2 md:pl-6 md:pr-2 rounded-full shadow-2xl shadow-zinc-900/40 flex items-center gap-3 md:gap-6 max-w-[90vw] md:max-w-xl w-full border border-white/10 ring-1 ring-white/5 mx-auto scale-90 md:scale-100 origin-bottom">
                        <div className="hidden md:block flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Continue Learning</div>
                            <div className="text-sm font-bold truncate text-zinc-100">{lessonTitle}</div>
                        </div>

                        <div className="md:hidden flex-1 min-w-0">
                            <div className="text-xs font-bold truncate text-zinc-100">{lessonTitle}</div>
                        </div>

                        <button
                            onClick={onClick}
                            className="flex-shrink-0 bg-[#D4F268] hover:bg-[#c3e055] text-zinc-900 px-4 py-2.5 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-lime-400/20"
                        >
                            <Play size={16} className="fill-current" />
                            <span className="hidden sm:inline">Resume</span>
                            <span className="sm:hidden">Resume Lesson</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
