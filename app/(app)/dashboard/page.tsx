"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Grid, List } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeroCourseCard from "@/components/dashboard/HeroCourseCard";
import TaskCard from "@/components/dashboard/TaskCard";
import { ActivityChart, LeaderboardWidget, UpcomingWorkshop } from "@/components/dashboard/SidebarWidgets";
import DailyGame from "@/components/dashboard/DailyGame";
import { Modal } from "@/components/ui/Modal";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export default function DashboardPage() {
    const [isGameOpen, setIsGameOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("grid");

    // Mock Data
    // TODO: Fetch user data from backend
    const user = { name: "Guest", streak: 0, xp: 0 };

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
    };

    const handleCompleteTask = () => {
        import("canvas-confetti").then((confetti) => {
            confetti.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        });
        setSelectedTask(null);
    };

    return (
        <div className="text-slate-900 font-sans p-4 md:p-8">
            <DailyGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />

            {/* Task Detail Modal */}
            <Modal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                title={selectedTask?.title || "Task Details"}
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setSelectedTask(null)}
                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleCompleteTask}
                            className="px-6 py-2 bg-[#D4F268] text-slate-900 text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,242,104,0.4)] transition-all active:scale-95"
                        >
                            Complete Task (+{selectedTask?.xp} XP)
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${selectedTask?.type === 'code' ? 'bg-blue-100 text-blue-700' :
                            selectedTask?.type === 'concept' ? 'bg-orange-100 text-orange-700' :
                                selectedTask?.type === 'social' ? 'bg-purple-100 text-purple-700' :
                                    'bg-green-100 text-green-700'
                            }`}>
                            {selectedTask?.type}
                        </span>
                        <span className="text-sm text-slate-400 font-medium">Est. {selectedTask?.meta || "10 min"}</span>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-lg">
                        {selectedTask?.desc}
                    </p>

                    {selectedTask?.type === 'code' && (
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                            <pre className="text-sm text-blue-300 font-mono">
                                <code>{`function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// TODO: Optimize this function using memoization.`}</code>
                            </pre>
                        </div>
                    )}

                    {selectedTask?.type === 'practice' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-2">Question 1/10</h4>
                                <p className="text-sm text-slate-600 mb-4">What is the primary purpose of a React Suspense boundary?</p>
                                <div className="space-y-2">
                                    {['Data Fetching', 'Error Handling', 'Loading States', 'State Management'].map((opt, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                                            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                            <span className="text-sm text-slate-600 font-medium">{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTask?.type === 'social' && (
                        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-purple-200 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-purple-900 text-sm">Review Request from Sarah</h4>
                                <p className="text-xs text-purple-700 mt-1">"Hey! detailed logic for the auth flow is in `auth-provider.tsx`. Let me know what you think!"</p>
                            </div>
                        </div>
                    )}

                    <div className="h-4" /> {/* Spacer */}
                </div>
            </Modal>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-[1400px] mx-auto"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <DashboardHeader user={user} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (Main Content) - Spans 8 cols */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Hero Card */}
                        <motion.div variants={itemVariants}>
                            <HeroCourseCard />
                        </motion.div>

                        {/* Focus Section Header */}
                        <motion.div variants={itemVariants} className="flex justify-between items-end">
                            <h2 className="text-xl font-bold text-slate-800">Today's Focus</h2>

                            {/* Animated Filter */}
                            <div className="hidden md:flex bg-white p-1 rounded-full border border-slate-100 shadow-sm relative">
                                {['grid', 'list'].map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setActiveTab(view)}
                                        className={`relative z-10 p-2 rounded-full transition-colors flex items-center justify-center ${activeTab === view ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {view === 'grid' ? <Grid size={18} /> : <List size={18} />}
                                        {activeTab === view && (
                                            <motion.div
                                                layoutId="activeFilter"
                                                className="absolute inset-0 bg-slate-900 rounded-full -z-10 shadow-md"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Task Grid - Now Loading from Backend (Empty State) */}
                        {/* TODO: Fetch tasks from backend */}
                        <div className={`grid gap-6 ${activeTab === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {/* Placeholder for empty state when backend is connected */}
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <List className="text-slate-300" size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                    You have no pending tasks for today. Take a break or explore the Daily Codele.
                                </p>
                                <Link href="/practice/daily-codele" className="inline-block mt-4">
                                    <button className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:scale-105 transition-transform">
                                        Play Daily Codele
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) - Spans 4 cols */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div variants={itemVariants}>
                            <ActivityChart />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <LeaderboardWidget />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <UpcomingWorkshop />
                        </motion.div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
