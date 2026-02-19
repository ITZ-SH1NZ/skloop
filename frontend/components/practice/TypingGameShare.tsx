"use client";

import { useState } from "react";

import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TypingShareProps {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    timeElapsed: number;
    mode: string;
}

export default function TypingGameShare({ wpm, rawWpm, accuracy, timeElapsed, mode }: TypingShareProps) {
    const [copied, setCopied] = useState(false);

    const generateShareText = () => {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let text = `⚡ Skloop Syntax Speed Run - ${today}\n`;
        text += `\n📊 My Results:\n`;
        text += `🎯 ${wpm} WPM (Net)\n`;
        text += `💨 ${rawWpm} WPM (Raw)\n`;
        text += `✓ ${accuracy}% Accuracy\n`;
        text += `⏱️ ${Math.floor(timeElapsed)}s elapsed\n`;
        text += `\n💻 Mode: ${mode}\n`;
        text += `\n🔥 Beat the compiler at skloop.vercel.app`;

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
                    <div className="text-white font-black text-xl mb-1">Syntax Speed Run</div>
                    <div className="text-lime-400 font-bold text-2xl">{wpm} WPM</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 rounded-xl p-3">
                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Raw</div>
                        <div className="text-white text-lg font-black">{rawWpm}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Accuracy</div>
                        <div className="text-white text-lg font-black">{accuracy}%</div>
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
