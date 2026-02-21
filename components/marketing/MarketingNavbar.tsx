"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Gamepad2 } from "lucide-react";

export default function MarketingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[90%] max-w-5xl rounded-full border-4 border-black shadow-[0_8px_0_0_#000] flex items-center justify-between px-6 py-3 ${isScrolled ? "bg-white/90 backdrop-blur-md" : "bg-white"
                    }`}
            >
                {/* Logo */}
                <Link href="/onboarding" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-lime-400 border-2 border-black flex items-center justify-center text-black font-black rotate-3 group-hover:rotate-12 transition-transform shadow-[2px_2px_0_0_#000]">
                        S
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="fixed inset-0 z-[60] p-6 flex flex-col items-center justify-center bg-zinc-900/40 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-sm bg-white border-8 border-black rounded-[3rem] shadow-[20px_20px_0_0_#000] p-8 flex flex-col gap-6 relative">
                            <button
                                className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full border-2 border-black hover:bg-zinc-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="w-6 h-6 text-black" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-lime-400 border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] flex items-center justify-center font-black text-2xl">S</div>
                                <span className="font-black text-3xl tracking-tighter">SKLOOP</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Link
                                    href="/manifesto"
                                    className="w-full p-4 bg-zinc-50 border-4 border-zinc-200 rounded-2xl font-bold text-lg text-center active:scale-95 transition-transform"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Strategy Guide
                                </Link>
                                <Link
                                    href="/login"
                                    className="w-full p-4 bg-zinc-50 border-4 border-zinc-200 rounded-2xl font-bold text-lg text-center active:scale-95 transition-transform"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Load Save
                                </Link>
                                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full p-4 bg-lime-400 border-4 border-black rounded-2xl font-black text-xl uppercase tracking-wider text-black shadow-[0_6px_0_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_0_#000] transition-all flex items-center justify-center gap-2">
                                        <Gamepad2 className="w-6 h-6" /> Play Now
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
