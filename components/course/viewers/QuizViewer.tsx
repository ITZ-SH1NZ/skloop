"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Check, X, ArrowRight, Award, RefreshCcw } from "lucide-react";

interface Question {
    question: string;
    options: string[];
    answer: number;
}

interface QuizViewerProps {
    quizData: {
        questions: Question[];
        passingScore?: number;
    };
    onComplete: () => void;
}

export default function QuizViewer({ quizData, onComplete }: QuizViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const passingScore = quizData.passingScore || 0;
    const currentQuestion = quizData.questions[currentIndex];

    // Memoize the shuffled options for the current question so they don't change on re-renders
    const { shuffledOptions, correctIndex } = useMemo(() => {
        if (!currentQuestion) return { shuffledOptions: [], correctIndex: -1 };

        // Map original options along with their original index
        const optionsWithOriginalIndex = currentQuestion.options.map((opt, i) => ({ opt, originalIndex: i }));

        // Fisher-Yates shuffle
        for (let i = optionsWithOriginalIndex.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsWithOriginalIndex[i], optionsWithOriginalIndex[j]] = [optionsWithOriginalIndex[j], optionsWithOriginalIndex[i]];
        }

        // Find where the correct answer ended up
        const newCorrectIndex = optionsWithOriginalIndex.findIndex(item => item.originalIndex === currentQuestion.answer);

        return {
            shuffledOptions: optionsWithOriginalIndex.map(item => item.opt),
            correctIndex: newCorrectIndex
        };
    }, [currentIndex, currentQuestion]);

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < quizData.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setShowResults(false);
        setScore(0);
    };

    if (showResults) {
        const passed = score >= passingScore;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center p-8"
            >
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border-4 ${passed ? 'bg-lime-100 border-lime-200 text-lime-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                    {passed ? <Award size={48} /> : <X size={48} />}
                </div>
                <h2 className="text-3xl font-black text-zinc-900 mb-2">
                    {passed ? "Quiz Complete!" : "Not Quite There"}
                </h2>
                <p className="text-zinc-500 mb-8 text-lg">
                    You scored {score} out of {quizData.questions.length}
                    {passingScore > 0 && <span> (Need {passingScore} to pass)</span>}
                </p>

                {passed ? (
                    <button
                        onClick={onComplete}
                        className="px-12 py-4 bg-lime-400 text-zinc-900 rounded-2xl font-black shadow-xl shadow-lime-400/20 hover:bg-lime-500 transition-all active:scale-95"
                    >
                        Claim Your XP
                    </button>
                ) : (
                    <button
                        onClick={handleRetry}
                        className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <RefreshCcw size={18} /> Try Again
                    </button>
                )}
            </motion.div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="flex flex-col h-full bg-white md:bg-transparent p-6 md:p-12 overflow-y-auto w-full">
            <div className="max-w-2xl mx-auto w-full">
                {/* Progress Bar */}
                <div className="h-2 w-full bg-zinc-100 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-lime-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / quizData.questions.length) * 100}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <h3 className="text-2xl font-black text-zinc-900 leading-tight">
                            {currentQuestion.question}
                        </h3>

                        <div className="space-y-3">
                            {shuffledOptions.map((option, idx) => {
                                const isCorrect = idx === correctIndex;
                                const isSelected = idx === selectedOption;

                                let stateStyles = "bg-zinc-50 border-zinc-200 hover:border-zinc-300";
                                if (isAnswered) {
                                    if (isCorrect) stateStyles = "bg-lime-50 border-lime-500 text-lime-700";
                                    else if (isSelected) stateStyles = "bg-red-50 border-red-500 text-red-700";
                                    else stateStyles = "bg-zinc-50 border-zinc-200 opacity-50";
                                } else if (isSelected) {
                                    stateStyles = "bg-zinc-900 border-zinc-900 text-white";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={isAnswered}
                                        className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${stateStyles}`}
                                    >
                                        <span>{option}</span>
                                        {isAnswered && isCorrect && <Check size={20} />}
                                        {isAnswered && isSelected && !isCorrect && <X size={20} />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 flex justify-end"
                    >
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
                        >
                            {currentIndex < quizData.questions.length - 1 ? "Next Question" : "See Results"}
                            <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
