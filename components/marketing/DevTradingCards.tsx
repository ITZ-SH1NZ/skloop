"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Code2, Braces, Database, Terminal, Ghost, Sparkles } from "lucide-react";

const CARDS = [
    {
        id: "frontend",
        title: "The Builder",
        subtitle: "Specialty: UI/UX & React",
        color: "bg-lime-400",
        shadow: "shadow-[10px_10px_0_0_#A3E635]",
        icon: <Code2 className="w-16 h-16 text-black" />,
        stats: [
            { label: "Design Vision", val: 95 },
            { label: "Component Logic", val: 80 },
            { label: "Centering Divs", val: 100 },
        ]
    },
    {
        id: "dsa",
        title: "The Algomancer",
        subtitle: "Specialty: Time Complexity",
        color: "bg-orange-500",
        shadow: "shadow-[10px_10px_0_0_#f97316]",
        icon: <Braces className="w-16 h-16 text-white" />,
        stats: [
            { label: "Big O Analysis", val: 99 },
            { label: "Tree Traversal", val: 90 },
            { label: "Touching Grass", val: 15 },
        ]
    },
    {
        id: "backend",
        title: "The Architect",
        subtitle: "Specialty: APIs & Databases",
        color: "bg-cyan-500",
        shadow: "shadow-[10px_10px_0_0_#06b6d4]",
        icon: <Database className="w-16 h-16 text-white" />,
        stats: [
            { label: "System Design", val: 90 },
            { label: "SQL Queries", val: 85 },
            { label: "Server Uptime", val: 99 },
        ]
    }
];

export default function DevTradingCards() {
    return (
        <section className="relative w-full max-w-6xl mx-auto px-2 md:px-6">
            <div className="text-center mb-12 md:mb-16">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase mb-4">Choose Your Class</h2>
                <div className="inline-flex gap-2 items-center bg-black text-white px-4 py-2 rounded-full border-2 border-lime-400 shadow-[4px_4px_0_0_#A3E635]">
                    <Sparkles className="w-4 h-4 text-lime-400 animate-pulse" />
                    <span className="font-bold text-sm tracking-wider uppercase">Hover Cards to Inspect</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-8 perspective-[2000px]">
                {CARDS.map((card, idx) => (
                    <TiltCard key={card.id} card={card} index={idx} />
                ))}
            </div>
        </section>
    );
}

function TiltCard({ card, index }: { card: typeof CARDS[0], index: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    // Glare effects based on mouse
    const glareOpacity = useTransform(mouseXSpring, [-0.5, 0, 0.5], [0, 0.3, 0]);
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                zIndex: index === 1 ? 20 : 10
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", bounce: 0.4, delay: index * 0.1 }}
            className={`relative w-full md:w-80 aspect-[2/3] rounded-3xl md:rounded-[2rem] border-8 border-black ${card.color} ${card.shadow} cursor-crosshair group`}
        >
            {/* Holographic Glare */}
            <motion.div
                className="absolute inset-0 z-50 pointer-events-none rounded-[1.5rem] bg-gradient-to-br from-white to-transparent"
                style={{ opacity: glareOpacity, left: glareX, top: glareY, transform: "translate(-50%, -50%) scale(2)" }}
            />

            {/* Inner Border & Texture */}
            <div className="absolute inset-3 border-4 border-black/20 rounded-2xl md:rounded-3xl z-0 overflow-hidden" style={{ transform: "translateZ(10px)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50" />
            </div>

            <div className="relative z-10 p-6 flex flex-col h-full justify-between" style={{ transform: "translateZ(30px)" }}>
                {/* Header */}
                <div className="text-center bg-black text-white py-2 rounded-xl border-2 border-white mb-6">
                    <h3 className="font-black text-2xl uppercase tracking-tighter">{card.title}</h3>
                </div>

                {/* Character Portrait/Icon Container */}
                <div className="flex-1 flex justify-center items-center relative">
                    <div className="absolute inset-0 bg-black/10 rounded-full blur-xl scale-75" />
                    <motion.div
                        className="relative z-20 bg-white border-4 border-black w-32 h-32 rounded-full flex items-center justify-center shadow-[4px_4px_0_0_#000]"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring" }}
                        style={{ transform: "translateZ(50px)" }} // Pops out
                    >
                        {card.icon}
                    </motion.div>
                </div>

                {/* Footer Stats */}
                <div className="bg-white border-4 border-black rounded-xl p-4 mt-6 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
                    <p className="text-xs font-black uppercase text-center text-zinc-500 mb-3 tracking-wider">{card.subtitle}</p>
                    <div className="space-y-2">
                        {card.stats.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-xs font-bold font-mono">
                                <span>{s.label}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-zinc-200 rounded-full overflow-hidden border border-zinc-400">
                                        <div className="h-full bg-black rounded-full" style={{ width: `${s.val}%` }} />
                                    </div>
                                    <span className="w-6 text-right">{s.val}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
