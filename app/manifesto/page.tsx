"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Network, Zap, MousePointer2, Users, ArrowRight, Share2 } from "lucide-react";
import { InventorySection } from "@/components/onboarding/InventorySection";

export default function ManifestoPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <main ref={containerRef} className="bg-[#FDFCF8] text-zinc-900 selection:bg-primary selection:text-zinc-900 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[100] p-6 md:p-10 flex justify-between items-center mix-blend-difference invert">
                <Link href="/onboarding" className="text-xl md:text-2xl font-black tracking-tighter">
                    SKLOOP_META
                </Link>
                <div className="flex gap-6 md:gap-12 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">
                    <Link href="/onboarding">Exit_Docs</Link>
                    <Link href="/signup">Join_Loop</Link>
                </div>
            </nav>

            {/* Hero: Immersive Entrance */}
            <section className="h-screen flex flex-col items-center justify-center relative px-8 text-center bg-zinc-950 text-white">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,242,104,0.15)_0%,_transparent_70%)]" />
                    <div className="absolute inset-0 bg-dot-pattern opacity-20" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-4 px-6 py-2 border border-white/20 rounded-full mb-12 backdrop-blur-md">
                        <ShieldCheck size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Manifesto // Protocol 1.0</span>
                    </div>
                    <h1 className="text-[clamp(4rem,12vw,14rem)] font-black tracking-tighter leading-[0.75] mb-12">
                        THE FULL <br />
                        <span className="text-primary italic">CIRCLE.</span>
                    </h1>
                    <p className="text-2xl md:text-3xl text-zinc-400 font-medium max-w-4xl mx-auto leading-tight grayscale hover:grayscale-0 transition-all cursor-default">
                        We believe technical mastery is a closed loop. <br />
                        <span className="text-white italic">Input. Implementation. Iteration. Infinity.</span>
                    </p>
                </motion.div>

                {/* Technical Loop Graphic */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-20 flex flex-col items-center gap-4">
                    <div className="w-1 h-32 bg-gradient-to-b from-primary to-transparent" />
                    <div className="text-[9px] font-mono tracking-widest text-primary animate-pulse">SCROLL_FOR_INTEL</div>
                </div>
            </section>

            {/* Section 2: Interactive Schematic (The Core Logic) */}
            <section className="py-24 md:py-60 px-8 bg-white border-y border-zinc-100">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div>
                            <h2 className="text-[clamp(3.5rem,10vw,8rem)] font-black tracking-tighter mb-12 leading-none">
                                THE LOGIC <br />
                                <span className="text-zinc-400 italic">ARCHITECTURE.</span>
                            </h2>
                            <p className="text-2xl text-zinc-500 font-medium leading-relaxed mb-16">
                                Our platform is built on physical implementation. We don't just teach modules; we orchestrate professional transitions through a verified technical sequence.
                            </p>

                            <div className="space-y-12">
                                <ManifestoPillar
                                    icon={<Cpu />}
                                    title="Active Execution"
                                    desc="No passive consumption. Every lesson requires a verified technical commit through our built-in IDE/DSL environment."
                                />
                                <ManifestoPillar
                                    icon={<Network />}
                                    title="Peer Validation"
                                    desc="Your growth is verified by human mentors and technical peers, ensuring real-world standards at every level cap."
                                />
                            </div>
                        </div>

                        {/* The Interactive Schematic Mockup */}
                        <div className="relative aspect-square bg-zinc-900 rounded-[4rem] p-12 overflow-hidden shadow-3xl">
                            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-zinc-800 to-transparent opacity-50" />
                            <div className="relative z-10 flex flex-col h-full border-4 border-white/5 rounded-[3rem] p-8 gap-8">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                </div>
                                <div className="flex-1 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center flex-col gap-6">
                                    <Share2 size={64} className="text-primary opacity-20" />
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PROTOCOL_VISUALIZATION_READY</div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-1 bg-zinc-800 rounded-full" />)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-12 bg-white/5 rounded-2xl" />
                                    <div className="h-12 bg-primary/20 rounded-2xl border border-primary/20" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: The Full Bleed Vision Section */}
            <section className="py-80 bg-zinc-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-8 text-center relative z-10">
                    <motion.h2
                        whileInView={{ scale: [1, 1.05, 1], opacity: [0, 1] }}
                        className="text-7xl md:text-[15rem] font-black tracking-tighter leading-none mb-12"
                    >
                        ZERO <br />
                        <span className="text-primary italic">FILLER.</span>
                    </motion.h2>
                    <p className="text-2xl md:text-4xl text-zinc-400 font-black italic uppercase tracking-tighter max-w-4xl mx-auto">
                        "TECHNICAL MASTERY IS NOT A DESTINATION. <br />
                        IT IS A RIGOROUS, RECURSIVE SYSTEM."
                    </p>
                </div>
                {/* Background High Fidelity Lines */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-[120vw] h-1 bg-primary/50 -rotate-45" />
                    <div className="w-[120vw] h-1 bg-primary/50 rotate-45" />
                </div>
            </section>

            {/* Section 4: Inventory & Customization (New Gamified Aspect) */}
            <InventorySection />

            {/* Section 5: Peer Protocol Callout */}
            <section className="py-60 px-8 bg-[#FDFCF8]">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="aspect-video bg-white rounded-[3rem] border-8 border-zinc-900 shadow-2xl relative overflow-hidden p-8 flex flex-col justify-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                                        <Users className="text-zinc-400" />
                                    </div>
                                    <div className="h-4 w-40 bg-zinc-200 rounded-full" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-2 w-full bg-zinc-100 rounded-full" />
                                    <div className="h-2 w-5/6 bg-zinc-100 rounded-full" />
                                    <div className="h-2 w-3/4 bg-zinc-100 rounded-full" />
                                </div>
                                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest mt-8">
                                    PEER_SYNC_OK <Zap size={12} fill="currentColor" />
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 rotate-12">
                                <MousePointer2 size={32} className="text-zinc-900" />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                                COLLECTIVE <br />
                                <span className="text-zinc-400 italic">INTELLIGENCE.</span>
                            </h3>
                            <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-12">
                                Skloop is powered by its inhabitants. From decentralized code reviews to peer mentorship, you contribute value back to the protocol as you grow.
                            </p>
                            <ul className="space-y-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-900">
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary" /> Verified Peer Review</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary" /> Tokenized Knowledge Economy</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary" /> Global Leaderboard Systems</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Final Call */}
            <section className="py-32 md:py-60 px-8 bg-zinc-900 text-white text-center">
                <h2 className="text-[clamp(4rem,12vw,12rem)] font-black tracking-tighter leading-none mb-20 group cursor-default">
                    START THE <br />
                    <span className="text-primary italic relative">
                        PROTOCOL_
                        <motion.div
                            className="absolute left-0 -bottom-4 h-3 bg-primary w-0 group-hover:w-full transition-all duration-500 ease-out"
                            initial={false}
                        />
                    </span>
                </h2>
                <Link href="/signup">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 md:px-20 py-6 md:py-10 bg-white text-zinc-900 rounded-[2rem] md:rounded-[3rem] font-black text-xl md:text-3xl shadow-glow-primary hover:bg-primary transition-all flex items-center gap-4 md:gap-6 mx-auto"
                    >
                        JOIN INITIALIZATION <ArrowRight size={24} className="md:w-8 md:h-8" />
                    </motion.button>
                </Link>
            </section>

            <footer className="py-20 px-8 border-t border-white/5 bg-zinc-950 text-center">
                <div className="text-[10px] font-mono uppercase tracking-[0.5em] text-zinc-600">
                    OFFICIAL_MANIFESTO_V1.0.4_2026 // ALL_LOGIC_HANDLED
                </div>
            </footer>
        </main>
    );
}

function ManifestoPillar({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="group">
            <div className="flex items-center gap-6 mb-4">
                <div className="w-14 h-14 bg-zinc-900 text-primary rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110">
                    {icon}
                </div>
                <h4 className="text-3xl font-black tracking-tighter text-zinc-900">{title}</h4>
            </div>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed pl-20 border-l border-zinc-100">
                {desc}
            </p>
        </div>
    );
}
