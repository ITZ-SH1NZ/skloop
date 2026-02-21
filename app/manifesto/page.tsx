"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Swords, BrainCircuit, Terminal } from "lucide-react";
import Link from "next/link";

export default function ManifestoPage() {
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

                <h1 className="text-5xl md:text-7xl mb-12 text-black leading-tight tracking-tighter">The Skloop Manifesto</h1>

                <section id="prologue" className="mb-16 md:mb-24 scroll-mt-32">
                    <h2 className="flex items-center gap-3 text-3xl md:text-4xl mb-8 border-b-4 border-black pb-4"><Sparkles className="text-lime-500 w-8 h-8 md:w-10 md:h-10" /> 01. Prologue</h2>
                    <p>
                        We build software. We break code. We spend hours staring at documentation that feels like it was written by robots, for robots.
                        The path to becoming an elite engineer—or just landing your first dev role—is fundamentally broken. It's a lonely, frustrating grind of disconnected tutorials, outdated LeetCode solutions, and sterile platforms.
                    </p>
                    <p>
                        We looked at the landscape and asked: <strong>Why is learning to build the future so damn boring?</strong>
                    </p>

                    <div className="not-prose bg-zinc-100 border-l-8 border-lime-400 border-y-4 border-r-4 border-r-zinc-200 border-y-zinc-200 p-6 my-8 rounded-r-2xl transform md:-rotate-1 relative shadow-sm">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-200 rounded-bl-full" />
                        <strong className="flex items-center gap-2 text-black font-black mb-2 uppercase tracking-wide text-sm">
                            <Terminal className="w-5 h-5" /> Gameplay Hint
                        </strong>
                        <p className="font-bold text-zinc-600">Learning shouldn't feel like reading a dictionary. It should feel like progressing through a skill tree. You don't read the manual to beat a boss; you fight it.</p>
                    </div>
                </section>

                <section id="the-grind" className="mb-16 md:mb-24 scroll-mt-32">
                    <h2 className="flex items-center gap-3 text-3xl md:text-4xl mb-8 border-b-4 border-black pb-4"><Swords className="text-orange-500 w-8 h-8 md:w-10 md:h-10" /> 02. The Grind</h2>
                    <p>
                        Currently, the "grind" to mastering Data Structures, Algorithms, and Full-Stack Development looks like this:
                    </p>
                    <ul className="list-disc pl-6 marker:text-lime-500 space-y-4 font-semibold text-lg md:text-xl text-zinc-700">
                        <li>Watch a 4-hour YouTube video entirely passively.</li>
                        <li>Copy-paste perfectly formatted code without understanding the 'why'.</li>
                        <li>Stare at a blank white screen on a competitive programming site feeling immense imposter syndrome.</li>
                        <li>Rinse and repeat until burnout.</li>
                    </ul>
                    <p className="mt-8">
                        This is the equivalent of leveling up in an RPG by hitting the same level 1 slime for 500 hours. It works, eventually, but you lose your soul in the process. We need a better core gameplay loop.
                    </p>
                </section>

                <section id="the-solution" className="mb-16 md:mb-24 scroll-mt-32">
                    <h2 className="flex items-center gap-3 text-3xl md:text-4xl mb-8 border-b-4 border-black pb-4"><BrainCircuit className="text-cyan-500 w-8 h-8 md:w-10 md:h-10" /> 03. The Skloop Engine</h2>
                    <p>
                        Skloop is an operating system for your engineering career, injected with the DNA of a video game. We are combining the tactile joy of playing a perfectly tuned game with the extreme rigor required to be a 10x developer.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
                        <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all">
                            <h4 className="font-black text-xl mb-2 uppercase">1. Tactile Learning</h4>
                            <p className="font-semibold text-zinc-600 text-sm">Every button press, completion, and milestone should feel physical and rewarding. Extreme feedback loops.</p>
                        </div>
                        <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all">
                            <h4 className="font-black text-xl mb-2 uppercase">2. Multiplayer Mode</h4>
                            <p className="font-semibold text-zinc-600 text-sm">Code shouldn't be written in isolation. Join guilds, compete on leaderboards, and spectate live challenges.</p>
                        </div>
                        <div className="bg-zinc-900 border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all text-white md:col-span-2">
                            <h4 className="font-black text-lime-400 text-xl mb-2 uppercase">3. Intelligent NPCs (AI Tutors)</h4>
                            <p className="font-semibold text-zinc-400 text-sm">Say goodbye to generic ChatGPT advice. Our contextual AI tutors ("Loopy") understand exactly where you are in the codebase and push you to the solution without spoiling the answer.</p>
                        </div>
                    </div>
                </section>

                <section id="epilogue" className="mb-10 scroll-mt-32">
                    <h2 className="text-3xl md:text-4xl mb-8 border-b-4 border-black pb-4">04. Epilogue</h2>
                    <p>
                        We are building this because we wanted it to exist when we were starting out. The internet is mature enough to move past generic text tutorials. It's time to play the game of engineering.
                    </p>

                    <div className="mt-16 text-center not-prose">
                        <Link href="/signup">
                            <button className="h-16 px-10 rounded-full bg-lime-400 text-black text-xl font-black inline-flex items-center gap-3 border-4 border-black shadow-[0_8px_0_0_#000] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#000] active:translate-y-[8px] active:shadow-none transition-all uppercase tracking-wider">
                                Start Your Adventure
                            </button>
                        </Link>
                    </div>
                </section>
            </motion.div>
        </article>
    );
}
