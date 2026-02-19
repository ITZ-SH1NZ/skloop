"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, Trophy, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/Button"; // Adjust path if needed

export function OverviewTab() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Flame size={120} />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black mb-2 text-foreground">Welcome back!</h2>
                        <p className="text-muted-foreground font-medium mb-8 max-w-md">
                            Ready to continue your learning journey?
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button className="rounded-xl font-bold px-6 py-6 shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all bg-black text-white">
                                Resume Learning
                            </Button>
                            <Button variant="outline" className="rounded-xl font-bold px-6 py-6 border-2 hover:bg-gray-50">
                                View Schedule
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                    <StatCard
                        icon={Flame}
                        label="Streak"
                        value="12 Days"
                        color="bg-orange-50 text-orange-500"
                        delay={0.1}
                    />
                    <StatCard
                        icon={Zap}
                        label="XP Gained"
                        value="2.4k"
                        color="bg-yellow-50 text-yellow-600"
                        delay={0.2}
                    />
                    <StatCard
                        icon={Clock}
                        label="Hours"
                        value="48.5"
                        color="bg-blue-50 text-blue-500"
                        delay={0.3}
                    />
                    <StatCard
                        icon={Trophy}
                        label="Rank"
                        value="#42"
                        color="bg-purple-50 text-purple-500"
                        delay={0.4}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upcoming Session */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#D4F268] p-6 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[200px]"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-black/70">Up Next</span>
                            <Clock size={20} className="text-black/50" />
                        </div>
                        <h3 className="font-black text-2xl leading-tight mb-1 text-black">React Native Deep Dive</h3>
                        <p className="font-bold text-black/60 text-sm">with Dwight Schrute</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
                        <span className="font-black text-black">Today, 2:00 PM</span>
                        <Button size="icon" className="h-10 w-10 rounded-full bg-black text-white hover:bg-black/80">
                            <ArrowRight size={18} />
                        </Button>
                    </div>
                </motion.div>

                {/* Recent Achievement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-black text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden"
                >
                    <div className="absolute -bottom-6 -right-6 text-white/5">
                        <Star size={150} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                                <Trophy size={12} className="text-yellow-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">New Badge</span>
                            </div>
                            <h3 className="font-black text-2xl mb-2">Regional Manager</h3>
                            <p className="text-gray-400 text-sm font-medium">Earned 2 days ago for completing &quot;Management 101&quot;</p>
                        </div>
                        <Button variant="outline" className="mt-6 border-white/20 text-white hover:bg-white/10 w-full rounded-xl">
                            View All Badges
                        </Button>
                    </div>
                </motion.div>

                {/* Activity Feed (Compact) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
                >
                    <h3 className="font-black text-lg mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { text: "Completed 'Intro to Sales'", time: "2h ago", color: "bg-blue-500" },
                            { text: "Booked a session with Jim", time: "5h ago", color: "bg-purple-500" },
                            { text: "Earned 'Early Bird' badge", time: "1d ago", color: "bg-yellow-500" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                                <div>
                                    <p className="text-sm font-bold text-gray-700 leading-tight">{item.text}</p>
                                    <p className="text-[10px] font-bold text-gray-300 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ icon: Icon, label, value, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-4 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow cursor-default"
        >
            <div className={`p-3 rounded-2xl mb-3 ${color}`}>
                <Icon size={20} />
            </div>
            <div className="font-black text-xl md:text-2xl text-foreground">{value}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{label}</div>
        </motion.div>
    )
}
