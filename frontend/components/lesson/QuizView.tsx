"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
}

interface QuizViewProps {
    questions: QuizQuestion[];
    onComplete?: () => void;
}

export default function QuizView({ questions, onComplete }: QuizViewProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === currentQuestion.correctIndex) {
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
            if (onComplete) onComplete();
        }
    };

    if (showResults) {
        return (
            <div className="max-w-2xl mx-auto w-full px-6 py-12 text-center space-y-6">
                <div className="h-32 w-32 bg-zinc-100 rounded-full mx-auto flex items-center justify-center text-4xl mb-6">
                    🏆
                </div>
                <h2 className="text-3xl font-bold text-zinc-900">Quiz Completed!</h2>
                <p className="text-xl text-zinc-600">
                    You scored <span className="font-bold text-[#D4F268] bg-zinc-900 px-2 py-0.5 rounded">{score} / {questions.length}</span>
                </p>
                <button
                    onClick={onComplete} // Or go back to course
                    className="bg-zinc-900 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                    Continue Learning
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 h-2 rounded-full mb-8 overflow-hidden">
                <div
                    className="bg-[#D4F268] h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
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
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === currentQuestion.correctIndex;

                        let cardStyle = "border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50";
                        if (isAnswered) {
                            if (isCorrect) cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                            else if (isSelected && !isCorrect) cardStyle = "border-red-500 bg-red-50 text-red-900";
                            else cardStyle = "opacity-50 border-zinc-100"; // Fade others
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
