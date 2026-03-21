"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Sparkles, Flame, BrainCircuit, Gamepad2, ChevronRight, Swords } from "lucide-react";
import { LoopyHeader } from "@/components/loopy/LoopyHeader";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLoading } from "@/components/LoadingProvider";

const API_ENDPOINT = "/api/loopy";

type Mode = "select" | "helpful" | "story";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export default function LoopyPage() {
    const { isLoading: isGlobalLoading } = useLoading();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [mode, setMode] = useState<Mode>("select");
    const [selectedCard, setSelectedCard] = useState<"helpful" | "story" | null>(null);
    const [hoveredCard, setHoveredCard] = useState<"helpful" | "story" | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [xp, setXp] = useState(120);
    const [rank] = useState("Script Wizard");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Priority: hover > selected > null (center)
    const activeSide = hoveredCard ?? selectedCard;
    const mascotOffset = isDesktop ? 185 : 88;

    const isWarriorMode = activeSide === "story";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleModeSelect = (selectedMode: "helpful" | "story") => {
        setMode(selectedMode);
        setMessages([]);
        if (selectedMode === "helpful") {
            setMessages([{ role: "assistant", content: "Hi! I'm Loopy, your Helpful Coding Guide! 🦉 I'm here to help you think through problems. What's on your mind?" }]);
        } else {
            setMessages([{ role: "assistant", content: "🔥 **GLITCH KINGDOM ENTERED** 🔥\n\nA `NullPointer` Dragon blocks the gate! Its eyes glow with undefined values.\n\n**MISSION**: Cast a spell to define its existence! (Hint: What checks for nulls?)" }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, mode, history: messages.map(m => ({ role: m.role, content: m.content })) })
            });
            if (!response.ok) throw new Error("API call failed");
            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
            if (mode === "story" && data.xp_gain > 0) setXp(prev => prev + data.xp_gain);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to cast spell. (Connection Error)" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isGlobalLoading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="flex flex-col bg-[#FDFCF8] font-sans relative overflow-hidden h-[100dvh] selection:bg-[#D4F268] selection:text-black"
        >
            {/* Background */}
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

            <LoopyHeader mode={mode} setMode={setMode} rank={rank} xp={xp} />

            <main className={`flex-1 relative flex flex-col z-10 min-h-0
                ${mode === "select" ? "overflow-y-auto pt-24 pb-10 md:pt-0" : "pt-20 pb-2 md:pt-0 overflow-hidden"}
            `}>
                <AnimatePresence mode="wait">
                    {mode === "select" ? (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full min-h-full flex flex-col items-center justify-center px-4 py-6 md:p-12 gap-6"
                        >
                            {/* Heading */}
                            <div className="text-center">
                                <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">Meet Loopy</h2>
                                <p className="text-slate-400 text-sm md:text-base font-medium">Your AI coding companion — choose a mode to begin</p>
                            </div>

                            {/* Cards + Sliding Mascot */}
                            <div className="relative w-full max-w-3xl">

                                {/* Mascot Stage — sits above the cards */}
                                <div className="relative flex justify-center items-end h-36 md:h-52 mb-0">
                                    {/* Ground shadow */}
                                    <motion.div
                                        className="absolute bottom-0 rounded-full blur-xl h-5 w-24 md:w-36 opacity-60"
                                        animate={{
                                            background: isWarriorMode ? "rgba(251,146,60,0.35)" : "rgba(163,230,53,0.35)",
                                            x: activeSide === "helpful" ? -mascotOffset
                                                : activeSide === "story" ? mascotOffset
                                                : 0,
                                            scaleX: activeSide ? 1.1 : 1
                                        }}
                                        transition={{ type: "spring", stiffness: 280, damping: 28 }}
                                    />

                                    {/* The sliding mascot */}
                                    <motion.div
                                        animate={{
                                            x: activeSide === "helpful" ? -mascotOffset
                                                : activeSide === "story" ? mascotOffset
                                                : 0,
                                        }}
                                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                                        className="relative z-10"
                                    >
                                        {/* Ring pulse when selected */}
                                        <AnimatePresence>
                                            {selectedCard && !hoveredCard && (
                                                <motion.div
                                                    key={selectedCard}
                                                    initial={{ scale: 0.6, opacity: 0.8 }}
                                                    animate={{ scale: 1.6, opacity: 0 }}
                                                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                                                    className={`absolute inset-0 rounded-full ${selectedCard === "story" ? "bg-orange-400" : "bg-lime-400"}`}
                                                />
                                            )}
                                        </AnimatePresence>

                                        <LoopyMascot
                                            size={isDesktop ? 160 : 110}
                                            mood={isWarriorMode ? "warrior" : "happy"}
                                            hasCrown={isWarriorMode}
                                            hasSword={isWarriorMode}
                                        />
                                    </motion.div>
                                </div>

                                {/* Mode Cards */}
                                <div className="grid grid-cols-2 gap-3 md:gap-5">

                                    {/* Helpful Card */}
                                    <motion.button
                                        onClick={() => setSelectedCard("helpful")}
                                        onMouseEnter={() => setHoveredCard("helpful")}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        animate={{
                                            scale: selectedCard === "helpful" ? 1.025 : 1,
                                            y: selectedCard === "helpful" ? -4 : 0,
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className={`group relative bg-white p-4 md:p-7 rounded-[1.75rem] border-[3px] text-left transition-shadow overflow-hidden flex flex-col ${
                                            selectedCard === "helpful"
                                                ? "border-[#D4F268] shadow-[0_20px_40px_-10px_rgba(163,230,53,0.4)]"
                                                : "border-zinc-100 hover:border-[#D4F268]/60 hover:shadow-[0_8px_20px_-5px_rgba(163,230,53,0.2)]"
                                        }`}
                                    >
                                        {/* Selected checkmark */}
                                        <AnimatePresence>
                                            {selectedCard === "helpful" && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 500 }}
                                                    className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 bg-[#D4F268] rounded-full flex items-center justify-center shadow-sm"
                                                >
                                                    <svg viewBox="0 0 12 10" className="w-3 h-3">
                                                        <polyline points="1,5 4,9 11,1" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Icon */}
                                        <div className={`w-10 h-10 md:w-13 md:h-13 rounded-2xl bg-lime-50 border border-lime-100 text-lime-600 flex items-center justify-center mb-3 md:mb-5 transition-transform duration-300 ${selectedCard === "helpful" ? "scale-110" : "group-hover:scale-110"}`}>
                                            <BrainCircuit className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                                        </div>

                                        <h3 className="text-sm md:text-xl font-black text-slate-900 mb-1">Helpful Guide</h3>
                                        <p className="text-slate-400 text-[11px] md:text-sm font-medium leading-relaxed mb-3 md:mb-5">
                                            Socratic coaching.<br className="hidden md:block" /> Learn by thinking.
                                        </p>

                                        <div className="flex flex-wrap gap-1.5">
                                            {["Debug", "Concepts", "Review"].map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-lime-50 text-lime-700 rounded-lg text-[10px] md:text-xs font-bold border border-lime-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.button>

                                    {/* Story Card */}
                                    <motion.button
                                        onClick={() => setSelectedCard("story")}
                                        onMouseEnter={() => setHoveredCard("story")}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        animate={{
                                            scale: selectedCard === "story" ? 1.025 : 1,
                                            y: selectedCard === "story" ? -4 : 0,
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className={`group relative bg-white p-4 md:p-7 rounded-[1.75rem] border-[3px] text-left transition-shadow overflow-hidden flex flex-col ${
                                            selectedCard === "story"
                                                ? "border-amber-400 shadow-[0_20px_40px_-10px_rgba(251,146,60,0.45)]"
                                                : "border-zinc-100 hover:border-amber-300/60 hover:shadow-[0_8px_20px_-5px_rgba(251,146,60,0.2)]"
                                        }`}
                                    >
                                        <AnimatePresence>
                                            {selectedCard === "story" && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 500 }}
                                                    className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm"
                                                >
                                                    <svg viewBox="0 0 12 10" className="w-3 h-3">
                                                        <polyline points="1,5 4,9 11,1" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className={`w-10 h-10 md:w-13 md:h-13 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mb-3 md:mb-5 transition-transform duration-300 ${selectedCard === "story" ? "scale-110" : "group-hover:scale-110"}`}>
                                            <Gamepad2 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                                        </div>

                                        <h3 className="text-sm md:text-xl font-black text-slate-900 mb-1">Story Mode</h3>
                                        <p className="text-slate-400 text-[11px] md:text-sm font-medium leading-relaxed mb-3 md:mb-5">
                                            RPG adventure.<br className="hidden md:block" /> Earn XP and glory.
                                        </p>

                                        <div className="flex flex-wrap gap-1.5">
                                            {["XP & Ranks", "Quests", "Glory"].map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] md:text-xs font-bold border border-amber-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.button>
                                </div>

                                {/* CTA — reveals after selecting a card */}
                                <AnimatePresence>
                                    {selectedCard && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            className="mt-5 flex justify-center"
                                        >
                                            <button
                                                onClick={() => handleModeSelect(selectedCard)}
                                                className={`group flex items-center gap-2.5 px-7 py-3.5 md:px-10 md:py-4 rounded-2xl font-black text-[#1A1A1A] text-sm md:text-base transition-all hover:-translate-y-1 active:translate-y-0 ${
                                                    selectedCard === "story"
                                                        ? "bg-amber-400 shadow-[0_6px_0_0_#d97706] hover:shadow-[0_8px_0_0_#d97706] active:shadow-none"
                                                        : "bg-[#D4F268] shadow-[0_6px_0_0_#a3e635] hover:shadow-[0_8px_0_0_#a3e635] active:shadow-none"
                                                }`}
                                            >
                                                {selectedCard === "story" ? (
                                                    <>
                                                        Enter the Glitch Kingdom
                                                        <Swords className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Start Chatting
                                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-4 overflow-hidden"
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
                                                <LoopyMascot
                                                    size={48}
                                                    mood={mode === "story" ? "warrior" : "happy"}
                                                    hasCrown={mode === "story"}
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
                                            <LoopyMascot size={48} mood="thinking" />
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
        </motion.div>
    );
}
