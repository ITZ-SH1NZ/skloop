"use client";

import { useState, useMemo } from "react";
import { Check, X, RefreshCcw } from "lucide-react";

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
}

export default function QuizView({ questions, passingScore = 18, onComplete }: QuizViewProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

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
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
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
        // Handle cases where dev passes a lower question count for testing
        const effectivePassingScore = Math.min(passingScore, questions.length);
        const passed = score >= effectivePassingScore;

        return (
            <div className="max-w-2xl mx-auto w-full px-6 py-12 text-center space-y-6">
                <div className={`h-32 w-32 rounded-full mx-auto flex items-center justify-center text-4xl mb-6 ${passed ? 'bg-lime-100/50' : 'bg-red-50'}`}>
                    {passed ? '🏆' : '📚'}
                </div>
                <h2 className="text-3xl font-bold text-zinc-900">
                    {passed ? "Quiz Completed!" : "Keep Studying!"}
                </h2>
                <p className="text-xl text-zinc-600">
                    You scored <span className={`font-bold px-2 py-0.5 rounded ${passed ? 'text-[#D4F268] bg-zinc-900' : 'text-red-500 bg-red-100'}`}>{score} / {questions.length}</span>
                </p>
                {passed ? (
                    <button
                        onClick={onComplete}
                        className="bg-zinc-900 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        Continue Learning
                    </button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-zinc-500">You need at least {effectivePassingScore} correct answers to pass module.</p>
                        <button
                            onClick={handleRetry}
                            className="bg-zinc-100 text-zinc-900 border border-zinc-200 px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <RefreshCcw size={18} /> Retry Quiz
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="max-w-2xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
            <div className="w-full bg-zinc-100 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="bg-[#D4F268] h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            <div className="space-y-8">
                <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 leading-tight">
                        {currentQuestion.question}
                    </h2>
                </div>

                <div className="space-y-3">
                    {shuffledOptions.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === correctIndex;

                        let cardStyle = "border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50";
                        if (isAnswered) {
                            if (isCorrect) cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                            else if (isSelected && !isCorrect) cardStyle = "border-red-500 bg-red-50 text-red-900";
                            else cardStyle = "opacity-50 border-zinc-100";
                        } else if (isSelected) {
                            cardStyle = "border-zinc-900 bg-zinc-50";
                        }

                        return (
                            <button
                                key={idx}
                                disabled={isAnswered}
                                onClick={() => handleOptionClick(idx)}
                                className={`
                                    w-full text-left p-4 md:p-5 rounded-xl border-2 font-medium transition-all duration-200 flex items-center justify-between
                                    ${cardStyle}
                                `}
                            >
                                <span>{option}</span>
                                {isAnswered && isCorrect && <Check className="text-emerald-600" size={20} />}
                                {isAnswered && isSelected && !isCorrect && <X className="text-red-600" size={20} />}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="pt-4 flex justify-end animate-in fade-in slide-in-from-bottom-4">
                        <button
                            onClick={handleNext}
                            className="bg-zinc-900 text-white px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                        >
                            {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
