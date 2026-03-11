"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Star, CheckCircle, X, Loader2, Play, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { getMentors, getPublicSessions, type MentorCard, type MentorSession } from "@/actions/mentorship-actions";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

export default function FindMentorPage() {
    const [tab, setTab] = useState<"mentors" | "videos">("mentors");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [mentors, setMentors] = useState<MentorCard[]>([]);
    const [videos, setVideos] = useState<MentorSession[]>([]);
    const [allSkills, setAllSkills] = useState<string[]>(["All"]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [m, v] = await Promise.all([getMentors(), getPublicSessions()]);
            setMentors(m);
            setVideos(v);
            const skills = new Set<string>();
            m.forEach(mentor => mentor.skills.forEach(s => skills.add(s)));
            setAllSkills(["All", ...Array.from(skills)]);
            setIsLoading(false);
        };
        load();
    }, []);

    const filteredMentors = mentors.filter(m => {
        const target = `${m.name} ${m.headline || ""} ${m.skills.join(" ")}`.toLowerCase();
        const matchSearch = target.includes(searchTerm.toLowerCase());
        const matchSkill = selectedSkill === "All" || m.skills.includes(selectedSkill);
        return matchSearch && matchSkill;
    });

    const filteredVideos = videos.filter(v => {
        const target = `${v.title} ${v.topic || ""} ${v.description || ""} ${v.mentorName}`.toLowerCase();
        return target.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex flex-col bg-[#FAFAFA] min-h-full">
            {/* Dark Header */}
            <div className="bg-zinc-900 px-6 py-10 md:px-10 md:py-14 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4F268]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="mb-8">
                        <span className="px-3 py-1 bg-[#D4F268] text-black text-xs font-black uppercase tracking-wider rounded-full">
                            Community Knowledge
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-3 mb-3">
                            Mentor <span className="text-[#D4F268]">Directory</span>
                        </h1>
                        <p className="text-zinc-400 font-medium text-lg max-w-xl leading-relaxed">
                            Connect with verified mentors or browse their public video library.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl w-fit mb-8 border border-white/10">
                        {(["mentors", "videos"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${tab === t ? "bg-[#D4F268] text-black" : "text-zinc-400 hover:text-white"}`}
                            >
                                {t === "mentors" ? `Mentors (${mentors.length})` : `Videos (${videos.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Search + Filter */}
                    <div className="flex gap-3 max-w-2xl">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4F268] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={tab === "mentors" ? "Search by name, skill..." : "Search videos..."}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white font-medium outline-none focus:ring-2 focus:ring-[#D4F268]/50 transition-all placeholder:text-zinc-600 text-sm"
                            />
                        </div>
                        {tab === "mentors" && (
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className={`px-5 rounded-2xl border transition-all flex items-center gap-2 font-bold shrink-0 text-sm ${selectedSkill !== "All"
                                    ? "bg-[#D4F268] text-black border-[#D4F268]"
                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                    }`}
                            >
                                <Filter size={16} />
                                <span className="hidden md:inline">{selectedSkill === "All" ? "Filter" : selectedSkill}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-50" />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto"
                            >
                                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900">Filter by Skill</h3>
                                        <p className="text-zinc-400 text-sm font-medium">Find the perfect match</p>
                                    </div>
                                    <button onClick={() => setIsFilterOpen(false)} className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="p-6 flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                                    {allSkills.map(skill => (
                                        <button key={skill} onClick={() => { setSelectedSkill(skill); setIsFilterOpen(false); }}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${selectedSkill === skill ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-100 text-zinc-600 hover:border-[#D4F268]"}`}>
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-zinc-100 flex justify-end">
                                    <Button onClick={() => { setSelectedSkill("All"); setIsFilterOpen(false); }} variant="ghost" className="text-zinc-500 font-bold">Clear</Button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="px-6 py-8 md:px-10 pb-32 max-w-6xl mx-auto w-full">
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
                ) : tab === "mentors" ? (
                    <AnimatePresence mode="popLayout">
                        {filteredMentors.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <Users size={48} className="mx-auto text-zinc-200 mb-4" />
                                <h3 className="text-lg font-bold text-zinc-900">No mentors found</h3>
                                <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or filter.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMentors.map((mentor, i) => (
                                    <motion.div
                                        key={mentor.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: i * 0.04 }}
                                        className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-[#D4F268]/10 transition-all group flex flex-col relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4F268]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex items-start gap-4 mb-4 relative z-10">
                                            <div className="relative">
                                                <Avatar src={mentor.avatarUrl} fallback={mentor.name.slice(0, 2).toUpperCase()} className="w-16 h-16 rounded-2xl border-4 border-white shadow-md" />
                                                <div className="absolute -bottom-1 -right-1 bg-black text-[#D4F268] p-1 rounded-full border-2 border-white">
                                                    <CheckCircle size={11} strokeWidth={3} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-lg text-zinc-900 leading-tight truncate group-hover:text-[#5a6d1a] transition-colors">{mentor.name}</h3>
                                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide mt-0.5 truncate">{mentor.headline || "Mentor"}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                {mentor.avgRating !== null ? (
                                                    <>
                                                        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg px-2 py-1">
                                                            <Star size={11} className="text-[#D4F268] fill-[#D4F268]" />
                                                            <span className="text-xs font-bold text-white">{mentor.avgRating}</span>
                                                        </div>
                                                        <span className="text-[10px] font-medium text-zinc-400">{mentor.reviewCount} reviews</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-zinc-300 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100">New</span>
                                                )}
                                            </div>
                                        </div>

                                        {mentor.bio && (
                                            <p className="text-zinc-600 text-sm leading-relaxed mb-4 line-clamp-2 font-medium relative z-10">{mentor.bio}</p>
                                        )}

                                        {mentor.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4 mt-auto relative z-10">
                                                {mentor.skills.slice(0, 3).map(skill => (
                                                    <span key={skill} className="bg-zinc-50 text-zinc-600 text-[11px] font-bold px-3 py-1 rounded-lg border border-zinc-100 uppercase tracking-wide">{skill}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-dashed border-zinc-100 flex items-center justify-between relative z-10">
                                            <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${mentor.isAccepting ? "bg-green-50 text-green-600" : "bg-zinc-50 text-zinc-400"}`}>
                                                {mentor.isAccepting ? "● Accepting" : "● Paused"}
                                            </div>
                                            <Button
                                                className="rounded-xl px-5 font-bold bg-zinc-900 hover:bg-[#D4F268] hover:text-black text-white transition-all text-sm shadow-lg shadow-zinc-900/10"
                                                onClick={() => setSelectedUserId(mentor.id)}
                                            >
                                                View Profile
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                ) : (
                    /* VIDEO TAB */
                    <div>
                        {filteredVideos.length === 0 ? (
                            <div className="text-center py-20">
                                <Play size={48} className="mx-auto text-zinc-200 mb-4" />
                                <h3 className="text-lg font-bold text-zinc-900">No videos yet</h3>
                                <p className="text-zinc-500 text-sm mt-1">Mentors haven't posted any content yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredVideos.map((video, i) => (
                                    <VideoCard key={video.id} video={video} index={i} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <UserProfileModal userId={selectedUserId} isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
        </div>
    );
}

function VideoCard({ video, index }: { video: MentorSession; index: number }) {
    const [showEmbed, setShowEmbed] = useState(false);
    const ytId = extractYouTubeId(video.videoUrl || "");
    const isPremiering = video.premiereAt && new Date(video.premiereAt) > new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col"
        >
            {/* Thumbnail / Embed */}
            <div className="aspect-video bg-zinc-900 relative overflow-hidden rounded-t-[2rem] group">
                {showEmbed && ytId ? (
                    <>
                        {/* Top overlay to block "Watch later", "Share", and Title links */}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 hidden group-hover:block" onClick={(e) => e.stopPropagation()} />

                        {/* Bottom right overlay to block the "YouTube" logo link */}
                        <div className="absolute bottom-0 right-0 w-24 h-12 bg-transparent z-10" onClick={(e) => e.stopPropagation()} />

                        <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                        />
                    </>
                ) : (
                    <>
                        {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isPremiering ? (
                                <div className="bg-[#D4F268] text-black px-4 py-2 rounded-full font-black text-sm">
                                    Premieres {new Date(video.premiereAt!).toLocaleDateString()}
                                </div>
                            ) : ytId ? (
                                <button onClick={() => setShowEmbed(true)} className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                    <Play size={24} className="text-zinc-900 fill-zinc-900 ml-1" />
                                </button>
                            ) : (
                                <a href={video.videoUrl} target="_blank" rel="noopener noreferrer"
                                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                    <Play size={24} className="text-zinc-900 fill-zinc-900 ml-1" />
                                </a>
                            )}
                        </div>
                        {isPremiering && (
                            <div className="absolute top-3 left-3 bg-[#D4F268] text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                                Upcoming
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-zinc-900 text-base leading-tight mb-1 line-clamp-2">{video.title}</h3>
                {video.topic && <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide mb-2">{video.topic}</p>}
                {video.description && <p className="text-zinc-500 text-sm line-clamp-2 mb-4 flex-1 font-medium">{video.description}</p>}

                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-zinc-50">
                    <Avatar src={video.mentorAvatar} fallback={video.mentorName.slice(0, 2).toUpperCase()} className="w-7 h-7 rounded-full border border-zinc-200" />
                    <span className="text-xs font-bold text-zinc-700">{video.mentorName}</span>
                    <span className="text-zinc-300 ml-auto text-[10px] font-medium">{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </motion.div>
    );
}

function extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] ?? null;
}
