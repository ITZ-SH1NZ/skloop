"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const getLevelColor = (level: number) => {
    switch (level) {
        case 0: return "bg-zinc-100";
        case 1: return "bg-lime-200";
        case 2: return "bg-lime-300";
        case 3: return "bg-lime-400";
        case 4: return "bg-lime-500";
        default: return "bg-zinc-100";
    }
};

interface ProfileHeatmapProps {
    userId: string;
}

export function ProfileHeatmap({ userId }: ProfileHeatmapProps) {
    const [activityData, setActivityData] = useState<number[]>(Array(91).fill(0));

    useEffect(() => {
        const fetchActivity = async () => {
            const supabase = createClient();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 90); // Last 91 days

            const { data } = await supabase
                .from('activity_logs')
                .select('activity_date, hours_spent')
                .eq('user_id', userId)
                .gte('activity_date', startDate.toISOString().split('T')[0]);

            if (data) {
                const newData = Array(91).fill(0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const hoursByDate = new Map<string, number>();
                data.forEach(log => {
                    const existing = hoursByDate.get(log.activity_date) || 0;
                    hoursByDate.set(log.activity_date, existing + parseFloat(log.hours_spent));
                });

                hoursByDate.forEach((totalHours, dateStr) => {
                    const logDate = new Date(dateStr);
                    logDate.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
                    const index = 90 - diffDays;
                    if (index >= 0 && index < 91) {
                        let level = 1;
                        if (totalHours >= 1) level = 2;
                        if (totalHours >= 3) level = 3;
                        if (totalHours >= 5) level = 4;
                        newData[index] = level;
                    }
                });

                setActivityData(newData);
            }
        };
        fetchActivity();
    }, [userId]);

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-[4px]">
                {activityData.map((level, i) => (
                    <div
                        key={i}
                        className={cn("w-[10px] h-[10px] rounded-[2px] flex-shrink-0", getLevelColor(level))}
                        title={`Activity Level: ${level}`}
                    />
                ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(l => (
                        <div key={l} className={cn("w-[10px] h-[10px] rounded-[2px]", getLevelColor(l))} />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
