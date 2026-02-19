"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";


interface ArcadeShellProps {
    title: string;
    description?: string;
    children: ReactNode;
    headerContent?: ReactNode;
    accentColor?: string; // e.g. "text-cyan-400"
    backPath?: string;
}

export default function ArcadeShell({
    title,
    description,
    children,
    headerContent,
    accentColor = "text-[#D4F268]",
    backPath = "/practice"
}: ArcadeShellProps) {
    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden font-sans selection:bg-[#D4F268]/30">

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" /> {/* Noise texture if available, else subtle grain */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">

                {/* Header */}
                <header className="flex items-center justify-between mb-8 md:mb-12">
                    <div className="flex items-center gap-6">
                        <Link
                            href={backPath}
                            className="group flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 backdrop-blur-md"
                        >
                            <ArrowLeft size={20} className="text-white/70 group-hover:text-white transition-colors" />
                        </Link>
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-3xl md:text-5xl font-bold tracking-tight"
                            >
                                {title} <span className={accentColor}>.</span>
                            </motion.h1>
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-white/40 font-medium mt-1 text-sm md:text-base tracking-wide"
                                >
                                    {description}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:block">
                        {headerContent}
                    </div>
                </header>

                {/* Main Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex-1 relative"
                >
                    {/* Glass Container optional wrapper, or direct children depending on design */}
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
