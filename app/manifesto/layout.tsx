"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function ManifestoLayout({ children }: { children: React.ReactNode }) {
    const { scrollYProgress } = useScroll();
    const [activeSection, setActiveSection] = useState("");

    // Simple scroll spy based on intersection observer
    useEffect(() => {
        const sections = document.querySelectorAll("section[id]");

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-20% 0px -80% 0px" }); // trigger near the top of the screen

        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const navLinks = [
        { id: "prologue", label: "01. Prologue" },
        { id: "the-grind", label: "02. The Grind" },
        { id: "the-solution", label: "03. The Engine" },
        { id: "epilogue", label: "04. Epilogue" },
    ];

    const xpGained = useTransform(scrollYProgress, (val) => Math.round(val * 1000));

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans selection:bg-lime-300 selection:text-black relative overflow-x-hidden">

            {/* The XP Bar (Scroll Progress) */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-2 bg-lime-400 z-[100] shadow-[0_0_15px_rgba(212,242,104,0.8)]"
                style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
            />

            {/* Very faint background grid for consistency */}
            <div className="fixed inset-0 pointer-events-none z-0 perspective-[1000px] opacity-30">
                <div
                    className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)]"
                    style={{ transform: "rotateX(60deg) scale(2) translateY(-10%)" }}
                />
            </div>

            <MarketingNavbar />

            <div className="relative z-10 pt-28 md:pt-36 pb-24 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-16">

                {/* Sidebar Navigation (Scrollspy) */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="sticky top-28 bg-white border-4 md:border-8 border-black rounded-2xl md:rounded-3xl p-6 shadow-[8px_8px_0_0_#000] md:shadow-[12px_12px_0_0_#000] z-20 transition-all">
                        <h3 className="font-black text-xl uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-3 h-3 bg-lime-400 border-2 border-black animate-pulse" />
                            Index
                        </h3>
                        <nav className="flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    className={`font-bold transition-all px-3 py-2 rounded-xl flex items-center gap-2 ${activeSection === link.id
                                            ? "bg-black text-lime-400 scale-105 shadow-[4px_4px_0_0_#a3e635] -translate-y-1"
                                            : "text-zinc-500 hover:text-black hover:bg-zinc-100"
                                        }`}
                                >
                                    {activeSection === link.id && <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />}
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="mt-8 pt-6 border-t-4 border-zinc-100">
                            <div className="bg-lime-300 border-2 border-black rounded-xl p-4 text-center">
                                <span className="block font-black text-xs uppercase mb-1">XP Gained</span>
                                <span className="font-bold text-sm">
                                    <motion.span>{xpGained}</motion.span>
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-white border-4 md:border-8 border-black rounded-3xl md:rounded-[3rem] p-8 md:p-16 shadow-[12px_12px_0_0_#000] md:shadow-[20px_20px_0_0_#000] relative z-20">
                    {children}
                </main>
            </div>

            <MarketingFooter />
        </div>
    );
}
