"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PeerProfile } from "@/components/peer/PeerCard";
import { ChatWindow } from "@/components/peer/ChatWindow";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Loader2, MessageSquarePlus, Hash, UserCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialUserId = searchParams.get("userId");
    const initialCircleId = searchParams.get("circleId");

    const [selectedPeerId, setSelectedPeerId] = useState<string | null>(initialUserId || initialCircleId || null);

    const [searchTerm, setSearchTerm] = useState("");
    const [dms, setDms] = useState<PeerProfile[]>([]);
    const [groups, setGroups] = useState<PeerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchChats = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUserId(user.id);

            // Fetch conversations the user is a part of
            const { data: myConvos } = await supabase
                .from('conversation_participants')
                .select(`
                    conversation_id,
                    conversations (
                        id, type, title, tags, description
                    )
                `)
                .eq('user_id', user.id);

            if (!myConvos || myConvos.length === 0) {
                // Check if we need to create a DM from initialUserId
                if (initialUserId) {
                    await handleEnsureDM(user.id, initialUserId, supabase);
                }
                setIsLoading(false);
                return;
            }

            const convoIds = myConvos.map((mc: any) => mc.conversation_id);

            // Fetch all participants for these convos to get peer details
            const { data: allParticipants } = await supabase
                .from('conversation_participants')
                .select(`
                    conversation_id,
                    user_id,
                    profiles (
                        id, username, full_name, avatar_url, role
                    )
                `)
                .in('conversation_id', convoIds);

            const fetchedDms: PeerProfile[] = [];
            const fetchedGroups: PeerProfile[] = [];

            myConvos.forEach((mc: any) => {
                const convo = mc.conversations;
                if (!convo) return;

                if (convo.type === 'group') {
                    fetchedGroups.push({
                        id: convo.id, // Study Circle IDs stay as their UUID
                        name: convo.title || 'Group',
                        username: 'group',
                        track: convo.tags?.[0] || 'Study Circle',
                        level: 0, xp: 0, streak: 0, status: 'none',
                    });
                } else if (convo.type === 'direct') {
                    // Find the OTHER participant
                    const peerParticipant = allParticipants?.find((p: any) => p.conversation_id === convo.id && p.user_id !== user.id);
                    if (peerParticipant && peerParticipant.profiles) {
                        const profile = Array.isArray(peerParticipant.profiles) ? peerParticipant.profiles[0] : peerParticipant.profiles as any;
                        fetchedDms.push({
                            id: convo.id, // The DM list uses the CURRENT conversation ID
                            name: profile?.full_name || profile?.username || 'User',
                            username: profile?.username || '',
                            avatarUrl: profile?.avatar_url,
                            track: profile?.role || 'Learner',
                            level: 0, xp: 0, streak: 0, status: 'none',
                        });
                    }
                }
            });

            setDms(fetchedDms);
            setGroups(fetchedGroups);

            // If initialUserId is present, make sure a DM exists
            if (initialUserId) {
                await handleEnsureDM(user.id, initialUserId, supabase, fetchedDms);
            }

            setIsLoading(false);
        };
        fetchChats();
    }, [initialUserId, initialCircleId]);

    const handleEnsureDM = async (myId: string, targetUserId: string, supabase: any, currentDms: PeerProfile[] = []) => {
        // Quick check if we already have a DM with them 
        // We'd need to know targetUserId. Wait, the `dms` stores conversation_id as `id`. We don't have targetUserId easily.
        // Let's just query Supabase to see if a direct convo exists between us.
        const { data: existingConvos } = await supabase
            .rpc('get_direct_conversation', { user1_id: myId, user2_id: targetUserId });
        // NOTE: get_direct_conversation might not exist. Let's do it manually.

        // Simpler manual approach:
        const { data: p1 } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', myId);
        const { data: p2 } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', targetUserId);

        let foundConvoId = null;
        if (p1 && p2) {
            const p1Ids = p1.map((p: any) => p.conversation_id);
            const p2Ids = p2.map((p: any) => p.conversation_id);
            const intersection = p1Ids.filter((id: any) => p2Ids.includes(id));

            if (intersection.length > 0) {
                // Verify it's a direct convo
                const { data: c } = await supabase.from('conversations').select('id').in('id', intersection).eq('type', 'direct').single();
                if (c) foundConvoId = c.id;
            }
        }

        if (foundConvoId) {
            setSelectedPeerId(foundConvoId);
            // Replace URL
            router.replace('/peer/chat');
        } else {
            // Create New DM
            const { data: newConvo } = await supabase.from('conversations').insert({ type: 'direct' }).select().single();
            if (newConvo) {
                await supabase.from('conversation_participants').insert([
                    { conversation_id: newConvo.id, user_id: myId },
                    { conversation_id: newConvo.id, user_id: targetUserId }
                ]);

                // Fetch target profile to add to UI
                const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
                if (targetProfile) {
                    const newDm: PeerProfile = {
                        id: newConvo.id,
                        name: targetProfile.full_name || targetProfile.username || 'User',
                        username: targetProfile.username || '',
                        avatarUrl: targetProfile.avatar_url,
                        track: targetProfile.role || 'Learner',
                        level: 0, xp: 0, streak: 0, status: 'none',
                    };
                    setDms(prev => [...prev, newDm]);
                    setSelectedPeerId(newConvo.id);
                    router.replace('/peer/chat');
                }
            }
        }
    };

    const allChats = [...dms, ...groups];

    const selectedPeer = allChats.find(c => c.id === selectedPeerId) || null;

    const filteredChats = allChats.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-full bg-[#f8f9fa] md:rounded-[2rem] overflow-hidden border border-zinc-200/60 shadow-sm relative">
            {/* Sidebar List */}
            <div className={`w-full md:w-[380px] flex flex-col border-r border-zinc-200/60 bg-white z-10 h-full ${selectedPeerId ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile sidebar transition wrapper */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col h-full overflow-hidden"
                >
                    {/* Header Setup */}
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
                                {/* Direct Messages Section */}
                                {dms.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 px-2 mb-2 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                                            <UserCircle2 size={14} />
                                            <span>Direct Messages</span>
                                        </div>
                                        <div className="space-y-[2px]">
                                            <AnimatePresence mode="popLayout">
                                                {filteredChats.filter(c => dms.some(d => d.id === c.id)).map((chat, index) => {
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
                                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group text-left relative overflow-hidden ${isActive ? "bg-lime-50" : "hover:bg-zinc-100/60"}`}
                                                        >
                                                            {/* Active Indicator Line */}
                                                            {isActive && (
                                                                <motion.div layoutId="activeDMIndicator" className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-lime-500" />
                                                            )}

                                                            <div className="relative shrink-0 ml-1">
                                                                <Avatar
                                                                    src={chat.avatarUrl}
                                                                    fallback={chat.name.charAt(0)}
                                                                    className={`w-[46px] h-[46px] rounded-full shrink-0 object-cover ${!isActive ? 'border border-zinc-200' : ''}`}
                                                                />
                                                                {/* Online status dot could go here */}
                                                                <div className="absolute right-0 bottom-0 w-3 h-3 bg-lime-400 rounded-full border-2 border-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-1">
                                                                <div className="flex justify-between items-baseline mb-0.5">
                                                                    <span className={`text-[15px] font-semibold truncate ${isActive ? "text-lime-950" : "text-zinc-900"}`}>{chat.name}</span>
                                                                    <span className={`text-[11px] font-medium shrink-0 ml-2 ${isActive ? "text-lime-600" : "text-zinc-400"}`}>12:42 PM</span>
                                                                </div>
                                                                <div className="flex justify-between items-center gap-2">
                                                                    <span className={`text-[13px] truncate ${isActive ? "text-lime-800/80 font-medium" : "text-zinc-500"}`}>
                                                                        You: Sure, let's catch up later today!
                                                                    </span>
                                                                    {/* Unread badge example */}
                                                                    {chat.name.includes("Alice") && !isActive && (
                                                                        <div className="w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center text-[9px] font-bold text-black shadow-sm shrink-0">
                                                                            2
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Study Circles Section */}
                                {groups.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 px-2 mb-2 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                                            <Hash size={14} />
                                            <span>Study Circles</span>
                                        </div>
                                        <div className="space-y-[2px]">
                                            <AnimatePresence mode="popLayout">
                                                {filteredChats.filter(c => groups.some(g => g.id === c.id)).map((chat, index) => {
                                                    const isActive = selectedPeerId === chat.id;
                                                    return (
                                                        <motion.button
                                                            layout
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ delay: (dms.length + index) * 0.03 }}
                                                            key={chat.id}
                                                            onClick={() => setSelectedPeerId(chat.id)}
                                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group text-left relative overflow-hidden ${isActive ? "bg-lime-50" : "hover:bg-zinc-100/60"}`}
                                                        >
                                                            {/* Active Indicator Line */}
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
                                                                    <span className={`text-[11px] font-medium shrink-0 ml-2 ${isActive ? "text-lime-700" : "text-zinc-400"}`}>Yesterday</span>
                                                                </div>
                                                                <div className="flex justify-between items-center gap-2">
                                                                    <span className={`text-[13px] truncate ${isActive ? "text-lime-800/80 font-medium" : "text-zinc-500"}`}>
                                                                        <span className="font-semibold text-zinc-700">Alex:</span> I just pushed the new design to staging!
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

                                {dms.length === 0 && groups.length === 0 && (
                                    <div className="text-center py-10 px-4">
                                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageSquarePlus className="text-zinc-400" size={24} />
                                        </div>
                                        <h3 className="text-sm rounded-full font-semibold text-zinc-900 mb-1">No chats found</h3>
                                        <p className="text-xs text-zinc-500">Search for peers to start a conversation.</p>
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
                        // Mobile: Fixed inset-0 with dVH to handle mobile bars correctly. desktop: static
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
                        {/* Decorative background blocks */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-zinc-200 rounded-full blur-3xl opacity-40 pointer-events-none" />

                        <div className="w-20 h-20 bg-white shadow-xl shadow-zinc-200/40 rounded-3xl flex items-center justify-center mb-6 border border-zinc-100 rotate-[-4deg]">
                            <MessageSquarePlus className="text-zinc-800" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Your Messages</h3>
                        <p className="text-zinc-500 text-sm max-w-[260px] text-center mb-6">Connect with peers or jump into a study circle to start collaborating.</p>
                        <button className="px-5 py-2.5 bg-lime-400 hover:bg-lime-500 text-black rounded-xl text-sm font-bold transition-colors shadow-sm">
                            Start a New Chat
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
