"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PeerProfile } from "@/components/peer/PeerCard";
import { ChatWindow } from "@/components/peer/ChatWindow";
import { Avatar } from "@/components/ui/Avatar";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data reusing PeerProfile structure but simplified list
// Extended to include Group Chats (Study Circles)
// TODO: Fetch chats from backend
const MOCK_CHATS: PeerProfile[] = [];

// TODO: Fetch groups from backend
const MOCK_GROUPS: PeerProfile[] = [];

export default function ChatPage() {
    const searchParams = useSearchParams();
    const initialUserId = searchParams.get("userId");
    const initialCircleId = searchParams.get("circleId");

    const [selectedPeerId, setSelectedPeerId] = useState<string | null>(initialUserId || (initialCircleId ? `g${initialCircleId}` : null));
    // Hack: mapping circleId 1->g1, 2->g2 for mock demo

    const [searchTerm, setSearchTerm] = useState("");

    // Sync state if URL changes (optional, but good for deep linking)
    useEffect(() => {
        if (initialUserId) setSelectedPeerId(initialUserId);
        if (initialCircleId) setSelectedPeerId(`g${initialCircleId}`);
    }, [initialUserId, initialCircleId]);

    // Combine individual chats and groups
    // In a real app, you'd fetch "My Chats" which includes both DMs and Groups
    const allChats = [...MOCK_CHATS, ...MOCK_GROUPS];

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
                        <div>
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2">
                                Direct Messages ({MOCK_CHATS.length})
                            </h3>
                            <div className="space-y-1">
                                <AnimatePresence mode="popLayout">
                                    {filteredChats.filter(c => !c.id.startsWith("g")).map((chat, index) => (
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
                                                {chat.isOnline && (
                                                    <div className="absolute bottom-0 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className={`text-sm font-bold truncate ${selectedPeerId === chat.id ? "text-white" : "text-zinc-900"}`}>{chat.name}</span>
                                                    <span className={`text-[10px] font-medium ${selectedPeerId === chat.id ? "text-zinc-400" : "text-zinc-400"}`}>10:42 AM</span>
                                                </div>
                                                <div className={`text-xs truncate font-medium ${selectedPeerId === chat.id ? "text-zinc-300" : "text-zinc-500"}`}>
                                                    {chat.track} • {chat.id === "1" ? "Sent a photo" : "Sure thing!"}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Study Circles Section */}
                        <div>
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2">
                                Study Circles ({MOCK_GROUPS.length})
                            </h3>
                            <div className="space-y-1">
                                <AnimatePresence mode="popLayout">
                                    {filteredChats.filter(c => c.id.startsWith("g")).map((chat, index) => (
                                        <motion.button
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: (MOCK_CHATS.length + index) * 0.05 }}
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
                                                    <span className={`text-[10px] font-medium ${selectedPeerId === chat.id ? "text-lime-100" : "text-zinc-400"}`}>10:42 AM</span>
                                                </div>
                                                <div className={`text-xs truncate font-medium ${selectedPeerId === chat.id ? "text-lime-50/90" : "text-zinc-500"}`}>
                                                    {chat.track}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
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
