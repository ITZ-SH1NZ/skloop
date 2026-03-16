"use client";

import { Search, Bell, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/user-actions";
import { LottieFlame } from "@/components/ui/LottieFlame";

interface Notification {
    id: string;
    title: string;
    content: string | null;
    type: string;
    is_read: boolean;
    metadata: any;
    created_at: string;
}

export default function DashboardHeader({ initialUser }: { initialUser?: any }) {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const { profile: userProfile } = useUser();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch notifications from Supabase
    const fetchNotifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('id, title, content, type, is_read, metadata, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    }, [supabase]);

    useEffect(() => {
        fetchNotifications();

        // The real-time listening is now handled globally by NotificationListener.
        // We just need to ensure the local unread count stays updated.
        // In a more advanced version, we'd use SWR mutation or a shared state.
    }, [fetchNotifications]);

    const handleMarkAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleMarkRead = async (id: string) => {
        const notif = notifications.find(n => n.id === id);
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Redirect if it's a message notification
        if (notif?.type === 'message' && notif.metadata?.conversation_id) {
            router.push(`/peer/chat?circleId=${notif.metadata.conversation_id}`);
            setNotificationsOpen(false);
        }
    };

    // Instant logout via Server Action
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            const result = await signOutAction();
            if (result.success) {
                // Use window.location for a full page refresh/clear on logout
                window.location.href = '/login';
            }
        } catch (error) {
            console.error("Logout failed:", error);
            // Fallback for safety
            supabase.auth.signOut();
            window.location.href = '/login';
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const typeIcon = (type: string) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return '🔔';
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8 relative z-10 w-full">
                <div className="shrink-0">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl md:text-2xl font-bold text-slate-900"
                    >
                        Dashboard
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-xs md:text-sm hidden sm:block"
                    >
                        Welcome back, {userProfile?.full_name || userProfile?.username || "Loading..."}!
                    </motion.p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1 justify-start md:justify-end min-w-0">
                    {/* Search */}
                    <div className="relative flex-1 md:flex-initial md:min-w-[180px] lg:min-w-[280px] xl:min-w-[380px] group order-last md:order-none">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-[#D4F268] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-200 bg-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F268] focus:border-transparent transition-all shadow-sm"
                        />
                    </div>

                    {/* XP Widget */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-white border border-slate-200 pl-1.5 pr-3 py-1.5 rounded-full shadow-sm cursor-default shrink-0"
                    >
                        <div className="relative w-[1.75rem] h-[1.75rem] md:w-8 md:h-8 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="50%" cy="50%" r="40%" stroke="#e2e8f0" strokeWidth="2.5" fill="none" />
                                <circle
                                    cx="50%" cy="50%" r="40%"
                                    stroke="#D4F268" strokeWidth="2.5" fill="none"
                                    strokeDasharray="88"
                                    strokeDashoffset={isNaN(userProfile?.xp ?? 0) ? 88 : 88 * (1 - (((userProfile?.xp ?? 0) % 500) / 500))}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-[8px] md:text-[10px] font-black text-slate-900">{userProfile?.level || 1}</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">Lvl {userProfile?.level || 1}</span>
                            <span className="text-xs md:text-sm font-black text-slate-900 inline-flex items-center gap-0.5">
                                <motion.span
                                    key={userProfile?.xp}
                                    initial={{ y: -10, opacity: 0, scale: 1.2 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                >
                                    {(userProfile?.xp || 0).toLocaleString()}
                                </motion.span>
                                <span className="text-[10px] text-slate-400 font-bold hidden sm:inline lg:hidden">XP</span>
                                <span className="text-[10px] text-slate-400 font-bold hidden lg:inline">XP</span>
                            </span>
                        </div>
                    </motion.div>

                    {/* Coin Widget */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 bg-[#FAFAFA] border border-slate-200 px-2.5 py-1.5 rounded-full shadow-sm cursor-pointer hover:border-[#D4F268]/50 transition-colors shrink-0"
                    >
                        <CurrencyCoin size="sm" />
                        <motion.span 
                            key={userProfile?.coins}
                            initial={{ scale: 1.3, color: "#fbbf24" }}
                            animate={{ scale: 1, color: "#0f172a" }}
                            transition={{ type: "spring", damping: 10, stiffness: 300 }}
                            className="text-xs md:text-sm font-black"
                        >
                            {(userProfile?.coins || 0).toLocaleString()}
                        </motion.span>
                    </motion.div>

                    {/* Streak Pill */}
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="flex items-center gap-1.5 bg-[#D4F268] px-3 py-2 rounded-xl md:rounded-2xl shadow-[0_4px_10px_-2px_rgba(212,242,104,0.3)] cursor-pointer shrink-0"
                        onClick={() => toast("Streak protected! Keep it up!", "success")}
                    >
                        <div className="flex items-center gap-1">
                            <LottieFlame size={20} className="-mt-0.5" />
                            <motion.span 
                                key={userProfile?.streak}
                                initial={{ scale: 1.5, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.6 }}
                                className="text-sm md:text-base font-bold text-slate-900 leading-none"
                            >
                                {userProfile?.streak || 0}
                            </motion.span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-900/60 uppercase tracking-wider hidden xl:inline">Streak</span>
                    </motion.div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Notifications Bell */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setNotificationsOpen(true)}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl border flex items-center justify-center transition-colors shadow-sm relative bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        >
                            <Bell className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {unreadCount > 0 && (
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </motion.button>

                        {/* Logout */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors disabled:opacity-60"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <span className="w-4 h-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                            ) : (
                                <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Notifications Modal Overlay */}
            <AnimatePresence>
                {notificationsOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-slate-900/30 backdrop-blur-sm"
                            onClick={() => setNotificationsOpen(false)}
                        />

                        {/* Popup Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                            style={{ maxHeight: '80vh' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div>
                                    <h2 className="font-bold text-slate-900 text-lg">Notifications</h2>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setNotificationsOpen(false)}
                                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Notification List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-3xl mb-3">🎉</p>
                                        <p className="font-bold text-slate-700">You're all caught up!</p>
                                        <p className="text-xs text-slate-400 mt-1">No new notifications right now.</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            onClick={() => handleMarkRead(n.id)}
                                            className={`p-4 rounded-2xl transition-colors cursor-pointer ${!n.is_read ? 'bg-blue-50/60 hover:bg-blue-100/60' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="flex gap-3 items-start">
                                                <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-sm font-bold text-slate-800 leading-tight ${!n.is_read ? '' : 'font-medium text-slate-600'}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                                                    </div>
                                                    {n.content && (
                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.content}</p>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1.5">{formatTimeAgo(n.created_at)}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
