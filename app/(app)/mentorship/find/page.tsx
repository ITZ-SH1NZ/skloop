"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Star, CheckCircle, X, Loader2, Play, Users, ArrowRight, Video as VideoIcon, Eye, MessageSquare, ListVideo, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
    getVideoDetails, getVideoComments,    getPlaylistDetails,
    getPublicPlaylists,
    trackPlaylistProgress,
    type MentorSession, type VideoDetailData, type VideoComment, type MentorPlaylist, type PlaylistWithVideos,
} from "@/actions/mentorship-actions";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { fetchFindMentorData } from "@/lib/swr-fetchers";
import { useLoading } from "@/components/LoadingProvider";

// Dynamically import heavy modals
const UserProfileModal = dynamic(() => import("@/components/profile/UserProfileModal"), {
    ssr: false,
    loading: () => <div className="hidden" />
});

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { type: "spring", stiffness: 350, damping: 25 }
    }
};

const MentorCard = memo(({ mentor, onViewProfile }: { mentor: any, onViewProfile: (id: string) => void }) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-[2rem] p-6 border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-[#D4F268]/50 transition-all duration-300 group flex flex-col relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D4F268]/30 to-transparent rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex flex-col items-center text-center gap-3 mb-5 relative z-10">
                <div className="relative">
                    <Avatar src={mentor.avatarUrl} fallback={mentor.name.slice(0, 2).toUpperCase()} className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-xl group-hover:shadow-[#D4F268]/20 transition-all duration-300" />
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute -bottom-2 -right-2 bg-zinc-900 rounded-full p-1.5 shadow-lg border-2 border-white"
                    >
                        <CheckCircle size={16} className="text-[#D4F268] fill-[#D4F268]" />
                    </motion.div>
                </div>
                <div>
                    <h3 className="font-extrabold text-xl text-zinc-900 leading-tight">{mentor.name}</h3>
                    <p className="text-[#5a6d1a] text-xs font-black uppercase tracking-widest mt-1 bg-[#D4F268]/20 inline-block px-3 py-1 rounded-full">{mentor.headline || "Expert Mentor"}</p>
                </div>
            </div>

            <div className="flex justify-center gap-4 mb-5 relative z-10">
                <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-zinc-900 flex items-center gap-1">
                        <Star size={16} className="text-[#D4F268] fill-[#D4F268]" /> 
                        {mentor.avgRating !== null ? mentor.avgRating : "5.0"}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rating</span>
                </div>
                <div className="w-px bg-zinc-100" />
                <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-zinc-900">{mentor.reviewCount || 0}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reviews</span>
                </div>
            </div>

            {mentor.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mb-6 relative z-10">
                    {mentor.skills.slice(0, 3).map((skill: any) => (
                        <span key={skill} className="bg-zinc-50 text-zinc-600 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-zinc-200 uppercase tracking-widest hover:border-[#D4F268] hover:bg-[#D4F268]/10 transition-colors cursor-default">{skill}</span>
                    ))}
                    {mentor.skills.length > 3 && (
                        <span className="bg-zinc-50 text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-zinc-200">+{mentor.skills.length - 3}</span>
                    )}
                </div>
            )}

            <div className="mt-auto relative z-10">
                <Button
                    onClick={() => onViewProfile(mentor.id)}
                    className="w-full h-12 rounded-xl font-black bg-zinc-900 text-white group-hover:bg-[#D4F268] group-hover:text-zinc-900 transition-all text-sm flex items-center justify-center gap-2 shadow-md group-hover:shadow-[0_8px_20px_rgba(212,242,104,0.4)]"
                >
                    View Profile <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </Button>
            </div>
        </motion.div>
    );
});
MentorCard.displayName = "MentorCard";

