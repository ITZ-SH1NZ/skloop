"use client";

import { useState } from "react";
import { CheckCircle, Play, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
    question: string;
    options: string[];
    answer?: number;
    correctIndex?: number;
}

interface VideoViewProps {
    videoUrl: string;
    summary: string;
    duration?: string;
    miniQuiz?: Question[];
    onComplete?: () => void;
}

export default function VideoView({ videoUrl, summary, duration, miniQuiz, onComplete }: VideoViewProps) {
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

    // Strict Sequential Quiz State
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [failedAttempts, setFailedAttempts] = useState<Record<number, number[]>>({});

    const hasMiniQuiz = miniQuiz && miniQuiz.length > 0;
    const isCompleteEnabled = !hasMiniQuiz || currentQuizIndex >= miniQuiz!.length;

    const handleQuizOptionSelect = (oIndex: number) => {
        if (!hasMiniQuiz || currentQuizIndex >= miniQuiz!.length) return;

        const currentQ = miniQuiz![currentQuizIndex];
        const correctAnswer = currentQ.correctIndex !== undefined ? currentQ.correctIndex : currentQ.answer;

        if (oIndex === correctAnswer) {
            // Correct - move to next question (or finish)
            setTimeout(() => {
                setCurrentQuizIndex(prev => prev + 1);
            }, 600); // Small delay to let user see the green success state
        } else {
            // Incorrect - record failure
            setFailedAttempts(prev => ({
                ...prev,
                [currentQuizIndex]: [...(prev[currentQuizIndex] || []), oIndex]
            }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
            {/* Video Player Container */}
            <div className="aspect-video w-full bg-zinc-900 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl relative group">
                {/* Top overlay to block "Watch later", "Share", and Title links */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 hidden group-hover:block" onClick={(e) => e.stopPropagation()} />

                {/* Bottom right overlay to block the "YouTube" logo link */}
                <div className="absolute bottom-0 right-0 w-24 h-12 bg-transparent z-10" onClick={(e) => e.stopPropagation()} />

                <iframe
                    src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1&playsinline=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            </div>

            {/* Video Meta & Summary */}
            <div className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Play size={14} className="fill-current" />
                        Video Lesson {duration && `• ${duration}`}
                    </span>
                </div>

                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                    <button
                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                        className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors"
                    >
                        <h3 className="text-lg font-black text-zinc-900">Lesson Summary</h3>
                        <div className={`p-2 rounded-full transition-colors ${isSummaryExpanded ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-50 text-zinc-400'}`}>
                            {isSummaryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </button>

                    <AnimatePresence initial={false}>
                        {isSummaryExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="px-6 pb-8 pt-2">
                                    <hr className="border-zinc-100 mb-6" />
                                    <div className="prose prose-zinc prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:text-zinc-900 prose-a:text-lime-600 prose-strong:text-zinc-900">
                                        <div dangerouslySetInnerHTML={{ __html: summary }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Strict Sequential Mini Quiz */}
            {hasMiniQuiz && (
                <div className="bg-zinc-50 rounded-3xl p-6 md:p-8 border border-zinc-200 mt-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Knowledge Check</h3>
                        {!isCompleteEnabled && (
                            <span className="text-sm font-bold text-zinc-400 bg-zinc-200/50 px-3 py-1 rounded-full">
                                {currentQuizIndex + 1} / {miniQuiz!.length}
                            </span>
                        )}
                    </div>

                    <div className="min-h-[280px] relative">
                        <AnimatePresence mode="wait">
                            {isCompleteEnabled ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-2xl border border-emerald-200 shadow-sm p-6"
                                >
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle size={32} strokeWidth={3} />
                                    </div>
                                    <h4 className="text-2xl font-black text-zinc-900">Excellent Work!</h4>
                                    <p className="text-zinc-500 font-medium max-w-xs">You've successfully answered all knowledge checks for this video.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={currentQuizIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {(() => {
                                        const currentQ = miniQuiz![currentQuizIndex];
                                        const correctAnswer = currentQ.correctIndex !== undefined ? currentQ.correctIndex : currentQ.answer;
                                        const currentFailures = failedAttempts[currentQuizIndex] || [];

                                        return (
                                            <>
                                                <p className="text-xl font-bold text-zinc-800 leading-snug">
                                                    {currentQ.question}
                                                </p>

                                                <div className="space-y-3">
                                                    {currentQ.options.map((opt, oIndex) => {
                                                        const isFailed = currentFailures.includes(oIndex);

                                                        let btnStyle = "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 shadow-sm";

                                                        if (isFailed) {
                                                            btnStyle = "bg-red-50 border-red-300 text-red-900 opacity-60 cursor-not-allowed";
                                                        }

                                                        return (
                                                            <button
                                                                key={oIndex}
                                                                disabled={isFailed}
                                                                onClick={() => handleQuizOptionSelect(oIndex)}
                                                                className={`w-full p-5 rounded-2xl border-2 font-bold transition-all text-left flex justify-between items-center group active:scale-[0.99] ${btnStyle}`}
                                                            >
                                                                <span className="text-lg">{opt}</span>

                                                                <div className="shrink-0">
                                                                    {isFailed && (
                                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500 bg-red-100 p-1.5 rounded-full">
                                                                            <X size={18} strokeWidth={3} />
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Action Area */}
            <div className="pt-8 flex justify-center border-t border-zinc-100 mt-8">
                <button
                    onClick={() => isCompleteEnabled && onComplete?.()}
                    disabled={!isCompleteEnabled}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition-all
                        ${isCompleteEnabled
                            ? "bg-zinc-900 text-white hover:bg-black hover:scale-105 active:scale-95 cursor-pointer shadow-xl shadow-zinc-900/20"
                            : "bg-zinc-200 text-zinc-400 cursor-not-allowed"}`}
                >
                    <CheckCircle size={22} className={isCompleteEnabled ? "text-[#D4F268]" : "text-zinc-400"} />
                    Mark as Completed
                </button>
            </div>
        </div>
    );
}
