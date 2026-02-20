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
            className="group relative flex flex-col p-5 bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-200/60 hover:border-zinc-200 transition-all duration-300 h-full overflow-hidden"
        >
            {/* Gradient Header (Visual flair) */}
            <div className={`absolute top-0 left-0 right-0 h-24 opacity-10`}
                style={{ background: `linear-gradient(135deg, ${getStringColor(circle.topic)} 0%, transparent 100%)` }}
            />

            <div className="relative z-10 flex flex-col h-full">
                {/* Activity Indicator */}
                {circle.isActive && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 z-20"
                    >
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-green-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Unread Badge */}
                {circle.isJoined && circle.unreadCount && circle.unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 z-20 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {circle.unreadCount > 9 ? "9+" : circle.unreadCount}
                    </motion.div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg`}
                            style={{ backgroundColor: getStringColor(circle.topic) }}
                        >
                            {circle.avatarUrl ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={circle.avatarUrl} alt={circle.name} className="w-full h-full object-cover rounded-2xl" />
                                </>
                            ) : (
                                circle.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-primary transition-colors">{circle.name}</h3>
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                <Hash size={10} /> {circle.topic}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-500 leading-relaxed mb-6 line-clamp-2 flex-1">
                    {circle.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {circle.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[10px] font-medium text-zinc-600">
                            #{tag}
                        </span>
                    ))}
                    {circle.tags.length > 3 && (
                        <span className="px-2 py-1 text-[10px] font-medium text-zinc-400">+{circle.tags.length - 3}</span>
                    )}
                </div>

                {/* Member Preview & Activity */}
                {circle.recentMembers && circle.recentMembers.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-zinc-50">
                        <div className="flex items-center justify-between">
                            <AvatarStack members={circle.recentMembers} maxDisplay={4} />
                            {circle.activeMembers && circle.activeMembers > 0 ? (
                                <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    {circle.activeMembers} online
                                </div>
                            ) : circle.lastActivity ? (
                                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                                    <Clock size={10} />
                                    {circle.lastActivity}
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Footer (Stats + Action) */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Users size={16} />
                        <span className="text-xs font-medium">
                            <span className="text-zinc-900 font-bold">
                                <FramerCounter value={circle.memberCount} />
                            </span>
                            <span className="text-zinc-300 mx-0.5">/</span>
                            {circle.maxMembers}
                        </span>
                    </div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            size="sm"
                            onClick={() => onJoin(circle.id)}
                            className={`relative overflow-hidden rounded-full px-5 h-9 font-bold text-xs transition-all ${circle.isJoined
                                ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md hover:shadow-lg"
                                }`}
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={circle.isJoined ? "joined" : "join"}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center"
                                >
                                    {circle.isJoined ? "Joined" : "Join Circle"}
                                    {!circle.isJoined && <ArrowRight size={14} className="ml-1" />}
                                </motion.span>
                            </AnimatePresence>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// Helper to generate consistent colors from strings
function getStringColor(str: string) {
    const colors = [
        "#3B82F6", // Blue
        "#8B5CF6", // Purple
        "#EC4899", // Pink
        "#10B981", // Emerald
        "#F59E0B", // Amber
        "#EF4444", // Red
        "#06B6D4", // Cyan
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
