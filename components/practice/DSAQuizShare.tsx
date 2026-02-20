"use client";

import { useState } from "react";

import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DSAShareProps {
    score: number;
    totalQuestions: number;
    timeElapsed: number;
    grade: string;
}

export default function DSAQuizShare({ score, totalQuestions, timeElapsed, grade }: DSAShareProps) {
    const [copied, setCopied] = useState(false);

    const getGradeEmoji = (grade: string) => {
        if (grade === "S+") return "🏆";
        if (grade === "S") return "⭐";
        if (grade === "A") return "🎯";
        if (grade === "B") return "💪";
        return "📚";
    };

    const generateShareText = () => {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const percentage = Math.round((score / totalQuestions) * 100);

        let text = `🧠 Skloop DSA Rapid Fire - ${today}\n`;
        text += `\n${getGradeEmoji(grade)} Grade: ${grade}\n`;
        text += `\n📊 Results:\n`;
        text += `✓ ${score}/${totalQuestions} Correct (${percentage}%)\n`;
        text += `⏱️ ${Math.floor(timeElapsed)}s elapsed\n`;
        text += `⚡ ${(timeElapsed / totalQuestions).toFixed(1)}s per question\n`;
        text += `\n🔥 Test your DSA skills at skloop.vercel.app`;

        return text;
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generateShareText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            {/* Visual Preview */}
            <div className="bg-zinc-900 p-6 rounded-2xl">
                <div className="text-center mb-4">
                    <div className="text-white font-black text-xl mb-1">DSA Rapid Fire</div>
                    <div className="text-6xl mb-2">{getGradeEmoji(grade)}</div>
                    <div className="text-lime-400 font-bold text-2xl">Grade {grade}</div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/10 rounded-xl p-3">
                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Score</div>
                        <div className="text-white text-lg font-black">{score}/{totalQuestions}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Time</div>
                        <div className="text-white text-lg font-black">{Math.floor(timeElapsed)}s</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Avg</div>
                        <div className="text-white text-lg font-black">{(timeElapsed / totalQuestions).toFixed(1)}s</div>
                    </div>
                </div>
            </div>

            {/* Share Button */}
            <Button
                onClick={handleCopy}
                className={`
                    w-full py-4 rounded-2xl font-bold text-lg shadow-lg
                    transition-all flex items-center justify-center gap-2
                    ${copied
                        ? 'bg-lime-500 text-zinc-900'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    }
                `}
            >
                {copied ? (
                    <>
                        <Check size={20} />
                        Copied to Clipboard!
                    </>
                ) : (
                    <>
                        <Share2 size={20} />
                        Share Results
                    </>
                )}
            </Button>

            {/* Text Preview */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                <pre className="text-xs font-mono text-zinc-600 whitespace-pre-wrap">
                    {generateShareText()}
                </pre>
            </div>
        </div>
    );
}
