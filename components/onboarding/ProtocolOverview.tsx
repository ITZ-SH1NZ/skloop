"use client";

import { useEffect, useRef } from "react";
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
    const sectionRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const totalPanels = PANELS.length;

        const pin = gsap.to(sectionRef.current, {
            xPercent: -100 * (totalPanels - 1),
            ease: "none",
            scrollTrigger: {
                trigger: triggerRef.current,
                pin: true,
                start: "top top",
                end: `+=${totalPanels * 100}%`,
                scrub: 0.6,
                snap: {
                    snapTo: 1 / (totalPanels - 1),
                    duration: { min: 0.2, max: 0.5 },
                    delay: 0,
                    ease: "power1.inOut"
                },
                anticipatePin: 1,
                onRefresh: (self) => {
                    // Force final position sync on refresh
                }
            }
        });
        return () => {
            pin.kill();
        };
    }, []);

    return (
        <section className="overflow-hidden bg-[#FDFCF8]">
            {/* Context Header */}
            <div className="py-32 px-12 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full mb-8 shadow-xl">
                    <LayoutDashboard size={14} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 italic">Protocol Modules</span>
                </div>
                <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black tracking-tighter mb-8 leading-[0.85]">
                    THE FULL <span className="text-primary italic">CIRCLE.</span>
                </h2>
                <p className="text-xl md:text-2xl text-zinc-500 font-medium">
                    Skloop isn't just a course—it's a living technical ecosystem. Every feature is designed to sharpen your edge.
                </p>
            </div>

            <div ref={triggerRef}>
                <div ref={sectionRef} className="h-screen w-[500vw] flex flex-row items-center bg-zinc-900 text-white relative will-change-transform">
                    {/* Background Detail Grid */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                            backgroundSize: "80px 80px"
                        }}
                    />

                    {PANELS.map((panel, idx) => (
                        <div key={panel.id} className="h-screen w-screen flex-shrink-0 flex items-center justify-center px-12 md:px-24 relative overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl w-full relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="inline-flex items-center gap-4 py-2 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-10 group">
                                        <div className="p-2 bg-zinc-800 rounded-lg group-hover:rotate-12 transition-transform">{panel.icon}</div>
                                        <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                                            {panel.subtitle}
                                        </div>
                                    </div>

                                    <h2 className="text-[clamp(3rem,6vw,5rem)] font-black tracking-tighter mb-8 leading-none">
                                        {panel.title}
                                    </h2>

                                    <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-lg mb-12">
                                        {panel.description}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        {panel.features.map((feat, fIdx) => (
                                            <div key={fIdx} className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-primary hover:text-zinc-900 transition-all cursor-default">
                                                {feat}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 1 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-4 bg-primary/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {panel.ui}

                                    {/* Overlay HUD bits */}
                                    <div className="absolute -top-4 -right-4 p-3 bg-zinc-900 border border-white/10 rounded-xl font-mono text-[9px] text-zinc-500">
                                        MODULE_ID: 0{idx + 1}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Number Detail bg */}
                            <div className="absolute bottom-[-5%] right-[-2%] text-[30vw] font-black text-white/[0.02] select-none pointer-events-none italic">
                                0{idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
