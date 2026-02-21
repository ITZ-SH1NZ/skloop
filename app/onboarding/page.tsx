"use client";

import { useEffect } from "react";
import { InfinityHero } from "@/components/onboarding/InfinityHero";
import { ProtocolOverview } from "@/components/onboarding/ProtocolOverview";
import { GlobalPulse } from "@/components/onboarding/GlobalPulse";
import { LoopyDuality } from "@/components/onboarding/LoopyDuality";
import { SkillTree } from "@/components/onboarding/SkillTree";
import { QuickSandbox } from "@/components/onboarding/QuickSandbox";
import { MasteryHall } from "@/components/onboarding/MasteryHall";
import { LenisProvider } from "@/components/providers/LenisProvider";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Sparkles, Trophy, ArrowRight, Zap, Target, MousePointer2 } from "lucide-react";

export default function OnboardingPage() {
    useEffect(() => {
        // Set cookie to indicate onboarding has been viewed
        document.cookie = "has_seen_onboarding=true; path=/; max-age=31536000"; // 1 year
    }, []);

    return (
        <LenisProvider>
            <main className="min-h-screen bg-[#FDFCF8] selection:bg-primary selection:text-zinc-900 overflow-x-hidden">
                {/* Fixed Technical Overlay (Floating UI elements for high-maintenance feel) */}
                <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden opacity-30">
                    <div className="absolute top-[20%] right-[2%] flex flex-col items-end gap-2 text-zinc-400 font-mono text-[8px] uppercase tracking-tighter">
                        <div>LATENCY: 1.2MS</div>
                        <div className="h-1 w-24 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-1/2 animate-pulse" />
                        </div>
                        <div>BUFFERING_PACKETS...</div>
                    </div>
                </div>

                {/* Global Navigation - Minimalist & Pro */}
                <nav className="fixed top-0 w-full z-[100] p-4 md:p-8 flex justify-between items-center pointer-events-none">
                    <Link href="/onboarding" className="pointer-events-auto">
                        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer bg-white/50 backdrop-blur-md px-3 md:px-5 py-2 md:py-3 rounded-2xl border border-zinc-100/50">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-900 rounded-lg md:rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-xl">
                                <span className="text-primary font-black text-lg md:text-xl italic">S</span>
                            </div>
                            <span className="text-lg md:text-xl font-black tracking-tighter text-zinc-900">SKLOOP</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-10 pointer-events-auto bg-white/50 backdrop-blur-md px-8 py-4 rounded-2xl border border-zinc-100/50">
                        <Link href="/manifesto" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors">
                            The Manifesto
                        </Link>
                        <div className="w-px h-4 bg-zinc-200" />
                        <Link href="/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-900 hover:opacity-70 transition-all">
                            INITIALIZE SYNC <ArrowRight size={14} />
                        </Link>
                    </div>
                </nav>

                {/* Section 1: Infinity Loop Entrance */}
                <InfinityHero />

                {/* Live System Ticker */}
                <GlobalPulse />

                {/* Section 2: Technical Protocol (Horizontal Overview) */}
                <ProtocolOverview />

                {/* Section 3: The AI Duality (Toggle Logic) */}
                <LoopyDuality />

                {/* Section 4: The Technical Skill Tree */}
                <SkillTree />

                {/* Section 5: The Interaction Sandbox */}
                <QuickSandbox />

                {/* Section 6: Local Peer Mastery Hall */}
                <MasteryHall />

                {/* Section 7: Interaction Callout (Legacy Refined) */}
                <section className="py-20 md:py-40 bg-[#D4F268]/5 border-y border-primary/10 relative overflow-hidden">
                    <div className="container mx-auto px-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <FeatureStat icon={<Target className="text-primary" />} label="Real Tracks" value="Verified Core" />
                            <FeatureStat icon={<Zap className="text-amber-500" />} label="AI Roadmap" value="Loopy Insight" />
                            <FeatureStat icon={<MousePointer2 className="text-blue-500" />} label="Active Implementation" value="Zero Filler" />
                        </div>
                    </div>
                    {/* Decorative Looping Grid */}
                    <div className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                            backgroundSize: "40px 40px"
                        }}
                    />
                </section>

                {/* Section 4: Final Final Call to Growth */}
                <section className="relative py-60 flex flex-col items-center justify-center text-center bg-zinc-900 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,242,104,0.3)_0%,_transparent_70%)]" />

                    <div className="relative z-10 max-w-5xl px-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-zinc-900 rounded-full font-black text-[11px] uppercase tracking-widest mb-16 shadow-glow-primary"
                        >
                            <Shield size={16} />
                            Mastery Protocol Authorized
                        </motion.div>

                        <h2 className="text-[clamp(4.5rem,10vw,12rem)] font-black tracking-tighter mb-16 leading-[0.75] group cursor-default">
                            CLOSE THE <br />
                            <span className="text-primary italic relative">
                                LOOP.
                                <motion.div
                                    className="absolute left-0 -bottom-4 h-3 bg-primary w-0 group-hover:w-full transition-all duration-500 ease-out"
                                    initial={false}
                                />
                            </span>
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 md:px-20 py-6 md:py-10 bg-white text-zinc-900 rounded-[2rem] md:rounded-[3rem] font-black text-xl md:text-3xl flex items-center gap-4 md:gap-6 shadow-2xl transition-all border-b-8 md:border-b-[16px] border-zinc-200 active:border-b-0"
                                >
                                    BEGIN PROTOCOL
                                    <ArrowRight size={24} className="md:w-9 md:h-9" />
                                </motion.button>
                            </Link>
                        </div>

                        <p className="mt-20 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">
                            End-to-End Encryption // Verifiable Skill Logic // 2026 Ready
                        </p>
                    </div>
                </section>

                {/* OS-like Footer */}
                <footer className="py-24 px-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-12 text-zinc-400 bg-white">
                    <div className="flex flex-col gap-6 items-center md:items-start text-center md:text-left">
                        <div className="text-3xl font-black tracking-tighter text-zinc-900 group cursor-pointer flex items-center gap-2">
                            <div className="w-6 h-6 bg-zinc-900 rounded-lg" />
                            SKLOOP
                        </div>
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60">System Synchronized V1.0.4</div>
                    </div>

                    <div className="flex gap-8 md:gap-16 text-[10px] font-black tracking-[0.3em] uppercase">
                        <Link href="/manifesto" className="hover:text-zinc-900 transition-colors">Manifesto</Link>
                        <a href="https://github.com/ITZ-SH1NZ/skloop" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">GitHub</a>
                        <Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-300">
                        &lt;© 2026/SKLOOP_DECENTRALIZED&gt;
                    </div>
                </footer>
            </main>
        </LenisProvider>
    );
}

function FeatureStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-zinc-100 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{label}</div>
            <div className="text-2xl font-black text-zinc-900">{value}</div>
        </div>
    );
}
