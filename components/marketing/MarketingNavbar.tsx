"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ArrowRight, Gamepad2, Infinity } from "lucide-react";

export default function MarketingNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    // DOCKING TRANSITIONS (Top of page -> Floating Pill)
    // 0 to 100px scroll range
    const navWidth = useTransform(scrollY, [0, 80], ["100%", "90%"]);
    const navTop = useTransform(scrollY, [0, 80], ["0px", "24px"]);
    const navRadius = useTransform(scrollY, [0, 80], ["0px", "9999px"]);
    const navBorder = useTransform(scrollY, [0, 80], ["0px", "4px"]);
    const navShadow = useTransform(scrollY, [0, 80], ["0px 0px 0 0 #000", "0px 8px 0 0 #000"]);
    const navPadding = useTransform(scrollY, [0, 80], ["16px 24px", "12px 24px"]);
    const navOpacity = useTransform(scrollY, [0, 80], [1, 0.95]);

    return (
        <>
            <motion.nav
                style={{
                    width: navWidth,
                    top: navTop,
                    borderRadius: navRadius,
                    borderWidth: navBorder,
                    boxShadow: navShadow,
                    padding: navPadding,
                    opacity: navOpacity,
                    backdropFilter: "blur(8px)",
                    translateX: "-50%"
                }}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="fixed left-1/2 z-50 bg-white border-black flex items-center justify-between shadow-black"
            >
                {/* Logo */}
                <Link href="/onboarding" className="flex items-center gap-3 group text-black">
                    <div className="w-10 h-10 rounded-xl bg-lime-400 border-2 border-black flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-[2px_2px_0_0_#000]">
                        <Infinity className="w-6 h-6" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-zinc-900 group-hover:-translate-y-1 transition-transform">
                        SKLOOP
                    </span>
                </Link>

                {/* Desktop Links (HUD Style) */}
                <div className="hidden md:flex items-center gap-2 bg-zinc-100 p-1.5 rounded-full border-2 border-zinc-200">
                    <Link
                        href="/manifesto"
                        className="px-6 py-2 rounded-full text-sm font-bold text-zinc-600 hover:text-black hover:bg-white hover:shadow-sm transition-all"
                    >
                        Strategy Guide
                    </Link>
                    <Link
                        href="/login"
                        className="px-6 py-2 rounded-full text-sm font-bold text-zinc-600 hover:text-black hover:bg-white hover:shadow-sm transition-all"
                    >
                        Load Save (Login)
                    </Link>
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:block">
                    <Link href="/signup">
                        <button className="h-12 px-6 rounded-full bg-lime-400 border-2 border-black text-black text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_0_0_#000] hover:shadow-[0_6px_0_0_#000] hover:-translate-y-1 active:translate-y-[4px] active:shadow-[0_0px_0_0_#000] transition-all group">
                            <Gamepad2 className="w-5 h-5 group-hover:animate-bounce" />
                            New Game
                        </button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-zinc-900 bg-zinc-100 rounded-full border-2 border-zinc-200"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] p-4 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md modal-centered"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                            className="w-full max-w-[340px] sm:max-w-sm bg-zinc-900 border-4 border-zinc-800 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] p-6 md:p-8 flex flex-col gap-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-5 right-5 p-2 bg-zinc-800 rounded-full border-2 border-zinc-700 hover:bg-zinc-700 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="w-5 h-5 text-zinc-300" />
                            </button>

                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-lime-400 border-2 border-lime-500 rounded-xl shadow-[0_0_15px_rgba(212,242,104,0.4)] flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-white/20 rounded-xl pointer-events-none" />
                                    <Infinity className="w-7 h-7 text-zinc-900 relative z-10" />
                                </div>
                                <span className="font-black text-3xl tracking-tighter text-white">SKLOOP</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/manifesto"
                                    className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 rounded-2xl font-bold text-lg text-center hover:bg-zinc-700 hover:border-zinc-600 active:scale-[0.98] transition-all"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Strategy Guide
                                </Link>
                                <Link
                                    href="/login"
                                    className="w-full p-4 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 rounded-2xl font-bold text-lg text-center hover:bg-zinc-700 hover:border-zinc-600 active:scale-[0.98] transition-all"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Load Save
                                </Link>
                                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="mt-2">
                                    <button className="w-full h-14 bg-lime-400 text-black rounded-2xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-lime-300 shadow-[0_0_20px_rgba(212,242,104,0.3)] hover:shadow-[0_0_30px_rgba(212,242,104,0.5)] active:scale-[0.98] transition-all">
                                        <Gamepad2 className="w-6 h-6" /> Play Now
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
