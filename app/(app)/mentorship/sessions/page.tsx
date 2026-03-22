"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { Video, Loader2, Clock, Calendar, MessageSquare, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { submitReview, markSessionCompletedByMentee } from "@/actions/mentorship-actions";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { fetchMySessionsAsMentee } from "@/lib/swr-fetchers";
import { useLoading } from "@/components/LoadingProvider";

// Dynamically import heavy components
const SessionVideoCard = dynamic(() => import("@/components/mentorship/SessionVideoCard").then(m => m.SessionVideoCard), {
    ssr: false,
    loading: () => <div className="h-72 bg-white animate-pulse rounded-[2rem] border-2 border-zinc-100" />
});

// Stagger variants for the lists
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { type: "spring", stiffness: 350, damping: 25 }
    }
};

const PendingSessionCard = memo(({ session }: { session: any }) => {
    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -4 }}
            className="bg-white rounded-[2rem] p-6 border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-zinc-200 transition-all duration-300 group relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center"
        >
            {/* Left Status Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500 ${session.status === "accepted" ? "bg-[#D4F268]" : "bg-zinc-200 group-hover:bg-zinc-300"}`} />
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-zinc-100 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-5 shrink-0 pl-4 relative z-10">
                <Avatar src={session.mentorAvatar} fallback={session.mentorName.slice(0, 2).toUpperCase()} className="w-16 h-16 rounded-2xl border-4 border-zinc-50 shadow-md group-hover:shadow-lg transition-shadow" />
                <div>
                    <div className="font-extrabold text-xl text-zinc-900 leading-tight mb-1">{session.mentorName}</div>
                    <div className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 ${session.status === "accepted" ? "text-[#5a6d1a] bg-[#D4F268]/20 px-2 py-0.5 rounded-md" : "text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${session.status === "accepted" ? "bg-[#D4F268] animate-pulse shadow-[0_0_8px_#D4F268]" : "bg-zinc-400"}`} />
                        {session.status === "accepted" ? "In Progress" : "Pending Approval"}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-zinc-50/80 group-hover:bg-zinc-50 rounded-2xl p-5 border border-zinc-100 transition-colors relative z-10">
                <h3 className="text-base font-extrabold text-zinc-900 mb-1.5 leading-snug">{session.title}</h3>
                {session.message ? (
                    <p className="text-zinc-500 text-sm leading-relaxed font-medium line-clamp-2">{session.message}</p>
                ) : (
                    <p className="text-zinc-400 italic text-sm">No additional message provided.</p>
                )}
            </div>

            <div className="flex flex-col items-end shrink-0 text-right min-w-[120px] relative z-10 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Requested</div>
                <div className="text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
                    {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
        </motion.div>
    );
});
PendingSessionCard.displayName = "PendingSessionCard";

export default function MySessionsPage() {
    const { isLoading: isGlobalLoading } = useLoading();
    const [activeTab, setActiveTab] = useState<"pending" | "library">("pending");

    const { data: sessions = [], isLoading, mutate } = useSWR(
        ['mySessionsAsMentee'],
        fetchMySessionsAsMentee as any,
        {
            revalidateOnFocus: false
        }
    );

    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const { pending, library } = useMemo(() => ({
        pending: sessions.filter((s: any) => s.status === "pending" || s.status === "accepted"),
        library: sessions.filter((s: any) => s.status === "published" || s.status === "completed")
    }), [sessions]);

    const displayed = activeTab === "pending" ? pending : library;

    const handleSubmitReview = async (sessionId: string) => {
        if (!rating) return;
        setIsSubmittingReview(true);
        try {
            await submitReview(sessionId, rating, comment);
            setReviewingId(null);
            setRating(0);
            setComment("");
            mutate();
        } catch { }
        setIsSubmittingReview(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={isGlobalLoading ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#FAFAFA] min-h-screen font-sans"
        >
            {/* Header Area */}
            <div className="px-6 md:px-10 pt-10 pb-8 max-w-[1200px] mx-auto">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="bg-zinc-900 rounded-[3rem] p-10 md:p-14 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl"
                >
                    {/* Background Gamified Animations */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#D4F268]/30 to-transparent rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" 
                    />
                    
                    <div className="relative z-10 text-white max-w-xl w-full">
                        <motion.span 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="px-4 py-1.5 bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 inline-block"
                        >
                            Mentee Workspace
                        </motion.span>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none drop-shadow-md">
                            My Mentorship
                        </h1>
                        <p className="text-zinc-400 font-medium text-base md:text-lg leading-relaxed max-w-md">
                            A centralized hub to track active session requests and build your permanent video library.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-4 shrink-0 w-full md:w-auto">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] flex-1 md:w-[160px] flex flex-col items-center justify-center text-center shadow-lg"
                        >
                            <div className="text-zinc-400 text-[11px] font-black uppercase tracking-widest mb-1.5">Active</div>
                            <div className="text-5xl font-black text-white">{pending.length}</div>
                        </motion.div>
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="bg-[#D4F268] p-6 rounded-[2rem] flex-1 md:w-[160px] flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(212,242,104,0.3)]"
                        >
                            <div className="text-[#5a6d1a] text-[11px] font-black uppercase tracking-widest mb-1.5">Videos</div>
                            <div className="text-5xl font-black text-zinc-900">{library.length}</div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <div className="px-6 md:px-10 pb-32 max-w-[1200px] mx-auto">
                
                {/* Clean Animated Segmented Control */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight hidden md:block">
                        {activeTab === "pending" ? "In Progress" : "Video Library"}
                    </h2>
                    
                    <div className="flex bg-white p-2 rounded-full border border-zinc-200 shadow-sm w-full md:w-auto relative">
                        {(["pending", "library"] as const).map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className={`flex-1 md:flex-none px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-widest transition-colors relative z-10 ${activeTab === t ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {t === "pending" ? <Clock size={18}/> : <PlayCircle size={18}/>}
                                    {t === "pending" ? "Active Requests" : "Video Library"}
                                </span>
                            </button>
                        ))}
                        <motion.div 
                            layoutId="sessionTabBgPill" 
                            className="absolute inset-y-2 bg-zinc-100 rounded-full"
                            style={{ width: "calc(50% - 16px)" }}
                            animate={{ left: activeTab === "pending" ? "8px" : "calc(50% + 8px)" }}
                            transition={{ type: "spring", bounce: 0.3, stiffness: 300, damping: 25 }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }} 
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {isLoading ? (
                            <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-[#D4F268]" /></div>
                        ) : displayed.length === 0 ? (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-zinc-100/80 border-dashed shadow-sm text-center"
                            >
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }} 
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-24 h-24 bg-zinc-50 rounded-3xl flex items-center justify-center mb-8 border border-zinc-100 shadow-inner"
                                >
                                    {activeTab === "pending" ? <MessageSquare className="text-zinc-300 w-10 h-10" /> : <Video className="text-zinc-300 w-10 h-10" />}
                                </motion.div>
                                <h3 className="text-2xl font-black text-zinc-900 mb-2">
                                    {activeTab === "pending" ? "No active requests" : "Library is empty"}
                                </h3>
                                <p className="text-base font-medium text-zinc-500 max-w-sm">
                                    {activeTab === "pending" ? "When you request a session with a mentor, you can track it here." : "Completed sessions and videos shared with you will appear here."}
                                </p>
                            </motion.div>
                        ) : activeTab === "pending" ? (
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-6"
                            >
                                {displayed.map((session: any) => (
                                    <PendingSessionCard key={session.id} session={session} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {displayed.map((session: any) => (
                                    <motion.div variants={itemVariants} key={session.id} className="relative z-10">
                                        <SessionVideoCard
                                            session={session}
                                            onRate={() => setReviewingId(session.id)}
                                            onComplete={async () => {
                                                const res = await markSessionCompletedByMentee(session.id);
                                                if (res.success) mutate();
                                            }}
                                            isActive={false}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewingId && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4"
                            onClick={() => setReviewingId(null)}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative border border-zinc-100"
                            >
                                
                                <div className="w-16 h-16 bg-[#D4F268]/20 rounded-3xl flex items-center justify-center mb-6 text-[#5a6d1a] border border-[#D4F268]/50 shadow-inner">
                                    <Star size={32} className="fill-[#D4F268]" />
                                </div>
                                
                                <h3 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">Rate session</h3>
                                <p className="text-zinc-500 text-sm font-medium mb-8">Your feedback directly helps mentors rank up and improve their curriculum.</p>

                                <div className="flex gap-2 mb-8 justify-between px-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            key={s} 
                                            onClick={() => setRating(s)}
                                            className={`w-12 h-12 rounded-2xl text-2xl transition-all flex items-center justify-center ${s <= rating ? "bg-[#D4F268] text-zinc-900 shadow-[0_5px_15px_rgba(212,242,104,0.4)] border border-[#D4F268]" : "bg-zinc-50 text-zinc-300 hover:bg-zinc-100 border border-zinc-200"}`}
                                        >
                                            ★
                                        </motion.button>
                                    ))}
                                </div>

                                <textarea value={comment} onChange={e => setComment(e.target.value)}
                                    placeholder="Leave a comment... (optional)"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-[#D4F268] focus:border-transparent mb-8 h-32 transition-all shadow-inner" />

                                <div className="flex gap-4 mt-2">
                                    <Button onClick={() => setReviewingId(null)} variant="ghost" className="flex-1 rounded-2xl font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 h-14">Cancel</Button>
                                    <Button onClick={() => handleSubmitReview(reviewingId)} disabled={!rating || isSubmittingReview}
                                        className="flex-[2] rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest hover:bg-[#D4F268] hover:text-zinc-900 transition-all h-14 shadow-lg disabled:opacity-50">
                                        {isSubmittingReview ? <Loader2 size={16} className="animate-spin" /> : "Submit Review"}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
