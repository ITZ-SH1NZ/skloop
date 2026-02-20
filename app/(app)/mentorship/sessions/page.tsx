"use client";

import { useState, useEffect } from "react";
import { Calendar, Video, Star, User, PlayCircle, Clock, CheckCircle2, MoreHorizontal, FileText, Sparkles, TrendingUp, Zap, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// Types
interface Session {
    id: string;
    mentor: {
        name: string;
        role: string;
        company: string;
        avatarUrl: string;
    };
    submittedDate: string;
    completedDate?: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    topic: string;
    description: string;
    videoDuration?: string;
    rating?: number | null;
    videoUrl?: string; // Add url for videos
}

export default function MySessionsPage() {
    const [activeTab, setActiveTab] = useState<"requests" | "library">("requests");
    const [pendingRequests, setPendingRequests] = useState<Session[]>([]);
    const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch Pending/In-Progress Requests
                const { data: requests } = await supabase
                    .from('mentorship_requests')
                    .select('*, mentor:profiles!mentorship_requests_mentor_id_fkey(full_name, username, avatar_url, role, company)')
                    .eq('mentee_id', user.id)
                    .neq('status', 'declined') // Show pending and maybe accepted (in_progress)
                    .order('created_at', { ascending: false });

                if (requests) {
                    setPendingRequests(requests.map(r => ({
                        id: r.id,
                        mentor: {
                            name: r.mentor?.full_name || r.mentor?.username || 'Mentor',
                            role: r.mentor?.role || 'Expert',
                            company: r.mentor?.company || 'Skloop',
                            avatarUrl: r.mentor?.avatar_url
                        },
                        submittedDate: new Date(r.created_at).toLocaleDateString(),
                        status: r.status === 'accepted' ? 'IN_PROGRESS' : 'PENDING',
                        topic: 'Mentorship Session',
                        description: r.message || 'Waiting for mentor review.'
                    })));
                }

                // Fetch Completed Video Library (peer_sessions where they are mentee and video exists)
                const { data: pastSessions } = await supabase
                    .from('peer_sessions')
                    .select('*, mentor:profiles!peer_sessions_user1_id_fkey(full_name, username, avatar_url, role, company)') // Assuming user1 is mentor who created it
                    .eq('user2_id', user.id)
                    .eq('status', 'completed')
                    .not('meeting_url', 'is', null) // Must have a video link
                    .order('start_time', { ascending: false });

                if (pastSessions) {
                    setCompletedSessions(pastSessions.map(s => ({
                        id: s.id,
                        mentor: {
                            name: s.mentor?.full_name || s.mentor?.username || 'Mentor',
                            role: s.mentor?.role || 'Expert',
                            company: s.mentor?.company || 'Skloop',
                            avatarUrl: s.mentor?.avatar_url
                        },
                        submittedDate: new Date(s.start_time).toLocaleDateString(),
                        status: 'COMPLETED',
                        topic: s.topic || 'Mentoship Session',
                        description: 'Completed video session.',
                        videoDuration: `${s.duration_minutes || 60}m`,
                        rating: null,
                        videoUrl: s.meeting_url
                    })));
                }
            }
            setIsLoading(false);
        };

        fetchSessions();
    }, []);

    return (
        <div className="h-full bg-[#FAFAFA] overflow-y-auto no-scrollbar">
            {/* Dark Header Section */}
            <div className="bg-zinc-900 px-6 py-10 md:px-10 md:py-14 relative overflow-hidden shrink-0">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4F268]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-[#D4F268] text-black text-xs font-black uppercase tracking-wider rounded-full">
                                    Member Pass
                                </span>
                                <span className="text-zinc-400 text-sm font-medium">Premium Access</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                                Mentorship <span className="text-[#D4F268]">Hub</span>
                            </h1>
                            <p className="text-zinc-400 font-medium text-lg max-w-xl leading-relaxed">
                                Your personal growth dashboard. Track requests and learn from personalized video responses.
                            </p>
                        </div>

                        {/* High Impact Stats */}
                        <div className="flex gap-4">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[140px]">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Video size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Sessions</span>
                                </div>
                                <div className="text-3xl font-black text-white">12</div>
                            </div>
                            <div className="bg-[#D4F268] p-4 rounded-2xl min-w-[140px] shadow-[0_0_20px_rgba(212,242,104,0.3)]">
                                <div className="flex items-center gap-2 text-black/60 mb-1">
                                    <Zap size={14} className="fill-black/60" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Impact</span>
                                </div>
                                <div className="text-3xl font-black text-black leading-none">Top 5%</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-[#D4F268] group-hover:text-black transition-colors">
                                <Clock size={18} />
                            </div>
                            <div>
                                <div className="text-zinc-400 text-xs font-bold uppercase">Hours Watched</div>
                                <div className="text-white font-bold text-lg">4.5h</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-[#D4F268] group-hover:text-black transition-colors">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <div className="text-zinc-400 text-xs font-bold uppercase">Growth Rate</div>
                                <div className="text-white font-bold text-lg">+12%</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group md:col-span-2">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-[#D4F268] group-hover:text-black transition-colors shrink-0">
                                <Sparkles size={18} className="text-[#D4F268] group-hover:text-black fill-[#D4F268] group-hover:fill-black" />
                            </div>
                            <div>
                                <div className="text-zinc-400 text-xs font-bold uppercase mb-1">Weekly Focus</div>
                                <div className="text-white font-bold text-sm">Reviewing System Design Patterns</div>
                            </div>
                            <Button size="sm" variant="ghost" className="ml-auto text-[#D4F268] hover:text-[#D4F268] hover:bg-white/5 uppercase text-xs font-bold tracking-wider">
                                View Plan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 py-8 md:px-10 pb-32">
                <div className="max-w-6xl mx-auto">
                    {/* Floating Tabs */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center p-1.5 bg-white rounded-full border border-zinc-200 shadow-sm">
                            <button
                                onClick={() => setActiveTab("requests")}
                                className={`px-8 py-3 rounded-full text-sm font-bold transition-all relative ${activeTab === "requests" ? "text-black" : "text-zinc-500 hover:text-zinc-800"
                                    }`}
                            >
                                {activeTab === "requests" && (
                                    <motion.div
                                        layoutId="pill"
                                        className="absolute inset-0 bg-[#D4F268] rounded-full shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    In Progress
                                    {pendingRequests.length > 0 && <span className="bg-black text-[#D4F268] text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("library")}
                                className={`px-8 py-3 rounded-full text-sm font-bold transition-all relative ${activeTab === "library" ? "text-black" : "text-zinc-500 hover:text-zinc-800"
                                    }`}
                            >
                                {activeTab === "library" && (
                                    <motion.div
                                        layoutId="pill"
                                        className="absolute inset-0 bg-[#D4F268] rounded-full shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">Video Library</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ACTIVE REQUESTS */}
                        {activeTab === "requests" && (
                            <motion.div
                                key="requests"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5, transition: { duration: 0.1 } }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="space-y-4"
                            >
                                {isLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>
                                ) : pendingRequests.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[2rem] border border-zinc-100">
                                        <p className="text-zinc-500 font-medium">No active requests.</p>
                                    </div>
                                ) : pendingRequests.map(session => (
                                    <div key={session.id} className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                        {/* Status Accent Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${session.status === "IN_PROGRESS" ? "bg-[#D4F268]" : "bg-zinc-100"
                                            }`} />

                                        <div className="flex flex-col md:flex-row gap-8 pl-4">
                                            {/* Status Column */}
                                            <div className="w-full md:w-56 shrink-0 flex flex-col justify-between">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Avatar
                                                        src={session.mentor.avatarUrl}
                                                        fallback={session.mentor.name.slice(0, 2).toUpperCase()}
                                                        className="w-14 h-14 rounded-2xl border-4 border-white shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-zinc-900 leading-tight">{session.mentor.name}</div>
                                                        <div className="text-xs text-zinc-500 font-medium">{session.mentor.company}</div>
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`w-2 h-2 rounded-full ${session.status === "IN_PROGRESS" ? "bg-amber-500 animate-pulse" : "bg-zinc-300"
                                                            }`} />
                                                        <span className="text-xs font-bold text-zinc-700 tracking-wide uppercase">
                                                            {session.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs font-medium text-zinc-400">
                                                        Sent {session.submittedDate}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Column */}
                                            <div className="flex-1 border-l border-dashed border-zinc-100 pl-0 md:pl-8">
                                                <h3 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">{session.topic}</h3>
                                                <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-medium">
                                                    {session.description}
                                                </p>

                                                <div className="flex items-center gap-4">
                                                    {session.status === "IN_PROGRESS" ? (
                                                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                                                            <Video size={16} className="animate-pulse" />
                                                            <span className="text-xs font-bold">{session.mentor.name} is recording...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs font-bold text-zinc-400 bg-zinc-50 px-4 py-2 rounded-full">
                                                            Waiting for acceptance
                                                        </div>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="ml-auto text-zinc-400 hover:text-zinc-900">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* VIDEO LIBRARY */}
                        {activeTab === "library" && (
                            <motion.div
                                key="library"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5, transition: { duration: 0.1 } }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {isLoading ? (
                                    <div className="flex justify-center py-20 col-span-2"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>
                                ) : completedSessions.length === 0 ? (
                                    <div className="text-center py-20 bg-white col-span-2 rounded-[2rem] border border-zinc-100">
                                        <p className="text-zinc-500 font-medium">No videos in your library yet.</p>
                                    </div>
                                ) : completedSessions.map(session => (
                                    <div key={session.id} className="bg-white rounded-[2rem] p-3 border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-900/5 transition-all group flex flex-col">
                                        {/* Thumbnail Area */}
                                        <div className="bg-zinc-900 aspect-video rounded-3xl relative flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4F268]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <PlayCircle size={64} className="text-white fill-white/10 group-hover:scale-110 group-hover:fill-[#D4F268]/20 group-hover:text-[#D4F268] transition-all duration-300 relative z-10" />

                                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 border border-white/10">
                                                <Clock size={12} />
                                                {session.videoDuration}
                                            </div>
                                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                                                <Avatar
                                                    src={session.mentor.avatarUrl}
                                                    fallback={session.mentor.name.slice(0, 2).toUpperCase()}
                                                    className="w-8 h-8 rounded-full border border-white/20"
                                                />
                                                <span className="text-white text-xs font-bold shadow-sm">{session.mentor.name}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="px-4 py-5 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-lg font-black text-zinc-900 leading-tight tracking-tight">{session.topic}</h3>
                                                {session.rating && (
                                                    <div className="flex gap-0.5 mt-1">
                                                        <Star size={14} className="fill-[#D4F268] text-[#D4F268]" />
                                                        <span className="text-xs font-bold text-zinc-900 ml-1">{session.rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-zinc-500 text-xs line-clamp-2 mb-6 flex-1 font-medium">
                                                {session.description}
                                            </p>

                                            <div className="flex items-center gap-3 mt-auto">
                                                <a href={session.videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <Button className="w-full rounded-xl font-bold bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-black transition-colors">
                                                        Watch Video
                                                    </Button>
                                                </a>
                                                {!session.rating && (
                                                    <Button variant="outline" className="rounded-xl font-bold border-zinc-200">
                                                        Rate
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
