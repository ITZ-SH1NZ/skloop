"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Users, Inbox, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { PeerCard, PeerProfile } from "@/components/peer/PeerCard";
import { PeerProfileModal } from "@/components/peer/PeerProfileModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// Mock Data
// TODO: Fetch peers from backend
const MOCK_PEERS: PeerProfile[] = [];

export default function MyPeersPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"friends" | "explore" | "requests">("friends");
    const [searchQuery, setSearchQuery] = useState("");
    const [peers, setPeers] = useState(MOCK_PEERS);

    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addModalQuery, setAddModalQuery] = useState("");
    const [selectedPeers, setSelectedPeers] = useState<string[]>([]);

    // Profile Modal State
    const [selectedProfile, setSelectedProfile] = useState<PeerProfile | null>(null);

    // Filter Logic
    const filteredPeers = peers.filter(peer => {
        const matchesSearch = peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            peer.username.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === "friends") return peer.status === "friend";
        if (activeTab === "explore") return peer.status === "none" || peer.status === "pending_outgoing";
        if (activeTab === "requests") return peer.status === "pending_incoming";
        return false;
    });

    const handleAction = (id: string, action: string) => {
        if (action === "message") {
            // Navigate to dedicated Chat Page
            router.push(`/peer/chat?userId=${id}`);
            return;
        }

        // Mock State Update
        setPeers(prev => prev.map(p => {
            if (p.id !== id) return p;
            if (action === "add") return { ...p, status: "pending_outgoing" };
            if (action === "accept") return { ...p, status: "friend" };
            if (action === "reject") return { ...p, status: "none" };
            if (action === "remove") return { ...p, status: "none" };
            return p;
        }));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">My Peers</h1>
                    <p className="text-zinc-500 font-medium mt-1">Connect, compete, and learn together.</p>
                </div>

                {/* Search Bar - Hidden on mobile if not exploring, or simplified */}
                <div className="hidden md:block relative w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-lime-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search peers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden relative w-full mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-lime-500/20 transition-all"
                />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-zinc-100/80 rounded-2xl w-full md:w-fit backdrop-blur-sm overflow-x-auto no-scrollbar">
                {[
                    { id: "friends", label: "My Friends", icon: Users },
                    { id: "explore", label: "Find Peers", icon: UserPlus },
                    { id: "requests", label: "Requests", icon: Inbox, count: peers.filter(p => p.status === "pending_incoming").length },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            relative flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex-1 md:flex-none justify-center whitespace-nowrap
                            ${activeTab === tab.id ? "text-zinc-900 shadow-sm bg-white" : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"}
                        `}
                    >
                        <tab.icon size={14} className="md:w-4 md:h-4" />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="bg-red-500 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                {tab.count}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-3 pb-20 md:pb-0"
                >
                    {filteredPeers.length > 0 ? (
                        filteredPeers.map((peer) => (
                            <PeerCard
                                key={peer.id}
                                peer={peer}
                                onAction={(action) => handleAction(peer.id, action)}
                                onClick={() => {
                                    if (activeTab === "friends") {
                                        setSelectedProfile(peer);
                                    }
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="text-zinc-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900">No peers found</h3>
                            <p className="text-zinc-500 mt-2 max-w-sm">
                                {searchQuery ? "Try a different search term." :
                                    activeTab === "requests" ? "You're all caught up! No pending requests." :
                                        "Start exploring to find new study partners!"}
                            </p>
                            {activeTab !== "explore" && !searchQuery && (
                                <Button
                                    className="mt-6 bg-zinc-900 text-white"
                                    onClick={() => setActiveTab("explore")}
                                >
                                    Explore Peers
                                </Button>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Floating Action Button for Adding Peers (Only on Explore Tab) */}
            <AnimatePresence>
                {activeTab === "explore" && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40"
                    >
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full bg-zinc-900 text-white shadow-2xl hover:scale-105 transition-transform"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <UserPlus size={24} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Peers Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Peers"
                footer={
                    <Button
                        className="w-full bg-zinc-900 text-white"
                        size="lg"
                        disabled={selectedPeers.length === 0}
                        onClick={() => {
                            // Add selected peers
                            setPeers(prev => prev.map(p => selectedPeers.includes(p.id) ? { ...p, status: "pending_outgoing" } : p));
                            setIsAddModalOpen(false);
                            setSelectedPeers([]);
                            setAddModalQuery("");
                        }}
                    >
                        Add Selected ({selectedPeers.length})
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            value={addModalQuery}
                            onChange={(e) => setAddModalQuery(e.target.value)}
                            placeholder="Search by name or username..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {peers
                            .filter(p => p.status === "none" && (p.name.toLowerCase().includes(addModalQuery.toLowerCase()) || p.username.toLowerCase().includes(addModalQuery.toLowerCase())))
                            .map(peer => (
                                <div
                                    key={peer.id}
                                    onClick={() => setSelectedPeers(prev => prev.includes(peer.id) ? prev.filter(id => id !== peer.id) : [...prev, peer.id])}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedPeers.includes(peer.id) ? "border-lime-500 bg-lime-50" : "border-zinc-100 hover:bg-zinc-50"}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedPeers.includes(peer.id) ? "bg-lime-500 border-lime-500" : "border-zinc-300 bg-white"}`}>
                                        {selectedPeers.includes(peer.id) && <Check size={12} className="text-white" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-zinc-900">{peer.name}</h4>
                                        <p className="text-xs text-zinc-500">@{peer.username}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">L{peer.level}</div>
                                    </div>
                                </div>
                            ))}
                        {addModalQuery && peers.filter(p => p.status === "none" && (p.name.toLowerCase().includes(addModalQuery.toLowerCase()) || p.username.toLowerCase().includes(addModalQuery.toLowerCase()))).length === 0 && (
                            <div className="text-center py-8 text-zinc-400 text-sm">
                                No new peers found.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Profile Modal */}
            <PeerProfileModal
                peer={selectedProfile}
                isOpen={!!selectedProfile}
                onClose={() => setSelectedProfile(null)}
                onMessage={(id) => {
                    setSelectedProfile(null);
                    router.push(`/peer/chat?userId=${id}`);
                }}
            />
        </div>
    );
}
