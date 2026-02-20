"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface TrackHeroProps {
    title: string;
    description: string;
    progress: number;
}

export default function TrackHero({ title, description, progress }: TrackHeroProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Transform values based on scroll
    const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroBlur = useTransform(scrollY, [0, 300], ["0px", "10px"]);

    // Sticky header appearance
    const stickyHeaderOpacity = useTransform(scrollY, [250, 400], [0, 1]);
    const stickyHeaderY = useTransform(scrollY, [250, 400], [-20, 0]);

    return (
        <>
            {/* Main Fluid Hero */}
            <motion.div
                ref={ref}
                style={{ scale: heroScale, opacity: heroOpacity, filter: `blur(${heroBlur})` }}
                className="relative min-h-[60vh] flex flex-col justify-end p-6 md:p-12 z-0 origin-bottom"
            >
                <Link href="/dashboard" className="absolute top-8 left-6 md:left-12 inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors z-20">
                    <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-zinc-200 flex items-center justify-center hover:bg-white transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-bold text-sm hidden md:inline-block">Dashboard</span>
                </Link>

                {/* Giant Typography Background (Parallax) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.03]">
                    <h1 className="text-[20vw] font-black leading-none tracking-tighter text-zinc-900 absolute -bottom-10 left-0 whitespace-nowrap">
                        WEB DEV
                    </h1>
                </div>

                <div className="relative z-10 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-block px-3 py-1 rounded-full border border-lime-400/50 bg-lime-100/50 text-lime-700 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                            Career Track
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.9] mb-8 text-balance">
                            {title}
                        </h1>
                        <p className="text-lg md:text-2xl text-zinc-500 font-medium max-w-2xl leading-relaxed text-balance">
                            {description}
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Sticky Minimal Header */}
            <motion.div
                style={{ opacity: stickyHeaderOpacity, y: stickyHeaderY }}
                className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 z-50 flex items-center justify-between px-6 md:px-12 pointer-events-none"
            >
                <div className="font-bold text-lg text-zinc-900 truncate max-w-[50%] pointer-events-auto">
                    {title}
                </div>
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden md:block">Progress</div>
                    <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-lime-500"
                        />
                    </div>
                </div>
            </motion.div>
        </>
    );
}
