"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Zap, Users, BrainCircuit } from "lucide-react";

export default function PurposeSection() {
    return (
        <section id="purpose" className="relative py-24 px-6 max-w-7xl mx-auto overflow-hidden">
            <div className="text-center mb-16 px-4">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-lime-500 font-black uppercase tracking-[0.3em] text-xs md:text-sm mb-4 block"
                >
                    The Mission
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-none mb-6"
                >
                    Engineering Mastery,<br />
                    <span className="text-zinc-400">Gamified.</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-500 font-bold text-lg md:text-xl max-w-2xl mx-auto leading-tight"
                >
                    Skloop is a Habit Engineering Platform designed to bridge the gap between "Tutorial Hell" and technical mastery. We turn the grind of learning code into a visceral, high-stakes RPG experience.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
                <PurposeCard 
                    icon={<Zap className="w-8 h-8 text-lime-400" />}
                    title="Habit Engineering"
                    description="We don't just teach syntax; we build habits. Through daily 'Codele' puzzles and streak-based progression, we ensure consistency is your strongest weapon."
                    delay={0.3}
                />
                <PurposeCard 
                    icon={<Target className="w-8 h-8 text-cyan-400" />}
                    title="Tactile Roadmaps"
                    description="Our journey is mapped through visually immersive biomes. Master Web Development and DSA by conquering levels that feel less like a syllabus and more like a quest."
                    delay={0.4}
                />
                <PurposeCard 
                    icon={<BrainCircuit className="w-8 h-8 text-purple-400" />}
                    title="Loopy AI Tutors"
                    description="Adaptive, emotional, and context-aware. Loopy AI isn't just a chatbot—it's your companion that reacts to your code, celebrates wins, and helps you squash bugs."
                    delay={0.5}
                />
            </div>

            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lime-400/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </section>
    );
}

function PurposeCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="group bg-white border-4 border-black p-8 md:p-10 rounded-[2rem] shadow-[8px_8px_0_0_#000] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_0_#000] transition-all"
        >
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border-2 border-white/10 group-hover:rotate-6 transition-transform">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4">{title}</h3>
            <p className="text-zinc-500 font-bold leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}
