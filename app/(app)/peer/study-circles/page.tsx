"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudyCircle, StudyCircleCard } from "@/components/peer/StudyCircleCard";
import { CreateCircleModal } from "@/components/peer/CreateCircleModal";
import { Search, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

// Mock Data
// TODO: Fetch circles from backend
const MOCK_CIRCLES: StudyCircle[] = [];

export default function StudyCirclesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [circles, setCircles] = useState(MOCK_CIRCLES);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredCircles = circles.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const router = useRouter();

    const handleJoin = (id: string) => {
        // Toggle local state (mock DB update)
        setCircles(prev => prev.map(c =>
            c.id === id ? { ...c, isJoined: !c.isJoined, memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1 } : c
        ));

        // Navigate to chat
        // In a real app, this would happen after a successful API call
        if (!circles.find(c => c.id === id)?.isJoined) {
            router.push(`/peer/chat?circleId=${id}`);
        }
    };

    const handleCreateCircle = (newCircle: Omit<StudyCircle, "id" | "memberCount" | "isJoined">) => {
        const circle: StudyCircle = {
            ...newCircle,
            id: Date.now().toString(),
            memberCount: 1,
            isJoined: true,
        };

        setCircles(prev => [circle, ...prev]);

        // Confetti celebration!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Navigate to the new circle's chat
        setTimeout(() => {
            router.push(`/peer/chat?circleId=${circle.id}`);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-zinc-100 px-6 py-8 md:px-10 md:py-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Study Circles</h1>
                            <p className="text-zinc-500 font-medium">Find your squad. Learn together. Grow faster.</p>
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 rounded-full px-6 py-6 font-bold text-base"
                        >
                            <Plus size={20} className="mr-2" />
                            Create Circle
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <motion.input
                            type="text"
                            placeholder="Search by name, topic, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-4 text-base font-medium outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white focus:border-zinc-300 transition-all shadow-sm placeholder:text-zinc-400"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
                <div className="max-w-6xl mx-auto">
                    {filteredCircles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCircles.map((circle, index) => (
                                <motion.div
                                    key={circle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                                >
                                    <StudyCircleCard
                                        circle={circle}
                                        onJoin={handleJoin}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <Search size={24} className="text-zinc-400" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">No circles found</h3>
                            <p className="text-zinc-500">Try searching for a different topic.</p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Create Circle Modal */}
            <CreateCircleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateCircle}
            />
        </div>
    );
}
