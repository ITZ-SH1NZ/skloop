"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

interface VideoViewerProps {
    youtubeId: string;
    onComplete: () => void;
}

export default function VideoViewer({ youtubeId, onComplete }: VideoViewerProps) {
    return (
        <div className="flex flex-col h-full bg-black md:bg-transparent">
            <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-8">
                {/* 16:9 Aspect Ratio Container */}
                <div className="w-full max-w-5xl aspect-video bg-zinc-900 shadow-2xl rounded-none md:rounded-3xl overflow-hidden border border-zinc-800">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                    />
                </div>

                {/* Footer Controls */}
                <div className="w-full max-w-5xl mt-6 px-6 md:px-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Watch & Learn</h2>
                        <p className="text-zinc-500 text-sm">Watch the full video to unlock the next step.</p>
                    </div>
                    <button
                        onClick={onComplete}
                        className="px-8 py-4 bg-lime-400 hover:bg-lime-500 text-zinc-900 rounded-2xl font-black shadow-lg shadow-lime-400/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Mark as Completed
                    </button>
                </div>
            </div>
        </div>
    );
}
