"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Plus, Upload, XCircle, CheckCircle, Clock, Calendar, Video, Star, Users, Zap, Award, Copy, Check, Info, Settings, Trash2, ExternalLink, Link as LinkIcon, Loader2 } from "lucide-react";
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

export default function MentorDashboardPage() {
    const { user } = useUser(); // Get user from browser client (goes through proxy)

    const { data: dashboardData, isLoading, mutate } = useSWR(
        user?.id ? ['mentorDashboard', user.id] : null,
        fetchMentorDashboardData as any,
        {
            revalidateOnFocus: false
        }
    );

    const status = dashboardData?.status || null;
    const sessions = dashboardData?.sessions || null;
    const vouchCodes = dashboardData?.vouchCodes || [];

    // UI State
    const [activeTab, setActiveTab] = useState<"requests" | "upcoming" | "history">("requests");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHandbookOpen, setIsHandbookOpen] = useState(false);
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [newVideo, setNewVideo] = useState({ title: "", topic: "", description: "", url: "", thumbnail: "", premiereAt: "" });
    const [newCode, setNewCode] = useState<string | null>(null);
    const [copying, setCopying] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadData = async (uid?: string) => {
        // Now handled by SWR
        mutate();
    };


    const handleAction = async (id: string, action: "accept" | "decline" | "complete" | "delete") => {
        setActionLoading(id);
        try {
            if (action === "complete") {
                await markSessionCompleted(id);
            } else if (action === "delete") {
                await deleteMentorVideo(id);
            } else {
                await handleSessionRequest(id, action);
            }
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
        } catch (err: any) {
            alert(err.message);
        }
        setActionLoading(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopying(text);
        setTimeout(() => setCopying(null), 2000);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>;
    }

    // LOCKED STATE
    if (!status?.isMentor) {
        const handleCheckStatus = async () => {
            setActionLoading("check");
            console.log("=== CHECK STATUS TRIGGERED ===");
            console.log("Current user from context:", user);
            await loadData(user?.id);
            setActionLoading(null);
        };

        return (
            <div className="bg-zinc-900 min-h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4F268]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white/5 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative z-10">
                    <div className="w-20 h-20 bg-[#D4F268] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(212,242,104,0.3)]">
                        <Lock className="text-black w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4">Dashboard Locked</h1>
                    <p className="text-zinc-400 font-medium mb-6 leading-relaxed">
                        This area is reserved for verified mentors. Apply to share your knowledge and grow the community.
                    </p>

                    {/* Status diagnostic — shows current values from DB */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-8 text-left space-y-1.5">
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Current Status</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400 font-medium">Mentor flag</span>
                            <span className={`font-black ${status?.isMentor ? "text-[#D4F268]" : "text-red-400"}`}>
                                {status?.isMentor ? "✓ TRUE" : "✗ FALSE"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400 font-medium">Level</span>
                            <span className="text-white font-black">{status?.level ?? "?"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400 font-medium">XP</span>
                            <span className="text-white font-black">{status?.xp ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400 font-medium">User ID</span>
                            <span className="text-zinc-500 font-mono text-[10px] truncate max-w-[140px]">{user?.id ?? "not loaded"}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={() => window.location.href = "/mentorship/apply"} className="h-16 rounded-2xl bg-[#D4F268] text-black font-black text-lg hover:scale-[1.02] transition-transform">
                            Become a Mentor
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleCheckStatus}
                            disabled={actionLoading === "check"}
                            className="text-zinc-500 hover:text-white font-bold h-12 disabled:opacity-50"
                        >
                            {actionLoading === "check"
                                ? <><Loader2 className="animate-spin mr-2 h-4 w-4 inline" /> Checking...</>
                                : "↻ Check Status Again"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFAFA] min-h-full pb-24">
            <MentorSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentProfile={status?.profile}
                onSave={() => loadData(user?.id)}
            />
            <MentorHandbookModal isOpen={isHandbookOpen} onClose={() => setIsHandbookOpen(false)} />
            {/* Header */}
            <header className="bg-zinc-900 text-white px-6 pt-12 pb-24 rounded-b-[2.5rem] relative overflow-hidden shrink-0">
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#D4F268]/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="px-3 py-1 bg-[#D4F268] text-black text-[10px] font-black uppercase tracking-wider rounded-full w-fit mb-3">
                            Verified Mentor
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            Mentor <span className="text-[#D4F268]">Dashboard</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-zinc-500 mb-0.5">Availability</div>
                            <div className="text-white font-bold flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${status.profile?.isAccepting ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`} />
                                {status.profile?.isAccepting ? "Accepting Sessions" : "Currently Paused"}
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsSettingsOpen(true)}
                            size="icon"
                            className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/5"
                        >
                            <Settings size={20} />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="Total Content" value={sessions?.stats.sessions || "0"} icon={Video} color="bg-blue-500" />
                    <StatCard label="Review Count" value={sessions?.stats.reviewCount || "0"} icon={Users} color="bg-purple-500" />
                    <StatCard label="Avg Rating" value={sessions?.stats.avgRating || "0.0"} icon={Star} color="bg-amber-400" />
                    <StatCard
                        label="Mentor Tier"
                        value={
                            status?.level! >= 30 ? "Elite" :
                                status?.level! >= 20 ? "Pro" :
                                    status?.level! >= 10 ? "Silver" : "Bronze"
                        }
                        icon={Zap}
                        color="bg-[#D4F268]"
                        textColor="text-black"
                    />
                    <StatCard
                        label="Total Earned"
                        value={`${(sessions?.history?.filter((h: any) => h.status === 'completed').length || 0) * (status?.profile?.hourlyRate || 0)}`}
                        icon={CurrencyCoin}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        label="Pending Value"
                        value={`${(sessions?.upcoming?.length || 0) * (status?.profile?.hourlyRate || 0)}`}
                        icon={Clock}
                        color="bg-zinc-800"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Area */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Session Requests */}
                        <section className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                                <h2 className="text-2xl font-black text-zinc-900">Sessions</h2>
                                <div className="flex bg-zinc-100/50 p-1.5 rounded-2xl">
                                    <button
                                        onClick={() => setActiveTab("requests")}
                                        className={`px-5 py-2.5 rounded-[14px] font-bold text-sm transition-all duration-200 ${activeTab === "requests" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
                                    >
                                        Requests {sessions?.pending?.length! > 0 && <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "requests" ? "bg-red-500 text-white" : "bg-red-500/20 text-red-600"}`}>{sessions?.pending.length}</span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("upcoming")}
                                        className={`px-5 py-2.5 rounded-[14px] font-bold text-sm transition-all duration-200 ${activeTab === "upcoming" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
                                    >
                                        Upcoming {sessions?.upcoming?.length! > 0 && `(${sessions?.upcoming.length})`}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("history")}
                                        className={`px-5 py-2.5 rounded-[14px] font-bold text-sm transition-all duration-200 ${activeTab === "history" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* REQUESTS TAB */}
                                {activeTab === "requests" && (
                                    sessions?.pending.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[2.5rem] border border-zinc-100 text-center text-zinc-400">
                                            <Clock size={48} className="mx-auto mb-4 opacity-10" />
                                            <p className="font-bold">No pending requests.</p>
                                        </div>
                                    ) : (
                                        sessions?.pending.map((req: any) => (
                                            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <Avatar src={req.mentorAvatar} fallback={req.mentorName[0]} className="w-14 h-14 rounded-2xl border-2 border-zinc-50" />
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-black text-zinc-900 truncate">{req.mentorName}</h3>
                                                        <div className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full md:w-auto bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                                    <div className="font-bold text-zinc-900 text-sm mb-1 line-clamp-1">{req.topic}</div>
                                                    <p className="text-zinc-500 text-xs line-clamp-2">{req.message}</p>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <Button onClick={() => handleAction(req.id, "decline")} disabled={actionLoading === req.id}
                                                        variant="ghost" className="h-12 w-12 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50">
                                                        <XCircle size={24} />
                                                    </Button>
                                                    <Button onClick={() => handleAction(req.id, "accept")} disabled={actionLoading === req.id}
                                                        className="h-12 w-12 rounded-xl bg-[#D4F268] text-black hover:scale-105 transition-transform">
                                                        {actionLoading === req.id ? <Loader2 className="animate-spin" /> : <CheckCircle size={24} />}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )
                                )}

                                {/* UPCOMING TAB */}
                                {activeTab === "upcoming" && (
                                    sessions?.upcoming.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[2.5rem] border border-zinc-100 text-center text-zinc-400">
                                            <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                                            <p className="font-bold">No upcoming sessions.</p>
                                        </div>
                                    ) : (
                                        sessions?.upcoming.map((req: any) => (
                                            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <Avatar src={req.mentorAvatar} fallback={req.mentorName[0]} className="w-14 h-14 rounded-full border-2 border-zinc-50" />
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-black text-zinc-900 truncate">{req.mentorName}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Accepted</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full md:w-auto bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                                    <div className="font-bold text-zinc-900 text-sm mb-1">{req.topic}</div>
                                                    <p className="text-zinc-500 text-xs line-clamp-2">{req.message}</p>
                                                </div>
                                                <div className="flex w-full md:w-auto">
                                                    <Button onClick={() => handleAction(req.id, "complete")} disabled={actionLoading === req.id}
                                                        className="h-12 w-full md:w-auto px-6 rounded-xl bg-zinc-900 text-white hover:bg-black transition-colors font-bold whitespace-nowrap">
                                                        {actionLoading === req.id ? <Loader2 className="animate-spin mr-2 h-4 w-4 inline" /> : <CheckCircle size={18} className="mr-2 inline" />}
                                                        Mark Done
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )
                                )}

                                {/* HISTORY TAB */}
                                {activeTab === "history" && (
                                    sessions?.history.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[2.5rem] border border-zinc-100 text-center text-zinc-400">
                                            <Clock size={48} className="mx-auto mb-4 opacity-10" />
                                            <p className="font-bold">No past sessions.</p>
                                        </div>
                                    ) : (
                                        sessions?.history.map((req: any) => (
                                            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="bg-zinc-50 p-6 rounded-[2.5rem] border border-zinc-100/50 flex flex-col md:flex-row items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <Avatar src={req.mentorAvatar} fallback={req.mentorName[0]} className="w-12 h-12 rounded-full border-2 border-white" />
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-bold text-zinc-900 truncate">{req.mentorName}</h3>
                                                        <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full md:w-auto">
                                                    <div className="font-bold text-zinc-700 text-sm mb-1 truncate">{req.topic}</div>
                                                </div>
                                                <div className="w-full md:w-auto min-w-[100px] text-right">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${req.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                                        "bg-red-100 text-red-700"
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))
                                    )
                                )}
                            </div>
                        </section>

                        {/* Video Content */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-zinc-900">Your Content</h2>
                                <Button onClick={() => setIsAddingVideo(!isAddingVideo)} variant="ghost"
                                    className="h-11 px-5 rounded-2xl bg-zinc-100 text-zinc-600 hover:text-black font-bold">
                                    {isAddingVideo ? <XCircle size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                                    {isAddingVideo ? "Cancel" : "Add Video"}
                                </Button>
                            </div>

                            <AnimatePresence>
                                {isAddingVideo && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-6">
                                        <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white space-y-4">
                                            <h3 className="font-black text-xl mb-4 text-[#D4F268]">Publish Public Content</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input type="text" placeholder="Video Title*" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                                                    className="bg-white/10 border border-white/10 rounded-2xl px-5 h-14 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4F268]" />
                                                <input type="text" placeholder="YouTube URL*" value={newVideo.url} onChange={e => setNewVideo({ ...newVideo, url: e.target.value })}
                                                    className="bg-white/10 border border-white/10 rounded-2xl px-5 h-14 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4F268]" />
                                                <input type="text" placeholder="Topic (e.g. System Design)" value={newVideo.topic} onChange={e => setNewVideo({ ...newVideo, topic: e.target.value })}
                                                    className="bg-white/10 border border-white/10 rounded-2xl px-5 h-14 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4F268]" />
                                                <input type="text" placeholder="Thumbnail URL (Optional - Auto-extracted if left blank)" value={newVideo.thumbnail} onChange={e => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                                                    className="bg-white/10 border border-white/10 rounded-2xl px-5 h-14 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4F268] col-span-1 md:col-span-2" />
                                            </div>

                                            {/* Live YouTube Preview */}
                                            {(() => {
                                                const ytMatch = newVideo.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                                                const vidId = ytMatch ? ytMatch[1] : null;
                                                const thumbToUse = newVideo.thumbnail || (vidId ? `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg` : null);

                                                // Only show preview if we have a URL to show
                                                if (!thumbToUse && !newVideo.url) return null;

                                                return (
                                                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center relative">
                                                        {thumbToUse ? (
                                                            <img
                                                                src={thumbToUse}
                                                                alt="Video Preview"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback if maxresdefault doesn't exist for this specific video
                                                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-zinc-500 font-bold text-sm tracking-widest uppercase">Invalid YouTube URL</span>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            <textarea placeholder="Description..." value={newVideo.description} onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                                                className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 h-32 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D4F268] resize-none" />
                                            <Button onClick={handlePublish} disabled={!newVideo.title || !newVideo.url || actionLoading === "publish"}
                                                className="w-full h-14 rounded-2xl bg-[#D4F268] text-black font-black text-lg hover:bg-[#c3e059] transition-all">
                                                {actionLoading === "publish" ? <Loader2 className="animate-spin" /> : "Publish to Library"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sessions?.published.map((rec: any) => (
                                    <div key={rec.id} className="bg-white p-5 rounded-[2.5rem] border border-zinc-100 flex items-start gap-4 group hover:border-[#D4F268] transition-colors relative">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-50 flex items-center justify-center shrink-0 group-hover:bg-[#D4F268]/20 transition-colors">
                                            <Video size={24} className="text-zinc-400 group-hover:text-black" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-black text-zinc-900 truncate pr-8">{rec.title}</h4>
                                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">{rec.topic || "General"}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <a href={rec.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-[#5a6d1a] hover:underline flex items-center gap-1">
                                                    <LinkIcon size={12} /> VIEW LINK
                                                </a>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleAction(rec.id, "delete")}
                                            disabled={actionLoading === rec.id}
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {actionLoading === rec.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">
                        {/* Ratings Overview */}
                        {sessions?.stats?.reviewCount > 0 && (
                            <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm space-y-6">
                                <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                    <Star size={22} className="text-amber-400 fill-amber-400" />
                                    Ratings Overview
                                </h3>

                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map(stars => {
                                        const count = sessions?.stats?.ratingDistribution?.[stars] || 0;
                                        const total = sessions?.stats?.reviewCount || 1;
                                        const percent = (count / total) * 100;
                                        return (
                                            <div key={stars} className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center gap-1 w-8 font-black text-zinc-700">
                                                    {stars} <Star size={12} className="text-amber-400 fill-amber-400" />
                                                </div>
                                                <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                                                </div>
                                                <div className="w-8 text-right font-black text-zinc-400">{count}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {sessions?.stats?.recentReviews?.length > 0 && (
                                    <div className="pt-4 border-t border-zinc-100 space-y-4">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recent Reviews</h4>
                                        {sessions?.stats?.recentReviews?.slice(0, 3).map((rev: any, i: number) => (
                                            <div key={i} className="bg-zinc-50 p-4 rounded-2xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar src={rev.reviewerAvatar} fallback={rev.reviewerName?.[0] || "?"} className="w-6 h-6 rounded-md" />
                                                        <span className="font-bold text-xs text-zinc-900 truncate max-w-[100px]">{rev.reviewerName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star size={10} className="text-amber-400 fill-amber-400" />
                                                        <span className="font-black text-xs text-zinc-700">{rev.rating}.0</span>
                                                    </div>
                                                </div>
                                                {rev.comment ? (
                                                    <p className="text-zinc-500 text-xs italic line-clamp-3">"{rev.comment}"</p>
                                                ) : (
                                                    <p className="text-zinc-400 text-xs italic">No text provided.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Vouch Codes */}
                        <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm space-y-6">
                            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                <Award size={22} className="text-[#D4F268]" />
                                Vouch Codes
                            </h3>
                            <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                                Share these codes to certify new mentors. You can generate up to 2 per day.
                            </p>

                            {newCode && (
                                <div className="bg-[#D4F268]/20 p-4 rounded-2xl border-2 border-dashed border-[#D4F268] animate-in zoom-in duration-300">
                                    <div className="text-[10px] font-black text-[#5a6d1a] mb-1">NEW CODE GENERATED:</div>
                                    <div className="flex items-center justify-between">
                                        <code className="text-lg font-black tracking-widest">{newCode}</code>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-black" onClick={() => copyToClipboard(newCode)}>
                                            {copying === newCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button onClick={handleGenerateCode} disabled={actionLoading === "code"}
                                className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-black transition-all">
                                {actionLoading === "code" ? <Loader2 className="animate-spin" /> : "Generate New Code"}
                            </Button>

                            <div className="space-y-3 pt-2">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Recent Codes</h4>
                                {vouchCodes.length === 0 ? (
                                    <p className="text-zinc-300 text-[10px] font-bold italic">No codes generated yet.</p>
                                ) : (
                                    vouchCodes.slice(0, 5).map((c: any) => (
                                        <div key={c.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                                            <code className="text-xs font-black tracking-wider text-zinc-600">{c.code}</code>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold ${c.usedAt ? "text-zinc-300" : "text-green-600"}`}>
                                                    {c.usedAt ? "USED" : "ACTIVE"}
                                                </span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(c.code)}>
                                                    {copying === c.code ? <CheckCircle size={12} /> : <Copy size={12} />}
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Guide Card */}
                        <div className="bg-zinc-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4F268]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="font-black text-lg mb-4">Mentor Guidelines</h3>
                            <ul className="space-y-4 text-xs font-medium text-zinc-400 list-inside marker:text-[#D4F268]">
                                <li>Content must be related to tech/growth.</li>
                                <li>Videos should be public or unlisted.</li>
                                <li>Respond to requests within 48h if possible.</li>
                            </ul>
                            <Button
                                onClick={() => setIsHandbookOpen(true)}
                                variant="ghost"
                                className="w-full mt-8 text-zinc-500 hover:text-white hover:bg-white/5 font-bold h-12 rounded-xl flex items-center justify-center gap-2 border border-white/5"
                            >
                                <ExternalLink size={16} /> Full Handbook
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, textColor = "text-white" }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-900/5 flex flex-col items-center justify-center text-center">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 ${textColor} shadow-lg`}>
                {Icon ? <Icon size={20} strokeWidth={2.5} /> : <CurrencyCoin size="sm" />}
            </div>
            <div className="text-3xl font-black text-zinc-900 mb-1">{value}</div>
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</div>
        </motion.div>
    );
}
