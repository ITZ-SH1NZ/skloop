"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Send, Terminal, Gamepad2, BrainCircuit, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LoopyHeader } from "@/components/loopy/LoopyHeader";

// API Route handles Python integration
// API Route handles Python integration (Vercel Function)
const API_ENDPOINT = "/api/loopy";

type Mode = "select" | "helpful" | "story";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export default function LoopyPage() {
    const [mode, setMode] = useState<Mode>("select");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [xp, setXp] = useState(120);
    const [rank, setRank] = useState("Script Wizard");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleModeSelect = (selectedMode: "helpful" | "story") => {
        setMode(selectedMode);
        setMessages([]);

        if (selectedMode === "helpful") {
            setMessages([
                { role: "assistant", content: "Hi! I'm Loopy, your Helpful Coding Guide! 🦉 I'm here to help you think through problems. What's on your mind?" }
            ]);
        } else {
            setMessages([
                { role: "assistant", content: "🔥 **GLITCH KINGDOM ENTERED** 🔥\n\nA `NullPointer` Dragon blocks the gate! Its eyes glow with undefined values.\n\n**MISSION**: Cast a spell to define its existence! (Hint: What checks for nulls?)" }
            ]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Call Python-backed API
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    mode: mode,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!response.ok) throw new Error("API call failed");

            const data = await response.json();

            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);

            if (mode === "story" && data.xp_gain > 0) {
                setXp(prev => prev + data.xp_gain);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to cast spell. (Connection Error)" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#FDFCF8] font-sans relative overflow-hidden selection:bg-[#D4F268] selection:text-black">

            {/* Background Texture & Blobs */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 pointer-events-none" />
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#E4E4E7 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

            <motion.div
                animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-lime-200/40 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-amber-200/40 rounded-full blur-[100px] pointer-events-none"
            />

            {/* Sticky Header */}
            <LoopyHeader mode={mode} setMode={setMode} rank={rank} xp={xp} />

            {/* Content Area - Adjusted padding: pt-24 only on mobile select mode, pb-4 for chat mode to keep input low */}
            <main className={`flex-1 relative flex flex-col z-10 
                ${mode === "select" ? "pt-24 pb-24 md:pt-0 overflow-y-auto" : "pt-20 pb-2 md:pt-0 overflow-hidden"}
            `}>
                <AnimatePresence mode="wait">
                    {mode === "select" ? (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full min-h-full flex flex-col items-center justify-center p-6 md:p-12 gap-8"
                        >
                            <div className="text-center max-w-lg mb-4 relative">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="inline-block mb-6 relative"
                                >
                                    {/* Mascot - Scaled down for mobile */}
                                    <div className="absolute inset-0 bg-lime-400/40 blur-[40px] rounded-full" />
                                    <div className="w-24 h-24 md:w-48 md:h-48 relative z-10 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] mx-auto">
                                        <Image
                                            src="/loopy.webp"
                                            alt="Loopy Mascot"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </motion.div>
                                <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 md:mb-3 tracking-tight">I'm Loopy!</h2>
                                <p className="text-slate-500 text-xs md:text-lg font-medium leading-relaxed max-w-sm mx-auto">
                                    Your coding companion. Choose your path!
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-3xl">
                                {/* CARD 1: HELPFUL (LIME THEME) */}
                                {/* CARD 1: HELPFUL (LIME THEME) */}
                                <button
                                    onClick={() => handleModeSelect("helpful")}
                                    className="group relative bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-[3px] border-zinc-100 hover:border-[#D4F268] text-left transition-all hover:shadow-[0_20px_40px_-10px_rgba(212,242,104,0.3)] hover:-translate-y-2 overflow-hidden h-full flex flex-col justify-between"
                                >
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-3xl bg-lime-50 text-lime-600 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-lime-100">
                                            <BrainCircuit className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-base md:text-2xl font-black text-slate-900 mb-1 md:mb-2">Helpful Guide</h3>
                                        <p className="text-slate-500 text-[10px] md:text-base font-medium leading-relaxed">
                                            Clear, Socratic debugging. <br className="hidden md:block" /> "Fresh Lime" Mode.
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-8">
                                        <span className="inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-[#D4F268] text-[#1A1A1A] font-bold rounded-xl md:rounded-2xl shadow-[0_4px_0_0_#a3e635] text-[10px] md:text-sm group-hover:bg-[#bef264] transition-all w-full md:w-auto">
                                            Start Chatting
                                        </span>
                                    </div>
                                </button>

                                {/* CARD 2: STORY MODE (AMBER THEME) */}
                                {/* CARD 2: STORY MODE (AMBER THEME) */}
                                <button
                                    onClick={() => handleModeSelect("story")}
                                    className="group relative bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-[3px] border-zinc-100 hover:border-amber-300 text-left transition-all hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] hover:-translate-y-2 overflow-hidden h-full flex flex-col justify-between"
                                >
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-amber-100 group-hover:rotate-3">
                                            <Gamepad2 className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-base md:text-2xl font-black text-slate-900 mb-1 md:mb-2">Story Mode</h3>
                                        <p className="text-slate-500 text-[10px] md:text-base font-medium leading-relaxed">
                                            Epic RPG Adventure. <br className="hidden md:block" /> "Golden Glitch" Mode.
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-8">
                                        <span className="inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-amber-400 text-[#1A1A1A] font-bold rounded-xl md:rounded-2xl shadow-[0_4px_0_0_#d97706] text-[10px] md:text-sm group-hover:bg-amber-300 transition-all w-full md:w-auto">
                                            Play Now
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full px-4"
                        >
                            {/* Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-6 space-y-8 scroll-smooth no-scrollbar">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ type: "spring", bounce: 0.4 }}
                                        className={`flex gap-4 items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="w-12 h-12 shrink-0 relative -bottom-4 filter drop-shadow-md hover:scale-110 transition-transform cursor-pointer z-10">
                                                <Image
                                                    src="/loopy.webp"
                                                    alt="Loopy"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}

                                        <div className={`
                                            max-w-[85%] md:max-w-[70%] p-5 text-sm md:text-base font-medium leading-relaxed relative
                                            ${msg.role === "user"
                                                ? mode === "story"
                                                    ? "bg-amber-400 text-slate-900 shadow-[0_4px_10px_-2px_rgba(245,158,11,0.4)] rounded-[2rem] rounded-br-[4px]"
                                                    : "bg-[#D4F268] text-slate-900 shadow-[0_4px_10px_-2px_rgba(212,242,104,0.5)] rounded-[2rem] rounded-br-[4px]"
                                                : "bg-white text-slate-700 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] rounded-[2rem] rounded-bl-[4px] border border-zinc-100"
                                            }
                                        `}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 items-end justify-start">
                                        <div className="w-12 h-12 shrink-0 relative filter drop-shadow-md">
                                            <Image src="/loopy.webp" alt="Loopy" fill className="object-contain animate-bounce" />
                                        </div>
                                        <div className="bg-white px-5 py-4 rounded-[2rem] rounded-bl-[4px] shadow-sm border border-zinc-100 flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full animate-bounce ${mode === 'story' ? 'bg-amber-400' : 'bg-[#D4F268]'}`} style={{ animationDelay: "0ms" }} />
                                            <span className={`w-2.5 h-2.5 rounded-full animate-bounce ${mode === 'story' ? 'bg-amber-400' : 'bg-[#D4F268]'}`} style={{ animationDelay: "150ms" }} />
                                            <span className={`w-2.5 h-2.5 rounded-full animate-bounce ${mode === 'story' ? 'bg-amber-400' : 'bg-[#D4F268]'}`} style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="py-6 relative z-20">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="relative flex items-center gap-3"
                                >
                                    <div className="flex-1 relative group">
                                        <div className={`absolute inset-0 rounded-3xl blur-xl transition-colors opacity-0 group-hover:opacity-100 ${mode === 'story' ? 'bg-amber-200/40' : 'bg-lime-200/40'}`} />
                                        <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${mode === 'story' ? 'text-amber-500' : 'text-lime-600'}`}>
                                            {mode === "story" ? <Terminal size={20} /> : <Sparkles size={20} />}
                                        </div>
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={mode === "story" ? "Cast spell (e.g. 'try-catch')..." : "Ask Loopy a question..."}
                                            className={`
                                                w-full pl-14 pr-6 py-5 bg-white border-2 rounded-[2rem] outline-none text-slate-800 placeholder:text-zinc-400 font-bold shadow-[0_8px_0_0_#f4f4f5] transition-all relative z-10
                                                ${mode === 'story' ? 'border-zinc-100 focus:border-amber-400 focus:shadow-[0_8px_0_0_#fcd34d]' : 'border-zinc-100 focus:border-[#D4F268] focus:shadow-[0_8px_0_0_#d9f99d]'}
                                            `}
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className={`
                                            h-[68px] w-[68px] rounded-[2rem] flex items-center justify-center text-[#1A1A1A] hover:translate-y-[2px] active:shadow-none active:translate-y-[8px] transition-all disabled:opacity-50 disabled:cursor-not-allowed group
                                            ${mode === 'story'
                                                ? 'bg-amber-400 shadow-[0_8px_0_0_#d97706] hover:shadow-[0_6px_0_0_#d97706]'
                                                : 'bg-[#D4F268] shadow-[0_8px_0_0_#a3e635] hover:shadow-[0_6px_0_0_#a3e635]'}
                                        `}
                                    >
                                        {mode === 'story' ? <Flame size={24} className="group-hover:scale-110 transition-transform fill-black/20" /> : <Send size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
