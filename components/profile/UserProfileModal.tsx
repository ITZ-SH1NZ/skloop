"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, MapPin, Link as LinkIcon, Calendar, Trophy, Zap,
    MessageCircle, Loader2, Sparkles, Award
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { LevelRing } from "@/components/profile/gamification/LevelRing";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface UserProfileModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface ProfileData {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    banner_url: string | null;
    bio: string;
    location: string;
    website: string;
    level: number;
    xp: number;
    coins: number;
    streak: number;
    role: string;
    joined_at: string;
    skills: string[];
    last_seen: string | null;
}

export function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { width, height } = useWindowSize();

    // 3D Hover State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    // Current User Logic
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Interaction States
    const [showConfetti, setShowConfetti] = useState(false);
    const [propsSent, setPropsSent] = useState(false);

    // Online Status Logic
    const isOnline = profile?.last_seen
        ? (new Date().getTime() - new Date(profile.last_seen).getTime()) < 5 * 60 * 1000
        : false;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const handleSendProps = () => {
        if (propsSent) return;
        setShowConfetti(true);
        setPropsSent(true);
        // Turn off confetti after 4 seconds
        setTimeout(() => setShowConfetti(false), 4000);
    };

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchProfile = async () => {
            setIsLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (!error && data) {
                setProfile({
                    id: data.id,
                    full_name: data.full_name || "Unknown Sklooper",
                    username: data.username || `user_${data.id.substring(0, 5)}`,
                    avatar_url: data.avatar_url,
                    banner_url: data.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
                    bio: data.bio || "No bio yet. Probably busy coding or learning!",
                    location: data.location || "The Loop",
                    website: data.website || "",
                    level: data.level || 1,
                    xp: data.xp || 0,
                    coins: data.coins || 0,
                    streak: data.streak || 0,
                    role: data.role || "Learner",
                    joined_at: data.joined_at || new Date().toISOString(),
                    skills: data.skills || [],
                    last_seen: data.last_seen || null
                });
            }
            setIsLoading(false);
        };

        const fetchCurrentUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };

        fetchProfile();
        fetchCurrentUser();
    }, [userId, isOpen]);

    const isCurrentUser = userId === currentUserId;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEsc);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Confetti Explosion */}
                    {showConfetti && (
                        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
                            <Confetti
                                width={width}
                                height={height}
                                recycle={false}
                                numberOfPieces={400}
                                gravity={0.15}
                                colors={['#D4F268', '#FFFFFF', '#000000', '#A3E635', '#FACC15']}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                animate={{ opacity: [0, 1, 1, 0], y: -100, scale: [0.5, 1.2, 1, 1] }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className="absolute text-4xl md:text-6xl font-black text-[#D4F268] drop-shadow-[0_0_15px_rgba(212,242,104,0.8)] z-[70]"
                            >
                                +10 XP!
                            </motion.div>
                        </div>
                    )}

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-[#FAFAFA] rounded-[2rem] shadow-2xl overflow-hidden z-50 flex flex-col"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D4F268] hover:text-black transition-all"
                        >
                            <X size={18} strokeWidth={3} />
                        </button>

                        {isLoading || !profile ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-[#D4F268]" />
                                <p className="text-zinc-500 font-bold animate-pulse">Summoning profile...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col relative w-full h-full max-h-[85vh] overflow-y-auto no-scrollbar">
                                {/* Banner with 3D Hover */}
                                <motion.div
                                    className="h-40 md:h-48 relative overflow-hidden group shrink-0"
                                    onMouseMove={handleMouseMove}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => {
                                        setIsHovering(false);
                                        setMousePos({ x: 0, y: 0 });
                                    }}
                                    style={{ perspective: 1000 }}
                                >
                                    <motion.div
                                        animate={{
                                            rotateY: isHovering ? mousePos.x * 10 : 0,
                                            rotateX: isHovering ? -mousePos.y * 10 : 0,
                                            scale: isHovering ? 1.05 : 1,
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="w-full h-full relative"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={profile.banner_url!}
                                            alt="Banner"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                                    </motion.div>
                                </motion.div>

                                {/* Body */}
                                <div className="px-6 pb-6 relative pt-12 flex-1">
                                    {/* Avatar & Level Ring */}
                                    <div className="absolute -top-16 left-6 flex items-end gap-4">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: 0.1, bounce: 0.5 }}
                                            className="relative"
                                        >
                                            <LevelRing level={profile.level} progress={(profile.xp % 500) / 500 * 100} size={100} colorClass="text-[#D4F268]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                                                    alt={profile.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </LevelRing>
                                        </motion.div>
                                    </div>

                                    {/* Basic Info */}
                                    <div className="mt-4 flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none group cursor-default">
                                                {profile.full_name}
                                                <span className="block text-sm text-zinc-500 font-bold mt-1 group-hover:text-[#D4F268] transition-colors">
                                                    @{profile.username}
                                                </span>
                                            </h2>
                                            <div className="flex gap-2 shrink-0 items-center">
                                                {isOnline && (
                                                    <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100/50">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-wide">Online</span>
                                                    </div>
                                                )}
                                                <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">
                                                    {profile.role} Track
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-zinc-600 text-sm mt-3 font-medium leading-relaxed">
                                            {profile.bio}
                                        </p>

                                        {/* Skills Pills */}
                                        {profile.skills && profile.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {profile.skills.map((skill, i) => (
                                                    <motion.div
                                                        key={skill}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.2 + i * 0.05, type: "spring" }}
                                                        whileHover={{ scale: 1.05 }}
                                                        className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-600 shadow-sm hover:border-[#D4F268] hover:text-black cursor-default transition-colors"
                                                    >
                                                        {skill}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Links/Dates Row */}
                                        <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-zinc-400">
                                            <div className="flex items-center gap-1.5 hover:text-zinc-600 transition-colors">
                                                <MapPin size={14} className="text-[#D4F268]" />
                                                {profile.location}
                                            </div>
                                            {profile.website && (
                                                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#D4F268] transition-colors">
                                                    <LinkIcon size={14} className="text-[#D4F268]" />
                                                    {profile.website.replace(/(^\w+:|^)\/\//, '')}
                                                </a>
                                            )}
                                            <div className="flex items-center gap-1.5 hover:text-zinc-600 transition-colors">
                                                <Calendar size={14} className="text-[#D4F268]" />
                                                Joined {new Date(profile.joined_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gamified Stats */}
                                    <div className="grid grid-cols-3 gap-3 mt-6">
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            className="bg-zinc-900 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-lg shadow-zinc-900/10 border border-zinc-800"
                                        >
                                            <Trophy size={20} className="text-[#D4F268] mb-1" />
                                            <span className="text-lg font-black text-white">{profile.xp.toLocaleString()}</span>
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total XP</span>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            className="bg-zinc-900 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-lg shadow-zinc-900/10 border border-zinc-800"
                                        >
                                            <Zap size={20} className="text-[#D4F268] fill-[#D4F268] mb-1" />
                                            <span className="text-lg font-black text-white">{profile.streak}</span>
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Day Streak</span>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            className="bg-zinc-900 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-lg shadow-zinc-900/10 border border-zinc-800"
                                        >
                                            <CurrencyCoin size="sm" className="w-5 h-5 mb-1" />
                                            <span className="text-lg font-black text-white">{profile.coins.toLocaleString()}</span>
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Loop Coins</span>
                                        </motion.div>
                                    </div>

                                    {/* Action Banner */}
                                    <div className="mt-6 flex gap-3">
                                        {!isCurrentUser ? (
                                            <>
                                                <Button
                                                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl py-6 shadow-md transition-all hover:scale-[1.02] border border-zinc-800 group relative overflow-hidden"
                                                    onClick={handleSendProps}
                                                    disabled={propsSent}
                                                >
                                                    {propsSent ? (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="flex items-center text-[#D4F268]"
                                                        >
                                                            <Sparkles size={18} className="mr-2" />
                                                            Props Sent!
                                                        </motion.div>
                                                    ) : (
                                                        <>
                                                            <Award size={18} className="mr-2 group-hover:text-[#D4F268] transition-colors" />
                                                            Send Props
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-[#D4F268] hover:bg-[#c1de5b] text-black font-black rounded-xl py-6 shadow-lg shadow-[#D4F268]/20 transition-all hover:scale-[1.02]"
                                                    onClick={() => {
                                                        onClose();
                                                        router.push(`/peer/chat?userId=${profile.id}`);
                                                    }}
                                                >
                                                    <MessageCircle size={18} className="mr-2 fill-black" />
                                                    Start Chat
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl py-6 shadow-md transition-all hover:scale-[1.02] border border-zinc-800"
                                                onClick={() => {
                                                    onClose();
                                                    router.push(`/profile`);
                                                }}
                                            >
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
