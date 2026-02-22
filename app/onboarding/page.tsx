"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import FeatureLevels from "@/components/marketing/FeatureLevels";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import ExpandedSections from "@/components/marketing/ExpandedSections";
import ParallaxBackground from "@/components/marketing/ParallaxBackground";
import { MasterScrollProvider } from "@/components/providers/MasterScrollProvider";

export default function OnboardingPage() {
    useEffect(() => {
        // Force scroll to top on mount/reload to ensure user starts at Hero
        window.scrollTo(0, 0);

        // Some browsers try to be smart and restore scroll after a delay
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <MasterScrollProvider>
            <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#D4F268] selection:text-black font-sans relative overflow-x-hidden">

                {/* GLOBAL BACKGROUND: 3D Grid Floor (from AuthVisuals) */}
                <div className="fixed inset-0 pointer-events-none z-0 perspective-[1000px]">
                    <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-60"
                        style={{ transform: "rotateX(60deg) scale(2) translateY(-10%)" }}
                    />
                </div>

                <MarketingNavbar />

                <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">

                    {/* HERO SECTION: "The Start Screen" */}
                    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center">

                        {/* Interactive Mouse Parallax Background */}
                        <ParallaxBackground />

                        <div className="relative z-10 flex flex-col items-center px-4">
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                className="inline-block px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-white text-black text-xs md:text-sm font-black uppercase tracking-widest shadow-lg border border-zinc-100 mb-6 md:mb-8"
                            >
                                Ready to level up?
                            </motion.div>

                            <div className="relative mb-6">
                                <motion.h1
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                                    className="text-6xl sm:text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 tracking-tighter select-none pb-2 leading-tight"
                                >
                                    SKLOOP
                                </motion.h1>
                                {/* Shadow Layer for Depth */}
                                <h1 className="absolute top-1 left-1 md:top-2 md:left-2 text-6xl sm:text-7xl md:text-9xl font-black text-lime-400 tracking-tighter select-none -z-10 blur-[1px] md:blur-[2px] opacity-40 leading-tight">
                                    SKLOOP
                                </h1>
                                <h1 className="absolute top-0.5 left-0.5 md:top-1 md:left-1 text-6xl sm:text-7xl md:text-9xl font-black text-zinc-100/50 tracking-tighter select-none -z-10 leading-tight">
                                    SKLOOP
                                </h1>
                            </div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-zinc-700 font-bold tracking-wide text-lg sm:text-xl md:text-2xl max-w-xl mx-auto relative z-20 mb-8 md:mb-12 text-balance"
                            >
                                The gamified platform for mastering Web Dev and DSA. Play games, follow tracks, and conquer code.
                            </motion.p>

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.8 }}
                                className="flex flex-col sm:flex-row gap-4 md:gap-6 relative z-30 w-full sm:w-auto"
                            >
                                <Link href="/signup" className="group w-full sm:w-auto">
                                    <button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-full bg-lime-300 text-zinc-900 text-lg md:text-xl font-black flex items-center justify-center gap-3 border-4 border-white shadow-[0_8px_0_0_#A3E635,0_10px_20px_-5px_rgba(212,242,104,0.6)] md:shadow-[0_10px_0_0_#A3E635,0_20px_40px_-10px_rgba(212,242,104,0.6)] active:shadow-[0_0px_0_0_#A3E635] active:translate-y-[8px] hover:-translate-y-1 hover:shadow-[0_10px_0_0_#A3E635,0_15px_30px_-5px_rgba(212,242,104,0.8)] md:hover:shadow-[0_12px_0_0_#A3E635,0_30px_50px_-10px_rgba(212,242,104,0.8)] transition-all uppercase tracking-wider relative overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Press Start <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-shineMove" />
                                    </button>
                                </Link>

                                <Link href="/manifesto" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-full bg-white text-zinc-900 border-4 border-zinc-200 text-base md:text-lg font-bold flex items-center justify-center gap-2 shadow-[0_6px_0_0_#e5e5e5] md:shadow-[0_8px_0_0_#e5e5e5] active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[6px] hover:-translate-y-1 transition-all">
                                        Read Manifesto
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </section>

                    {/* THE MAP / FEATURE LEVELS */}
                    <FeatureLevels />

                    {/* EXPANDED CONTENT (Character Select, Leaderboard, Final Boss) */}
                    <ExpandedSections />

                </main>
                <MarketingFooter />
            </div>
        </MasterScrollProvider>
    );
}
