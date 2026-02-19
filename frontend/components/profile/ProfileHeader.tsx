"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, MapPin, Link as LinkIcon, Flame, Trophy, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface User {
    coins: number;
    xp: number;
    nextLevelXp: number;
    name?: string;
    username?: string;
    location?: string;
    website?: string;
    level?: number;
    streak?: number;
    rank?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface ProfileHeaderProps {
    user: User;
    isEditMode: boolean;
    toggleEditMode: () => void;
}

const COVERS = [
    "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
    "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500",
    "bg-gradient-to-r from-emerald-400 to-cyan-400",
    "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-zinc-900",
];

export function ProfileHeader({ user, isEditMode, toggleEditMode }: ProfileHeaderProps) {
    const [coverIndex, setCoverIndex] = useState(1);

    const handleCoverChange = () => {
        setCoverIndex((prev) => (prev + 1) % COVERS.length);
    };

    return (
        <div className="relative mb-20 md:mb-24">
            {/* Cover Image */}
            <motion.div
                layoutId="profile-cover"
                className={cn(
                    "h-48 md:h-64 w-full rounded-b-[2.5rem] md:rounded-[2.5rem] relative overflow-hidden shadow-sm transition-colors duration-500",
                    COVERS[coverIndex]
                )}
            >
                <div className="absolute inset-0 bg-black/10" />

                {isEditMode && (
                    <Button
                        onClick={handleCoverChange}
                        variant="ghost"
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-none rounded-full"
                    >
                        <Camera size={18} className="mr-2" /> Change Cover
                    </Button>
                )}
            </motion.div>

            {/* Avatar & Info Container */}
            <div className="absolute -bottom-12 md:-bottom-16 left-0 right-0 px-6 md:px-12 flex flex-col md:flex-row items-end md:items-end gap-6">

                {/* Avatar */}
                <div className="relative group">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] bg-white p-2 shadow-xl relative z-10"
                    >
                        <div className="h-full w-full rounded-[1.5rem] bg-zinc-100 overflow-hidden relative">
                            {/* Placeholder Avatar */}
                            <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-300">
                                👔
                            </div>

                            {isEditMode && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Online Indicator */}
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 border-4 border-white rounded-full" />
                    </motion.div>
                </div>

                {/* User Info */}
                <div className="flex-1 pb-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{user.name || "User Name"}</h1>
                        <span className="hidden md:flex px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                            LVL {user.level || Math.floor(user.xp / 1000) + 1}
                        </span>
                    </div>

                    <p className="text-muted-foreground font-medium text-sm md:text-base flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {user.location || "Earth"}</span>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"><LinkIcon size={14} /> {user.website || "skloop.app"}</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pb-4">
                    {/* Stats Ticker (Desktop) */}
                    <div className="hidden xl:flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100 shadow-sm mr-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><Flame size={16} /></div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-muted-foreground leading-none">Streak</p>
                                <p className="font-bold text-sm leading-none">12 Days</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg"><Trophy size={16} /></div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-muted-foreground leading-none">Rank</p>
                                <p className="font-bold text-sm leading-none">#42</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl h-12 w-12 border-2 hover:bg-gray-50"
                        onClick={toggleEditMode}
                    >
                        <Settings size={20} />
                    </Button>

                    <Button className="rounded-xl h-12 px-6 font-bold bg-black text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        Follow
                    </Button>
                </div>
            </div>
        </div>
    );
}
