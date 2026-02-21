"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Check, X, ArrowRight, Award } from "lucide-react";

interface Question {
    question: string;
    options: string[];
    answer: number;
}

interface QuizViewerProps {
    quizData: {
        questions: Question[];
    };
    onComplete: () => void;
}

export default function QuizViewer({ quizData, onComplete }: QuizViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = quizData.questions[currentIndex];

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === currentQuestion.answer) {
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

    if (showResults) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center p-8"
            >
                <div className="w-24 h-24 bg-lime-100 rounded-3xl flex items-center justify-center mb-6">
                    <Award size={48} className="text-lime-600" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 mb-2">Quiz Complete!</h2>
                <p className="text-zinc-500 mb-8 text-lg">You scored {score} out of {quizData.questions.length}</p>

                <button
                    onClick={onComplete}
                    className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl hover:bg-zinc-800 transition-all active:scale-95"
                >
                    Claim Your XP
                </button>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white md:bg-transparent p-6 md:p-12 overflow-y-auto">
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
                            {currentQuestion.options.map((option, idx) => {
                                const isCorrect = idx === currentQuestion.answer;
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
