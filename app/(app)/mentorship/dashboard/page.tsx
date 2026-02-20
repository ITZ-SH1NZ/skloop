"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock, Star, CheckCircle, XCircle, Settings, Users, Video, Plus, Link as LinkIcon, ExternalLink, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { Toggle } from "@/components/ui/Toggle";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import { createClient } from "@/utils/supabase/client";

// Mock Data
const STATS = [
    { label: "Total Sessions", value: "42", icon: Users, color: "bg-blue-500" },
    { label: "Hours Mentored", value: "68", icon: Clock, color: "bg-purple-500" },
    { label: "Rating", value: "4.9", icon: Star, color: "bg-amber-400" },
    { label: "Coins Earned", value: "2,450", icon: null, color: "bg-[#D4F268]" }, // Special case for Coin icon
];

const REQUESTS = [
    {
        id: "1",
        mentee: "Jessica Chen",
        role: "Frontend Developer",
        topic: "React Architecture Review",
        time: "Tomorrow, 2:00 PM",
        avatar: "https://i.pravatar.cc/150?u=jessica",
        status: "pending"
    },
    {
        id: "2",
        mentee: "David Miller",
        role: "Student",
        topic: "Career Guidance",
        time: "Fri, 10:00 AM",
        avatar: "https://i.pravatar.cc/150?u=david",
        status: "pending"
    }
];

const RECORDINGS = [
    {
        id: "101",
        title: "Advanced React Patterns",
        url: "https://youtu.be/example1",
        views: 120,
        date: "2 days ago"
    },
    {
        id: "102",
        title: "System Design Interview Prep",
        url: "https://youtu.be/example2",
        views: 85,
        date: "1 week ago"
    }
];

