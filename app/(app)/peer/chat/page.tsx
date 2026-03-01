"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PeerProfile } from "@/components/peer/PeerCard";
import { ChatWindow } from "@/components/peer/ChatWindow";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Loader2, MessageSquarePlus, Hash, UserCircle2, X, PenSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getUserConversations, getOrCreateDirectConversation, getFriendsList } from "@/actions/chat-actions";

// ============================================================
// NewChatPicker — Responsive: bottom-sheet on mobile, popover on desktop
// ============================================================
interface Friend { id: string; name: string; username: string; avatarUrl?: string; }

function NewChatPicker({
    onSelect,
}: {
    onSelect: (friend: Friend) => Promise<void>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [query, setQuery] = useState("");
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const [openingFor, setOpeningFor] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Fetch friends on open
    useEffect(() => {
        if (!isOpen) return;
        setIsLoadingFriends(true);
        getFriendsList().then(list => {
            setFriends(list);
            setIsLoadingFriends(false);
        });
    }, [isOpen]);

    // Close on outside click (desktop)
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen]);

    const filtered = friends.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.username.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = async (friend: Friend) => {
        setOpeningFor(friend.id);
        await onSelect(friend);
        setOpeningFor(null);
        setIsOpen(false);
        setQuery("");
    };

    const pickerContent = (
        <div className="flex flex-col overflow-hidden h-full">
            {/* Search */}
            <div className="p-3 border-b border-zinc-100 shrink-0">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search friends..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-zinc-100 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-lime-500/40 placeholder:text-zinc-400"
                    />
                </div>
            </div>

            {/* Friend list */}
            <div className="flex-1 overflow-y-auto p-2 min-h-0">
                {isLoadingFriends ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin text-zinc-300 w-5 h-5" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <p className="text-sm font-semibold text-zinc-800">
                            {friends.length === 0 ? "No friends yet" : "No results"}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                            {friends.length === 0
                                ? "Add peers from the My Peers tab first"
                                : "Try a different name"}
                        </p>
                    </div>
                ) : filtered.map(friend => (
                    <button
                        key={friend.id}
                        onClick={() => handleSelect(friend)}
                        disabled={openingFor === friend.id}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-left group disabled:opacity-60"
                    >
                        <div className="relative shrink-0">
                            <Avatar
                                src={friend.avatarUrl}
                                fallback={friend.name.charAt(0)}
                                className="w-10 h-10 rounded-full border border-zinc-100"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">{friend.name}</p>
                            <p className="text-xs text-zinc-400 font-medium">@{friend.username}</p>
                        </div>
                        {openingFor === friend.id ? (
                            <Loader2 size={16} className="animate-spin text-zinc-400 shrink-0" />
                        ) : (
                            <PenSquare size={15} className="text-zinc-300 group-hover:text-lime-500 transition-colors shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="relative">
            {/* Trigger button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(o => !o)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isOpen
                        ? "bg-lime-400 text-zinc-900"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                    }`}
                title="New message"
            >
                {isOpen ? <X size={16} /> : <MessageSquarePlus size={16} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile: full-screen bottom sheet */}
                        <motion.div
                            key="mobile-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            key="mobile-sheet"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 32 }}
                            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
                            style={{ maxHeight: "80dvh", display: "flex", flexDirection: "column" }}
                        >
                            {/* Sheet handle */}
                            <div className="flex items-center justify-between px-5 py-4 shrink-0">
                                <h3 className="font-bold text-zinc-900 text-base">New Message</h3>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex-1 min-h-0 overflow-hidden">{pickerContent}</div>
                        </motion.div>

                        {/* Desktop: anchored popover */}
                        <motion.div
                            key="desktop-popover"
                            ref={popoverRef}
                            initial={{ opacity: 0, scale: 0.95, y: -6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="hidden md:flex flex-col absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-zinc-100 z-50 overflow-hidden"
                            style={{ maxHeight: "380px" }}
                        >
                            <div className="px-4 pt-3 pb-1 shrink-0">
                                <p className="text-sm font-bold text-zinc-900">New Message</p>
                            </div>
                            <div className="flex-1 min-h-0 overflow-hidden">{pickerContent}</div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}


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
                            <div className="xl:ml-auto">
                                <NewChatPicker
                                    onSelect={async (friend) => {
                                        // Add placeholder immediately
                                        const existingInDms = dms.find(d => {
                                            // We don't know convoId yet, so we can't match by id.
                                            // Just proceed — getOrCreateDirectConversation handles deduplication.
                                            return false;
                                        });
                                        const convoId = await getOrCreateDirectConversation(friend.id);
                                        if (!convoId) return;

                                        // Add or update DM in sidebar
                                        setDms(prev => {
                                            const exists = prev.find(d => d.id === convoId);
                                            if (exists) return prev;
                                            return [...prev, {
                                                id: convoId,
                                                name: friend.name,
                                                username: friend.username,
                                                avatarUrl: friend.avatarUrl,
                                                type: 'direct' as const,
                                                track: 'Learner',
                                                level: 0, xp: 0, streak: 0, status: 'none' as const,
                                            }];
                                        });
                                        setSelectedPeerId(convoId);
                                    }}
                                />
                            </div>
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