const VideoCard = memo(({ video, onViewDetails, onPreview }: {
    video: MentorSession;
    onViewDetails: (id: string) => void;
    onPreview: (id: string) => void;
}) => {
    const ytId = extractYouTubeId(video.videoUrl || "");
    const isPremiering = video.premiereAt && new Date(video.premiereAt) > new Date();

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => onPreview(video.id)}
            className="bg-white rounded-3xl border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-[#D4F268]/50 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
        >
            <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={video.thumbnailUrl} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100" />
                ) : (
                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                        <VideoIcon className="text-zinc-600 w-12 h-12" />
                    </div>
                )}
                <div className="absolute inset-0 bg-zinc-900/20 flex items-center justify-center group-hover:bg-zinc-900/50 transition-colors">
                    {isPremiering ? (
                        <div className="bg-[#D4F268] text-zinc-900 px-5 py-2.5 rounded-xl font-black text-sm shadow-[0_10px_20px_rgba(212,242,104,0.3)] animate-pulse">
                            Premieres {new Date(video.premiereAt!).toLocaleDateString()}
                        </div>
                    ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                <Eye size={20} className="text-white" />
                            </div>
                            <span className="text-white text-xs font-black uppercase tracking-widest">Preview</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-2 mb-3">
                    {video.topic && <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{video.topic}</span>}
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-black text-zinc-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#5a6d1a] transition-colors">{video.title}</h3>
                {video.description && <p className="text-zinc-500 text-sm line-clamp-2 mb-5 font-medium flex-1 leading-relaxed">{video.description}</p>}

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-zinc-100">
                    <Avatar src={video.mentorAvatar} fallback={video.mentorName.slice(0, 2).toUpperCase()} className="w-10 h-10 rounded-[12px] border-2 border-zinc-100" />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-extrabold text-zinc-900 truncate">{video.mentorName}</div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mentor</div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); onViewDetails(video.id); }}
                        className="shrink-0 h-9 px-4 rounded-xl font-black text-xs bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-zinc-900 transition-all flex items-center gap-1.5"
                    >
                        Watch <ArrowRight size={13} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
});
VideoCard.displayName = "VideoCard";

// ─── Video Preview Modal ──────────────────────────────────────────────────────

function StarMini({ value, size = 12 }: { value: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
                <Star key={s} size={size} className={value >= s ? "text-[#D4F268] fill-[#D4F268]" : "text-zinc-200 fill-zinc-200"} />
            ))}
        </div>
    );
}

