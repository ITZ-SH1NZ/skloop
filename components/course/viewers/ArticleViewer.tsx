"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface ArticleViewerProps {
    markdown: string;
    onComplete: () => void;
}

export default function ArticleViewer({ markdown, onComplete }: ArticleViewerProps) {
    return (
        <div className="h-full bg-white md:bg-transparent p-6 md:p-12 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-zinc prose-lg max-w-none prose-headings:font-black prose-headings:text-zinc-900 prose-p:text-zinc-600 prose-strong:text-zinc-900 prose-pre:bg-zinc-900 prose-pre:rounded-2xl"
                >
                    {/* In a real app, use a markdown renderer like react-markdown here */}
                    {markdown.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </motion.article>

                <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-center">
                    <button
                        onClick={onComplete}
                        className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 shadow-xl transition-all active:scale-95 flex items-center gap-3"
                    >
                        <CheckCircle size={20} className="text-lime-400" />
                        Complete Reading
                    </button>
                </div>
            </div>
        </div>
    );
}
