"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
    LayoutDashboard, Map, Gamepad2, Users, UserCheck, Bot,
    CheckCircle2, Flame, Award, ArrowRight
} from "lucide-react";
import Link from "next/link";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

export default function LiveDemoGrid() {
    return (
        <section className="relative w-full max-w-7xl mx-auto py-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Inside the Loop</h2>
                <p className="text-[#6B7280] text-lg max-w-2xl mx-auto text-balance">
                    Experience a gamified learning journey. Real progression, real coding games, and a real community.
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]"
            >
                {/* 1. Dashboard Mock (Large) */}
                <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative group overflow-hidden bg-white rounded-3xl border border-[#E5E5E0] shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAFA] to-white z-0" />
                    <div className="relative z-10 p-8 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-[#D4F268]/20 rounded-xl">
                                <LayoutDashboard className="w-6 h-6 text-[#1A1A1A]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#1A1A1A]">Your Dashboard</h3>
                        </div>

                        <p className="text-[#6B7280] mb-8">Track daily modules, quests, and climb the leaderboard.</p>

                        {/* Inner Dashboard Mock UI */}
                        <div className="flex-1 rounded-2xl border border-[#E5E5E0] bg-[#FAFAFA] overflow-hidden flex flex-col p-4 gap-4 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                            {/* Header mock */}
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E0]">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-1 font-bold text-orange-500"><Flame className="w-4 h-4" /> 12</div>
                                    <div className="flex items-center gap-1 font-bold text-[#D4F268] drop-shadow-sm"><Award className="w-4 h-4 text-black" /> 1.2k</div>
                                </div>
                            </div>
                            {/* Content mock */}
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="h-20 bg-white rounded-xl border border-[#E5E5E0] p-3">
                                        <div className="text-xs font-bold text-[#6B7280] mb-2 uppercase">Daily Quest</div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-[#D4F268]" />
                                            <div className="h-4 flex-1 bg-slate-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Tracks Mock */}
                <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-white rounded-3xl border border-[#E5E5E0] p-8 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Map className="w-5 h-5 text-[#6B7280]" />
                                <h3 className="text-xl font-bold text-[#1A1A1A]">Curated Tracks</h3>
                            </div>
                            <p className="text-[#6B7280] text-sm">Web Dev, DSA, and tailored Roadmaps.</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center group-hover:bg-[#D4F268] transition-colors">
                            <ArrowRight className="w-4 h-4 text-[#1A1A1A]" />
                        </div>
                    </div>

                    {/* Mock Path line */}
                    <div className="relative h-16 mt-4 flex items-center justify-between px-4">
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#E5E5E0] -translate-y-1/2 -z-10" />
                        <div className="absolute top-1/2 left-4 right-1/2 h-1 bg-[#D4F268] -translate-y-1/2 -z-10" />
                        <div className="w-6 h-6 rounded-full bg-[#D4F268] shadow-sm ring-4 ring-white" />
                        <div className="w-6 h-6 rounded-full bg-[#D4F268] shadow-sm ring-4 ring-white" />
                        <div className="w-6 h-6 rounded-full bg-[#E5E5E0] shadow-sm ring-4 ring-white" />
                        <div className="w-6 h-6 rounded-full bg-[#E5E5E0] shadow-sm ring-4 ring-white" />
                    </div>
                </motion.div>

                {/* 3. Daily Games Mock */}
                <motion.div variants={item} className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-[#1A1A1A] text-white rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:shadow-[#D4F268]/20 transition-all duration-300">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
                        <Gamepad2 className="w-32 h-32 text-[#D4F268]" />
                    </div>
                    <GameGridIcon />
                    <h3 className="text-xl font-bold mt-4 mb-2">Daily Games</h3>
                    <p className="text-gray-400 text-sm">Codal, Typing Tests & DSA Quizzes.</p>
                </motion.div>

                {/* 4. Peers/Community */}
                <motion.div variants={item} className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-[#D4F268] rounded-3xl p-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <Users className="w-8 h-8 text-black mb-4" />
                    <h3 className="text-xl font-bold text-black mb-2">Peers & Circles</h3>
                    <p className="text-black/70 text-sm font-medium">Chat, collaborate, and compete globally.</p>
                </motion.div>

                {/* 5. Mentorship */}
                <motion.div variants={item} className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 bg-white rounded-3xl border border-[#E5E5E0] p-8 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#E5E5E0] flex items-center justify-center shrink-0">
                        <UserCheck className="w-8 h-8 text-[#1A1A1A]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">Expert Mentors</h3>
                        <p className="text-[#6B7280] text-sm">Connect with pros and attend exclusive courses.</p>
                    </div>
                </motion.div>

                {/* 6. Loopy AI */}
                <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-white rounded-3xl border border-[#E5E5E0] p-8 flex items-center gap-6 relative overflow-hidden group hover:shadow-xl hover:border-[#D4F268] transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#D4F268]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex-1">
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-[#D4F268]" /> Loopy AI
                        </h3>
                        <p className="text-[#6B7280] text-sm">Your dual-mode assistant. Helpful tutor by day, gamified coding rival by night.</p>
                    </div>
                    <Link href="/signup" className="relative z-10 shrink-0 px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform">
                        Try it
                    </Link>
                </motion.div>

            </motion.div>
        </section>
    );
}

function GameGridIcon() {
    return (
        <div className="grid grid-cols-3 gap-1 w-12 h-12 mb-4">
            {[...Array(9)].map((_, i) => (
                <div key={i} className={`rounded-sm ${i % 4 === 0 ? 'bg-[#D4F268]' : 'bg-white/20 animate-pulse'}`} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
        </div>
    );
}
