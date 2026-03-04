"use client";

import { Users, ArrowRight, Hash, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { FramerCounter } from "@/components/ui/FramerCounter";
import { AvatarStack } from "@/components/peer/AvatarStack";
import { motion, AnimatePresence } from "framer-motion";

export interface StudyCircle {
    id: string;
    name: string;
    topic: string;
    description: string;
    memberCount: number;
    maxMembers: number;
    avatarUrl?: string; // Optional custom group icon
    tags: string[];
    isJoined?: boolean;
    activeMembers?: number; // Online now
    lastActivity?: string; // Last message time
    unreadCount?: number; // For joined circles
    recentMembers?: { id: string; name: string; avatarUrl: string }[]; // Avatar stack
    isActive?: boolean; // Recent activity indicator
}

interface StudyCircleCardProps {
    circle: StudyCircle;
    onJoin: (id: string) => void;
    onView?: (id: string) => void;
}

export function StudyCircleCard({ circle, onJoin }: StudyCircleCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="group relative flex flex-col p-5 bg-[#FDFCF8] rounded-[2rem] border border-[#E5E5E0] shadow-sm hover:shadow-2xl hover:shadow-[#D4F268]/20 hover:border-[#D4F268]/50 transition-all duration-300 h-full overflow-hidden"
        >
            {/* Subtle Lime Top Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-[#D4F268] opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="relative z-10 flex flex-col h-full pt-2">
                {/* Activity Indicator */}
                {circle.isActive && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 z-20"
                    >
                        <div className="relative">
                            <div className="w-3 h-3 bg-[#D4F268] border border-[#1A1A1A] rounded-full" />
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-[#D4F268] rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Unread Badge */}
                {circle.isJoined && circle.unreadCount && circle.unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 z-20 bg-[#1A1A1A] text-[#D4F268] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-white"
                    >
                        {circle.unreadCount > 9 ? "9+" : circle.unreadCount}
                    </motion.div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 w-full">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 shadow-sm border border-[#E5E5E0] group-hover:border-[#1A1A1A] transition-colors ${circle.isJoined ? 'bg-[#1A1A1A] text-[#D4F268]' : 'bg-white text-[#1A1A1A]'}`}>
                            {circle.avatarUrl ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={circle.avatarUrl} alt={circle.name} className="w-full h-full object-cover rounded-2xl" />
                                </>
                            ) : (
                                circle.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-black text-[17px] text-[#1A1A1A] leading-tight truncate group-hover:text-black transition-colors">{circle.name}</h3>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                <Hash size={10} className="text-[#D4F268]" /> <span className="truncate">{circle.topic}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-[13px] font-medium text-zinc-600 leading-relaxed mb-5 line-clamp-2 flex-1">
                    {circle.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {circle.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-lg bg-zinc-100 border border-[#E5E5E0] text-[10px] font-bold text-zinc-600 group-hover:bg-white transition-colors">
                            #{tag}
                        </span>
                    ))}
                    {circle.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-zinc-400 bg-transparent">+{circle.tags.length - 3}</span>
                    )}
                </div>

                {/* Member Preview & Activity */}
                {circle.recentMembers && circle.recentMembers.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-[#E5E5E0]/50">
                        <div className="flex items-center justify-between">
                            <AvatarStack members={circle.recentMembers} maxDisplay={4} />
                            {circle.activeMembers && circle.activeMembers > 0 ? (
                                <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    {circle.activeMembers} online
                                </div>
                            ) : circle.lastActivity ? (
                                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold bg-zinc-50 px-2 py-1 rounded-full border border-zinc-100">
                                    <Clock size={10} />
                                    {circle.lastActivity}
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Footer (Stats + Action) */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#E5E5E0]/50">
                    <div className="flex items-center gap-1.5 text-zinc-500 bg-white px-2.5 py-1.5 rounded-xl border border-[#E5E5E0] shadow-sm">
                        <Users size={14} className="text-[#1A1A1A]" />
                        <span className="text-xs font-medium flex items-center gap-1">
                            <span className="text-[#1A1A1A] font-black">
                                <FramerCounter value={circle.memberCount} />
                            </span>
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-500 font-bold">{circle.maxMembers}</span>
                        </span>
                    </div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            size="sm"
                            onClick={() => onJoin(circle.id)}
                            className={`relative overflow-hidden rounded-xl px-4 h-9 font-black text-xs transition-all border border-transparent ${circle.isJoined
                                ? "bg-white text-zinc-600 border-[#E5E5E0] hover:bg-zinc-50 hover:border-zinc-300 shadow-sm"
                                : "bg-[#1A1A1A] text-[#D4F268] hover:bg-black shadow-md hover:shadow-lg hover:shadow-[#1A1A1A]/10"
                                }`}
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={circle.isJoined ? "joined" : "join"}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-1.5"
                                >
                                    {circle.isJoined ? "Joined" : "Join"}
                                    {!circle.isJoined && <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
                                </motion.span>
                            </AnimatePresence>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
