"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, X, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { soundManager } from "@/lib/sound";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { OptionButton } from "./OptionButton";

interface QuizQuestion {
    id?: string;
    question: string;
    options: string[];
    correctIndex?: number;
    answer?: number;
}

interface QuizViewProps {
    questions: QuizQuestion[];
    passingScore?: number;
    onComplete?: () => void;
    hearts?: number;
    onHeartLost?: () => void;
    onProgress?: (current: number, total: number) => void;
    onRetry?: () => void;
}

export default function QuizView({ questions, passingScore = 18, onComplete, hearts, onHeartLost, onProgress, onRetry }: QuizViewProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (onProgress) {
            onProgress(currentQuestionIndex, questions.length);
        }
    }, [currentQuestionIndex, questions.length, onProgress]);

    const currentQuestion = questions[currentQuestionIndex];

    const { shuffledOptions, correctIndex } = useMemo(() => {
        if (!currentQuestion) return { shuffledOptions: [], correctIndex: -1 };

        const originalTargetIndex = currentQuestion.correctIndex !== undefined ? currentQuestion.correctIndex : currentQuestion.answer ?? 0;
        const optionsWithOriginalIndex = currentQuestion.options.map((opt, i) => ({ opt, originalIndex: i }));

        for (let i = optionsWithOriginalIndex.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsWithOriginalIndex[i], optionsWithOriginalIndex[j]] = [optionsWithOriginalIndex[j], optionsWithOriginalIndex[i]];
        }

        const newCorrectIndex = optionsWithOriginalIndex.findIndex(item => item.originalIndex === originalTargetIndex);

        return {
            shuffledOptions: optionsWithOriginalIndex.map(item => item.opt),
            correctIndex: newCorrectIndex
        };
    }, [currentQuestionIndex, currentQuestion]);

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === correctIndex) {
            setScore(s => s + 1);
            soundManager.playMetalSnap();
        } else {
            soundManager.playError();
            if (onHeartLost) onHeartLost();
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            const effectivePassingScore = Math.min(passingScore, questions.length);
            if (score >= effectivePassingScore) {
                if (onComplete) onComplete();
            } else {
                setShowResults(true);
            }
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setShowResults(false);
        setScore(0);
    };

    if (showResults) {
        // This is only reached if they somehow reach the end without passing 
        // (e.g. hearts disabled, or passing score requires perfection)
        const effectivePassingScore = Math.min(passingScore, questions.length);
        const passed = score >= effectivePassingScore;

        if (passed && onComplete) {
            onComplete();
            return null; // Should instantly unmount and trigger global cutscene
        }

        return (
            <div className="max-w-xl mx-auto w-full px-6 py-12 text-center space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="h-32 w-32 rounded-full border-4 border-red-200 bg-red-100 flex items-center justify-center text-5xl shadow-xl shadow-red-500/10 mb-2">
                    📚
                </div>
                <h2 className="text-4xl font-black text-zinc-900 tracking-tight">
                    Keep Studying!
                </h2>
                <div className="bg-zinc-50 border border-zinc-200 w-full rounded-3xl p-6">
                    <p className="text-lg text-zinc-600 font-medium mb-2">
                        You scored <span className="font-black text-red-600 ml-1">{score} / {questions.length}</span>
                    </p>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-4">
                        Required to pass: {effectivePassingScore}
                    </p>
                </div>
                <button
                    onClick={handleRetry}
                    className="w-full bg-zinc-900 text-white border-b-4 border-black px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-lg hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                    <RefreshCcw size={22} className="opacity-80" /> Try Again
                </button>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 mb-40 min-h-[70vh] flex flex-col justify-start pt-16 relative">
            
            <div className="space-y-8 md:space-y-12 relative z-10 w-full max-w-2xl mx-auto">
                
                <div className="flex flex-col md:flex-row items-end md:items-start gap-4 md:gap-8">
                    {/* Character Column */}
                    <div className="hidden md:flex flex-col items-center shrink-0 w-[140px] -mt-10">
                        <LoopyMascot size={160} mood="thinking" isStatic={false} />
                    </div>

                    {/* Speech Bubble Question */}
                    <div className="relative w-full bg-white border-2 border-zinc-200 border-b-[6px] p-6 md:p-8 rounded-3xl md:rounded-tl-none flex-1 shadow-sm">
                        {/* Desktop Triangle pointing to Mascot */}
                        <div className="hidden md:block absolute -left-[14px] top-10 w-6 h-6 bg-white border-l-2 border-t-2 border-zinc-200 rotate-[-45deg] z-0" />

                        <span className="inline-block text-xs md:text-sm font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 border-2 border-zinc-200 px-4 py-1.5 rounded-full mb-6 shadow-sm relative z-10">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 leading-[1.3] relative z-10">
                            {currentQuestion.question}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-20 w-full">
                    {shuffledOptions.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === correctIndex;

                        return (
                            <OptionButton
                                key={idx}
                                idx={idx}
                                option={option}
                                isAnswered={isAnswered}
                                isSelected={isSelected}
                                isCorrect={isCorrect}
                                onClick={() => handleOptionClick(idx)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Feedback Banner (Fixed to Bottom) */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`fixed bottom-0 left-0 right-0 z-[100] border-t-4 p-4 md:p-6 lg:p-8 flex items-center justify-between
                            ${selectedOption === correctIndex 
                                ? "bg-[#D4F268] border-[#a3e635]" 
                                : "bg-red-50 border-red-400"
                            }
                        `}
                    >
                        <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 relative">
                            {/* Detailed Banner Layout with Mascot */}
                            <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                                {/* Only show Mascot on Desktop so it doesn't break mobile layout */}
                                <div className="hidden md:flex absolute -left-6 -top-[130px] pointer-events-none">
                                    <motion.div
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 100, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                    >
                                        <LoopyMascot size={160} mood={selectedOption === correctIndex ? 'celebrating' : 'annoyed'} isStatic={false} />
                                    </motion.div>
                                </div>
                                
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 shadow-md border-4 md:ml-32
                                    ${selectedOption === correctIndex ? "bg-white text-[#4d7c0f] border-[#a3e635]" : "bg-white text-red-600 border-red-200"}
                                `}>
                                    {selectedOption === correctIndex ? <Check size={32} strokeWidth={4} /> : <X size={32} strokeWidth={4} />}
                                </div>
                                <div className="flex flex-col">
                                    <div className={`font-black text-2xl md:text-3xl ${selectedOption === correctIndex ? "text-[#1a2e05]" : "text-red-700"}`}>
                                        {selectedOption === correctIndex ? "Incredible!" : "Not quite!"}
                                    </div>
                                    {! (selectedOption === correctIndex) && (
                                        <div className="text-red-600 text-sm md:text-base font-bold mt-1 opacity-90 drop-shadow-sm">
                                            Correct answer: <span className="bg-white/50 px-2 py-0.5 rounded ml-1 text-red-800">{shuffledOptions[correctIndex]}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={handleNext} 
                                className={`w-full md:w-auto font-black px-12 py-5 rounded-3xl text-base md:text-lg tracking-widest uppercase transition-all shadow-xl active:translate-y-1 active:shadow-none active:border-b-0
                                    ${selectedOption === correctIndex 
                                        ? "bg-[#4d7c0f] text-white hover:brightness-110 border-b-4 border-[#3f6212]" 
                                        : "bg-red-600 text-white hover:brightness-110 border-b-4 border-red-800"
                                    }
                                `}
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
