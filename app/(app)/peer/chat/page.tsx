"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PeerProfile } from "@/components/peer/PeerCard";
import { ChatWindow } from "@/components/peer/ChatWindow";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Loader2 } from "lucide-react";
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
        <div className="flex h-full bg-white md:rounded-3xl overflow-hidden border border-zinc-200 shadow-sm relative">
            {/* Sidebar List */}
            <div className={`w-full md:w-96 flex flex-col border-r border-zinc-100 bg-white z-10 h-full ${selectedPeerId ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile sidebar transition wrapper */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col h-full"
                >
                    <div className="p-5 border-b border-zinc-50">
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-4 px-1">Messages</h2>
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-50/80 border-0 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/10 focus:bg-white transition-all shadow-sm placeholder:text-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                        {/* Direct Messages Section */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="animate-spin text-zinc-300 w-6 h-6" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2">
                                        Direct Messages ({dms.length})
                                    </h3>
                                    <div className="space-y-1">
                                        <AnimatePresence mode="popLayout">
                                            {filteredChats.filter(c => dms.some(d => d.id === c.id)).map((chat, index) => (
                                                <motion.button
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    key={chat.id}
                                                    onClick={() => setSelectedPeerId(chat.id)}
                                                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group text-left ${selectedPeerId === chat.id ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10 scale-[1.02]" : "hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"}`}
                                                >
                                                    <div className="relative shrink-0">
                                                        <Avatar
                                                            src={chat.avatarUrl}
                                                            fallback={chat.name.charAt(0)}
                                                            className={`w-12 h-12 rounded-full border-2 transition-colors ${selectedPeerId === chat.id ? "border-zinc-700" : "border-white bg-zinc-100"}`}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className={`text-sm font-bold truncate ${selectedPeerId === chat.id ? "text-white" : "text-zinc-900"}`}>{chat.name}</span>
                                                        </div>
                                                        <div className={`text-xs truncate font-medium ${selectedPeerId === chat.id ? "text-zinc-300" : "text-zinc-500"}`}>
                                                            @{chat.username}
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                            {dms.length === 0 && <p className="text-xs text-zinc-400 px-3">No direct messages yet.</p>}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Study Circles Section */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2 mt-4">
                                        Study Circles ({groups.length})
                                    </h3>
                                    <div className="space-y-1">
                                        <AnimatePresence mode="popLayout">
                                            {filteredChats.filter(c => groups.some(g => g.id === c.id)).map((chat, index) => (
                                                <motion.button
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: (dms.length + index) * 0.05 }}
                                                    key={chat.id}
                                                    onClick={() => setSelectedPeerId(chat.id)}
                                                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group text-left relative overflow-hidden ${selectedPeerId === chat.id ? "bg-gradient-to-r from-lime-400 to-emerald-500 text-white shadow-lg shadow-lime-500/20 scale-[1.02]" : "hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"}`}
                                                >
                                                    {/* Gradient background for circles */}
                                                    {selectedPeerId !== chat.id && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-lime-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                    <div className="relative shrink-0">
                                                        <Avatar
                                                            src={chat.avatarUrl}
                                                            fallback={chat.name.charAt(0)}
                                                            className={`w-12 h-12 rounded-full border-2 transition-colors ${selectedPeerId === chat.id ? "border-lime-200" : "border-white bg-gradient-to-br from-lime-100 to-emerald-100"}`}
                                                        />
                                                        {/* Group badge */}
                                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${selectedPeerId === chat.id ? "bg-lime-500 text-white" : "bg-white text-emerald-500 shadow-sm"} ring-2 ring-white`}>
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0 relative z-10">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className={`text-sm font-bold truncate ${selectedPeerId === chat.id ? "text-white" : "text-zinc-900"}`}>{chat.name}</span>
                                                        </div>
                                                        <div className={`text-xs truncate font-medium ${selectedPeerId === chat.id ? "text-lime-50/90" : "text-zinc-500"}`}>
                                                            {chat.track}
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                            {groups.length === 0 && <p className="text-xs text-zinc-400 px-3">No study circles joined.</p>}
                                        </AnimatePresence>
                                    </div>
                                </div>
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
                        className="fixed inset-0 h-[100dvh] md:h-auto md:static md:inset-auto md:flex-1 md:flex md:flex-col bg-white md:bg-zinc-50/30 z-50 md:z-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <ChatWindow
                            peer={selectedPeer}
                            onBack={() => setSelectedPeerId(null)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        className="hidden md:flex flex-1 flex-col h-full bg-zinc-50/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ChatWindow peer={null} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
