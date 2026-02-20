"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ShareProps {
    guesses: string[];
    solution: string;
    won: boolean;
    attempts: number;
}

export default function DailyCodeleShare({ guesses, solution, won, attempts }: ShareProps) {
    const [copied, setCopied] = useState(false);

    const generateShareText = () => {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let text = `� Skloop Daily Codele - ${today}\n`;
        text += won ? `✅ Solved in ${attempts}/6 attempts!\n` : `❌ Failed (6/6)\n`;
        text += `\n`;

        guesses.forEach((guess) => {
            if (!guess) return;
            const row = guess.split('').map((letter, i) => {
                if (letter === solution[i]) return '🟩';
                if (solution.includes(letter)) return '🟨';
                return '⬜';
            }).join('');
            text += row + '\n';
        });

        text += `\n💡 Daily programming term challenge`;
        text += `\n🔥 Test your coding vocabulary!`;
        text += `\n\n🎮 Play at skloop.vercel.app`;
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
                    <div className="text-white font-black text-xl mb-1">Skloop Daily Codele</div>
                    <div className="text-lime-400 font-bold text-lg">
                        {won ? `✅ ${attempts}/6` : '❌ Failed'}
                    </div>
                </div>

                <div className="flex flex-col gap-2 items-center">
                    {guesses.map((guess, i) => {
                        if (!guess) return null;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-1"
                            >
                                {guess.split('').map((letter, j) => {
                                    let color = 'bg-zinc-700';
                                    if (letter === solution[j]) color = 'bg-lime-500';
                                    else if (solution.includes(letter)) color = 'bg-amber-400';

                                    return (
                                        <div
                                            key={j}
                                            className={`w-8 h-8 rounded-lg ${color}`}
                                        />
                                    );
                                })}
                            </motion.div>
                        );
                    })}
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
