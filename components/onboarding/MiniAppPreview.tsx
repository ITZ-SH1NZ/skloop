"use client";

import { motion } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    Users,
    MessageSquare,
    Settings,
    User,
    Sparkles,
    CheckCircle2,
    Calendar,
    Zap
} from "lucide-react";

/**
 * MINI SIDEBAR
 */
export const MiniSidebar = () => (
    <div className="w-16 h-full bg-zinc-900 border-r border-white/5 flex flex-col items-center py-6 gap-6">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-zinc-900 font-black text-xs">S</span>
        </div>
        <LayoutDashboard size={18} className="text-primary" />
        <BookOpen size={18} className="text-zinc-500" />
        <Trophy size={18} className="text-zinc-500" />
        <Users size={18} className="text-zinc-500" />
        <div className="mt-auto flex flex-col gap-6">
            <MessageSquare size={18} className="text-zinc-500" />
            <Settings size={18} className="text-zinc-500" />
        </div>
    </div>
);

/**
 * MINI DASHBOARD
 */
export const MiniDashboard = () => (
    <div className="flex-1 p-6 bg-zinc-950">
        <div className="flex justify-between items-center mb-6">
            <div className="h-4 w-32 bg-zinc-800 rounded-full" />
            <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800" />
                <div className="w-6 h-6 rounded-full bg-zinc-800" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2].map(i => (
                <div key={i} className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                    <div className="h-2 w-12 bg-zinc-800 rounded-full mb-3" />
                    <div className="h-6 w-20 bg-primary/20 rounded-lg" />
                </div>
            ))}
        </div>

        <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 h-32 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-24 bg-zinc-800 rounded-full" />
                <Sparkles size={12} className="text-primary" />
            </div>
            <div className="space-y-3">
                <div className="h-2 w-full bg-white/5 rounded-full" />
                <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                <div className="h-2 w-full bg-white/5 rounded-full" />
            </div>
        </div>
    </div>
);

/**
 * MINI LOOPY (The AI Assistant)
 */
export const MiniLoopy = () => (
    <div className="flex-1 p-6 bg-zinc-950 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-glow-primary">
                <Sparkles size={20} className="text-zinc-900" />
            </div>
            <div>
                <div className="h-3 w-20 bg-white rounded-full mb-1" />
                <div className="h-2 w-12 bg-zinc-600 rounded-full" />
            </div>
        </div>

        <div className="space-y-4">
            <div className="p-3 bg-zinc-900 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%]">
                <div className="h-2 w-32 bg-zinc-700 rounded-full mb-2" />
                <div className="h-2 w-24 bg-zinc-700 rounded-full" />
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl rounded-tr-none border border-primary/20 max-w-[80%] self-end">
                <div className="h-2 w-32 bg-primary/30 rounded-full mb-2" />
                <div className="h-2 w-20 bg-primary/30 rounded-full" />
            </div>
        </div>

        <div className="mt-auto h-10 bg-zinc-900 rounded-xl border border-white/5 flex items-center px-4 justify-between">
            <div className="h-2 w-32 bg-zinc-700 rounded-full" />
            <Zap size={14} className="text-zinc-500" />
        </div>
    </div>
);

/**
 * MINI PROFILE / CUSTOMIZATION
 */
export const MiniProfile = () => (
    <div className="flex-1 p-8 bg-zinc-950 text-white flex flex-col items-center">
        <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-1">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                    <User size={40} className="text-zinc-600" />
                </div>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-4 border-zinc-950 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-zinc-900" />
            </div>
        </div>

        <div className="h-4 w-32 bg-white rounded-full mb-2" />
        <div className="h-3 w-20 bg-zinc-600 rounded-full mb-8" />

        <div className="grid grid-cols-3 gap-4 w-full">
            {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-zinc-900 rounded-xl border border-white/5" />
            ))}
        </div>
    </div>
);

/**
 * MINI CHAT / PEERS
 */
export const MiniChat = () => (
    <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="h-3 w-24 bg-zinc-800 rounded-full" />
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-950" />
                ))}
            </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex-shrink-0" />
                <div className="space-y-2">
                    <div className="h-2 w-16 bg-zinc-600 rounded-full" />
                    <div className="h-2 w-32 bg-zinc-800 rounded-full" />
                </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex-shrink-0" />
                <div className="space-y-2 items-end flex flex-col">
                    <div className="h-2 w-12 bg-primary/40 rounded-full" />
                    <div className="h-2 w-24 bg-primary/30 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);
