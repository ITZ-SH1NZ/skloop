"use client";

import { useState, useEffect } from "react";
import { Play, Clock, Star, Video, CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { getMySessionsAsMentee, submitReview, markSessionCompletedByMentee, type MentorSession } from "@/actions/mentorship-actions";

export default function MySessionsPage() {
    const [activeTab, setActiveTab] = useState<"pending" | "library">("pending");
    const [sessions, setSessions] = useState<MentorSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        getMySessionsAsMentee().then(data => {
            setSessions(data);
            setIsLoading(false);
        });
    }, []);

    const pending = sessions.filter(s => s.status === "pending" || s.status === "accepted");
    const library = sessions.filter(s => s.status === "published" || s.status === "completed");
    const displayed = activeTab === "pending" ? pending : library;

    const handleSubmitReview = async (sessionId: string) => {
        if (!rating) return;
        setIsSubmittingReview(true);
        try {
            await submitReview(sessionId, rating, comment);
            setReviewingId(null);
            setRating(0);
            setComment("");
        } catch { }
        setIsSubmittingReview(false);
    };

    return (
        <div className="bg-[#FAFAFA] min-h-full">
            {/* Header */}
            <div className="bg-zinc-900 px-6 py-10 md:px-10 md:py-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4F268]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <span className="px-3 py-1 bg-[#D4F268] text-black text-xs font-black uppercase tracking-wider rounded-full">Member Pass</span>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-3 mb-3">
                        My <span className="text-[#D4F268]">Sessions</span>
                    </h1>
                    <p className="text-zinc-400 font-medium text-base max-w-xl">
                        Track your mentorship requests and watch video responses from your mentors.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mt-8">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[130px]">
                            <div className="text-zinc-400 text-xs font-bold uppercase mb-1">Requests</div>
                            <div className="text-3xl font-black text-white">{pending.length}</div>
                        </div>
                        <div className="bg-[#D4F268] p-4 rounded-2xl min-w-[130px] shadow-[0_0_20px_rgba(212,242,104,0.3)]">
                            <div className="text-black/60 text-xs font-bold uppercase mb-1">Completed</div>
                            <div className="text-3xl font-black text-black">{library.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8 md:px-10 pb-32 max-w-5xl mx-auto">
                {/* Tabs */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center p-1.5 bg-white rounded-full border border-zinc-200 shadow-sm">
                        {(["pending", "library"] as const).map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className={`px-8 py-3 rounded-full text-sm font-bold transition-all relative ${activeTab === t ? "text-black" : "text-zinc-500 hover:text-zinc-800"}`}>
                                {activeTab === t && (
                                    <motion.div layoutId="sessionPill" className="absolute inset-0 bg-[#D4F268] rounded-full shadow-sm" transition={{ type: "spring", bounce: 0.2 }} />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {t === "pending" ? "In Progress" : "Video Library"}
                                    {t === "pending" && pending.length > 0 && (
                                        <span className="bg-black text-[#D4F268] text-[10px] px-1.5 py-0.5 rounded-full">{pending.length}</span>
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                        {isLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
                        ) : displayed.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[2rem] border border-zinc-100">
                                <Video size={40} className="mx-auto text-zinc-200 mb-4" />
                                <p className="text-zinc-500 font-medium">
                                    {activeTab === "pending" ? "No active requests." : "No videos in your library yet."}
                                </p>
                            </div>
                        ) : activeTab === "pending" ? (
                            <div className="space-y-4">
                                {displayed.map(session => (
                                    <div key={session.id} className="bg-white rounded-[2rem] p-6 md:p-8 border border-zinc-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem] ${session.status === "accepted" ? "bg-[#D4F268]" : "bg-zinc-100"}`} />
                                        <div className="flex flex-col md:flex-row gap-6 pl-4">
                                            <div className="flex items-center gap-4 shrink-0">
                                                <Avatar src={session.mentorAvatar} fallback={session.mentorName.slice(0, 2).toUpperCase()} className="w-14 h-14 rounded-2xl border-4 border-white shadow-md" />
                                                <div>
                                                    <div className="font-bold text-zinc-900 text-sm">{session.mentorName}</div>
                                                    <div className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${session.status === "accepted" ? "text-amber-600" : "text-zinc-400"}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${session.status === "accepted" ? "bg-amber-500 animate-pulse" : "bg-zinc-300"}`} />
                                                        {session.status === "accepted" ? "In Progress" : "Pending"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 border-l border-dashed border-zinc-100 pl-0 md:pl-6">
                                                <h3 className="text-xl font-black text-zinc-900 mb-2">{session.title}</h3>
                                                {session.message && <p className="text-zinc-500 text-sm leading-relaxed font-medium">{session.message}</p>}
                                                <div className="text-xs font-medium text-zinc-400 mt-3">Sent {new Date(session.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {displayed.map(session => (
                                    <div key={session.id}>
                                        <SessionVideoCard
                                            session={session}
                                            onRate={() => setReviewingId(session.id)}
                                            onComplete={async () => {
                                                const res = await markSessionCompletedByMentee(session.id);
                                                if (res.success) {
                                                    setSessions(await getMySessionsAsMentee());
                                                }
                                            }}
                                            isActive={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewingId && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setReviewingId(null)} />
                        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                                className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
                                <h3 className="text-2xl font-black text-zinc-900 mb-2">Rate this session</h3>
                                <p className="text-zinc-500 text-sm mb-6">Your feedback helps mentors improve</p>

                                <div className="flex gap-2 mb-6 justify-center">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} onClick={() => setRating(s)}
                                            className={`w-12 h-12 rounded-2xl text-2xl transition-all ${s <= rating ? "bg-[#D4F268] scale-110" : "bg-zinc-50 hover:bg-zinc-100"}`}>
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <textarea value={comment} onChange={e => setComment(e.target.value)}
                                    placeholder="Share your thoughts... (optional)"
                                    className="w-full border border-zinc-200 rounded-2xl p-4 text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-[#D4F268] mb-4 h-24" />

                                <div className="flex gap-3">
                                    <Button onClick={() => setReviewingId(null)} variant="ghost" className="flex-1 rounded-xl font-bold text-zinc-500">Cancel</Button>
                                    <Button onClick={() => handleSubmitReview(reviewingId)} disabled={!rating || isSubmittingReview}
                                        className="flex-1 rounded-xl bg-zinc-900 text-white font-bold hover:bg-[#D4F268] hover:text-black transition-colors">
                                        {isSubmittingReview ? <Loader2 size={16} className="animate-spin" /> : "Submit"}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function SessionVideoCard({ session, onRate, onComplete, isActive }: { session: MentorSession; onRate: () => void; onComplete?: () => void; isActive?: boolean }) {
    const [showEmbed, setShowEmbed] = useState(false);
    const ytId = extractYouTubeId(session.videoUrl || "");

    return (
        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col overflow-hidden">
            <div className="aspect-video bg-zinc-900 relative overflow-hidden rounded-t-[2rem] group/embed">
                {showEmbed && ytId ? (
                    <>
                        {/* Top overlay to block "Watch later", "Share", and Title links */}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 hidden group-hover/embed:block" onClick={(e) => e.stopPropagation()} />

                        {/* Bottom right overlay to block the "YouTube" logo link */}
                        <div className="absolute bottom-0 right-0 w-24 h-12 bg-transparent z-10" onClick={(e) => e.stopPropagation()} />

                        <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" />
                    </>
                ) : (
                    <>
                        {session.thumbnailUrl
                            ? <img src={session.thumbnailUrl} alt={session.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            : <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />
                        }
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => ytId ? setShowEmbed(true) : window.open(session.videoUrl, "_blank")}
                                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                <Play size={20} className="text-zinc-900 fill-zinc-900 ml-1" />
                            </button>
                        </div>
                    </>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Avatar src={session.mentorAvatar} fallback={session.mentorName.slice(0, 2).toUpperCase()} className="w-7 h-7 rounded-full border border-white/30" />
                    <span className="text-white text-xs font-bold">{session.mentorName}</span>
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-zinc-900 text-base leading-tight mb-1 line-clamp-2">{session.title}</h3>
                {session.topic && <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">{session.topic}</p>}
                <div className="flex items-center gap-3 mt-auto flex-wrap">
                    <Button className="flex-1 rounded-xl bg-zinc-900 text-white font-bold hover:bg-[#D4F268] hover:text-black transition-colors text-sm"
                        onClick={() => ytId ? setShowEmbed(true) : window.open(session.videoUrl, "_blank")}
                        disabled={!session.videoUrl}>
                        <Play size={14} className="mr-1.5" /> Watch
                    </Button>
                    <Button variant="outline" className="rounded-xl font-bold border-zinc-200 text-sm flex-1 md:flex-none" onClick={onRate}>
                        <Star size={14} className="mr-1.5" /> Rate
                    </Button>
                    {isActive && session.videoUrl && (
                        <Button className="rounded-xl font-bold bg-[#D4F268] text-black hover:bg-[#c2e252] text-sm w-full mt-2 md:mt-0" onClick={onComplete}>
                            <CheckCircle2 size={14} className="mr-1.5" /> Mark as Watched
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] ?? null;
}
