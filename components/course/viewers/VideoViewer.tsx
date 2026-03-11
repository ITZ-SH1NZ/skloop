"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Check, X } from "lucide-react";

interface Question {
    question: string;
    options: string[];
    answer: number;
}

interface VideoViewerProps {
    videoData: {
        youtubeId: string;
        description?: string;
        summaryRenderer?: string;
        miniQuiz?: Question[];
    };
    onComplete: () => void;
}

export default function VideoViewer({ videoData, onComplete }: VideoViewerProps) {
    const { youtubeId, description, summaryRenderer, miniQuiz } = videoData;

    // State for the mini-quiz
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [showQuizErrors, setShowQuizErrors] = useState(false);

    const hasMiniQuiz = miniQuiz && miniQuiz.length > 0;

    const handleQuizOptionSelect = (qIndex: number, oIndex: number) => {
        setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
        setShowQuizErrors(false);
    };

    const handleCompletionAttempt = () => {
        if (!hasMiniQuiz) {
            onComplete();
            return;
        }

        // Validate all questions are answered and correct
        let allCorrect = true;
        for (let i = 0; i < miniQuiz!.length; i++) {
            if (quizAnswers[i] !== miniQuiz![i].answer) {
                allCorrect = false;
                break;
            }
        }

        if (allCorrect) {
            onComplete();
        } else {
            setShowQuizErrors(true);
        }
    };

    const isCompleteEnabled = !hasMiniQuiz || Object.keys(quizAnswers).length === miniQuiz!.length;

    return (
        <div className="flex flex-col h-full bg-black md:bg-transparent overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-start p-0 md:p-8 space-y-8 w-full max-w-5xl mx-auto">

                {/* 16:9 Aspect Ratio Container */}
                <div className="w-full aspect-video bg-zinc-900 shadow-2xl rounded-none md:rounded-3xl overflow-hidden border border-zinc-800 shrink-0 relative group">
                    {/* Top overlay to block "Watch later", "Share", and Title links */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 hidden group-hover:block" onClick={(e) => e.stopPropagation()} />

                    {/* Bottom right overlay to block the "YouTube" logo link */}
                    <div className="absolute bottom-0 right-0 w-24 h-12 bg-transparent z-10" onClick={(e) => e.stopPropagation()} />

                    {/* Full overlay that activates at the very end of the video to block the "More Videos" grid is impossible without the IFrame API, but we'll try to rely on rel=0 */}
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        className="w-full h-full border-0"
                    />
                </div>

                {/* Additional Content Container */}
                <div className="w-full px-6 md:px-0 flex flex-col gap-8 pb-12">

                    {/* Header & HTML Summary */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-white md:text-zinc-900">Watch & Learn</h2>
                            {description && <p className="text-zinc-400 md:text-zinc-500 mt-1">{description}</p>}
                        </div>

                        {summaryRenderer && (
                            <div
                                className="html-summary-renderer w-full"
                                dangerouslySetInnerHTML={{ __html: summaryRenderer }}
                            />
                        )}
                    </div>

                    {/* Mini Quiz */}
                    {hasMiniQuiz && (
                        <div className="bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-800 mt-4">
                            <h3 className="text-xl font-bold text-white mb-6">Knowledge Check</h3>

                            <div className="space-y-8">
                                {miniQuiz!.map((q, qIndex) => {
                                    const selected = quizAnswers[qIndex];
                                    const isCorrect = selected === q.answer;
                                    const showError = showQuizErrors && selected !== undefined && !isCorrect;

                                    return (
                                        <div key={qIndex} className="space-y-4">
                                            <p className="text-lg font-medium text-zinc-100">{q.question}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt, oIndex) => {
                                                    const isSelected = selected === oIndex;

                                                    let btnStyle = "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-500";

                                                    // Styling logic after attempting to complete
                                                    if (showQuizErrors) {
                                                        if (oIndex === q.answer) {
                                                            btnStyle = "bg-lime-900/40 border-lime-500/50 text-lime-400"; // reveal correct
                                                        } else if (isSelected) {
                                                            btnStyle = "bg-red-900/40 border-red-500/50 text-red-400"; // show their mistake
                                                        }
                                                    } else if (isSelected) {
                                                        btnStyle = "bg-white border-white text-black font-bold";
                                                    }

                                                    return (
                                                        <button
                                                            key={oIndex}
                                                            onClick={() => handleQuizOptionSelect(qIndex, oIndex)}
                                                            className={`p-4 rounded-xl border transition-all text-left flex justify-between items-center ${btnStyle}`}
                                                        >
                                                            <span>{opt}</span>
                                                            {showQuizErrors && oIndex === q.answer && <Check className="text-lime-400 shrink-0" size={18} />}
                                                            {showQuizErrors && isSelected && oIndex !== q.answer && <X className="text-red-400 shrink-0" size={18} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {showQuizErrors && (
                                <p className="text-red-400 mt-6 font-medium">Please correct your answers before proceeding.</p>
                            )}
                        </div>
                    )}

                    {/* Completion Button */}
                    <div className="flex justify-end mt-4 pt-4 border-t border-zinc-800 md:border-zinc-200">
                        <button
                            onClick={handleCompletionAttempt}
                            disabled={!isCompleteEnabled}
                            className={`px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2
                                ${isCompleteEnabled
                                    ? "bg-lime-400 hover:bg-lime-500 text-zinc-900 shadow-lg shadow-lime-400/20 active:scale-95 cursor-pointer"
                                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
                        >
                            Mark as Completed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
