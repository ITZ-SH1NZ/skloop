"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoopyMascot, LoopyMood } from "@/components/loopy/LoopyMascot";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface DSALoopyPanelProps {
    algorithmTitle: string;
    category: string;
    timeComplexity: string;
    description: string;
}

function renderContent(text: string) {
    // Split on triple-backtick code blocks first
    const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match;

    while ((match = codeBlockRe.exec(text)) !== null) {
        if (match.index > lastIdx) {
            parts.push(<span key={lastIdx}>{inlineCode(text.slice(lastIdx, match.index))}</span>);
        }
        parts.push(
            <pre key={match.index} className="mt-2 mb-1 bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                {match[1] && <span className="text-zinc-500 text-[10px] block mb-1">{match[1]}</span>}
                {match[2]}
            </pre>
        );
        lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) parts.push(<span key={lastIdx}>{inlineCode(text.slice(lastIdx))}</span>);
    return parts;
}

function inlineCode(text: string) {
    return text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") && part.endsWith("`")
            ? <code key={i} className="bg-zinc-200 text-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>
            : <span key={i}>{part}</span>
    );
}

function MessageBubble({ msg, isLast }: { msg: Message; isLast: boolean }) {
    const isUser = msg.role === "user";
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-2.5 items-end", isUser && "flex-row-reverse")}
        >
            {!isUser && (
                <div className="shrink-0 w-9 h-9">
                    <LoopyMascot size={36} mood={isLast ? "thinking" : "happy"} isStatic={!isLast} />
                </div>
            )}
            <div className={cn(
                "max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                isUser
                    ? "bg-zinc-900 text-white rounded-br-sm"
                    : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
            )}>
                {renderContent(msg.content)}
            </div>
        </motion.div>
    );
}

export function DSALoopyPanel({ algorithmTitle, category, timeComplexity, description }: DSALoopyPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Hey! I'm your ${algorithmTitle} tutor. Ask me anything about this algorithm — how it works, edge cases, complexity, or specific code questions!`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loopyMood, setLoopyMood] = useState<LoopyMood>("happy");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        const userMsg: Message = { role: "user", content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        setLoopyMood("thinking");

        try {
            const res = await fetch("/api/dsa-loopy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ algorithmTitle, category, timeComplexity, description, messages: newMessages }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Hmm, try again!" }]);
            setLoopyMood("happy");
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Couldn't reach me right now. Try again!" }]);
            setLoopyMood("annoyed");
            setTimeout(() => setLoopyMood("happy"), 2000);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 shrink-0">
                    <LoopyMascot size={40} mood={loopyMood} isStatic={loopyMood === "happy"} />
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-900">Loopy AI</p>
                    <p className="text-xs text-zinc-400">{algorithmTitle} · Ask me anything</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} isLast={i === messages.length - 1 && msg.role === "assistant"} />
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 items-end">
                        <div className="w-9 h-9 shrink-0">
                            <LoopyMascot size={36} mood="thinking" />
                        </div>
                        <div className="bg-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-100 shrink-0">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex gap-2 items-center bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask about ${algorithmTitle}...`}
                        className="flex-1 bg-transparent text-sm outline-none text-zinc-900 placeholder:text-zinc-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-7 h-7 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
                    >
                        <Send className="w-3.5 h-3.5 text-black" />
                    </button>
                </form>
                <p className="text-center text-[10px] text-zinc-300 mt-1.5">Only answers {algorithmTitle} questions</p>
            </div>
        </div>
    );
}
