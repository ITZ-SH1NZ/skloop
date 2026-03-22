"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { Search, Filter, Star, CheckCircle, X, Loader2, Play, Users, ArrowRight, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { type MentorSession } from "@/actions/mentorship-actions";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { fetchFindMentorData } from "@/lib/swr-fetchers";
import { useLoading } from "@/components/LoadingProvider";

// Dynamically import heavy modals
const UserProfileModal = dynamic(() => import("@/components/profile/UserProfileModal"), {
    ssr: false,
    loading: () => <div className="hidden" />
});

// Stagger variants for the grid
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { type: "spring", stiffness: 350, damping: 25 }
    }
};

const MentorCard = memo(({ mentor, index, onViewProfile }: { mentor: any, index: number, onViewProfile: (id: string) => void }) => {
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

const VideoCard = memo(({ video, index }: { video: MentorSession; index: number }) => {
    const [showEmbed, setShowEmbed] = useState(false);
    const ytId = extractYouTubeId(video.videoUrl || "");
    const isPremiering = video.premiereAt && new Date(video.premiereAt) > new Date();

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white rounded-[2rem] border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-[#D4F268]/50 transition-all duration-300 overflow-hidden flex flex-col group"
        >
            <div className="aspect-video bg-zinc-900 relative overflow-hidden group">
                {showEmbed && ytId ? (
                    <>
                        <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 hidden group-hover:block" onClick={(e) => e.stopPropagation()} />
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
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={video.thumbnailUrl} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100" />
                        ) : (
                            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                                <VideoIcon className="text-zinc-600 w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-zinc-900/20 flex items-center justify-center group-hover:bg-zinc-900/40 transition-colors backdrop-blur-[2px] group-hover:backdrop-blur-sm">
                            {isPremiering ? (
                                <div className="bg-[#D4F268] text-zinc-900 px-5 py-2.5 rounded-xl font-black text-sm shadow-[0_10px_20px_rgba(212,242,104,0.3)] animate-pulse">
                                    Premieres {new Date(video.premiereAt!).toLocaleDateString()}
                                </div>
                            ) : ytId ? (
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowEmbed(true)} 
                                    className="w-16 h-16 rounded-full bg-[#D4F268] flex items-center justify-center shadow-[0_10px_30px_rgba(212,242,104,0.4)]"
                                >
                                    <Play size={24} className="text-zinc-900 fill-zinc-900 ml-1.5" />
                                </motion.button>
                            ) : (
                                <motion.a 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    href={video.videoUrl} target="_blank" rel="noopener noreferrer"
                                    className="w-16 h-16 rounded-full bg-[#D4F268] flex items-center justify-center shadow-[0_10px_30px_rgba(212,242,104,0.4)]"
                                >
                                    <Play size={24} className="text-zinc-900 fill-zinc-900 ml-1.5" />
                                </motion.a>
                            )}
                        </div>
                    </>
                )}
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
                    <div>
                        <div className="text-sm font-extrabold text-zinc-900">{video.mentorName}</div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mentor</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
VideoCard.displayName = "VideoCard";

function extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] ?? null;
}

export default function FindMentorPage() {
    const { isLoading: isGlobalLoading } = useLoading();
    const [isMounted, setIsMounted] = useState(false);
    const [tab, setTab] = useState<"mentors" | "videos">("mentors");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
                                    placeholder={tab === "mentors" ? "Search by name or skill..." : "Search video library..."}
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
                <div className="flex bg-white/80 backdrop-blur-md p-2 rounded-3xl shadow-lg border border-zinc-200/50 w-full max-w-sm mx-auto mb-16 relative">
                    {(["mentors", "videos"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors relative rounded-2xl z-10 ${tab === t ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                        >
                            {t === "mentors" ? "Mentors" : "Videos"}
                        </button>
                    ))}
                    <motion.div 
                        layoutId="findTabPill" 
                        className="absolute inset-y-2 bg-[#D4F268] rounded-2xl shadow-sm z-0" 
                        style={{ width: "calc(50% - 12px)" }}
                        animate={{ left: tab === "mentors" ? "8px" : "calc(50% + 4px)" }}
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
                                        {filteredMentors.map((mentor: any, i: number) => (
                                            <MentorCard
                                                key={mentor.id}
                                                mentor={mentor}
                                                index={i}
                                                onViewProfile={setSelectedUserId}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                filteredVideos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-zinc-200/60 shadow-sm">
                                        <VideoIcon size={64} className="text-zinc-200 mb-6" />
                                        <h3 className="text-2xl font-black text-zinc-900 mb-2">No videos found</h3>
                                        <p className="text-zinc-500 text-base font-medium">Try a different search term.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {filteredVideos.map((video: any, i: number) => (
                                            <VideoCard key={video.id} video={video} index={i} />
                                        ))}
                                    </div>
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <UserProfileModal userId={selectedUserId} isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
        </motion.div>
    );
}
