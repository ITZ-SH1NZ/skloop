"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Sparkles } from "lucide-react";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { LoopyResponseRenderer } from "@/components/loopy/LoopyResponseRenderer";


type Message = {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    mood?: string;
};

export default function LoopyChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: rawId } = React.use(params);
    // Use a ref for the actual chat ID so we can swap it from 'new' → real ID mid-session
    const [chatId, setChatId] = useState(rawId);
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial load from local storage
    useEffect(() => {
        if (chatId !== "new") {
            try {
                const saved = localStorage.getItem(`loopy_chat_${chatId}`);
                if (saved) setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load chat", e);
            }
        }
    }, [chatId]);

    // Save to local storage on message changes and update sidebar title
    useEffect(() => {
        if (chatId === "new" || messages.length === 0) return;
        
        try {
            localStorage.setItem(`loopy_chat_${chatId}`, JSON.stringify(messages));
            
            // Generate title from first user message
            const firstUserMsg = messages.find(m => m.role === "user");
            if (firstUserMsg) {
                let title = firstUserMsg.content.slice(0, 22).replace(/\n/g, ' ').trim();
                title += firstUserMsg.content.length > 22 ? "..." : "";
                
                const savedList = localStorage.getItem("loopy_chats_list");
                let chatList = savedList ? JSON.parse(savedList) : [];
                
                const existingIndex = chatList.findIndex((c: any) => c.id === chatId);
                if (existingIndex !== -1) {
                    if (chatList[existingIndex].title === "Untitled Chat") {
                        chatList[existingIndex].title = title;
                        localStorage.setItem("loopy_chats_list", JSON.stringify(chatList));
                        window.dispatchEvent(new Event("loopy_chats_updated"));
                    }
                } else {
                    chatList = [{ id: chatId, title }, ...chatList];
                    localStorage.setItem("loopy_chats_list", JSON.stringify(chatList));
                    window.dispatchEvent(new Event("loopy_chats_updated"));
                }
            }
        } catch (e) {
            console.error("Failed to save chat or update list", e);
        }
    }, [messages, chatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        // If this is a brand-new chat (URL is /chat/new), generate a real ID and
        // update the URL + sidebar BEFORE sending so the chat gets persisted properly.
        let activeChatId = chatId;
        if (chatId === "new") {
            const newId = Date.now().toString();
            activeChatId = newId;
            setChatId(newId);
            // Register in sidebar immediately
            try {
                const title = input.slice(0, 22).replace(/\n/g, ' ').trim() + (input.length > 22 ? "..." : "");
                const savedList = localStorage.getItem("loopy_chats_list");
                const chatList = savedList ? JSON.parse(savedList) : [];
                const updated = [{ id: newId, title }, ...chatList];
                localStorage.setItem("loopy_chats_list", JSON.stringify(updated));
                window.dispatchEvent(new Event("loopy_chats_updated"));
            } catch (e) {}
            // Update URL silently without triggering a Next.js navigation/remount
            window.history.replaceState(null, '', `/loopy/chat/${activeChatId}`);
        }
        
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Using the new dedicated endpoint
            const res = await fetch("/api/loopy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: input, 
                    history: messages.map(m => ({ role: m.role, content: m.content })) 
                })
            });
            
            if (!res.ok) throw new Error("API failed");
            const data = await res.json();
            
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.content || "Oops, I encountered a glitch in the syntax!",
                mood: data.mood || "thinking"
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "**Error**: Unable to cast spell (API Connection Failed). Please check your Groq API key and network.",
                mood: "screaming"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const isNew = messages.length === 0;

    return (
        <div className="flex flex-col h-full w-full relative z-10 selection:bg-[#D4F268] selection:text-black min-h-0">
            
            {/* Header: Skloop Theme (Creamy White & Lime) */}
            <header className="h-16 shrink-0 flex items-center px-8 border-b-2 border-slate-200 bg-[#FAFAF8]/80 backdrop-blur-2xl sticky top-0 z-20 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D4F268] flex items-center justify-center text-[#050505] shadow-[0_4px_10px_rgba(212,242,104,0.4)] border-2 border-[#b5db3b]">
                        <Terminal size={18} strokeWidth={3} />
                    </div>
                    <h1 className="text-[#050505] font-black tracking-wide text-md">
                        {isNew ? 'New Session' : 'Active Conversation'}
                    </h1>
                </div>
            </header>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 md:py-12 space-y-12 no-scrollbar bg-[#FAFAF8]">
                
                {isNew && !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 bg-[#D4F268] rounded-full flex items-center justify-center mb-6 border-4 border-[#b5db3b] shadow-[0_10px_20px_rgba(212,242,104,0.3)]"
                        >
                            <Sparkles size={40} className="text-[#050505]" strokeWidth={2.5} />
                        </motion.div>
                        <h2 className="text-3xl font-black text-[#050505] mb-3">Initialize Guide</h2>
                        <p className="text-slate-500 font-medium max-w-sm text-base">Ask Loopy a question, debug an error, or request architectural advice.</p>
                    </div>
                )}

                <div className="max-w-3xl mx-auto space-y-10">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                className={`flex gap-4 md:gap-6 font-sans ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                {/* Chunky Avatar */}
                                <div className="shrink-0 mt-1">
                                    {msg.role === "assistant" ? (
                                        <div className="w-12 h-12 rounded-2xl bg-[#050505] flex items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.2)] border-2 border-slate-800 relative overflow-hidden">
                                            <div className="scale-75 origin-center transform translate-y-3">
                                                <LoopyMascot size={55} mood={(msg.mood as any) || "happy"} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-[#D4F268] text-black flex items-center justify-center font-black tracking-tighter shadow-[0_4px_0_#b5db3b] border-2 border-[#b5db3b]">
                                            YOU
                                        </div>
                                    )}
                                </div>

                                {/* Content Bubble */}
                                <div className={`flex flex-col min-w-0 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start w-full"}`}>
                                    <div className={`
                                        text-[16px] py-4 px-6 rounded-3xl border-2
                                        ${msg.role === "user" 
                                            ? "bg-white text-[#050505] rounded-tr-sm border-slate-200 shadow-[0_4px_0_rgba(226,232,240,1)] font-bold leading-relaxed" 
                                            : "bg-[#050505] text-[#FAFAF8] rounded-tl-sm border-[#050505] w-full shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
                                        }
                                    `}>
                                        {msg.role === "assistant" ? (
                                            <LoopyResponseRenderer content={msg.content} />
                                        ) : (
                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 md:gap-6">
                            <div className="shrink-0 mt-1">
                                <div className="w-12 h-12 rounded-2xl bg-[#050505] flex items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.2)] border-2 border-slate-800 relative overflow-hidden">
                                     <div className="scale-75 origin-center transform translate-y-3 text-white opacity-50">
                                         <LoopyMascot size={55} mood="thinking" />
                                     </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-5 bg-[#050505] rounded-3xl rounded-tl-sm border-2 border-[#050505]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#D4F268] animate-bounce shadow-[0_0_10px_#D4F268]" style={{ animationDelay: "0ms" }} />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#D4F268] animate-bounce shadow-[0_0_10px_#D4F268]" style={{ animationDelay: "150ms" }} />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#D4F268]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="px-4 pb-8 pt-4 md:px-8 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8] to-transparent shrink-0">
                <div className="max-w-3xl mx-auto relative group">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative flex flex-col bg-white border-4 border-slate-200 rounded-[2.2rem] shadow-[0_8px_0_rgba(226,232,240,1)] focus-within:border-[#D4F268] focus-within:shadow-[0_8px_0_#b5db3b] transition-all"
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask Loopy to debug a component or explain a concept..."
                            className="w-full bg-transparent text-[#050505] placeholder:text-slate-400 font-bold px-6 py-5 outline-none resize-none min-h-[64px] max-h-[250px] text-[16px] leading-relaxed no-scrollbar rounded-[2.2rem]"
                            rows={1}
                        />
                        
                        <div className="flex justify-between items-center px-4 pb-3">
                            <div className="flex gap-2 text-slate-400 font-bold text-xs px-2 mt-2 uppercase tracking-wide">
                                Shift + Enter for new line
                            </div>
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={`
                                    w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:translate-y-1 shadow-sm
                                    ${input.trim() && !isLoading 
                                        ? "bg-[#D4F268] text-[#050505] border-b-4 border-r-2 border-t-2 border-l-2 border-[#b5db3b] hover:bg-[#bef264]" 
                                        : "bg-slate-100 text-slate-300 border-2 border-slate-200 cursor-not-allowed"}
                                `}
                            >
                                <Send size={20} strokeWidth={3} className={input.trim() && !isLoading ? "-translate-y-[1px] translate-x-[1px]" : ""} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
