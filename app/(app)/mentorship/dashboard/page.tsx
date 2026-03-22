"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Lock, Plus, XCircle, CheckCircle, Clock, Calendar, Video, Star, Users, Zap, Award, Copy, Info, Settings, Trash2, Link as LinkIcon, Loader2, ArrowRight, Play, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import {
    getMyMentorStatus,
    getMySessionsAsMentor,
    handleSessionRequest,
    markSessionCompleted,
    publishMentorVideo,
    deleteMentorVideo,
    generateVouchCode,
    getMyVouchCodes,
    type MentorSession,
    type VouchCode
} from "@/actions/mentorship-actions";
import { useUser } from "@/context/UserContext";
import { MentorSettingsModal } from "@/components/mentorship/MentorSettingsModal";
import { MentorHandbookModal } from "@/components/mentorship/MentorHandbookModal";
import useSWR from "swr";
import { fetchMentorDashboardData } from "@/lib/swr-fetchers";
import { XPLevelRing } from "@/components/mentorship/XPLevelRing";

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
};

export default function MentorDashboardPage() {
    const { user, profile } = useUser();

    const { data: dashboardData, isLoading, mutate } = useSWR(
        user?.id ? ['mentorDashboard', user.id] : null,
        fetchMentorDashboardData as any,
        { revalidateOnFocus: false }
    );

    const status = dashboardData?.status || null;
    const sessions = dashboardData?.sessions || null;
    const vouchCodes = dashboardData?.vouchCodes || [];

    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"requests" | "upcoming" | "history">("requests");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHandbookOpen, setIsHandbookOpen] = useState(false);
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [newVideo, setNewVideo] = useState({ title: "", topic: "", description: "", url: "", thumbnail: "", premiereAt: "" });
    const [newCode, setNewCode] = useState<string | null>(null);
    const [copying, setCopying] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Prevent hydration mismatch — SWR isLoading is false on server, true initially on client
    useEffect(() => { setIsMounted(true); }, []);

    const loadData = async (uid?: string) => { mutate(); };

    const handleAction = async (id: string, action: "accept" | "decline" | "complete" | "delete") => {
        setActionLoading(id);
        try {
            if (action === "complete") { await markSessionCompleted(id); }
            else if (action === "delete") { await deleteMentorVideo(id); }
            else { await handleSessionRequest(id, action); }
            await loadData();
        } catch { }
        setActionLoading(null);
    };

    const handlePublish = async () => {
        if (!newVideo.title || !newVideo.url) return;

        let finalThumbnail = newVideo.thumbnail;
        if (!finalThumbnail) {
            const ytMatch = newVideo.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
            if (ytMatch && ytMatch[1]) {
                finalThumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
            }
        }

        setActionLoading("publish");
        try {
            await publishMentorVideo({
                title: newVideo.title,
                topic: newVideo.topic,
                description: newVideo.description,
                videoUrl: newVideo.url,
                thumbnailUrl: finalThumbnail,
                premiereAt: newVideo.premiereAt
            });
            setIsAddingVideo(false);
            setNewVideo({ title: "", topic: "", description: "", url: "", thumbnail: "", premiereAt: "" });
            await loadData();
        } catch { }
        setActionLoading(null);
    };

    const handleGenerateCode = async () => {
        setActionLoading("code");
        try {
            const code = await generateVouchCode();
            setNewCode(code);
            await loadData();
        } catch (err: any) { alert(err.message); }
        setActionLoading(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopying(text);
        setTimeout(() => setCopying(null), 2000);
    };

    const previewThumbnail = (() => {
        if (newVideo.thumbnail) return newVideo.thumbnail;
        const ytMatch = newVideo.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        if (ytMatch && ytMatch[1]) {
            return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
        }
        return "";
    })();

    // Show nothing until client mount to avoid hydration mismatch
    if (!isMounted || isLoading) {
        return <div className="flex items-center justify-center min-h-[60vh] bg-[#FAFAFA]"><Loader2 className="w-12 h-12 animate-spin text-[#D4F268]" /></div>;
    }

    if (!status?.isMentor) {
        const handleCheckStatus = async () => {
            setActionLoading("check");
            await loadData(user?.id);
            setActionLoading(null);
        };

        return (
            <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center p-6 text-center font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 40 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="max-w-lg w-full bg-white p-12 rounded-[3.5rem] border-2 border-zinc-100 shadow-2xl relative z-10"
                >
                    <motion.div animate={{ rotateY: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 bg-[#D4F268]/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-[#D4F268]/50 shadow-inner">
                        <Lock className="text-[#5a6d1a] w-10 h-10" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-zinc-900 mb-4 tracking-tighter">Mentor Access</h1>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-10">
                        This area is reserved for verified mentors. Apply to share your knowledge, earn revenue, and grow the community.
                    </p>

                    <div className="flex flex-col gap-4">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.location.href = "/mentorship/apply"} className="h-16 rounded-2xl bg-[#D4F268] text-zinc-900 font-black tracking-widest uppercase text-sm shadow-[0_10px_30px_rgba(212,242,104,0.4)] w-full">
                            Apply to Mentor
                        </motion.button>
                        <Button variant="ghost" onClick={handleCheckStatus} disabled={actionLoading === "check"} className="text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest text-xs h-14 w-full disabled:opacity-50">
                            {actionLoading === "check" ? <><Loader2 className="animate-spin mr-2 h-4 w-4 inline" /> Syncing</> : "Check Status"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const totalEarned = (sessions?.history?.filter((h: any) => h.status === 'completed').length || 0) * (status?.profile?.hourlyRate || 0);
    const pendingValue = (sessions?.upcoming?.length || 0) * (status?.profile?.hourlyRate || 0);

    return (
        <div className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans pb-32">
            <MentorSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentProfile={status?.profile} onSave={() => loadData(user?.id)} />
            <MentorHandbookModal isOpen={isHandbookOpen} onClose={() => setIsHandbookOpen(false)} />

            {/* Massive Gamified Dashboard Header */}
            <div className="relative w-full pt-16 pb-12 mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] bg-[#D4F268] rounded-[200px] mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" 
                />

                <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1 w-full text-center md:text-left">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="bg-[#D4F268]/20 border border-[#D4F268]/40 text-[#D4F268] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                            Dashboard Workspace
                        </motion.div>
                        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring", bounce: 0.5 }} className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
                            Command <span className="text-[#D4F268]">Center</span>
                        </motion.h1>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.5 }} className="text-zinc-400 font-medium text-lg max-w-xl leading-relaxed mb-8 md:mb-0 mx-auto md:mx-0">
                            Track your earnings, manage session requests, and publish premium video content.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                        className="relative z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 w-full md:w-auto md:min-w-[360px] shadow-2xl skew-x-[-2deg] shrink-0"
                    >
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${status.profile?.isAccepting ? "bg-[#D4F268] shadow-[0_0_15px_#D4F268] animate-pulse" : "bg-red-500 shadow-[0_0_15px_red]"}`} />
                                <span className="text-white font-black text-xs uppercase tracking-widest">{status.profile?.isAccepting ? "Accepting" : "Paused"}</span>
                            </div>
                            <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                <Settings size={18} />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            <div className="flex flex-col">
                                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">Your Rate</div>
                                <div className="flex items-center gap-2">
                                    <CurrencyCoin size="md" />
                                    <span className="text-3xl font-black text-white leading-none">{status.profile?.hourlyRate ?? 0}</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">XP Level</div>
                                <div className="flex items-center gap-2 h-[calc(1rem+28px)]">
                                    <XPLevelRing level={status?.level} xp={status?.xp} size="md" showLevelInside={false} />
                                    <span className="text-3xl font-black text-white leading-none">{status?.level ?? "?"}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col xl:flex-row gap-10">
                {/* ─── MAIN COLUMN ─── */}
                <div className="flex-1 flex flex-col gap-10 min-w-0">
                    
                    {/* Bouncing Stats Grid */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatPanel label="Total Earned" value={totalEarned.toLocaleString()} icon={<Coins size={18} />} bg="bg-[#D4F268]/20 text-[#5a6d1a] border-[#D4F268]/40" />
                        <StatPanel label="Pending Value" value={pendingValue.toLocaleString()} icon={<Coins size={18} />} bg="bg-amber-100 text-amber-700 border-amber-200" />
                        <StatPanel label="Reviews" value={sessions?.stats.reviewCount ?? 0} icon={<Users size={18} />} bg="bg-blue-100 text-blue-700 border-blue-200" />
                        <StatPanel label="Avg Rating" value={sessions?.stats.avgRating ?? "0.0"} icon={<Star size={18} className="fill-current" />} bg="bg-purple-100 text-purple-700 border-purple-200" />
                    </motion.div>

                    {/* Highly interactive Video Section */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-8 md:p-10 border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700" />
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
                            <div>
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Your Content</h2>
                                <p className="text-zinc-500 font-medium text-sm mt-1">Publish exclusive videos or link your existing YouTube library.</p>
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsAddingVideo(!isAddingVideo)} 
                                className="bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-zinc-900 px-6 h-12 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center transition-colors shadow-lg"
                            >
                                {isAddingVideo ? <><XCircle size={16} className="mr-2" /> Cancel</> : <><Plus size={16} className="mr-2" /> Publish Video</>}
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {isAddingVideo && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8 relative z-10">
                                    <div className="bg-zinc-50 border-2 border-zinc-200 p-8 rounded-[2rem] shadow-inner space-y-6">
                                        <h3 className="font-black text-xl text-zinc-900 uppercase tracking-widest">New Upload</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input type="text" placeholder="Video Title*" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                                                className="bg-white border-2 border-zinc-200 rounded-2xl px-5 h-14 text-sm font-bold outline-none focus:border-[#D4F268] focus:ring-4 focus:ring-[#D4F268]/20 transition-all shadow-sm" />
                                            <input type="text" placeholder="YouTube URL*" value={newVideo.url} onChange={e => setNewVideo({ ...newVideo, url: e.target.value })}
                                                className="bg-white border-2 border-zinc-200 rounded-2xl px-5 h-14 text-sm font-bold outline-none focus:border-[#D4F268] focus:ring-4 focus:ring-[#D4F268]/20 transition-all shadow-sm" />
                                            <input type="text" placeholder="Topic (e.g. Design)" value={newVideo.topic} onChange={e => setNewVideo({ ...newVideo, topic: e.target.value })}
                                                className="bg-white border-2 border-zinc-200 rounded-2xl px-5 h-14 text-sm font-bold outline-none focus:border-[#D4F268] focus:ring-4 focus:ring-[#D4F268]/20 transition-all shadow-sm" />
                                            <input type="text" placeholder="Custom Thumbnail URL (Optional)" value={newVideo.thumbnail} onChange={e => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                                                className="bg-white border-2 border-zinc-200 rounded-2xl px-5 h-14 text-sm font-bold outline-none focus:border-[#D4F268] focus:ring-4 focus:ring-[#D4F268]/20 transition-all shadow-sm" />
                                        </div>
                                        <textarea placeholder="Description..." value={newVideo.description} onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                                            className="w-full bg-white border-2 border-zinc-200 rounded-2xl p-5 h-32 text-sm font-bold resize-none outline-none focus:border-[#D4F268] focus:ring-4 focus:ring-[#D4F268]/20 transition-all shadow-sm" />
                                        
                                        {/* Live Preview Section */}
                                        {(newVideo.title || newVideo.url) && (
                                            <div className="pt-4 border-t-2 border-zinc-200">
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Preview Configuration</h4>
                                                <div className="flex justify-center">
                                                    <VideoItemCard 
                                                        rec={{
                                                            id: "preview",
                                                            title: newVideo.title || "Untitled Video",
                                                            topic: newVideo.topic || "General",
                                                            videoUrl: newVideo.url,
                                                            thumbnailUrl: previewThumbnail
                                                        }} 
                                                        isPreview
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <Button onClick={handlePublish} disabled={!newVideo.title || !newVideo.url || actionLoading === "publish"}
                                            className="w-full h-14 rounded-2xl bg-[#D4F268] text-zinc-900 font-black uppercase tracking-widest text-sm hover:bg-[#c4ec3e] transition-all shadow-lg hover:shadow-xl">
                                            {actionLoading === "publish" ? <Loader2 className="animate-spin" /> : "Publish to Library"}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {sessions?.published?.length === 0 ? (
                            <div className="bg-zinc-50 border-2 border-zinc-200 border-dashed rounded-[2rem] py-16 flex flex-col items-center justify-center text-center relative z-10 w-full mb-2">
                                <Video className="text-zinc-300 w-16 h-16 mb-4" />
                                <h3 className="text-xl font-black text-zinc-900 mb-1">No videos yet</h3>
                                <p className="text-zinc-500 font-medium text-sm">Upload content to attract more mentees.</p>
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-6 pb-6 pt-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-2 snap-x relative z-10">
                                {sessions?.published.map((rec: any) => (
                                    <VideoItemCard key={rec.id} rec={rec} onAction={handleAction} actionLoading={actionLoading} />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Gamified Sessions Tab Block */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-8 md:p-10 border-2 border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Mentorship Sessions</h2>
                                <p className="text-zinc-500 font-medium text-sm mt-1">Manage pipeline of incoming and active sessions.</p>
                            </div>
                            <div className="grid grid-cols-3 bg-zinc-100 p-1.5 rounded-full border border-zinc-200/50 shadow-inner w-full md:w-80 overflow-hidden relative">
                                {(["requests", "upcoming", "history"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t)}
                                        className={`px-2 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors relative z-10 whitespace-nowrap ${activeTab === t ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                                    >
                                        {t === "requests" ? `Inbox (${sessions?.pending?.length ?? 0})` : t === "upcoming" ? "Live" : "History"}
                                    </button>
                                ))}
                                <motion.div 
                                    layoutId="mentorSessionTabBg" 
                                    className="absolute inset-y-1.5 bg-white rounded-full shadow-md z-0" 
                                    style={{ width: "calc(33.333% - 4px)" }}
                                    animate={{ left: activeTab === "requests" ? "2px" : activeTab === "upcoming" ? "33.333%" : "66.666%" }}
                                    transition={{ type: "spring", bounce: 0.25, stiffness: 350, damping: 30 }}
                                />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="space-y-5"
                            >
                                {/* REQUESTS */}
                                {activeTab === "requests" && (
                                    sessions?.pending.length === 0 ? (
                                        <EmptyState icon={Clock} title="No active requests" desc="Session requests from mentees will appear here." />
                                    ) : (
                                        sessions?.pending.map((req: any) => (
                                            <SessionListItem key={req.id} req={req} actionLoading={actionLoading} onAction={handleAction} type="request" />
                                        ))
                                    )
                                )}

                                {/* UPCOMING */}
                                {activeTab === "upcoming" && (
                                    sessions?.upcoming.length === 0 ? (
                                        <EmptyState icon={Calendar} title="No upcoming sessions" desc="Accepted requests move here until marked as complete." />
                                    ) : (
                                        sessions?.upcoming.map((req: any) => (
                                            <SessionListItem key={req.id} req={req} actionLoading={actionLoading} onAction={handleAction} type="upcoming" />
                                        ))
                                    )
                                )}

                                {/* HISTORY */}
                                {activeTab === "history" && (
                                    sessions?.history.length === 0 ? (
                                        <EmptyState icon={Clock} title="No past history" desc="Completed sessions will be logged in this tab." />
                                    ) : (
                                        sessions?.history.map((req: any) => (
                                            <SessionListItem key={req.id} req={req} actionLoading={actionLoading} onAction={handleAction} type="history" />
                                        ))
                                    )
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* ─── RIGHT SIDEBAR ─── */}
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full xl:w-[380px] shrink-0 flex flex-col gap-8">
                    
                    {/* Compact Profile Card bouncing */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-8 border-2 border-zinc-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 w-full h-24 overflow-hidden">
                            {profile?.banner_url ? (
                                <img src={profile.banner_url} className="w-full h-full object-cover opacity-80" alt="Banner" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-50" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                        </div>
                        <Avatar fallback={profile?.full_name?.[0] || user?.user_metadata?.name?.[0]} src={profile?.avatar_url || user?.user_metadata?.avatar_url} className="w-28 h-28 rounded-[2rem] border-8 border-white shadow-xl mb-5 relative z-10 group-hover:scale-105 transition-transform duration-500" />
                        <h2 className="text-2xl font-black text-zinc-900 leading-tight z-10">{profile?.full_name || user?.user_metadata?.name || "Mentor"}</h2>
                        <p className="text-zinc-500 text-sm font-bold opacity-60 z-10">@{profile?.username || "mentor"}</p>
                        <div className="text-[#5a6d1a] text-xs font-black uppercase tracking-widest bg-[#D4F268]/20 px-4 py-1.5 mt-3 rounded-full flex items-center gap-2 z-10 shadow-sm">
                            <Award size={16} className="text-[#5a6d1a]" />
                            {status?.level! >= 30 ? "Elite Tier" : status?.level! >= 20 ? "Pro Tier" : status?.level! >= 10 ? "Silver Tier" : "Bronze Tier"}
                        </div>
                    </motion.div>

                    {/* Vouch Codes gamified widget */}
                    <motion.div variants={itemVariants} className="bg-zinc-900 rounded-[3rem] p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#D4F268]/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#D4F268]/30 transition-colors" />
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter">
                                <span className="bg-[#D4F268] text-zinc-900 p-2.5 rounded-2xl shadow-[0_5px_15px_rgba(212,242,104,0.4)]"><Zap size={20} className="fill-current" /></span>
                                Vouch Codes
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed relative z-10">
                            Certify new mentors by sharing these codes. Generates up to 2 unique keys daily.
                        </p>
                        
                        <AnimatePresence>
                            {newCode && (
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-[#D4F268] rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_30px_rgba(212,242,104,0.2)]">
                                    <code className="font-mono text-lg font-black text-zinc-900 tracking-wider">{newCode}</code>
                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-900 hover:bg-white/40" onClick={() => copyToClipboard(newCode)}>
                                        {copying === newCode ? <CheckCircle size={18} className="text-zinc-900" /> : <Copy size={18} />}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerateCode} disabled={actionLoading === "code"} className="w-full bg-white/10 text-white hover:bg-white/20 font-black uppercase tracking-widest text-xs h-14 rounded-2xl transition-all relative z-10">
                            {actionLoading === "code" ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Generate New Key"}
                        </motion.button>

                        <div className="space-y-3 mt-2 relative z-10">
                            {vouchCodes.slice(0, 4).map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between text-xs font-bold border-t border-white/10 pt-3">
                                    <span className="font-mono text-zinc-500 tracking-widest">{c.code}</span>
                                    <span className={c.usedAt ? "text-zinc-600 uppercase tracking-widest" : "text-[#D4F268] uppercase tracking-widest flex items-center gap-1"}>
                                        {!c.usedAt && <span className="w-1.5 h-1.5 rounded-full bg-[#D4F268] animate-pulse" />}
                                        {c.usedAt ? "Used" : "Active"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Handbook Card — rounded square, not a pill */}
                    <motion.div variants={itemVariants}>
                        <button
                            onClick={() => setIsHandbookOpen(true)}
                            className="bg-white border-2 border-zinc-100 hover:border-[#D4F268]/60 rounded-[2.5rem] p-6 w-full shadow-sm hover:shadow-xl transition-all duration-300 group text-left"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-[#D4F268]/20 border-2 border-[#D4F268]/40 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#D4F268] transition-colors">
                                    <Info size={24} className="text-[#5a6d1a] group-hover:text-zinc-900 transition-colors" />
                                </div>
                                <div>
                                    <div className="font-black text-zinc-900 text-base uppercase tracking-widest leading-tight">Mentor Handbook</div>
                                    <div className="text-zinc-400 text-xs font-medium mt-0.5">Guidelines & best practices</div>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-xs leading-relaxed font-medium mb-4">
                                Everything you need to run great sessions, grow your reputation, and earn consistently.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Open Guide</span>
                                <ArrowRight size={18} className="text-zinc-300 group-hover:text-[#5a6d1a] group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

// ─── Gamified Helper Components ───

function StatPanel({ label, value, icon, bg }: { label: string, value: string | number, icon: React.ReactNode, bg: string }) {
    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.05 }}
            className={`bg-white rounded-[2rem] p-6 border-2 border-zinc-100 shadow-sm hover:shadow-xl hover:border-zinc-200 flex flex-col gap-4 h-[150px] min-w-0 transition-all cursor-default group relative overflow-hidden`}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 rounded-full blur-[20px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Icon Row */}
            <div className={`p-2.5 rounded-2xl shrink-0 border-2 w-fit ${bg} shadow-inner relative z-10`}>
                {icon}
            </div>
            {/* Label + Value */}
            <div className="relative z-10">
                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-0.5 truncate">{label}</div>
                <div className="text-2xl font-black text-zinc-900 truncate group-hover:text-[#5a6d1a] transition-colors">{value}</div>
            </div>
        </motion.div>
    );
}

function VideoItemCard({ rec, onAction, actionLoading, isPreview }: any) {
    return (
        <motion.div 
            whileHover={{ y: -6, scale: 1.02 }}
            className="min-w-[280px] sm:min-w-[320px] w-[280px] sm:w-[320px] shrink-0 bg-white rounded-[2rem] border-2 border-zinc-100 overflow-hidden flex flex-col snap-start shadow-[0_5px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all group relative"
        >
            <div className="h-40 bg-zinc-900 relative overflow-hidden border-b-2 border-zinc-100">
                {rec.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Video className="text-zinc-600 w-12 h-12" />
                    </div>
                )}
                <div className="absolute top-3 left-3 bg-zinc-900/60 backdrop-blur-md text-[#D4F268] text-[9px] uppercase tracking-widest font-black px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-700">
                    <Video size={12} /> Published
                </div>
                {!isPreview && (
                    <motion.button 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onAction(rec.id, "delete")} 
                        disabled={actionLoading === rec.id}
                        className="absolute top-3 right-3 h-10 w-10 flex items-center justify-center bg-zinc-900/60 hover:bg-red-500 text-white hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-lg border border-zinc-700 hover:border-red-500"
                    >
                        {actionLoading === rec.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </motion.button>
                )}
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h4 className="font-black text-lg text-zinc-900 line-clamp-2 leading-snug mb-2 group-hover:text-[#5a6d1a] transition-colors">{rec.title}</h4>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-auto pb-4 truncate bg-zinc-50 w-fit px-2.5 py-1 rounded-md">{rec.topic || "General"}</p>
                <a href={rec.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black uppercase tracking-widest text-zinc-900 hover:text-[#5a6d1a] hover:bg-[#D4F268]/20 border-t-2 border-zinc-100 pt-4 flex items-center justify-between transition-colors px-2 -mx-2 rounded-b-xl">
                    View Output <LinkIcon size={14} />
                </a>
            </div>
        </motion.div>
    );
}

function SessionListItem({ req, actionLoading, onAction, type }: { req: any, actionLoading: string | null, onAction: any, type: "request" | "upcoming" | "history" }) {
    const isHistory = type === "history";
    return (
        <motion.div 
            whileHover={{ scale: 1.01, x: 2 }}
            className={`p-6 rounded-[2rem] border-2 ${isHistory ? 'bg-zinc-50 border-transparent hover:border-zinc-200' : 'bg-white border-zinc-100 hover:shadow-lg'} flex flex-col md:flex-row gap-6 md:items-center transition-all shadow-sm`}
        >
            {/* Avatar & Info */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
                <Avatar src={req.mentorAvatar} fallback={req.mentorName[0]} className="w-16 h-16 rounded-[1.5rem] border-4 border-zinc-50 shadow-md shrink-0" />
                <div className="min-w-0">
                    <h3 className="text-lg font-black text-zinc-900 truncate mb-1">{req.mentorName}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest bg-white border border-zinc-100 px-2.5 py-1 rounded-md">
                            {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                        </span>
                        {isHistory && (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${req.status === "completed" ? "bg-[#D4F268]/20 text-[#5a6d1a] border border-[#D4F268]/40" : "bg-red-100 text-red-700 border border-red-200"}`}>
                                {req.status}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Preview */}
            <div className={`md:w-1/3 min-w-0 rounded-2xl p-4 border-2 ${isHistory ? 'bg-white border-zinc-100' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="font-black text-zinc-900 text-sm mb-1 truncate">{req.topic}</div>
                {req.message && <p className="text-zinc-500 text-xs font-medium line-clamp-1">{req.message}</p>}
            </div>

            {/* Actions Gamified */}
            <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0 justify-end md:shrink-0">
                {type === "request" && (
                    <>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAction(req.id, "decline")} disabled={actionLoading === req.id}
                            className="h-12 px-6 rounded-2xl text-zinc-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-2 border-zinc-200 bg-white transition-colors text-[11px] font-black uppercase tracking-widest w-full sm:w-auto shadow-sm">
                            Decline
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAction(req.id, "accept")} disabled={actionLoading === req.id}
                            className="h-12 px-8 rounded-2xl bg-[#D4F268] text-zinc-900 text-[11px] font-black uppercase tracking-widest shadow-[0_8px_20px_rgba(212,242,104,0.3)] transition-all hover:bg-[#c4ec3e] w-full sm:w-auto">
                            {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : "Accept"}
                        </motion.button>
                    </>
                )}
                {type === "upcoming" && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAction(req.id, "complete")} disabled={actionLoading === req.id}
                        className="h-12 px-8 rounded-2xl bg-zinc-900 text-white text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-[#D4F268] hover:text-zinc-900 transition-all w-full sm:w-auto text-center justify-center flex items-center">
                        {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : "Finalize Session"}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

function EmptyState({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-20 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-[2.5rem] border-2 border-zinc-100 border-dashed">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mb-6 border border-zinc-200">
                <Icon className="text-zinc-300 w-10 h-10" />
            </motion.div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">{title}</h3>
            <p className="text-zinc-500 font-medium text-sm max-w-xs leading-relaxed">{desc}</p>
        </motion.div>
    );
}