export default function MentorDashboardPage() {
    const [isMentor, setIsMentor] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [recordings, setRecordings] = useState<any[]>([]);
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newVideoTitle, setNewVideoTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [stats, setStats] = useState({ sessions: 0, hours: 0, rating: "5.0", coins: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setCurrentUserId(user.id);
                // 1. Check if user is mentor
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_mentor, coins')
                    .eq('id', user.id)
                    .single();

                if (profile?.is_mentor) {
                    setIsMentor(true);
                    setStats(s => ({ ...s, coins: profile.coins || 0 }));

                    // 2. Fetch pending requests
                    const { data: pendingRequests } = await supabase
                        .from('mentorship_requests')
                        .select('*, mentee:profiles!mentorship_requests_mentee_id_fkey(full_name, username, avatar_url, role)')
                        .eq('mentor_id', user.id)
                        .eq('status', 'pending');

                    if (pendingRequests) {
                        const formattedReqs = pendingRequests.map(req => ({
                            id: req.id,
                            menteeId: req.mentee_id,
                            mentee: req.mentee?.full_name || req.mentee?.username || 'User',
                            role: req.mentee?.role || 'Learner',
                            topic: req.message || 'General Mentorship',
                            time: 'Needs Scheduling', // Would be part of a more complex scheduling flow
                            avatar: req.mentee?.avatar_url,
                            status: req.status
                        }));
                        setRequests(formattedReqs);
                    }

                    // 3. Fetch completed sessions/recordings (using peer_sessions table as proxy for now)
                    const { data: pastSessions } = await supabase
                        .from('peer_sessions')
                        .select('*')
                        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                        .eq('status', 'completed');

                    if (pastSessions) {
                        const formattedRecs = pastSessions.filter(s => s.meeting_url).map(rec => ({
                            id: rec.id,
                            title: rec.topic || 'Mentorship Session',
                            url: rec.meeting_url,
                            views: Math.floor(Math.random() * 100), // Mock
                            date: new Date(rec.start_time).toLocaleDateString()
                        }));
                        setRecordings(formattedRecs);
                        setStats(s => ({ ...s, sessions: pastSessions.length, hours: pastSessions.reduce((acc, curr) => acc + (curr.duration_minutes || 60), 0) / 60 }));
                    }
                }
            }
            setIsLoading(false);
        };

        fetchDashboardData();
    }, []);

    // Toggle Request Status
    const handleRequest = async (id: string, action: "accept" | "decline") => {
        const supabase = createClient();
        const newStatus = action === "accept" ? "accepted" : "declined";

        // Optimistic UI update
        setRequests(prev => prev.filter(req => req.id !== id));

        const { error } = await supabase
            .from('mentorship_requests')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error(`Failed to ${action} request`, error);
            // In a real app, revert optimistic update here
        } else if (action === "accept" && currentUserId) {
            // If accepted, create a peer_session representing the upcoming meeting
            const request = requests.find(r => r.id === id);
            if (request) {
                await supabase.from('peer_sessions').insert({
                    user1_id: currentUserId,
                    user2_id: request.menteeId,
                    topic: request.topic,
                    status: 'scheduled'
                    // start_time would be parsed from scheduling data
                });
            }
        }
    };

    const handleAddVideo = async () => {
        if (newVideoUrl && newVideoTitle && currentUserId) {
            // Optimistic Update
            const fakeId = Date.now().toString();
            const newRec = {
                id: fakeId,
                title: newVideoTitle,
                url: newVideoUrl,
                views: 0,
                date: "Just now"
            };
            setRecordings([newRec, ...recordings]);
            setNewVideoTitle("");
            setNewVideoUrl("");
            setIsAddingVideo(false);

            // Persist to DB using peer_sessions as the storage for these links for now
            const supabase = createClient();
            await supabase.from('peer_sessions').insert({
                user1_id: currentUserId,
                topic: newVideoTitle,
                meeting_url: newVideoUrl,
                status: 'completed',
                start_time: new Date().toISOString()
            });
        }
    };

    // LOCKED STATE
    if (!isMentor) {
        return (
            <div className="min-h-full bg-zinc-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4F268]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-zinc-800/50 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 relative z-10"
                >
                    <div className="w-24 h-24 rounded-full bg-[#D4F268]/10 flex items-center justify-center mx-auto mb-8 border border-[#D4F268]/20">
                        <Lock size={40} className="text-[#D4F268]" />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-4">Dashboard Locked</h1>
                    <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
                        This area is restricted to certified mentors. Complete the verification process to unlock your dashboard.
                    </p>

                    <div className="space-y-4">
                        <Link href="/mentorship/apply">
                            <Button className="w-full h-14 rounded-2xl bg-[#D4F268] text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all">
                                Become a Mentor
                            </Button>
                        </Link>

                        {/* Dev Bypass */}
                        <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Dev Mode Override</span>
                            <Toggle checked={isMentor} onCheckedChange={setIsMentor} />
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // UNLOCKED DASHBOARD
    const dynamicStats = [
        { label: "Total Sessions", value: stats.sessions.toString(), icon: Users, color: "bg-blue-500" },
        { label: "Hours Mentored", value: stats.hours.toString(), icon: Clock, color: "bg-purple-500" },
        { label: "Rating", value: stats.rating, icon: Star, color: "bg-amber-400" },
        { label: "Coins Earned", value: stats.coins.toString(), icon: null, color: "bg-[#D4F268]" },
    ];

    return (
        <div className="min-h-full bg-[#FAFAFA] pb-24 overflow-y-auto no-scrollbar">
            {/* Header */}
            <header className="bg-zinc-900 text-white px-6 pt-12 pb-24 rounded-b-[2.5rem] relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#D4F268]/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto relative z-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-1 bg-[#D4F268] text-black text-[10px] font-black uppercase tracking-wider rounded-full">
                                Verified Mentor
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                            Mentor <span className="text-[#D4F268]">Dashboard</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-zinc-400">Availability</div>
                            <div className="text-white font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Online Now
                            </div>
                        </div>
                        <Button size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                            <Settings size={20} />
                        </Button>
                        {/* Dev Bypass Toggle for Demo */}
                        <div className="fixed bottom-4 right-4 z-50 md:static md:z-0">
                            <Toggle checked={true} onCheckedChange={() => { }} className="data-[state=checked]:bg-[#D4F268]" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dynamicStats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-900/5 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                                {stat.icon ? <stat.icon size={20} strokeWidth={2.5} /> : <CurrencyCoin size="sm" />}
                            </div>
                            <div className="text-3xl font-black text-zinc-900 mb-1">{stat.value}</div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area (Requests & Recordings) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Session Requests */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                                    Requests
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
                                </h2>
                                {/* Add Session Button */}
                                <Button className="h-10 px-4 rounded-xl bg-black text-white hover:bg-zinc-800 text-sm font-bold flex items-center gap-2">
                                    <Plus size={16} />
                                    New Session
                                </Button>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {requests.length === 0 ? (
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 text-center text-zinc-400">
                                        <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">No new requests. You're all caught up!</p>
                                    </div>
                                ) : (
                                    requests.map(req => (
                                        <motion.div
                                            key={req.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-6"
                                        >
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <Avatar src={req.avatar} fallback={req.mentee[0]} className="w-16 h-16 rounded-2xl border-2 border-zinc-100" />
                                                <div>
                                                    <h3 className="text-lg font-black text-zinc-900">{req.mentee}</h3>
                                                    <div className="text-zinc-500 text-xs font-bold uppercase">{req.role}</div>
                                                </div>
                                            </div>

                                            <div className="flex-1 w-full md:w-auto bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-sm">
                                                <div className="font-bold text-zinc-900 mb-1">Topic: {req.topic}</div>
                                                <div className="text-zinc-500 flex items-center gap-2 font-medium">
                                                    <Calendar size={14} />
                                                    {req.time}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto">
                                                <Button
                                                    onClick={() => handleRequest(req.id, "decline")}
                                                    variant="ghost"
                                                    className="flex-1 md:flex-none h-12 w-12 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <XCircle size={24} />
                                                </Button>
                                                <Button
                                                    onClick={() => handleRequest(req.id, "accept")}
                                                    className="flex-1 md:flex-none h-12 w-12 rounded-xl bg-[#D4F268] text-black hover:bg-[#c3e059]"
                                                >
                                                    <CheckCircle size={24} />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Recent Recordings */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                                    My Content
                                </h2>
                                <Button
                                    onClick={() => setIsAddingVideo(!isAddingVideo)}
                                    variant="ghost"
                                    className="h-10 px-4 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 text-sm font-bold flex items-center gap-2"
                                >
                                    {isAddingVideo ? <XCircle size={16} /> : <Plus size={16} />}
                                    {isAddingVideo ? "Cancel" : "Add Video"}
                                </Button>
                            </div>

                            {/* Add Video Form */}
                            <AnimatePresence>
                                {isAddingVideo && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-zinc-900 p-6 rounded-[2rem] text-white flex flex-col gap-4 mb-6">
                                            <h3 className="font-bold text-lg">Add New Recording</h3>
                                            <input
                                                type="text"
                                                placeholder="Video Title"
                                                value={newVideoTitle}
                                                onChange={(e) => setNewVideoTitle(e.target.value)}
                                                className="bg-white/10 border border-white/10 rounded-xl px-4 h-12 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4F268]"
                                            />
                                            <input
                                                type="text"
                                                placeholder="YouTube URL (Unlisted)"
                                                value={newVideoUrl}
                                                onChange={(e) => setNewVideoUrl(e.target.value)}
                                                className="bg-white/10 border border-white/10 rounded-xl px-4 h-12 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4F268]"
                                            />
                                            <Button
                                                onClick={handleAddVideo}
                                                className="bg-[#D4F268] text-black font-bold h-12 rounded-xl hover:bg-[#c3e059]"
                                            >
                                                Add Recording
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recordings.map(rec => (
                                    <div key={rec.id} className="bg-white p-4 rounded-[2rem] border border-zinc-100 flex items-start gap-4 group hover:border-zinc-200 transition-colors">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-[#D4F268]/20 transition-colors">
                                            <Video size={24} className="text-zinc-400 group-hover:text-[#D4F268]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-zinc-900 truncate">{rec.title}</h4>
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mt-1">
                                                <span>{rec.views} views</span>
                                                <span>•</span>
                                                <span>{rec.date}</span>
                                            </div>
                                            <a href={rec.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#D4F268] mt-2 group-hover:underline">
                                                <LinkIcon size={12} />
                                                View Link
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Sidebar */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-zinc-900">Quick Actions</h2>
                        <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4F268]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <h3 className="font-bold text-lg mb-6">Your Availability</h3>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-sm font-medium text-zinc-300">Mon - Fri</span>
                                    <span className="text-[#D4F268] font-bold text-sm">6PM - 9PM</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-sm font-medium text-zinc-300">Weekends</span>
                                    <span className="text-[#D4F268] font-bold text-sm">Flexible</span>
                                </div>
                            </div>

                            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 rounded-xl mb-4">
                                Edit Schedule
                            </Button>

                            <Button variant="ghost" className="w-full text-white/50 hover:text-white hover:bg-white/10 font-bold h-12 rounded-xl flex items-center justify-center gap-2">
                                <ExternalLink size={16} />
                                Guide
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
