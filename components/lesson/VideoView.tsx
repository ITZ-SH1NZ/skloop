"use client";

import { CheckCircle, Play } from "lucide-react";

interface VideoViewProps {
    videoUrl: string;
    summary: string;
    duration: string;
    onComplete?: () => void;
}

export default function VideoView({ videoUrl, summary, duration, onComplete }: VideoViewProps) {
    return (
        <div className="max-w-4xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
            {/* Video Player Container */}
            <div className="aspect-video w-full bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl relative group">
                <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Video Meta & Summary */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Play size={14} className="fill-current" />
                        Video Lesson • {duration}
                    </span>
                </div>

                <hr className="border-zinc-100" />

                <div className="prose prose-zinc prose-sm md:prose-base max-w-none">
                    <h3>Summary</h3>
                    <div dangerouslySetInnerHTML={{ __html: summary }} />
                </div>
            </div>

            {/* Action Area */}
            <div className="pt-8 flex justify-center">
                <button
                    onClick={onComplete}
                    className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
                >
                    <CheckCircle size={20} className="text-[#D4F268]" />
                    I've Watched It
                </button>
            </div>
        </div>
    );
}
