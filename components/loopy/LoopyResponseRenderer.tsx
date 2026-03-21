"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Play, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const ExpandableList = ({ items }: { items: React.ReactNode[] }) => {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? items : items.slice(0, 4);

    return (
        <div className="mb-4 bg-white/10 rounded-xl border border-white/10 overflow-hidden">
            <ul className="divide-y divide-white/5">
                {visible.map((item, i) => (
                    <li key={i} className="px-4 py-2.5 text-white/90 font-medium text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-[#D4F268] shrink-0 mt-0.5 font-black">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
            {items.length > 4 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#D4F268] hover:bg-white/5 flex items-center justify-center gap-2 transition-colors border-t border-white/10"
                >
                    {expanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Show {items.length - 4} More</>}
                </button>
            )}
        </div>
    );
};

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
    const [copied, setCopied] = useState(false);
    const isRunnable = language === 'js' || language === 'javascript';

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = () => {
        try {
            // eslint-disable-next-line no-new-func
            const result = new Function(code)();
            alert(result !== undefined ? `Output:\n${result}` : 'Ran successfully (no return value).');
        } catch (e) {
            alert(`Error:\n${e}`);
        }
    };

    return (
        <div className="my-6 rounded-2xl overflow-hidden border border-slate-700 bg-[#0f0f10] shadow-2xl group/code">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1d] border-b border-white/10">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{language}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                    {isRunnable && (
                        <button onClick={handleRun} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#D4F268] hover:bg-[#bef264] text-black rounded-lg text-xs font-black transition-colors">
                            <Play size={11} fill="currentColor" /> Run
                        </button>
                    )}
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors">
                        <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
            <pre className="p-5 text-sm font-mono text-[#e8e6e3] overflow-x-auto leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export function LoopyResponseRenderer({ content }: { content: string }) {
    if (!content) return null;

    return (
        <div className="text-white/95 text-[15px] leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // --- Block elements ---
                    h1: ({ children }) => <h1 className="text-xl font-black text-white mb-3 mt-6 pb-2 border-b border-white/10">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-black text-white mb-2 mt-5">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-black text-white/90 mb-2 mt-4">{children}</h3>,

                    p: ({ children }) => {
                        // Only do warning detection on flat text content (no nested elements)
                        const isWarning = typeof children === 'string' && (
                            children.toLowerCase().includes('watch out') ||
                            children.toLowerCase().includes('common mistake') ||
                            children.toLowerCase().includes('warning:') ||
                            children.toLowerCase().includes('caution:')
                        );

                        if (isWarning) {
                            return (
                                <div className="my-4 bg-amber-500/15 border border-amber-400/30 rounded-xl p-4 flex gap-3">
                                    <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                    <span className="text-amber-200 font-medium leading-relaxed">{children}</span>
                                </div>
                            );
                        }

                        return <p className="mb-3 last:mb-0 text-white/90 leading-relaxed">{children}</p>;
                    },

                    // --- Inline elements ---
                    strong: ({ children }) => (
                        <strong className="font-black text-[#D4F268]">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-white/70">{children}</em>
                    ),
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#D4F268] underline underline-offset-2 hover:text-white transition-colors">
                            {children}
                        </a>
                    ),

                    // --- Code ---
                    code: ({ className, children, ...props }: any) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="bg-white/10 text-[#D4F268] px-1.5 py-0.5 rounded font-mono text-[0.85em] font-bold border border-white/10">
                                    {children}
                                </code>
                            );
                        }
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : 'code';
                        const code = String(children).replace(/\n$/, '');
                        return <CodeBlock language={lang} code={code} />;
                    },

                    // --- Lists ---
                    ul: ({ children }) => {
                        const items = React.Children.toArray(children).filter(
                            (child) => React.isValidElement(child) && child.type === 'li'
                        );
                        const itemContents = items.map((item) => {
                            if (React.isValidElement(item)) {
                                return (item.props as any).children;
                            }
                            return item;
                        });
                        return <ExpandableList items={itemContents} />;
                    },
                    ol: ({ children }) => (
                        <ol className="space-y-3 my-4 counter-reset-[step]">
                            {React.Children.map(children, (child, i) => {
                                if (!React.isValidElement(child)) return null;
                                return (
                                    <li key={i} className="flex gap-3 items-start">
                                        <span className="shrink-0 w-6 h-6 rounded-full bg-[#D4F268] text-black text-xs font-black flex items-center justify-center mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-white/90 leading-relaxed font-medium">
                                            {(child.props as any).children}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    ),
                    li: ({ children }) => <>{children}</>,

                    // --- Blockquote ---
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#D4F268]/50 pl-4 my-4 text-white/60 italic">
                            {children}
                        </blockquote>
                    ),

                    // --- HR ---
                    hr: () => <hr className="border-white/10 my-6" />,
                }}
            />
        </div>
    );
}
