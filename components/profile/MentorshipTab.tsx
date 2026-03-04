"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Video, Star, MoreVertical, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getMySessionsAsMentee, type MentorSession } from "@/actions/mentorship-actions";

export function MentorshipTab() {
    const [sessions, setSessions] = useState<MentorSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getMySessionsAsMentee().then(data => {
            setSessions(data);
            setIsLoading(false);
        });
    }, []);

    const upcoming = sessions.filter(s => s.status === "pending" || s.status === "accepted");
    const past = sessions.filter(s => s.status === "published" && s.videoUrl);

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Header Action */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-black text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-2">Mentorship Journey</h2>
                    <p className="text-gray-400 font-medium max-w-sm">Connect with experts or watch your shared video library to grow.</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <Link href="/mentorship/find">
                        <Button className="bg-[#D4F268] text-black font-bold rounded-xl hover:bg-[#c3e055]">Find a Mentor</Button>
                    </Link>
                    <Link href="/mentorship/apply">
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl bg-black">Become a Mentor</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Sessions List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black text-xl px-2">Active Requests</h3>

                    <div className="space-y-4">
                        {upcoming.length === 0 ? (
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center text-gray-400">
                                <p className="font-medium">No active requests. Browse the directory to get started.</p>
                            </div>
                        ) : (
                            upcoming.map((session, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={session.id}
                                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center group hover:scale-[1.01] transition-transform"
                                >
                                    <div className="bg-zinc-50 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[5rem] border border-gray-200/50">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</span>
                                        <span className={`text-xs font-black mt-1 ${session.status === 'accepted' ? 'text-green-500 animate-pulse' : 'text-amber-500'}`}>
                                            {session.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-black text-lg text-foreground mb-1">{session.title}</h4>
                                        <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                            with <span className="text-black font-black">{session.mentorName}</span>
                                        </p>
                                        <div className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-tight">Requested on {new Date(session.createdAt).toLocaleDateString()}</div>
                                    </div>

                                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                        <Link href="/mentorship/sessions">
                                            <Button className="w-full rounded-xl font-bold bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-black">
                                                Manage
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Stats / History */}
                <div className="space-y-6">
                    <h3 className="font-black text-xl px-2">Video Library</h3>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Total Mentors</p>
                                <p className="text-3xl font-black">{new Set(sessions.map(s => s.mentorId)).size}</p>
                            </div>
                            <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900">
                                <Video size={18} />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">Past Sessions</h4>
                            <div className="space-y-4">
                                {past.length === 0 ? (
                                    <p className="text-xs text-gray-400">No video responses yet.</p>
                                ) : (
                                    past.slice(0, 3).map(s => (
                                        <div key={s.id} className="flex gap-3 items-center group">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 group-hover:bg-[#D4F268] group-hover:text-black transition-colors shrink-0">
                                                <Play size={14} fill="currentColor" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-black truncate">{s.title}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{s.mentorName}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {past.length > 3 && (
                                    <Link href="/mentorship/sessions" className="text-[10px] font-black text-[#5a6d1a] hover:underline block pt-2">
                                        VIEW ALL {past.length} VIDEOS
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
