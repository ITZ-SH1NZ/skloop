"use client";

import { useState, memo } from "react";
import { Play, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { type MentorSession } from "@/actions/mentorship-actions";

function extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] ?? null;
}

export const SessionVideoCard = memo(({ 
    session, 
    onRate, 
    onComplete, 
    isActive 
}: { 
    session: MentorSession; 
    onRate: () => void; 
    onComplete?: () => void; 
    isActive?: boolean 
}) => {
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
});
