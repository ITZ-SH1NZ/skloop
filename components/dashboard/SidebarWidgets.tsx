"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trophy, Target, Zap, Calendar, Clock, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import confetti from "canvas-confetti";
import useSWR from "swr";
import { fetchActivityChart, fetchTopLearners, fetchNextWorkshop } from "@/lib/swr-fetchers";
import { useUser } from "@/context/UserContext";
import UserProfileModal from "@/components/profile/UserProfileModal";

export function ActivityChart() {
    const { user } = useUser();
    const [isReportOpen, setIsReportOpen] = useState(false);

    const { data } = useSWR(
        user?.id ? ['activityChart', user.id] : null,
        fetchActivityChart as any,
        { revalidateOnFocus: false }
    );

    const chartData = data?.chartData || [];
    const totalTime = data?.totalTime || 0;
    const dailyAvg = data?.dailyAvg || 0;
    const focusAreas = data?.focusAreas || [];

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
                        <AreaChart data={chartData}>
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
                        <span className="text-lg font-black text-slate-900">{totalTime.toFixed(1)}h</span>
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
                            <div className="text-2xl font-black text-slate-900">{totalTime.toFixed(1)}h</div>
                            <div className="text-green-600 text-xs font-bold mt-1">This Week</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Daily Avg</div>
                            <div className="text-2xl font-black text-slate-900">{dailyAvg.toFixed(1)}h</div>
                            <div className="text-slate-400 text-xs font-bold mt-1">Consistent</div>
                        </div>
                    </div>

                    <div className="p-4 border border-slate-100 rounded-2xl">
                        <h4 className="font-bold text-slate-800 mb-4">Focus Areas</h4>
                        <div className="space-y-3">
                            {focusAreas.length > 0 ? (
                                focusAreas.map((focus: any, i: number) => (
                                    <div key={focus.area}>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span>{focus.area}</span>
                                            <span>{focus.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${i % 3 === 0 ? 'bg-blue-500' : i % 3 === 1 ? 'bg-purple-500' : 'bg-orange-500'}`}
                                                style={{ width: `${focus.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-xs text-slate-400 font-bold py-2">
                                    No activity logged this week
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export function LeaderboardWidget() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const router = useRouter();

    const { data: users = [] } = useSWR(
        ['topLearners'],
        fetchTopLearners as any,
        { revalidateOnFocus: false }
    );

    return (
        <>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Top Learners</h3>
                <div className="space-y-6">
                    {users.map((u: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="flex items-center gap-3 group cursor-pointer"
                            whileHover={{ x: 5 }}
                            onClick={() => u.id && setSelectedUserId(u.id)}
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
                    onClick={() => router.push('/peer/leaderboard')}
                    className="w-full mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors"
                >
                    View All Leaderboard →
                </button>
            </div>

            <UserProfileModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </>
    );
}

export function UpcomingWorkshop() {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const { data: workshop } = useSWR(
        ['nextWorkshop'],
        fetchNextWorkshop as any,
        { revalidateOnFocus: false }
    );

    const handleRegister = (e: React.MouseEvent | null) => {
        if (e) e.stopPropagation();
        if (!isRegistered) {
            import("canvas-confetti").then((confetti) => {
                confetti.default({
                    particleCount: 50,
                    spread: 60,
                    origin: { x: 0.8, y: 0.7 },
                    colors: ['#D4F268', '#1A1C1E']
                });
            });
            setIsRegistered(true);
        }
    };

    if (!workshop) {
        return (
            <div className="bg-[#F7F7F5] p-6 rounded-[2rem] border border-[#E5E5E0] opacity-50 pointer-events-none grayscale">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <h3 className="font-bold text-slate-800 text-sm">Upcoming Workshop</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <p className="text-xs text-slate-400 font-bold">No workshops scheduled</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsDetailsOpen(true)}>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h3 className="font-bold text-slate-800 text-sm">Upcoming Workshop</h3>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors" />
                    <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{workshop.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{new Date(workshop.start_time).toLocaleDateString()} @ {new Date(workshop.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                            <h2 className="text-2xl font-black text-white px-8">{workshop.title}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Date</div>
                                <div className="text-sm font-bold text-slate-900">{new Date(workshop.start_time).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                <Clock size={18} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Time</div>
                                <div className="text-sm font-bold text-slate-900">{new Date(workshop.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-slate-800">What we'll cover:</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#D4F268]" />
                                {workshop.description}
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </>
    );
}
