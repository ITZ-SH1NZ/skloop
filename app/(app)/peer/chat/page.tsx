"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PeerProfile } from "@/components/peer/PeerCard";
import { ChatWindow } from "@/components/peer/ChatWindow";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Loader2, MessageSquarePlus, Hash, UserCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getUserConversations, getOrCreateDirectConversation } from "@/actions/chat-actions";

// ⚠️ Next.js App Router: useSearchParams() MUST be inside a <Suspense> boundary.
// So the actual page logic lives in ChatPageContent, and the default export wraps it.
function ChatPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialUserId = searchParams.get("userId");
    const initialCircleId = searchParams.get("circleId");

    const [selectedPeerId, setSelectedPeerId] = useState<string | null>(initialCircleId || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [dms, setDms] = useState<PeerProfile[]>([]);
    const [groups, setGroups] = useState<PeerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const { dms: fetchedDms, groups: fetchedGroups } = await getUserConversations();
                setDms(fetchedDms as PeerProfile[]);
                setGroups(fetchedGroups as PeerProfile[]);

                // If opened with a specific userId, ensure a DM exists and select it
                if (initialUserId) {
                    const convoId = await getOrCreateDirectConversation(initialUserId);
                    if (convoId) {
                        // Add the DM to local state FIRST (with a placeholder),
                        // then enrich with profile data. Never gate the chat on profile fetch.
                        if (!fetchedDms.find((d: any) => d.id === convoId)) {
                            // Add placeholder immediately so the chat window renders
                            setDms(prev => [...prev, {
                                id: convoId,
                                name: 'Loading...',
                                username: '',
                                type: 'direct' as const,
                                track: 'Learner',
                                level: 0, xp: 0, streak: 0, status: 'none' as const,
                            }]);

                            // Then enrich with real profile data in the background
                            const supabase = createClient();
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('id, full_name, username, avatar_url, role')
                                .eq('id', initialUserId)
                                .single();

                            if (profile) {
                                setDms(prev => prev.map(d => d.id === convoId ? {
                                    ...d,
                                    name: profile.full_name || profile.username || 'User',
                                    username: profile.username || '',
                                    avatarUrl: profile.avatar_url,
                                    track: profile.role || 'Learner',
                                } : d));
                            }
                        }

                        // Select the chat — this must happen AFTER adding to state above
                        setSelectedPeerId(convoId);
                        router.replace('/peer/chat');
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUserId, initialCircleId]);

    const allChats = [...dms, ...groups];
    const selectedPeer = allChats.find(c => c.id === selectedPeerId) || null;

    const filteredDms = dms.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredGroups = groups.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-full bg-[#f8f9fa] md:rounded-[2rem] overflow-hidden border border-zinc-200/60 shadow-sm relative">
            {/* Sidebar List */}
            <div className={`w-full md:w-[380px] flex flex-col border-r border-zinc-200/60 bg-white z-10 h-full ${selectedPeerId ? 'hidden md:flex' : 'flex'}`}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col h-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="pt-6 pb-4 px-5 shrink-0 bg-white">
                        <div className="flex items-center justify-between xl:justify-start xl:gap-4 mb-5">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Chats</h2>
                            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors xl:ml-auto">
                                <MessageSquarePlus size={18} />
                            </button>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-lime-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-100/80 border-0 rounded-xl pl-10 pr-4 py-2.5 text-[15px] font-medium outline-none focus:ring-2 focus:ring-lime-500/50 focus:bg-white transition-all shadow-sm placeholder:text-zinc-500 text-zinc-900"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="animate-spin text-zinc-300 w-6 h-6" />
                            </div>
                        ) : (
                            <>
                                {/* Direct Messages */}
                                {filteredDms.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 px-2 mb-2 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                                            <UserCircle2 size={14} />
                                            <span>Direct Messages</span>
                                        </div>
                                        <div className="space-y-[2px]">
                                            <AnimatePresence mode="popLayout">
                                                {filteredDms.map((chat, index) => {
                                                    const isActive = selectedPeerId === chat.id;
                                                    return (
                                                        <motion.button
                                                            layout
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ delay: index * 0.03 }}
                                                            key={chat.id}
                                                            onClick={() => setSelectedPeerId(chat.id)}
                                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 text-left relative overflow-hidden ${isActive ? "bg-lime-50" : "hover:bg-zinc-100/60"}`}
                                                        >
                                                            {isActive && (
                                                                <motion.div layoutId="activeDMIndicator" className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-lime-500" />
                                                            )}
                                                            <div className="relative shrink-0 ml-1">
                                                                <Avatar
                                                                    src={chat.avatarUrl}
                                                                    fallback={chat.name.charAt(0)}
                                                                    className="w-[46px] h-[46px] rounded-full shrink-0 object-cover border border-zinc-200"
                                                                />
                                                                <div className="absolute right-0 bottom-0 w-3 h-3 bg-lime-400 rounded-full border-2 border-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-1">
                                                                <div className="flex justify-between items-baseline mb-0.5">
                                                                    <span className={`text-[15px] font-semibold truncate ${isActive ? "text-lime-950" : "text-zinc-900"}`}>{chat.name}</span>
                                                                    <span className={`text-[11px] font-medium shrink-0 ml-2 ${isActive ? "text-lime-600" : "text-zinc-400"}`}>
                                                                        {formatTime(chat.lastMessageAt)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center gap-2">
                                                                    <span className={`text-[13px] truncate ${isActive ? "text-lime-800/80 font-medium" : "text-zinc-500"}`}>
                                                                        {chat.lastMessage || 'No messages yet'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Study Circles */}
                                {filteredGroups.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 px-2 mb-2 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                                            <Hash size={14} />
                                            <span>Study Circles</span>
                                        </div>
                                        <div className="space-y-[2px]">
                                            <AnimatePresence mode="popLayout">
                                                {filteredGroups.map((chat, index) => {
                                                    const isActive = selectedPeerId === chat.id;
                                                    return (
                                                        <motion.button
                                                            layout
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ delay: index * 0.03 }}
                                                            key={chat.id}
                                                            onClick={() => setSelectedPeerId(chat.id)}
                                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 text-left relative overflow-hidden ${isActive ? "bg-lime-50" : "hover:bg-zinc-100/60"}`}
                                                        >
                                                            {isActive && (
                                                                <motion.div layoutId="activeGroupIndicator" className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-lime-500" />
                                                            )}
                                                            <div className="relative shrink-0 ml-1">
                                                                <div className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${isActive ? "bg-lime-400 text-black border border-lime-500/20" : "bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-500 border border-zinc-200/60"}`}>
                                                                    {chat.name.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-1">
                                                                <div className="flex justify-between items-baseline mb-0.5">
                                                                    <span className={`text-[15px] font-semibold truncate ${isActive ? "text-lime-950" : "text-zinc-900"}`}>{chat.name}</span>
                                                                    <span className={`text-[11px] font-medium shrink-0 ml-2 ${isActive ? "text-lime-700" : "text-zinc-400"}`}>
                                                                        {formatTime(chat.lastMessageAt)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center gap-2">
                                                                    <span className={`text-[13px] truncate ${isActive ? "text-lime-800/80 font-medium" : "text-zinc-500"}`}>
                                                                        {chat.lastMessage || 'No messages yet'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {filteredDms.length === 0 && filteredGroups.length === 0 && (
                                    <div className="text-center py-10 px-4">
                                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageSquarePlus className="text-zinc-400" size={24} />
                                        </div>
                                        <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                                            {searchTerm ? 'No results found' : 'No chats yet'}
                                        </h3>
                                        <p className="text-xs text-zinc-500">
                                            {searchTerm ? 'Try a different name.' : 'Find a peer to start a conversation.'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Chat Area */}
            <AnimatePresence mode="popLayout">
                {selectedPeer ? (
                    <motion.div
                        key={selectedPeer.id}
                        className="fixed inset-0 h-[100dvh] md:h-auto md:static md:inset-auto md:flex-1 md:flex md:flex-col bg-white z-50 md:z-auto shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.05)] md:shadow-none"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <ChatWindow
                            peer={selectedPeer}
                            onBack={() => setSelectedPeerId(null)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        className="hidden md:flex flex-1 flex-col h-full bg-[#f8f9fa] items-center justify-center relative overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-zinc-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
                        <div className="w-20 h-20 bg-white shadow-xl shadow-zinc-200/40 rounded-3xl flex items-center justify-center mb-6 border border-zinc-100 rotate-[-4deg]">
                            <MessageSquarePlus className="text-zinc-800" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Your Messages</h3>
                        <p className="text-zinc-500 text-sm max-w-[260px] text-center mb-6">Connect with peers or jump into a study circle to start collaborating.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Default export wraps in Suspense so useSearchParams works correctly
export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-zinc-300 w-6 h-6" />
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    );
}