function VideoPreviewModal({ videoId, isOpen, onClose, onWatch }: {
    videoId: string | null; isOpen: boolean; onClose: () => void; onWatch: (id: string) => void;
}) {
    const [data, setData] = useState<VideoDetailData | null>(null);
    const [comments, setComments] = useState<VideoComment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !videoId) return;
        setLoading(true); setData(null); setComments([]);
        Promise.all([getVideoDetails(videoId), getVideoComments(videoId, 0, 5)])
            .then(([detail, coms]) => { setData(detail); setComments(coms.slice(0, 3)); })
            .finally(() => setLoading(false));
    }, [isOpen, videoId]);

    if (!isOpen || !videoId) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 20 }}
                        transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                        className="relative bg-[#FAFAFA] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* close */}
                        <button onClick={onClose} className="absolute top-5 right-5 z-20 w-9 h-9 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center shadow border border-zinc-200 transition-colors">
                            <X size={16} className="text-zinc-500" />
                        </button>

                        {loading ? (
                            <div className="flex items-center justify-center py-32">
                                <Loader2 className="w-10 h-10 animate-spin text-[#D4F268]" />
                            </div>
                        ) : !data ? (
                            <div className="flex items-center justify-center py-32 text-zinc-400 font-bold">Video not found</div>
                        ) : (
                            <div className="overflow-y-auto" data-lenis-prevent>
                                {/* Thumbnail header */}
                                <div className="aspect-video bg-zinc-900 relative shrink-0">
                                    {data.session.thumbnailUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={data.session.thumbnailUrl} alt={data.session.title} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center"><VideoIcon size={48} className="text-zinc-600" /></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            {data.session.topic && <span className="bg-white/15 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20">{data.session.topic}</span>}
                                        </div>
                                        <h2 className="text-white font-black text-xl leading-snug line-clamp-2 drop-shadow">{data.session.title}</h2>
                                    </div>
                                </div>

                                <div className="p-7 space-y-6">
                                    {/* Mentor + meta row */}
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={data.mentor.avatarUrl} fallback={data.mentor.name.slice(0,2).toUpperCase()} className="w-11 h-11 rounded-[12px] border-2 border-zinc-100" />
                                            <div>
                                                <div className="font-black text-zinc-900 text-sm">{data.mentor.name}</div>
                                                {data.mentor.headline && <div className="text-[10px] text-[#5a6d1a] font-black uppercase tracking-widest">{data.mentor.headline}</div>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                                            <span className="flex items-center gap-1"><Eye size={13} /> {data.session.viewCount.toLocaleString()}</span>
                                            <span className="flex items-center gap-1"><MessageSquare size={13} /> {data.totalComments}</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {data.session.description && (
                                        <p className="text-zinc-500 text-sm font-medium leading-relaxed">{data.session.description}</p>
                                    )}

                                    {/* Rating */}
                                    {data.session.reviewCount > 0 && (
                                        <div className="bg-white rounded-2xl p-5 border border-zinc-100">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center shrink-0">
                                                    <div className="text-4xl font-black text-zinc-900 leading-none mb-1">{data.session.avgRating}</div>
                                                    <StarMini value={Math.round(data.session.avgRating || 0)} size={13} />
                                                    <div className="text-[10px] text-zinc-400 font-bold mt-1">{data.session.reviewCount} review{data.session.reviewCount !== 1 ? "s" : ""}</div>
                                                </div>
                                                <div className="flex-1 space-y-1.5">
                                                    {[5,4,3,2,1].map(star => {
                                                        const count = data.ratingDistribution[star as keyof typeof data.ratingDistribution] ?? 0;
                                                        const pct = data.session.reviewCount > 0 ? Math.round((count / data.session.reviewCount) * 100) : 0;
                                                        return (
                                                            <div key={star} className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-zinc-500 w-3">{star}</span>
                                                                <Star size={9} className="text-[#D4F268] fill-[#D4F268] shrink-0" />
                                                                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: (5 - star) * 0.06 }} className="h-full bg-[#D4F268] rounded-full" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-zinc-400 w-6 text-right">{pct}%</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Top reviews */}
                                    {data.recentReviews.filter(r => r.comment).length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black text-zinc-700 uppercase tracking-widest mb-3">Top Reviews</h3>
                                            <div className="space-y-3">
                                                {data.recentReviews.filter(r => r.comment).slice(0, 2).map((r, i) => (
                                                    <div key={i} className="bg-white rounded-2xl p-4 border border-zinc-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Avatar src={r.reviewerAvatar} fallback={(r.reviewerName || "U").slice(0,2).toUpperCase()} className="w-7 h-7 rounded-lg" />
                                                            <span className="text-xs font-black text-zinc-800">{r.reviewerName}</span>
                                                            <StarMini value={r.rating} size={10} />
                                                        </div>
                                                        <p className="text-zinc-500 text-xs font-medium leading-relaxed line-clamp-2">&ldquo;{r.comment}&rdquo;</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Top comments */}
                                    {comments.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black text-zinc-700 uppercase tracking-widest mb-3">Comments</h3>
                                            <div className="space-y-3">
                                                {comments.map(c => (
                                                    <div key={c.id} className="flex gap-3">
                                                        <Avatar src={c.authorAvatar} fallback={c.authorName.slice(0,2).toUpperCase()} className="w-8 h-8 rounded-[10px] shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-black text-zinc-800">{c.authorName}</span>
                                                                <span className="text-[10px] text-zinc-400 font-medium">Lv.{c.authorLevel}</span>
                                                            </div>
                                                            <p className="text-zinc-500 text-xs font-medium leading-relaxed line-clamp-2">{c.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CTA footer */}
                        {data && (
                            <div className="shrink-0 p-6 pt-0 border-t border-zinc-100 bg-[#FAFAFA]">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => { onClose(); onWatch(videoId!); }}
                                    className="w-full h-14 rounded-2xl font-black text-sm bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-zinc-900 transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                    Watch Full Video <ArrowRight size={16} />
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Playlist Card ────────────────────────────────────────────────────────────

const PlaylistCard = memo(({ playlist, onPreview }: { playlist: MentorPlaylist; onPreview: (id: string) => void }) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => onPreview(playlist.id)}
            className="bg-white rounded-[2rem] border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-[#D4F268]/50 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                {playlist.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={playlist.thumbnailUrl} alt={playlist.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                ) : (
                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                        <ListVideo className="text-zinc-600 w-12 h-12" />
                    </div>
                )}
                <div className="absolute inset-0 bg-zinc-900/30 group-hover:bg-zinc-900/50 transition-colors" />
                {/* Video count badge */}
                <div className="absolute bottom-3 right-3 bg-zinc-900/80 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10">
                    <ListVideo size={11} />
                    {playlist.videoCount} video{playlist.videoCount !== 1 ? "s" : ""}
                </div>
                {/* Hover eye */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <BookOpen size={18} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-black uppercase tracking-widest">View Playlist</span>
                    </div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-zinc-900 text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-[#5a6d1a] transition-colors">{playlist.title}</h3>
                {playlist.description && (
                    <p className="text-zinc-400 text-xs font-medium line-clamp-2 mb-4 leading-relaxed flex-1">{playlist.description}</p>
                )}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-zinc-100">
                    <Avatar src={playlist.mentorAvatar} fallback={playlist.mentorName.slice(0,2).toUpperCase()} className="w-8 h-8 rounded-[10px] border-2 border-zinc-100" />
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-extrabold text-zinc-900 truncate">{playlist.mentorName}</div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mentor</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[10px] font-black text-[#5a6d1a] bg-[#D4F268]/20 px-2.5 py-1.5 rounded-lg">
                        <ChevronRight size={11} /> Open
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
PlaylistCard.displayName = "PlaylistCard";

// ─── Playlist Preview Modal ───────────────────────────────────────────────────

function PlaylistPreviewModal({ playlistId, isOpen, onClose, onWatch }: {
    playlistId: string | null; isOpen: boolean; onClose: () => void; onWatch: (id: string) => void;
}) {
    const [data, setData] = useState<PlaylistWithVideos | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !playlistId) return;
        setLoading(true); setData(null);
        getPlaylistDetails(playlistId).then(setData).finally(() => setLoading(false));
    }, [isOpen, playlistId]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 20 }}
                        transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                        className="relative bg-[#FAFAFA] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <button onClick={onClose} className="absolute top-5 right-5 z-20 w-9 h-9 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center shadow border border-zinc-200 transition-colors">
                            <X size={16} className="text-zinc-500" />
                        </button>

                        {loading ? (
                            <div className="flex items-center justify-center py-32"><Loader2 className="w-10 h-10 animate-spin text-[#D4F268]" /></div>
                        ) : !data ? (
                            <div className="flex items-center justify-center py-32 text-zinc-400 font-bold">Playlist not found</div>
                        ) : (
                            <>
                                 {/* Header */}
                                 <div className="bg-zinc-900 px-7 pt-7 pb-6 shrink-0 relative overflow-hidden">
                                     {/* Background Thumbnail if available */}
                                     {data.thumbnailUrl && (
                                         <div className="absolute inset-0 opacity-20 blur-2xl scale-110">
                                             <img src={data.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                         </div>
                                     )}
                                     <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4F268]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                     
                                     <div className="flex items-start gap-5 mb-6 relative z-10">
                                         <div className="w-24 aspect-video rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 shadow-2xl">
                                             {data.thumbnailUrl ? (
                                                 <img src={data.thumbnailUrl} alt={data.title} className="w-full h-full object-cover" />
                                             ) : (
                                                 <div className="w-full h-full flex items-center justify-center"><ListVideo size={24} className="text-zinc-600" /></div>
                                             )}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <h2 className="font-black text-white text-xl leading-tight mb-2 line-clamp-2">{data.title}</h2>
                                             <div className="flex items-center gap-2 flex-wrap">
                                                 <span className="bg-zinc-800/80 backdrop-blur-sm text-zinc-300 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border border-zinc-700/50">{data.videoCount} video{data.videoCount !== 1 ? "s" : ""}</span>
                                                 <span className="bg-zinc-800/80 backdrop-blur-sm text-zinc-300 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 border border-zinc-700/50">
                                                     <Eye size={10} className="text-[#D4F268]" /> {data.videos.reduce((acc, v) => acc + v.viewCount, 0).toLocaleString()}
                                                 </span>
                                                 <div className="flex items-center gap-1.5 ml-1">
                                                     <Avatar src={data.mentorAvatar} fallback={data.mentorName.slice(0,2).toUpperCase()} className="w-5 h-5 rounded-md border border-zinc-700" />
                                                     <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{data.mentorName}</span>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>

                                     {data.userProgress ? (
                                         <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 group/progress cursor-pointer hover:bg-white/10 transition-colors"
                                              onClick={() => { trackPlaylistProgress(data.id, data.userProgress!.lastSessionId); onClose(); onWatch(data.userProgress!.lastSessionId); }}>
                                             <div className="w-16 aspect-video rounded-lg bg-zinc-800 overflow-hidden shrink-0 relative">
                                                 {data.videos.find(v => v.sessionId === data.userProgress?.lastSessionId)?.thumbnailUrl ? (
                                                     <img src={data.videos.find(v => v.sessionId === data.userProgress?.lastSessionId)!.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                                 ) : (
                                                     <div className="w-full h-full flex items-center justify-center"><VideoIcon size={12} className="text-zinc-600" /></div>
                                                 )}
                                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                     <Play size={12} className="text-white fill-white" />
                                                 </div>
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                 <div className="text-[10px] font-black text-[#D4F268] uppercase tracking-widest mb-0.5">Continue Watching</div>
                                                 <div className="text-xs font-bold text-white line-clamp-1">{data.videos.find(v => v.sessionId === data.userProgress?.lastSessionId)?.title || "Untitled Video"}</div>
                                             </div>
                                             <ArrowRight size={16} className="text-zinc-500 group-hover:text-[#D4F268] transition-colors" />
                                         </div>
                                     ) : data.description && (
                                         <p className="text-zinc-400 text-sm font-medium leading-relaxed line-clamp-3 relative z-10">{data.description}</p>
                                     )}
                                 </div>

                                {/* Video list */}
                                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2" data-lenis-prevent>
                                    {data.videos.length === 0 ? (
                                        <div className="text-center py-12 text-zinc-400 font-medium text-sm">No videos in this playlist yet</div>
                                    ) : (
                                        data.videos.map((v, i) => (
                                            <motion.div key={v.sessionId}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="flex items-center gap-3 bg-white rounded-xl p-3 border border-zinc-100 hover:border-[#D4F268]/50 hover:shadow-sm transition-all group/item"
                                            >
                                                <div className="text-xs font-black text-zinc-300 w-5 text-center shrink-0">{i + 1}</div>
                                                <div className="w-20 aspect-video bg-zinc-100 rounded-lg overflow-hidden shrink-0">
                                                    {v.thumbnailUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><VideoIcon size={14} className="text-zinc-400" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black text-zinc-900 text-xs leading-snug line-clamp-1 group-hover/item:text-[#5a6d1a] transition-colors">{v.title}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {v.topic && <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">{v.topic}</span>}
                                                        {v.avgRating !== null && (
                                                            <span className="flex items-center gap-0.5 text-[10px] font-black text-zinc-500">
                                                                <Star size={9} className="text-[#D4F268] fill-[#D4F268]" /> {v.avgRating}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-0.5 text-[10px] text-zinc-400 font-bold">
                                                            <Eye size={9} /> {v.viewCount}
                                                        </span>
                                                    </div>
                                                </div>
                                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                                                    onClick={() => { 
                                                        trackPlaylistProgress(data.id, v.sessionId);
                                                        onClose(); 
                                                        onWatch(v.sessionId); 
                                                    }}
                                                    className="shrink-0 w-8 h-8 rounded-xl bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-zinc-900 flex items-center justify-center transition-all"
                                                >
                                                    <Play size={12} className="fill-current ml-0.5" />
                                                </motion.button>
                                            </motion.div>
                                        ))
                                    )}
                                </div>

                                {/* CTA */}
                                {data.videos.length > 0 && (
                                    <div className="shrink-0 p-5 border-t border-zinc-100 bg-[#FAFAFA]">
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => { 
                                                const targetId = data.userProgress?.lastSessionId || data.videos[0].sessionId;
                                                trackPlaylistProgress(data.id, targetId);
                                                onClose(); 
                                                onWatch(targetId); 
                                            }}
                                            className="w-full h-13 py-3.5 rounded-2xl font-black text-sm bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-zinc-900 transition-all flex items-center justify-center gap-2 shadow-md"
                                        >
                                            <Play size={15} className="fill-current" /> {data.userProgress ? "Continue Watching" : "Start Playlist"}
                                        </motion.button>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] ?? null;
}

export default function FindMentorPage() {
    const router = useRouter();
    const { isLoading: isGlobalLoading } = useLoading();
    const [isMounted, setIsMounted] = useState(false);
    const [tab, setTab] = useState<"mentors" | "videos" | "playlists">("mentors");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
    const [previewPlaylistId, setPreviewPlaylistId] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: mentorData, isLoading } = useSWR(
        ['findMentorData'],
        fetchFindMentorData as any,
        {
            revalidateOnFocus: false
        }
    );

    const mentors = mentorData?.mentors || [];
    const videos = mentorData?.videos || [];
    const playlists: MentorPlaylist[] = mentorData?.playlists || [];

    const allSkills = useMemo(() => {
        const skills = new Set<string>();
        mentors.forEach((mentor: any) => mentor.skills.forEach((s: string) => skills.add(s)));
        return ["All", ...Array.from(skills)];
    }, [mentors]);

    const filteredMentors = useMemo(() => mentors.filter((m: any) => {
        const target = `${m.name} ${m.headline || ""} ${m.skills.join(" ")}`.toLowerCase();
        const matchSearch = target.includes(searchTerm.toLowerCase());
        const matchSkill = selectedSkill === "All" || m.skills.includes(selectedSkill);
        return matchSearch && matchSkill;
    }), [mentors, searchTerm, selectedSkill]);

    const filteredVideos = useMemo(() => videos.filter((v: any) => {
        const target = `${v.title} ${v.topic || ""} ${v.description || ""} ${v.mentorName}`.toLowerCase();
        return target.includes(searchTerm.toLowerCase());
    }), [videos, searchTerm]);

    const filteredPlaylists = useMemo(() => playlists.filter((p: MentorPlaylist) => {
        const target = `${p.title} ${p.description || ""} ${p.mentorName}`.toLowerCase();
        return target.includes(searchTerm.toLowerCase());
    }), [playlists, searchTerm]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={isGlobalLoading ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-[#FAFAFA] min-h-screen font-sans"
        >
            {/* Massive Gamified Lime Header */}
            <div className="relative w-full pt-16 pb-24 overflow-hidden mb-8">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#D4F268] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none" 
                />
                
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10 flex flex-col items-center text-center">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="bg-[#D4F268]/20 border border-[#D4F268]/40 text-[#D4F268] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
                    >
                        Community Directory
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl"
                    >
                        Find your next <span className="text-[#D4F268]">Mentor</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                        className="text-zinc-400 font-medium text-lg max-w-2xl leading-relaxed mb-12"
                    >
                        Connect with verified industry experts. Ask questions, book 1-on-1 sessions, or learn from their extensive public video libraries.
                    </motion.p>

                    {/* Highly interactive search bar */}
                    <motion.div 
                        initial={{ y: 30, opacity: 0, scale: 0.9 }} 
                        animate={{ y: 0, opacity: 1, scale: 1 }} 
                        transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                        className="w-full max-w-3xl relative group flex gap-3"
                    >
                        <div className="relative flex-1">
                            <div className="absolute inset-0 bg-[#D4F268] rounded-3xl blur-xl opacity-0 group-focus-within:opacity-30 transition-opacity duration-500" />
                            <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl overflow-hidden flex items-center shadow-2xl group-focus-within:border-[#D4F268] transition-colors duration-300">
                                <Search className="absolute left-6 text-zinc-400 group-focus-within:text-[#D4F268] transition-colors" size={24} />
                                <input
                                    type="text"
                                    placeholder={tab === "mentors" ? "Search by name or skill..." : tab === "videos" ? "Search video library..." : "Search playlists..."}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent pl-16 pr-6 py-6 text-white font-bold text-lg outline-none placeholder:text-zinc-500 placeholder:font-medium"
                                />
                            </div>
                        </div>

                        {tab === "mentors" && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsFilterOpen(true)}
                                className={`shrink-0 h-full min-h-[76px] px-8 rounded-3xl border-2 transition-all flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest shadow-xl
                                    ${selectedSkill !== "All"
                                        ? "bg-[#D4F268] text-zinc-900 border-[#D4F268] shadow-[0_0_30px_rgba(212,242,104,0.3)]"
                                        : "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                                    }`}
                            >
                                <Filter size={20} />
                                <span className="hidden sm:inline">{selectedSkill === "All" ? "Filter" : selectedSkill}</span>
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Filter Modal */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50" />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden pointer-events-auto border border-zinc-100"
                            >
                                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                    <div>
                                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Filter by Skill</h3>
                                        <p className="text-zinc-500 font-medium mt-1">Select an expertise area</p>
                                    </div>
                                    <button onClick={() => setIsFilterOpen(false)} className="w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8 flex flex-wrap gap-2.5 max-h-[60vh] overflow-y-auto">
                                    {allSkills.map((skill: any) => (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            key={skill} 
                                            onClick={() => { setSelectedSkill(skill); setIsFilterOpen(false); }}
                                            className={`px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2 ${selectedSkill === skill ? "bg-[#D4F268] text-zinc-900 border-[#D4F268] shadow-lg shadow-[#D4F268]/20" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"}`}>
                                            {skill}
                                        </motion.button>
                                    ))}
                                </div>
                                <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
                                    <Button onClick={() => { setSelectedSkill("All"); setIsFilterOpen(false); }} variant="ghost" className="text-zinc-500 font-bold hover:bg-zinc-200 hover:text-zinc-900 rounded-xl px-6 h-12">Clear Filters</Button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="px-6 md:px-10 pb-32 max-w-[1400px] mx-auto w-full -mt-8 relative z-20">
                
                {/* Custom Big Tabs */}
                <div className="flex bg-white/80 backdrop-blur-md p-2 rounded-3xl shadow-lg border border-zinc-200/50 w-full max-w-md mx-auto mb-16 relative">
                    {(["mentors", "videos", "playlists"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors relative rounded-2xl z-10 ${tab === t ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                        >
                            {t === "mentors" ? "Mentors" : t === "videos" ? "Videos" : "Playlists"}
                        </button>
                    ))}
                    <motion.div
                        layoutId="findTabPill"
                        className="absolute inset-y-2 bg-[#D4F268] rounded-2xl shadow-sm z-0"
                        style={{ width: "calc(33.333% - 10px)" }}
                        animate={{ left: tab === "mentors" ? "8px" : tab === "videos" ? "calc(33.333% + 4px)" : "calc(66.666% + 0px)" }}
                        transition={{ type: "spring", bounce: 0.3 }}
                    />
                </div>

                {(!isMounted || isLoading) ? (
                    <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-[#D4F268]" /></div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            {tab === "mentors" ? (
                                filteredMentors.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-zinc-200/60 shadow-sm">
                                        <Users size={64} className="text-zinc-200 mb-6" />
                                        <h3 className="text-2xl font-black text-zinc-900 mb-2">No mentors found</h3>
                                        <p className="text-zinc-500 text-base font-medium">Try adjusting your search or filters.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {filteredMentors.map((mentor: any) => (
                                            <MentorCard
                                                key={mentor.id}
                                                mentor={mentor}
                                                onViewProfile={setSelectedUserId}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : tab === "videos" ? (
                                filteredVideos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-zinc-200/60 shadow-sm">
                                        <VideoIcon size={64} className="text-zinc-200 mb-6" />
                                        <h3 className="text-2xl font-black text-zinc-900 mb-2">No videos found</h3>
                                        <p className="text-zinc-500 text-base font-medium">Try a different search term.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {filteredVideos.map((video: any) => (
                                            <VideoCard
                                                key={video.id}
                                                video={video}
                                                onViewDetails={(id) => router.push(`/mentorship/video/${id}`)}
                                                onPreview={setPreviewVideoId}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                filteredPlaylists.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-zinc-200/60 shadow-sm">
                                        <ListVideo size={64} className="text-zinc-200 mb-6" />
                                        <h3 className="text-2xl font-black text-zinc-900 mb-2">No playlists found</h3>
                                        <p className="text-zinc-500 text-base font-medium">Try a different search term.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {filteredPlaylists.map((playlist: MentorPlaylist) => (
                                            <PlaylistCard
                                                key={playlist.id}
                                                playlist={playlist}
                                                onPreview={setPreviewPlaylistId}
                                            />
                                        ))}
                                    </div>
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <UserProfileModal userId={selectedUserId} isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} />

            <VideoPreviewModal
                videoId={previewVideoId}
                isOpen={!!previewVideoId}
                onClose={() => setPreviewVideoId(null)}
                onWatch={(id) => router.push(`/mentorship/video/${id}`)}
            />

            <PlaylistPreviewModal
                playlistId={previewPlaylistId}
                isOpen={!!previewPlaylistId}
                onClose={() => setPreviewPlaylistId(null)}
                onWatch={(id) => router.push(`/mentorship/video/${id}`)}
            />
        </motion.div>
    );
}
