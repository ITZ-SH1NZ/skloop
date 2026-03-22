'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { 
    X, MapPin, Link as LinkIcon, Calendar, Trophy, Zap, 
    Award, MessageCircle, Sparkles, Loader2, Github, ExternalLink 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ProfileHeatmap } from '@/components/profile/charts/ProfileHeatmap';
import { useLenis } from 'lenis/react';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    github_url: string | null;
    website_url: string | null;
}

// ─── Sub-component to handle hooks that need refs ───
function UserProfileModalContent({ 
    profile, 
    pinnedProjects, 
    isLoading, 
    error, 
    isCurrentUser,
    onClose,
    onSendProps,
    propsSent
}: any) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const bannerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Scroll-based parallax
    const { scrollY } = useScroll({ container: scrollRef });
    const bannerY = useTransform(scrollY, [0, 200], [0, 60]);
    const bannerOpacity = useTransform(scrollY, [0, 150], [1, 0.8]);
    const bannerBlur = useTransform(scrollY, [0, 150], ["blur(0px)", "blur(4px)"]);

    // Hover-based parallax
    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const springConfig = { stiffness: 80, damping: 20 };
    const smoothMouseX = useSpring(rawMouseX, springConfig);
    const smoothMouseY = useSpring(rawMouseY, springConfig);
    const bannerParallaxX = useTransform(smoothMouseX, [-1, 1], [-14, 14]);
    const bannerParallaxYHover = useTransform(smoothMouseY, [-1, 1], [-8, 8]);

    const handleBannerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = bannerRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawMouseX.set((e.clientX - rect.left) / rect.width * 2 - 1);
        rawMouseY.set((e.clientY - rect.top) / rect.height * 2 - 1);
    };
    const handleBannerMouseLeave = () => {
        rawMouseX.set(0);
        rawMouseY.set(0);
    };

    return (
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain no-scrollbar"
            data-lenis-prevent
        >
            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-lime-500" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <X size={28} />
                    </div>
                    <h3 className="text-xl font-black uppercase text-black mb-2">Load Failed</h3>
                    <p className="text-zinc-500 font-medium mb-6 text-sm">{error}</p>
                    <Button onClick={onClose} variant="outline" className="border-2 border-black font-bold px-8 rounded-xl h-11 uppercase text-sm">
                        Close
                    </Button>
                </div>
            )}

            {/* Content */}
            {!isLoading && !error && profile && (
                <>
                    {/* ─── BANNER ─── */}
                    <div
                        ref={bannerRef}
                        className="relative w-full h-44 sm:h-56 shrink-0 overflow-hidden bg-zinc-900 cursor-crosshair"
                        onMouseMove={handleBannerMouseMove}
                        onMouseLeave={handleBannerMouseLeave}
                    >
                        <motion.div
                            style={{ y: bannerY, x: bannerParallaxX, filter: bannerBlur, opacity: bannerOpacity }}
                            className="absolute inset-0 w-full h-full scale-110"
                        >
                            {profile.banner_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                    src={profile.banner_url} 
                                    alt="Banner" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
                                    {/* Lima glow orb */}
                                    <div className="absolute -top-16 right-8 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                </>
                            )}
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* ─── IDENTITY SECTION ─── */}
                    <motion.div
                        className="px-6 sm:px-10"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        {/* Row: PFP + Name + CTAs */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6">

                            {/* Avatar — pull up with own negative margin */}
                            <div className="relative shrink-0 z-20 -mt-16 sm:-mt-20 mx-auto sm:mx-0">
                                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[2.5rem] overflow-hidden border-[6px] border-[#FAFAFA] bg-zinc-200 shadow-2xl transition-transform hover:rotate-2">
                                    {profile.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.full_name || profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-white font-black text-5xl">
                                            {(profile.name || profile.full_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {/* Level pill */}
                                <div className="absolute -bottom-2 -right-2 bg-black text-lime-400 font-black text-sm px-3 py-1.5 rounded-xl border-4 border-[#FAFAFA] flex items-center gap-1.5 shadow-xl">
                                    <Zap size={14} className="fill-lime-400" />
                                    LVL {profile.level || 1}
                                </div>
                            </div>

                            {/* Name, "You" tag, bio */}
                            <div className="flex-1 min-w-0 pt-2 sm:pt-3 relative z-10">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-none uppercase line-clamp-1 min-w-0">
                                        {profile.full_name || profile.name || 'Unknown'}
                                    </h2>
                                    {isCurrentUser && (
                                        <span className="bg-black text-lime-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shrink-0 shadow-sm">
                                            You
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-zinc-500 max-w-md line-clamp-2">
                                    {profile.bio || 'No mission briefing recorded.'}
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="flex gap-3 shrink-0 pt-2 sm:pt-3 relative z-10">
                                {!isCurrentUser ? (
                                    <>
                                        <Button
                                            onClick={() => { onClose(); router.push(`/peer/chat?userId=${profile.id}`); }}
                                            className="h-10 bg-white hover:bg-zinc-50 text-black border-2 border-black rounded-xl font-black px-4 text-xs uppercase tracking-wide gap-1.5 shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                                        >
                                            <MessageCircle size={15} /> Chat
                                        </Button>
                                        <Button
                                            onClick={onSendProps}
                                            disabled={propsSent}
                                            className="h-10 bg-lime-400 hover:bg-lime-500 text-black border-2 border-black rounded-xl font-black px-4 text-xs uppercase tracking-wide gap-1.5 shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-60"
                                        >
                                            {propsSent ? <Sparkles size={15} /> : <Award size={15} />}
                                            {propsSent ? 'Sent!' : 'Props'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => { onClose(); router.push('/profile'); }}
                                        className="h-10 bg-black hover:bg-zinc-800 text-white rounded-xl font-black px-6 text-xs uppercase tracking-wide hover:-translate-y-0.5 transition-transform"
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* ─── META ROW ─── */}
                        <div className="flex flex-wrap gap-x-5 gap-y-2 pb-6 border-b-2 border-zinc-100 text-xs font-bold text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-zinc-400" />
                                {profile.joined_at
                                    ? `Joined ${new Date(profile.joined_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}`
                                    : 'Active member'}
                            </div>
                            {profile.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={13} className="text-zinc-400" />
                                    {profile.location}
                                </div>
                            )}
                            {profile.website && (
                                <a
                                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-lime-600 hover:underline underline-offset-2 decoration-lime-400 transition-colors"
                                >
                                    <LinkIcon size={13} className="text-lime-500" />
                                    {profile.website.replace(/(^\w+:|^)\/\//, '')}
                                </a>
                            )}
                        </div>

                        {/* ─── STATS + HEATMAP ─── */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 py-6 border-b-2 border-zinc-100"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
                        >
                            {/* Stats column */}
                            <div className="flex sm:flex-col gap-4">
                                {/* XP */}
                                <div className="flex-1 sm:flex-none bg-white border-2 border-zinc-100 rounded-2xl p-4 flex items-center gap-3 hover:border-lime-200 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
                                        <Trophy size={18} className="text-lime-600" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Total XP</div>
                                        <div className="text-xl font-black text-black leading-tight">{(profile.xp || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                                {/* Streak */}
                                <div className="flex-1 sm:flex-none bg-white border-2 border-zinc-100 rounded-2xl p-4 flex items-center gap-3 hover:border-orange-100 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                        <Zap size={18} className="text-orange-500 fill-orange-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Streak</div>
                                        <div className="text-xl font-black text-black leading-tight">{profile.streak || 0} <span className="text-sm text-zinc-400 font-bold">Days</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Heatmap */}
                            <div className="bg-white border-2 border-zinc-100 rounded-2xl p-5 hover:border-zinc-200 transition-colors overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                                        Activity Grid
                                    </h4>
                                    <span className="text-[10px] font-bold text-zinc-400">Last 91 Days</span>
                                </div>
                                <ProfileHeatmap userId={profile.id} />
                            </div>
                        </motion.div>

                        {/* ─── PINNED PROJECTS ─── */}
                        <motion.div
                            className="py-6"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
                        >
                            <h3 className="text-lg font-black uppercase tracking-tight mb-4">
                                Pinned Arsenal
                            </h3>

                            {pinnedProjects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {pinnedProjects.map((project: any, idx: number) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.07 * idx }}
                                            className="bg-white border-2 border-black rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] transition-all"
                                        >
                                            <div className="h-24 bg-zinc-100 relative overflow-hidden shrink-0">
                                                {project.thumbnail_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">No Image</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h4 className="font-black uppercase tracking-tight mb-1 text-sm leading-tight line-clamp-1">{project.title}</h4>
                                                <p className="text-[11px] font-medium text-zinc-500 line-clamp-2 mb-3 flex-1">{project.description}</p>
                                                <div className="flex gap-2">
                                                    {project.github_url && (
                                                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                            <Button variant="outline" className="w-full h-7 text-[10px] rounded-lg border-2 border-black font-black uppercase p-0 hover:bg-black hover:text-white transition-colors">
                                                                <Github size={11} className="mr-1" /> Repo
                                                            </Button>
                                                        </a>
                                                    )}
                                                    {project.website_url && (
                                                        <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                            <Button className="w-full h-7 text-[10px] rounded-lg bg-lime-400 hover:bg-lime-500 border-2 border-black text-black font-black uppercase p-0 transition-colors">
                                                                <ExternalLink size={11} className="mr-1" /> Live
                                                            </Button>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-zinc-200 rounded-2xl py-8 flex flex-col items-center justify-center text-center px-4 group hover:border-zinc-400 transition-colors">
                                    <div className="w-10 h-10 bg-zinc-100 group-hover:bg-lime-100 rounded-full flex items-center justify-center mb-3 transition-colors">
                                        <Award size={18} className="text-zinc-300 group-hover:text-lime-600 transition-colors" />
                                    </div>
                                    <p className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-1">No Loadouts Pinned</p>
                                    <p className="text-zinc-400 text-[11px] font-medium max-w-xs">
                                        {isCurrentUser
                                            ? 'Go to your portfolio to pin up to 3 projects here.'
                                            : "This user hasn't pinned any projects yet."}
                                    </p>
                                </div>
                            )}
                        </motion.div>

                    </motion.div>
                </>
            )}
        </div>
    );
}

// ─── Main Modal Component ───
export default function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
    const [profile, setProfile] = useState<any>(null);
    const [pinnedProjects, setPinnedProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [propsSent, setPropsSent] = useState(false);
    
    const { width, height } = useWindowSize();
    const supabase = createClient();
    const lenis = useLenis();

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (profileError) throw profileError;
                setProfile(profileData);

                const { data: projectsData, error: projectsError } = await supabase
                    .from('user_projects')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('is_pinned', true)
                    .limit(3);

                if (!projectsError && projectsData) {
                    setPinnedProjects(projectsData);
                }
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message || "Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };

        fetchData();
        fetchCurrentUser();
        setPropsSent(false);
    }, [userId, isOpen]);

    const isCurrentUser = userId === currentUserId;

    // Lock background scroll when open
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            lenis?.stop();
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
            lenis?.start();
        };
    }, [isOpen, onClose, lenis]);

    const handleSendProps = () => {
        setPropsSent(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
                    onWheel={(e) => e.stopPropagation()}
                >
                    {showConfetti && (
                        <div className="fixed inset-0 z-[70] pointer-events-none">
                            <Confetti
                                width={width}
                                height={height}
                                recycle={false}
                                numberOfPieces={400}
                                gravity={0.15}
                                colors={['#D4F268', '#FAFAFA', '#000000']}
                            />
                        </div>
                    )}

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/55 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 60 }}
                        animate={{
                            opacity: 1, scale: 1, y: 0,
                            transition: { type: 'spring', damping: 18, stiffness: 260, mass: 0.75 }
                        }}
                        exit={{
                            opacity: 0, scale: 0.85, y: 50,
                            transition: { duration: 0.22, ease: [0.4, 0, 1, 1] }
                        }}
                        className="relative z-10 w-full max-w-3xl bg-[#FAFAFA] rounded-[2rem] shadow-[0_32px_80px_-8px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col"
                        style={{ maxHeight: 'calc(100vh - 4rem)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-30 w-9 h-9 bg-black/30 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <UserProfileModalContent 
                            profile={profile}
                            pinnedProjects={pinnedProjects}
                            isLoading={isLoading}
                            error={error}
                            isCurrentUser={isCurrentUser}
                            onClose={onClose}
                            onSendProps={handleSendProps}
                            propsSent={propsSent}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
