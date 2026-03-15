"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Calendar, LogOut, Bell, Search, MessageSquare, Loader2, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PeerProfile } from "./PeerCard";
import { useState, useEffect } from "react";
import { getConversationMembers } from "@/actions/chat-actions";
import { GroupSettingsModal } from "./GroupSettingsModal";
import { createClient } from "@/utils/supabase/client";

interface CircleInfoPanelProps {
    peer: PeerProfile;
    isOpen: boolean;
    onClose: () => void;
    supabase: any;
    onUpdate?: (updatedData: { name: string, description: string, avatarUrl: string, privacy: string }) => void;
}

interface Member {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role: string;
    joinedAt: string;
}

export function CircleInfoPanel({ peer, isOpen, onClose, supabase, onUpdate }: CircleInfoPanelProps) {
    const [activeTab, setActiveTab] = useState<"members" | "resources">("members");
    const [memberSearch, setMemberSearch] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState("member");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || peer.type !== 'group') return;
        const fetchMembers = async () => {
            setIsLoadingMembers(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) setCurrentUserId(user.id);

                const data = await getConversationMembers(peer.id);
                setMembers(data as Member[]);

                if (user && data) {
                    const me = (data as Member[]).find(m => m.id === user.id);
                    if (me) setCurrentUserRole(me.role);
                }
            } finally {
                setIsLoadingMembers(false);
            }
        };
        fetchMembers();
    }, [isOpen, peer.id, peer.type]);

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.username.toLowerCase().includes(memberSearch.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 z-50 w-full md:w-80 bg-white border-l border-zinc-200 shadow-xl flex flex-col md:static md:h-full"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
                            <h3 className="font-bold text-zinc-900">Circle Info</h3>
                            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full h-8 w-8">
                                <X size={18} />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* Circle Branding */}
                            <div className="p-6 flex flex-col items-center border-b border-zinc-100 bg-zinc-50/50">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime-200 to-lime-400 flex items-center justify-center text-4xl font-black mb-3 border-4 border-white shadow-md">
                                    {peer.name.charAt(0)}
                                </div>
                                <h2 className="text-xl font-black text-zinc-900 text-center leading-tight mb-1">{peer.name}</h2>
                                <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium mb-4">
                                    <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-700 text-xs font-bold border border-lime-200">
                                        {peer.track}
                                    </span>
                                    <span>•</span>
                                    <span>{isLoadingMembers ? '...' : `${members.length} member${members.length !== 1 ? 's' : ''}`}</span>
                                </div>

                                <div className="flex gap-2 w-full">
                                    <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs font-bold border-zinc-200 hover:bg-white hover:text-zinc-900">
                                        <Bell size={14} className="mr-2" />
                                        Mute
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSettingsOpen(true)}
                                        className="flex-1 rounded-xl h-9 text-xs font-bold border-zinc-200 hover:bg-white hover:text-zinc-900"
                                    >
                                        <Settings size={14} className="mr-2" />
                                        Settings
                                    </Button>
                                </div>
                            </div>

                            {/* About */}
                            <div className="p-6 border-b border-zinc-100">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">About</h4>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    {peer.track} study circle. Collaborate, ask questions, and grow together! 🚀
                                </p>
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                                        <Hash size={16} className="text-zinc-400" />
                                        <span>{peer.track?.toLowerCase()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                                        <Calendar size={16} className="text-zinc-400" />
                                        <span>Study Circle</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="sticky top-0 bg-white z-10 border-b border-zinc-100 flex">
                                <button
                                    onClick={() => setActiveTab("members")}
                                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "members" ? "border-lime-500 text-lime-700" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}
                                >
                                    Members {members.length > 0 && `(${members.length})`}
                                </button>
                                <button
                                    onClick={() => setActiveTab("resources")}
                                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "resources" ? "border-lime-500 text-lime-700" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}
                                >
                                    Resources
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-2">
                                {activeTab === "members" && (
                                    <div className="space-y-1">
                                        <div className="p-2 sticky top-12 bg-white z-10">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search members..."
                                                    value={memberSearch}
                                                    onChange={(e) => setMemberSearch(e.target.value)}
                                                    className="w-full bg-zinc-100 rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-lime-500/10"
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                                            {isLoadingMembers ? (
                                                <div className="flex justify-center py-8">
                                                    <Loader2 className="animate-spin text-zinc-300 w-5 h-5" />
                                                </div>
                                            ) : filteredMembers.length === 0 ? (
                                                <div className="text-center py-8 text-zinc-400 text-xs">No members found</div>
                                            ) : filteredMembers.map(member => (
                                                <button key={member.id} className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-xl transition-colors text-left group">
                                                    <div className="relative">
                                                        <Avatar src={member.avatarUrl} fallback={member.name[0]} className="w-9 h-9 rounded-full border border-zinc-100" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-zinc-900 truncate">{member.name}</span>
                                                            {member.role !== "member" && (
                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${member.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                                                    {member.role}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500 font-medium">@{member.username}</p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MessageSquare size={16} className="text-zinc-400 hover:text-lime-600" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "resources" && (
                                    <div className="p-4 text-center">
                                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Hash size={20} className="text-zinc-400" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-900">No resources yet</p>
                                        <p className="text-xs text-zinc-500 mt-1">Shared links and files will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-10 rounded-xl">
                                <LogOut size={18} className="mr-3" />
                                Leave Circle
                            </Button>
                        </div>
                    </motion.div>

                    {/* Settings Modal */}
                    <GroupSettingsModal
                        peer={peer}
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        currentUserRole={currentUserRole}
                        onUpdate={onUpdate}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
