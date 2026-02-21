"use client";

import { motion } from "framer-motion";
import { Users, Trophy, Award, Star, MessageSquare } from "lucide-react";
import Link from "next/link";

const TOP_PEERS = [
    { name: "Logic_X", level: 92, xp: "1.2M", badges: 42, color: "bg-primary" },
    { name: "Silo_Dev", level: 88, xp: "980k", badges: 38, color: "bg-blue-400" },
    { name: "Protocol_Zero", level: 85, xp: "850k", badges: 35, color: "bg-amber-400" },
];

const MENTORS = [
    { name: "Architect_Sam", role: "DSA Master", rating: 4.9, students: 120, status: "Active" },
    { name: "Neko_Code", role: "Next.js Lead", rating: 5.0, students: 85, status: "Active" },
];

export const MasteryHall = () => {
    return (
        <section className="py-60 px-8 bg-zinc-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(212,242,104,0.05)_0%,_transparent_50%)]" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="flex flex-col items-center text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8">
                        <Users size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 italic">Peer Protocol // Social</span>
                    </div>
                    <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black tracking-tighter mb-12 leading-none">
                        THE HALL OF <br />
                        <span className="text-primary italic italic">MASTERY.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto">
                        Don't code in a vacuum. Gain validation from elite architects and race against the top logic-streams globally.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    {/* Leaderboard Column */}
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
                            <Trophy size={24} className="text-primary" />
                            Elite Peer Stream
                        </h3>
                        <div className="space-y-6">
                            {TOP_PEERS.map((peer, idx) => (
                                <motion.div
                                    key={peer.name}
                                    whileHover={{ x: 10 }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group cursor-default"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="text-2xl font-black text-zinc-600">0{idx + 1}</div>
                                        <div className={`w-12 h-12 rounded-2xl ${peer.color} flex items-center justify-center`}>
                                            <span className="font-black text-zinc-900">{peer.name[0]}</span>
                                        </div>
                                        <div>
                                            <div className="font-black text-xl tracking-tight">{peer.name}</div>
                                            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Level {peer.level} // {peer.badges} Badges</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-primary font-black text-lg">{peer.xp}</div>
                                        <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Mastery_XP</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Mentors Column */}
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
                            <Award size={24} className="text-primary" />
                            Official Mentors
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                            {MENTORS.map((mentor) => (
                                <div key={mentor.name} className="p-8 bg-zinc-800 rounded-[3rem] border border-white/5 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-primary/40 uppercase tracking-widest">MENTOR_ID: 10{mentor.name.length}</div>
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-16 h-16 rounded-3xl bg-zinc-700 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform shadow-2xl">
                                            <Star size={32} />
                                        </div>
                                        <div>
                                            <div className="font-black text-2xl tracking-tight">{mentor.name}</div>
                                            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{mentor.role}</div>
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Star size={10} className="fill-current" />
                                                <span className="text-[10px] font-bold">{mentor.rating} · {mentor.students} Students</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/signup" className="w-full">
                                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-zinc-900 transition-all flex items-center justify-center gap-3">
                                            INITIALIZE SYNC <MessageSquare size={14} />
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
