"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    LayoutDashboard, Map, Gamepad2, Users, UserCheck, Bot,
    CheckCircle2, Flame, Award, ArrowRight
} from "lucide-react";

export default function FeatureLevels() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end end"],
    });

    return (
        <section ref={containerRef} className="relative w-full py-20 pb-40">

            {/* The Mario-style World Map Path connecting the levels */}
            <div className="absolute top-0 bottom-0 left-6 md:left-1/2 md:-translate-x-1/2 w-3 md:w-4 bg-zinc-200 rounded-full flex flex-col items-center">
                <motion.div
                    className="w-full bg-lime-400 origin-top rounded-full shadow-[0_0_10px_2px_rgba(212,242,104,0.6)] md:shadow-[0_0_20px_5px_rgba(212,242,104,0.6)]"
                    style={{ scaleY: scrollYProgress, height: "100%" }}
                />
            </div>

            <div className="flex flex-col gap-16 md:gap-32 relative z-10 w-full max-w-5xl mx-auto px-6 md:px-0">

                {/* LEVEL 1: DASHBOARD */}
                <LevelCard
                    title="Level 1: The Dashboard"
                    description="Your daily hub. Track quests, modules, and climb the leaderboard."
                    icon={<LayoutDashboard className="w-8 h-8 text-black" />}
                    align="left"
                    color="bg-white"
                >
                    {/* Mock Dashboard UI */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border-2 border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-300 animate-pulse border-2 border-zinc-400" />
                                <div className="h-4 w-24 bg-zinc-300 rounded animate-pulse" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1 font-bold text-orange-500 text-lg"><Flame className="w-5 h-5" /> 12</div>
                                <div className="flex items-center gap-1 font-bold text-lime-500 text-lg"><Award className="w-5 h-5 text-black" /> 1.2k</div>
                            </div>
                        </div>
                        <div className="h-24 bg-zinc-50 rounded-xl border-2 border-zinc-200 p-4 flex flex-col justify-center shadow-inner">
                            <div className="text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">Daily Quest: Arrays</div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-lime-500 drop-shadow-sm" />
                                <div className="h-4 flex-1 bg-zinc-300 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </LevelCard>

                {/* LEVEL 2: TRACKS */}
                <LevelCard
                    title="Level 2: Skloop Tracks"
                    description="Follow curated paths in Web Dev and DSA. Complete nodes to unlock the next challenge."
                    icon={<Map className="w-8 h-8 text-black" />}
                    align="right"
                    color="bg-lime-300"
                >
                    <div className="relative h-24 mt-4 flex items-center justify-between px-6 bg-white rounded-xl border-4 border-black box-content overflow-hidden">
                        <div className="absolute top-1/2 left-6 right-6 h-3 bg-zinc-200 -translate-y-1/2 -z-10 rounded-full" />
                        <div className="absolute top-1/2 left-6 right-1/2 h-3 bg-black -translate-y-1/2 -z-10 rounded-full" />
                        <div className="w-8 h-8 rounded-full bg-black shadow-[0_4px_0_0_#e5e5e5] border-4 border-white z-10" />
                        <div className="w-8 h-8 rounded-full bg-black shadow-[0_4px_0_0_#e5e5e5] border-4 border-white z-10" />
                        <div className="w-8 h-8 rounded-full bg-zinc-200 shadow-[0_4px_0_0_#a1a1aa] border-4 border-white z-10" />
                        <div className="w-8 h-8 rounded-full bg-zinc-200 shadow-[0_4px_0_0_#a1a1aa] border-4 border-white z-10 relative">
                            <div className="absolute -top-3 -right-3 w-4 h-4 rounded-full bg-orange-500 animate-ping" />
                        </div>
                    </div>
                </LevelCard>

                {/* LEVEL 3: DAILY GAMES */}
                <LevelCard
                    title="Level 3: Daily Arcade"
                    description="Keep your streak alive. Play Codele (Coding Wordle), test your typing speed, and solve DSA quizzes."
                    icon={<Gamepad2 className="w-8 h-8 text-lime-400" />}
                    align="left"
                    color="bg-zinc-900"
                    textColor="text-white"
                >
                    <div className="grid grid-cols-3 gap-2 w-32 h-32 mx-auto mt-4">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className={`rounded-lg border-2 ${i % 4 === 0 ? 'bg-lime-400 border-lime-500' : 'bg-zinc-800 border-zinc-700 animate-pulse'}`} style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>
                </LevelCard>

                {/* LEVEL 4: PEERS & MENTORS */}
                <LevelCard
                    title="Level 4: Co-op Mode"
                    description="Chat with peers, join study circles, and connect with expert mentors for guidance."
                    icon={<Users className="w-8 h-8 text-black" />}
                    align="right"
                    color="bg-white"
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-lime-100 p-3 rounded-xl border-2 border-lime-400">
                            <div className="w-12 h-12 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center font-bold text-xl">U</div>
                            <div>
                                <h4 className="font-bold text-black text-lg leading-tight">Study Circle</h4>
                                <p className="text-sm font-semibold text-zinc-600">3 peers online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-xl border-2 border-zinc-200">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center font-bold text-xl text-white"><UserCheck className="w-6 h-6" /></div>
                            <div>
                                <h4 className="font-bold text-black text-lg leading-tight">Find a Mentor</h4>
                                <p className="text-sm font-semibold text-zinc-600">Book a 1-on-1</p>
                            </div>
                        </div>
                    </div>
                </LevelCard>

                {/* LEVEL 5: LOOPY AI */}
                <LevelCard
                    title="Boss Fight: Loopy AI"
                    description="Face off against our dual-mode AI. Use it as a helpful tutor, or challenge it in the gamified coding arena."
                    icon={<Bot className="w-8 h-8 text-lime-400" />}
                    align="left"
                    color="bg-zinc-900"
                    textColor="text-white"
                >
                    <div className="bg-zinc-800 border-4 border-zinc-700 rounded-xl p-4 flex gap-4 mt-2">
                        <div className="w-12 h-12 rounded border-2 border-lime-400 bg-lime-400/20 shrink-0 flex items-center justify-center animate-pulse">
                            <Bot className="w-6 h-6 text-lime-400" />
                        </div>
                        <div className="space-y-2 flex-1 pt-1">
                            <div className="h-3 w-full bg-zinc-700 rounded-sm" />
                            <div className="h-3 w-3/4 bg-zinc-700 rounded-sm" />
                            <div className="h-3 w-1/2 bg-lime-400 rounded-sm mt-4 shadow-[0_0_10px_rgba(212,242,104,0.5)]" />
                        </div>
                    </div>
                </LevelCard>

            </div>
        </section>
    );
}

