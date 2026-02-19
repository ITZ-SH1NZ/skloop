"use client";

interface ArticleViewProps {
    content: string; // Expecting HTML string for MVP simplicity
    readTime: string;
    onComplete?: () => void;
}

export default function ArticleView({ content, readTime, onComplete }: ArticleViewProps) {
    return (
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
            <div className="prose prose-zinc prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Footer Action */}
            <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col items-center gap-4">
                <p className="text-zinc-400 text-sm">You've reached the end of this article.</p>
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full font-bold transition-colors"
                >
                    Mark as Read
                </button>
            </div>
        </div>
    );
}
