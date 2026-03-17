"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Titan_One } from "next/font/google";
import dynamic from "next/dynamic";
import { useLoading } from "@/components/LoadingProvider";

const ParallaxBackground = dynamic(() => import("@/components/marketing/ParallaxBackground"), { ssr: false });

const titanOne = Titan_One({ weight: "400", subsets: ["latin"] });

export default function HomeHero() {
    const { isLoading } = useLoading();

    React.useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => window.scrollTo(0, 0), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center">
            {/* Interactive Mouse Parallax Background */}
            <ParallaxBackground />

            <div className="relative z-10 flex flex-col items-center px-4">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isLoading ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="inline-block px-4 py-1.5 md:px-6 md:py-2 rounded-xl bg-white text-black text-xs md:text-sm font-black uppercase tracking-widest shadow-lg border border-zinc-100 mb-6 md:mb-8"
                >
                    Ready to level up?
                </motion.div>

                <div className={`relative mb-6 ${titanOne.className}`}>
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={isLoading ? { y: 50, opacity: 0 } : { y: 0, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                        className="text-7xl sm:text-8xl md:text-[10rem] font-normal text-zinc-900 tracking-normal select-none relative z-10 uppercase drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
                        style={{
                            WebkitTextStroke: "2px white",
                            paintOrder: "stroke fill"
                        }}
                    >
                        SKLOOP
                    </motion.h1>
                    {/* Subtle Sticker Shadow Layer */}
                    <div className="absolute top-1 left-1 md:top-2 md:left-2 text-7xl sm:text-8xl md:text-[10rem] font-normal text-lime-400 tracking-normal select-none -z-10 blur-[1px] md:blur-[2px] opacity-30 uppercase">
                        SKLOOP
                    </div>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-zinc-700 font-bold tracking-wide text-lg sm:text-xl md:text-2xl max-w-xl mx-auto relative z-20 mb-8 md:mb-12 text-balance"
                >
                    The gamified platform for mastering Web Dev and DSA. Play games, follow tracks, and conquer code.
                </motion.p>

                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={isLoading ? { y: 30, opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 relative z-30 w-full sm:w-auto"
                >
                    <Link href="/signup" className="group w-full sm:w-auto">
                        <button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-lime-300 text-zinc-900 text-lg md:text-xl font-black flex items-center justify-center gap-3 border-4 border-white shadow-[0_8px_0_0_#A3E635,0_10px_20px_-5px_rgba(212,242,104,0.6)] md:shadow-[0_10px_0_0_#A3E635,0_20px_40px_-10px_rgba(212,242,104,0.6)] active:shadow-[0_0px_0_0_#A3E635] active:translate-y-[8px] hover:-translate-y-1 hover:shadow-[0_10px_0_0_#A3E635,0_15px_30px_-5px_rgba(212,242,104,0.8)] md:hover:shadow-[0_12px_0_0_#A3E635,0_30px_50px_-10px_rgba(212,242,104,0.8)] transition-all uppercase tracking-wider relative overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Press Start <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-shineMove" />
                        </button>
                    </Link>

                    <Link href="/manifesto" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-white text-zinc-900 border-4 border-zinc-200 text-base md:text-lg font-bold flex items-center justify-center gap-2 shadow-[0_6px_0_0_#e5e5e5] md:shadow-[0_8px_0_0_#e5e5e5] active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[6px] hover:-translate-y-1 transition-all">
                            Access Lore
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
