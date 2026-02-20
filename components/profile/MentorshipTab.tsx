"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Video, Star, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export function MentorshipTab() {
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [past, setPast] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, rating: "5.0" }); // Mock rating for now

    useEffect(() => {
        const fetchMentorshipData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch upcoming sessions from peer_sessions
                const { data: sessions } = await supabase
                    .from('peer_sessions')
                    .select('*, user2:profiles!peer_sessions_user2_id_fkey(full_name, username, role)')
                    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                    .order('start_time', { ascending: true });

                if (sessions) {
                    const now = new Date();
                    const scheduled = sessions.filter(s => s.status === 'scheduled' && new Date(s.start_time || Date.now()) > now);
                    const completed = sessions.filter(s => s.status === 'completed');

                    setUpcoming(scheduled.map(s => ({
                        id: s.id,
                        title: s.topic || 'Mentorship Session',
                        mentor: s.user2?.full_name || s.user2?.username || 'Mentor',
                        date: new Date(s.start_time || Date.now() + 86400000), // mock future if null
                    })));

                    setPast(completed.map(s => ({
                        id: s.id,
                        title: s.topic || 'Mentorship Session',
                        date: new Date(s.start_time || Date.now() - 86400000).toLocaleDateString(),
                    })));

                    setStats(prev => ({ ...prev, total: completed.length }));
                }
            }
        };

        fetchMentorshipData();
    }, []);
    return (
        <div className="space-y-8">

            {/* Header Action */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-black text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-2">Mentorship Journey</h2>
                    <p className="text-gray-400 font-medium max-w-sm">Connect with experts or share your knowledge to earn XP and badges.</p>
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
                    <h3 className="font-black text-xl px-2">Upcoming Sessions</h3>

                    <div className="space-y-4">
                        {upcoming.length === 0 ? (
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center text-gray-400">
                                <p className="font-medium">No upcoming sessions. Book a mentor to get started.</p>
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
                                    {/* Date Box */}
                                    <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[5rem] border border-gray-200/50">
                                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">{session.date.toLocaleString('en-US', { month: 'short' })}</span>
                                        <span className="text-3xl font-black text-gray-900">{session.date.getDate()}</span>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-black text-lg text-foreground mb-1">{session.title}</h4>
                                        <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                                            with <span className="text-black">{session.mentor}</span>
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full">Top Rated</span>
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Clock size={14} /> {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Video size={14} /> Zoom Meeting
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                        <Button className="flex-1 sm:flex-none rounded-xl font-bold bg-primary text-black hover:bg-primary/90">
                                            Join
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hidden sm:flex rounded-xl text-gray-400 hover:text-black">
                                            <MoreVertical size={18} />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Stats / History */}
                <div className="space-y-6">
                    <h3 className="font-black text-xl px-2">Your Impact</h3>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Total Sessions</p>
                                <p className="text-3xl font-black">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary-foreground">
                                <Video size={18} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Average Rating</p>
                                <p className="text-3xl font-black">{stats.rating}</p>
                            </div>
                            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <Star size={18} fill="currentColor" />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">Past Sessions</h4>
                            <div className="space-y-3">
                                {past.length === 0 ? (
                                    <p className="text-xs text-gray-400">No past sessions yet.</p>
                                ) : (
                                    past.map(s => (
                                        <div key={s.id} className="flex gap-3 items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{s.title[0]}</div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-bold truncate">{s.title}</p>
                                                <p className="text-[10px] text-gray-400">{s.date}</p>
                                            </div>
                                            <span className="text-xs font-bold text-green-500">Completed</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
