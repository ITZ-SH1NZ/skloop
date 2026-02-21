"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { motion } from "framer-motion";
import { Code2, Braces, Users, Sparkles, LayoutDashboard, MessageSquare } from "lucide-react";
import { MiniSidebar, MiniDashboard, MiniLoopy, MiniChat, MiniProfile } from "./MiniAppPreview";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const PANELS = [
    {
        id: "web-dev",
        title: "Master Web Architecture",
        subtitle: "Track 01: Core Engineering",
        description: "From pixel-perfect CSS to high-performance distributed systems. Implement real features in a production-ready environment.",
        icon: <Code2 className="text-primary" size={32} />,
        features: ["Next.js Mastery", "Responsive Protocol", "API Orchestration"],
        ui: <div className="flex bg-zinc-950 rounded-3xl overflow-hidden h-[340px] border border-white/10 shadow-3xl"><MiniSidebar /><MiniDashboard /></div>
    },
    {
        id: "dsa",
        title: "Algorithmic Integrity",
        subtitle: "Track 02: Logical Systems",
        description: "Optimize for deep scale. Master the structures that power global platforms through interactive code challenges.",
        icon: <Braces className="text-blue-500" size={32} />,
        features: ["Big O Mastery", "Memory Efficiency", "Distributed Logic"],
        ui: <div className="flex bg-zinc-950 rounded-3xl overflow-hidden h-[340px] border border-white/10 shadow-3xl"><MiniSidebar /><div className="flex-1 p-8 flex items-center justify-center text-zinc-500 font-mono text-xs italic bg-dot-pattern">PATH_TRACING_IN_PROGRESS...</div></div>
    },
    {
        id: "loopy-ai",
        title: "The AI Sentinel",
        subtitle: "Intelligent Autopilot",
        description: "Meet Loopy. From helpful roadmap generators to gamified logic agents, AI is integrated into every step of your journey.",
        icon: <Sparkles className="text-amber-500" size={32} />,
        features: ["Personalized Roadmaps", "Code Auditing", "Contextual Guidance"],
        ui: <div className="flex bg-zinc-950 rounded-3xl overflow-hidden h-[340px] border border-white/10 shadow-3xl"><MiniSidebar /><MiniLoopy /></div>
    },
    {
        id: "peers",
        title: "The Peer Network",
        subtitle: "Collaborative Mastery",
        description: "You aren't coding alone. Interact with peers, trade Skloop coins, and transition into a mentor once you hit the level cap.",
        icon: <Users className="text-indigo-500" size={32} />,
        features: ["Direct Mentorship", "Peer Code Reviews", "Logic Chat"],
        ui: <div className="flex bg-zinc-950 rounded-3xl overflow-hidden h-[340px] border border-white/10 shadow-3xl"><MiniSidebar /><MiniChat /></div>
    },
    {
        id: "ecosystem",
        title: "Full Customization",
        subtitle: "Personalized Protocol",
        description: "Track every XP point. Customize your profile, unlock rare technical badges, and manage your growth through a high-performance dashboard.",
        icon: <LayoutDashboard className="text-primary" size={32} />,
        features: ["Growth Dashboard", "Profile Identity", "Inventory System"],
        ui: <div className="flex bg-zinc-950 rounded-3xl overflow-hidden h-[340px] border border-white/10 shadow-3xl"><MiniSidebar /><MiniProfile /></div>
    }
];

export const ProtocolOverview = () => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        const total = PANELS.length;

        // 1. Initial State: Carousel starts compressed
        gsap.set(".orbit-card", {
            opacity: 0,
            scale: 0.8,
            z: -500
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top",
                end: "+=350%", // Long enough for smooth rotation
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    // Calculate which card is closest to front (progress 0-1)
                    const segment = 1 / total;
                    const closest = Math.round(self.progress * (total - 1));
                    if (closest !== activeIdx) setActiveIdx(closest);
                }
            }
        });

        // 2. The Rotation Animation
        tl.to(orbitRef.current, {
            rotateY: (total - 1) * -72, // -360 / 5 = -72 deg per step
            ease: "none"
        });

        // 3. Staggered Entrance
        gsap.to(".orbit-card", {
            opacity: 1,
            scale: 1,
            z: 0,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
                trigger: triggerRef.current,
                start: "top 80%",
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <section ref={triggerRef} className="relative bg-zinc-950 overflow-hidden min-h-screen">
            {/* Context Header (Pinned at Top) */}
            <div className="absolute top-0 w-full z-50 py-16 px-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-md"
                >
                    <LayoutDashboard size={14} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 italic text-zinc-400">Mastery Orbit // Protocol v1.0</span>
                </motion.div>
                <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-tighter leading-none text-white select-none">
                    ORCHESTRATED <span className="text-primary italic">INTELLIGENCE.</span>
                </h2>
            </div>

            {/* 3D Scene Root */}
            <div className="relative h-screen flex items-center justify-center perspective-[2000px]">
                {/* Background Grid (Parallax) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                        transform: "translateZ(-500px) scale(2)"
                    }}
                />

                {/* The Orbit Container */}
                <div
                    ref={orbitRef}
                    className="relative w-full h-[600px] flex items-center justify-center translate-z-0 preserve-3d transition-transform duration-700 ease-out"
                >
                    {PANELS.map((panel, idx) => {
                        const angle = (idx * 360) / PANELS.length;
                        const isFocused = idx === activeIdx;

                        return (
                            <div
                                key={panel.id}
                                className="orbit-card absolute w-[90vw] md:w-[800px] preserve-3d flex items-center justify-center"
                                style={{
                                    transform: `rotateY(${angle}deg) translateZ(600px)`,
                                }}
                            >
                                <motion.div
                                    animate={{
                                        opacity: isFocused ? 1 : 0.15,
                                        scale: isFocused ? 1 : 0.85,
                                        filter: isFocused ? "blur(0px)" : "blur(4px)",
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="relative w-full bg-zinc-900 rounded-[3rem] border border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden group"
                                >
                                    {/* Card Content */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                                        <div>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 bg-white/5 rounded-2xl text-primary">{panel.icon}</div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">
                                                    Module_0{idx + 1}
                                                </div>
                                            </div>

                                            <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-none">
                                                {panel.title}
                                            </h3>

                                            <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-10 max-w-md">
                                                {panel.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {panel.features.map((feat, fIdx) => (
                                                    <span key={fIdx} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold tracking-widest uppercase text-zinc-500">
                                                        {feat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute -inset-10 bg-primary/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                            {panel.ui}
                                        </div>
                                    </div>

                                    {/* Numbers HUD detail */}
                                    <div className="absolute bottom-6 right-10 text-[12rem] font-black text-white/[0.03] select-none pointer-events-none -mb-8 -mr-8 italic">
                                        0{idx + 1}
                                    </div>

                                    {/* Decorative Borders */}
                                    <div className="absolute inset-0 border-[20px] border-white/[0.01] pointer-events-none rounded-[3rem]" />
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls Info Tooltip */}
                <div className="absolute bottom-8 flex flex-col items-center gap-4 opacity-40">
                    <div className="text-[8px] font-mono tracking-[0.4em] uppercase text-zinc-500">CONTINUE_DEEP_SYNC</div>
                    <div className="h-12 w-px bg-gradient-to-b from-primary to-transparent" />
                </div>
            </div>
        </section>
    );
};
