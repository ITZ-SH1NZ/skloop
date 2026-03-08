"use client";

interface ArticleViewProps {
    content: string; // Expecting HTML string for MVP simplicity
    readTime?: string;
    onComplete?: () => void;
}

export default function ArticleView({ content, readTime, onComplete }: ArticleViewProps) {
    return (
        <div className="max-w-4xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
            {readTime && (
                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4F268]/20 text-[#D4F268] text-sm font-bold uppercase tracking-widest">
                        ⏱️ {readTime} Read
                    </span>
                </div>
            )}

            <div className="prose prose-zinc prose-lg md:prose-xl max-w-none 
                prose-headings:font-black prose-headings:text-zinc-900 prose-headings:tracking-tight 
                prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-8
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-zinc-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-lime-600 prose-a:font-bold hover:prose-a:text-lime-700
                prose-strong:font-bold prose-strong:text-zinc-900
                prose-code:text-zinc-800 prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:p-6 prose-pre:rounded-2xl prose-pre:shadow-xl
                prose-ul:list-disc prose-ul:pl-6 prose-li:my-2 prose-li:text-zinc-700
                prose-ol:list-decimal prose-ol:pl-6
                prose-blockquote:border-l-4 prose-blockquote:border-[#D4F268] prose-blockquote:bg-zinc-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-zinc-600">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Footer Action */}
            <div className="mt-20 pt-12 border-t border-zinc-200 flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center text-2xl">
                    📚
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-black text-zinc-900 mb-2">You've reached the end!</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto">Great job completing this reading material. Mark it as read to claim your XP and continue your journey.</p>
                </div>
                <button
                    onClick={onComplete}
                    className="px-10 py-4 bg-zinc-900 hover:bg-black text-white hover:scale-105 active:scale-95 shadow-xl shadow-zinc-900/20 rounded-full font-bold transition-all mt-4"
                >
                    Mark as Read & Continue
                </button>
            </div>
        </div>
    );
}
