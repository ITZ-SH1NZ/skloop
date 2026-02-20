"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { X, Trophy, Target, Zap, Calendar, Clock, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import confetti from "canvas-confetti";

export function ActivityChart() {
    const [isReportOpen, setIsReportOpen] = useState(false);
    // TODO: Fetch activity data from backend
    const data: any[] = [];

    return (
        <>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800">Weekly Activity</h3>
                    <span
                        onClick={() => setIsReportOpen(true)}
                        className="text-xs font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                    >
                        View Report
                    </span>
                </div>

                <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4F268" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#D4F268" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                hide
                                domain={[0, 'dataMax + 2']}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="#D4F268"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorHours)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex justify-between items-center px-2 mt-2">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium">Total Time</span>
                        <span className="text-lg font-black text-slate-900">0h 0m</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        -- vs last week
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                title="Weekly Analytics Report"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Hours</div>
                            <div className="text-2xl font-black text-slate-900">24.2h</div>
                            <div className="text-green-600 text-xs font-bold mt-1">+2.4h vs last week</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Daily Avg</div>
                            <div className="text-2xl font-black text-slate-900">3.4h</div>
                            <div className="text-slate-400 text-xs font-bold mt-1">Consistent</div>
                        </div>
                    </div>

                    <div className="p-4 border border-slate-100 rounded-2xl">
                        <h4 className="font-bold text-slate-800 mb-4">Focus Areas</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Coding</span>
                                    <span>65%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[65%] rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Design</span>
                                    <span>25%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[25%] rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>Reading</span>
                                    <span>10%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[10%] rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export function LeaderboardWidget() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    // TODO: Fetch leaderboard data from backend
    const users: any[] = [];

    return (
        <>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Top Learners</h3>
                <div className="space-y-6">
                    {users.map((u, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="flex items-center gap-3 group cursor-pointer"
                            whileHover={{ x: 5 }}
                            onClick={() => setSelectedUser(u)}
                        >
                            <div className="relative">
                                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl bg-slate-100" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4F268] rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold">
                                    {u.rank}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-800 group-hover:text-[#84cc16] transition-colors">{u.name}</div>
                                <div className="text-[10px] font-bold text-slate-400">{u.xp.toLocaleString()} XP</div>
                            </div>
                            <div className="text-[10px] font-bold text-[#166534] bg-[#F0FDF4] px-2 py-1 rounded">
                                +{120 + (i * 45)} XP
                            </div>
                        </motion.div>
                    ))}
                </div>
                <button
                    className="w-full mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors"
                >
                    View All Leaderboard
                </button>
            </div>

            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="Learner Profile"
            >
                {selectedUser && (
                    <div className="flex flex-col items-center pb-6">
                        <img src={selectedUser.avatar} alt={selectedUser.name} className="w-24 h-24 rounded-3xl bg-slate-100 mb-4 shadow-lg" />
                        <h2 className="text-2xl font-black text-slate-900">{selectedUser.name}</h2>
                        <p className="text-slate-500 font-medium mb-4">{selectedUser.title}</p>

                        <div className="flex gap-2 mb-6">
                            {selectedUser.badges.map((b: string, i: number) => (
                                <span key={i} className="text-2xl bg-slate-50 p-2 rounded-xl">{b}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mb-6">
                            <div className="bg-[#F0FDF4] p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-[#166534] text-xs font-bold uppercase">Total XP</span>
                                <span className="text-[#166534] text-xl font-black">{selectedUser.xp.toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                                <span className="text-slate-500 text-xs font-bold uppercase">Rank</span>
                                <span className="text-slate-800 text-xl font-black">#{selectedUser.rank}</span>
                            </div>
                        </div>

                        <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2">
                            View Full Profile <ExternalLink size={14} />
                        </button>
                    </div>
                )}
            </Modal>
        </>
    );
}

export function UpcomingWorkshop() {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const handleRegister = (e: React.MouseEvent | null) => {
        if (e) e.stopPropagation();
        if (!isRegistered) {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { x: 0.8, y: 0.7 },
                colors: ['#D4F268', '#1A1C1E']
            });
            setIsRegistered(true);
        }
    };

    return (
        <>
            <div className="bg-[#F7F7F5] p-6 rounded-[2rem] border border-[#E5E5E0] opacity-50 pointer-events-none grayscale">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <h3 className="font-bold text-slate-800 text-sm">Upcoming Workshop</h3>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <p className="text-xs text-slate-400 font-bold">No workshops scheduled</p>
                </div>
            </div>

            <Modal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title="Workshop Details"
                footer={
                    <button
                        onClick={() => {
                            handleRegister(null);
                            setIsDetailsOpen(false);
                        }}
                        className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isRegistered
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#D4F268] text-slate-900 hover:shadow-lg hover:shadow-[#D4F268]/40"
                            }`}
                        disabled={isRegistered}
                    >
                        {isRegistered ? "You're In! See you there." : <>Secure Your Spot <ArrowRight size={16} /></>}
                    </button>
                }
            >
                <div className="space-y-6">
                    <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3')] bg-cover opacity-50" />
                        <div className="z-10 text-center">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 inline-block mb-2">
                                <span className="text-[#D4F268] font-bold text-xs uppercase tracking-widest">Live Event</span>
                            </div>
                            <h2 className="text-2xl font-black text-white px-8">System Design Interviews</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Date</div>
                                <div className="text-sm font-bold text-slate-900">Tomorrow</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                <Clock size={18} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Time</div>
                                <div className="text-sm font-bold text-slate-900">5:00 PM EST</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-slate-800">What we'll cover:</h4>
                        <ul className="space-y-2">
                            {["Load Balancing Strategies", "Database Sharding", "Caching Patterns", "Mock Interview Session"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4F268]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Modal>
        </>
    );
}
