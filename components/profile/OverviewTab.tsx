"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";

interface ActivityEntry {
    text: string;
    time: string;
    color: string;
}

export function OverviewTab() {
    const { user, profile } = useUser();
    const [hoursSpent, setHoursSpent] = useState<number>(0);
    const [myRank, setMyRank] = useState<number | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            const supabase = createClient();

            // Sum total hours from activity logs
            const { data: logs } = await supabase
                .from("activity_logs")
                .select("hours_spent")
                .eq("user_id", user.id);

            if (logs) {
                const total = logs.reduce((sum, l) => sum + parseFloat(l.hours_spent ?? "0"), 0);
                setHoursSpent(Math.round(total * 10) / 10);
            }

            // Get recent activity log entries for the feed
            const { data: recent } = await supabase
                .from("activity_logs")
                .select("focus_area, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(3);

            if (recent && recent.length > 0) {
                setRecentActivity(
                    recent.map((entry, i) => {
                        const colors = ["bg-blue-500", "bg-purple-500", "bg-yellow-500"];
                        const ts = new Date(entry.created_at);
                        const diffMs = Date.now() - ts.getTime();
                        const diffH = Math.floor(diffMs / 3600000);
                        const timeStr = diffH < 1 ? "just now" : diffH < 24 ? `${diffH}h ago` : `${Math.floor(diffH / 24)}d ago`;
                        return {
                            text: entry.focus_area || "Studied on Skloop",
                            time: timeStr,
                            color: colors[i % colors.length],
                        };
                    })
                );
            }

            // Count how many users have more XP than this user (to get rank)
            if (profile?.xp !== undefined) {
                const { count } = await supabase
                    .from("profiles")
                    .select("id", { count: "exact", head: true })
                    .gt("xp", profile.xp);
                setMyRank((count ?? 0) + 1);
            }
        };

        fetchStats();
    }, [user, profile?.xp]);

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
                        <h2 className="text-2xl md:text-3xl font-black mb-2 text-foreground">
                            Welcome back, {profile?.full_name || profile?.username || "Learner"}!
                        </h2>
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
                        value={`${profile?.streak ?? 0} Days`}
                        color="bg-orange-50 text-orange-500"
                        delay={0.1}
                    />
                    <StatCard
                        icon={Zap}
                        label="Total XP"
                        value={(profile?.xp ?? 0).toLocaleString()}
                        color="bg-yellow-50 text-yellow-600"
                        delay={0.2}
                    />
                    <StatCard
                        icon={Clock}
                        label="Hours"
                        value={hoursSpent > 0 ? String(hoursSpent) : "—"}
                        color="bg-blue-50 text-blue-500"
                        delay={0.3}
                    />
                    <StatCard
                        icon={Trophy}
                        label="Rank"
                        value={myRank ? `#${myRank}` : "—"}
                        color="bg-purple-50 text-purple-500"
                        delay={0.4}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Recent Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm lg:col-span-3"
                >
                    <h3 className="font-black text-lg mb-4">Recent Activity</h3>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 leading-tight">{item.text}</p>
                                        <p className="text-[10px] font-bold text-gray-300 mt-1">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 font-medium">No activity yet. Start learning to see your history here!</p>
                    )}
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
