"use client";

import { Search, Bell, User, LogOut, Settings, HelpCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";

export default function DashboardHeader({ initialUser }: { initialUser?: any }) {
    const { toast } = useToast();
    const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'profile' | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const { profile: userProfile } = useUser();

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (type: 'notifications' | 'profile') => {
        setActiveDropdown(activeDropdown === type ? null : type);
    };

    const notifications: any[] = []; // TODO: Fetch from backend

    return (
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8 relative z-10">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-slate-900"
                >
                    Dashboard
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 text-sm"
                >
                    Welcome back, {userProfile?.full_name || userProfile?.username || "Loading..."}!
                </motion.p>
            </div>


            <div className="flex flex-wrap md:flex-nowrap flex-1 md:justify-end items-center gap-4" ref={dropdownRef}>
                {/* Search */}
                <div className="relative w-full md:w-auto md:max-w-md group order-last md:order-none mt-2 md:mt-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#D4F268] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tracks, lessons..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F268] focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                {/* XP Widget */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-3 bg-white border border-slate-200 pl-2 pr-4 py-1.5 rounded-full shadow-sm cursor-default"
                >
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        {/* Circular Progress */}
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="16" cy="16" r="14" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                            <circle
                                cx="16"
                                cy="16"
                                r="14"
                                stroke="#D4F268"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray="88"
                                strokeDashoffset={isNaN(userProfile?.xp ?? 0) ? 88 : 88 * (1 - (((userProfile?.xp ?? 0) % 1000) / 1000))}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-black text-slate-900">{userProfile?.level || 1}</span>
                    </div>

                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lvl {userProfile?.level || 1}</span>
                        <span className="text-sm font-black text-slate-900">{(userProfile?.xp || 0).toLocaleString()} XP</span>
                    </div>
                </motion.div>

                {/* Coin Widget */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-[#FAFAFA] border border-slate-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:border-[#D4F268]/50 transition-colors"
                >
                    <div className="w-8 h-8 relative flex items-center justify-center">
                        <CurrencyCoin size="sm" />
                    </div>
                    <span className="text-sm font-black text-slate-900">{(userProfile?.coins || 0).toLocaleString()}</span>
                </motion.div>

                {/* Streak Pill */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="flex items-center gap-2 bg-[#D4F268] px-4 py-2.5 rounded-2xl shadow-[0_4px_10px_-2px_rgba(212,242,104,0.5)] cursor-pointer"
                    onClick={() => toast("Streak protected! Keep it up!", "success")}
                >
                    <span className="text-slate-900 font-bold">🔥 {userProfile?.streak || 0}</span>
                    <span className="text-xs font-bold text-slate-900/60 uppercase tracking-wider">Day Streak</span>
                </motion.div>

                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleDropdown('notifications')}
                        className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors shadow-sm relative ${activeDropdown === 'notifications' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                        <Bell className="w-4 h-4" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </motion.button>

                    <AnimatePresence>
                        {activeDropdown === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 origin-top-right"
                            >
                                <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                    <span className="text-[10px] text-[#D4F268] bg-[#1A1C1E] px-2 py-0.5 rounded font-bold">3 New</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto w-full">
                                    {notifications.map(n => (
                                        <div key={n.id} className={`p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                            <p className="text-sm text-slate-800 font-medium leading-tight mb-1">{n.text}</p>
                                            <p className="text-xs text-slate-400">{n.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 border-t border-slate-50 text-center">
                                    <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors w-full py-1">Mark all as read</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile -> Replaced with Logout */}
                <div className="relative block">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            // Reset onboarding for logged out users
                            document.cookie = "has_seen_onboarding=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                            window.location.href = "/login";
                        }}
                    >
                        <LogOut size={20} className="ml-0.5" />
                    </motion.button>
                </div>

            </div>
        </div>
    );
}