// -------------------------------------------------------------
// HELPER COMPONENT: The Tactile Module Card
// -------------------------------------------------------------
interface LevelCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    align: "left" | "right";
    color?: string;
    textColor?: string;
    children: React.ReactNode;
}

function LevelCard({ title, description, icon, align, children, color = "bg-white", textColor = "text-zinc-900" }: LevelCardProps) {
    const isLeft = align === "left";

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, x: isLeft ? -50 : 50 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className={`flex flex-col md:flex-row items-center gap-8 ${isLeft ? '' : 'md:flex-row-reverse'}`}
        >
            {/* The Node On The Path */}
            <div className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:flex w-16 h-16 bg-white border-8 border-black rounded-full shadow-[0_6px_0_0_#000] z-20 items-center justify-center">
                {icon}
            </div>

            {/* Empty space to push card to side */}
            <div className="hidden md:block md:w-1/2" />

            {/* The Tactile Card */}
            <div className={`w-full md:w-[45%] ${color} ${textColor} border-4 md:border-8 border-black rounded-[2rem] md:rounded-[3rem] shadow-[12px_12px_0_0_#000] md:shadow-[20px_20px_0_0_#000] p-6 md:p-10 relative z-10 hover:z-50 group hover:-translate-y-2 hover:shadow-[24px_24px_0_0_#000] transition-all duration-300`}>
                <div className="flex items-center gap-4 mb-4 md:hidden">
                    <div className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#000]">
                        {icon}
                    </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3 select-none">{title}</h3>
                <p className={`font-semibold text-lg md:text-xl leading-snug mb-8 ${textColor === 'text-white' ? 'text-zinc-400' : 'text-zinc-600'}`}>{description}</p>

                {/* Embedded UI Mock */}
                <div className="w-full">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
