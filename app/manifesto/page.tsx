"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Sparkles, Swords, BrainCircuit, Terminal, Skull, AlertOctagon, Joystick, Zap, Users, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";

export default function ManifestoPage() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <article className="prose prose-zinc max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-semibold prose-p:text-lg prose-p:leading-relaxed md:prose-p:text-xl prose-a:text-lime-600 prose-a:font-bold">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-lime-300 text-black text-xs md:text-sm font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] border-2 border-black mb-8">
                    Official Strategy Guide
                </div>

                <h1 className="text-5xl md:text-7xl mb-12 text-black leading-tight tracking-tighter shadow-sm">The Skloop Manifesto</h1>

                {/* 01. PROLOGUE */}
                <section id="prologue" className="mb-20 md:mb-32 scroll-mt-32">
                    <h2 className="flex items-center gap-3 text-3xl md:text-4xl mb-8 border-b-4 border-black pb-4">
                        <Sparkles className="text-lime-500 w-8 h-8 md:w-10 md:h-10" /> 01. Prologue
                    </h2>
                    
                    <p className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-zinc-800 mb-8 max-w-3xl">
                        Learning to build the future shouldn't feel like reading a <span className="line-through text-red-500 decoration-4">dictionary</span>.
                    </p>

                    <div className="not-prose bg-black border-4 border-black p-6 md:p-8 my-8 relative shadow-[8px_8px_0_0_#d4f268] group hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#d4f268] transition-all">
                        <div className="flex items-center gap-2 text-lime-400 font-mono text-sm md:text-base mb-4 bg-zinc-900 inline-flex px-3 py-1 rounded">
                            <Terminal className="w-4 h-4" /> root@skloop:~# cat reality_check.txt
                        </div>
                        <p className="text-white font-mono text-sm md:text-base leading-relaxed">
                            <span className="text-lime-400">&gt; WARNING:</span> The standard path to engineering mastery is broken.<br/><br/>
                            Stop reading manuals. Start fighting bosses.
                        </p>
                    </div>
                </section>

                {/* 02. THE GRIND */}
                <section id="the-grind" className="mb-20 md:mb-32 scroll-mt-32">
                    <h2 className="flex items-center gap-3 text-3xl md:text-4xl mb-10 border-b-4 border-black pb-4">
                        <Swords className="text-orange-500 w-8 h-8 md:w-10 md:h-10" /> 02. The Grind
                    </h2>
                    
                    <p className="mb-8 font-bold text-zinc-600 tracking-wide">Leveling up shouldn't mean hitting the same Level 1 slime for 500 hours.</p>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 not-prose"
                    >
                        {/* Debuff Card 1 */}
                        <motion.div variants={itemVariants} className="bg-red-50 border-4 border-red-900 rounded-xl p-6 shadow-[6px_6px_0_0_#7f1d1d] relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-red-100 opacity-50 group-hover:scale-110 transition-transform">
                                <Skull className="w-24 h-24" />
                            </div>
                            <h4 className="flex items-center gap-2 font-black text-red-900 text-lg uppercase tracking-wide mb-3 relative z-10"><AlertOctagon className="w-5 h-5"/> Tutorial Hell</h4>
                            <p className="text-red-800 text-sm font-semibold relative z-10">Passive watching = 0% retention. 100% false confidence.</p>
                        </motion.div>

                        {/* Debuff Card 2 */}
                        <motion.div variants={itemVariants} className="bg-orange-50 border-4 border-orange-900 rounded-xl p-6 shadow-[6px_6px_0_0_#7c2d12] relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-orange-100 opacity-50 group-hover:scale-110 transition-transform">
                                <ShieldAlert className="w-24 h-24" />
                            </div>
                            <h4 className="flex items-center gap-2 font-black text-orange-900 text-lg uppercase tracking-wide mb-3 relative z-10"><Cpu className="w-5 h-5"/> Mindless Copy</h4>
                            <p className="text-orange-800 text-sm font-semibold relative z-10">Copy-pasting formatted code without understanding the <i>'why'</i>.</p>
                        </motion.div>

                        {/* Debuff Card 3 */}
                        <motion.div variants={itemVariants} className="bg-zinc-100 border-4 border-zinc-900 rounded-xl p-6 shadow-[6px_6px_0_0_#18181b] relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-zinc-200 opacity-50 group-hover:scale-110 transition-transform">
                                <Users className="w-24 h-24" />
                            </div>
                            <h4 className="flex items-center gap-2 font-black text-zinc-900 text-lg uppercase tracking-wide mb-3 relative z-10"><Zap className="w-5 h-5"/> Blank Canvas</h4>
                            <p className="text-zinc-700 text-sm font-semibold relative z-10">Staring at blank IDEs feeling absolute imposter syndrome.</p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* 03. THE ENGINE */}
                <section id="the-solution" className="mb-20 md:mb-32 scroll-mt-32">
                    <h2 className="flex items-center gap-3 text-3xl md:text-4xl mb-10 border-b-4 border-black pb-4">
                        <BrainCircuit className="text-cyan-500 w-8 h-8 md:w-10 md:h-10" /> 03. The Engine
                    </h2>
                    
                    <p className="md:text-2xl font-black mb-10">
                        Skloop is an operating system for your engineering career, <span className="text-lime-600 underline decoration-black decoration-4 underline-offset-4">injected with the DNA of a video game.</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                        <motion.div 
                            whileHover={{ y: -5, x: -5 }}
                            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000] relative"
                        >
                            <div className="w-12 h-12 bg-lime-300 border-2 border-black rounded-full flex items-center justify-center mb-4 absolute -top-6 -left-4 shadow-[4px_4px_0_0_#000]">
                                <Joystick className="w-6 h-6 text-black" />
                            </div>
                            <h4 className="font-black text-2xl mb-3 mt-2 uppercase tracking-tight">Tactile Learning</h4>
                            <p className="font-semibold text-zinc-600">Extreme tactile feedback. Every keystroke is rewarded.</p>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ y: -5, x: -5 }}
                            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000] relative"
                        >
                            <div className="w-12 h-12 bg-cyan-300 border-2 border-black rounded-full flex items-center justify-center mb-4 absolute -top-6 -left-4 shadow-[4px_4px_0_0_#000]">
                                <Users className="w-6 h-6 text-black" />
                            </div>
                            <h4 className="font-black text-2xl mb-3 mt-2 uppercase tracking-tight">Multiplayer Mode</h4>
                            <p className="font-semibold text-zinc-600">Join guilds, conquer leaderboards, and spectate live coding battles.</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5, x: -5 }}
                            className="bg-black text-white border-4 border-black p-6 md:p-10 shadow-[8px_8px_0_0_#d4f268] md:col-span-2 relative overflow-hidden"
                        >
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                                <Terminal className="w-64 h-64 -mb-16 -mr-16" />
                            </div>
                            <h4 className="font-black text-lime-400 text-3xl mb-4 uppercase tracking-tight relative z-10 flex items-center gap-3">
                                <Zap className="w-8 h-8 text-lime-400" />
                                Intelligent NPCs (AI Tutors)
                            </h4>
                            <p className="font-medium text-zinc-300 text-lg md:text-xl max-w-2xl relative z-10">
                                Context-aware companions that nudge you forward <span className="text-white border-b-2 border-lime-400 cursor-pointer hover:bg-lime-400 hover:text-black transition-colors rounded">without spoiling the solution</span>.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* 04. EPILOGUE */}
                <section id="epilogue" className="mb-10 scroll-mt-32">
                    <h2 className="text-3xl md:text-4xl mb-8 border-b-4 border-black pb-4 font-black">
                        04. Epilogue
                    </h2>
                    <p className="text-2xl md:text-4xl font-black mb-8 uppercase tracking-tighter text-zinc-900 border-l-4 border-lime-400 pl-6">
                        It's time to play the game of engineering.
                    </p>

                    <div className="mt-20 text-center not-prose">
                        <Link href="/signup">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-black text-black bg-lime-400 border-4 border-black overflow-hidden shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] hover:-translate-y-1 transition-all uppercase tracking-widest rounded-2xl"
                            >
                                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                                <span className="relative flex items-center gap-3">
                                    Start Your Adventure <Swords className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                </span>
                            </motion.button>
                        </Link>
                    </div>
                </section>
            </motion.div>
        </article>
    );
}
