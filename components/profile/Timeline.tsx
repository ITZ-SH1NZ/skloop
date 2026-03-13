"use client";

import { motion } from "framer-motion";
import { Award, Code2, Zap, Rocket, BookOpen, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetchUserTimeline } from "@/lib/swr-fetchers";
import { useUser } from "@/context/UserContext";

const ICON_MAP: Record<string, any> = {
    award: Award,
    code: Code2,
    zap: Zap,
    rocket: Rocket,
    course: BookOpen,
    achievement: Sparkles,
    milestone: Trophy
};

export function Timeline() {
    const { user } = useUser();
    
    const { data: timelineData = [], isLoading } = useSWR(
        user?.id ? ['userTimeline', user.id] : null,
        () => fetchUserTimeline(user!.id)
    );

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isLoading && timelineData.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center text-zinc-400 font-medium">
                No milestones recorded yet. Complete courses or add projects to build your timeline!
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="relative">
                {/* Center Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

                <div className="space-y-12">
                    {timelineData.map((item: any, i: number) => {
                        const Icon = ICON_MAP[item.icon_type] || Rocket;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={cn(
                                    "relative flex flex-col md:flex-row gap-8 items-center",
                                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                                )}
                            >
                                {/* Content Side */}
                                <div className="flex-1 w-full pl-16 md:pl-0">
                                    <div className={cn(
                                        "bg-white p-6 rounded-2xl border shadow-sm transition-shadow hover:shadow-md relative",
                                        "border-zinc-100 group hover:border-lime-200 transition-colors"
                                    )}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-black text-lg uppercase tracking-tight">{item.title}</h3>
                                                <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", item.color || "text-lime-500")}>
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                            <span className="text-sm font-black text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">
                                                {item.year || new Date(item.event_date).getFullYear()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 text-sm font-medium">{item.description}</p>

                                        {/* Arrow connecting to center */}
                                        <div className={cn(
                                            "hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b border-l rotate-45",
                                            i % 2 === 0 ? "-left-2 border-zinc-200" : "-right-2 border-t border-r border-b-0 border-l-0 border-zinc-200"
                                        )} />
                                    </div>
                                </div>

                                {/* Center Icon */}
                                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-zinc-50 shadow-sm z-10 group-hover:border-lime-100 transition-colors">
                                    <Icon className={cn("w-5 h-5", item.color || "text-lime-400")} />
                                </div>

                                {/* Empty Side (Spacer) */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
