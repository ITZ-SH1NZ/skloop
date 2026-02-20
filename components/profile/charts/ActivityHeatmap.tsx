"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const getLevelColor = (level: number) => {
    switch (level) {
        case 0: return "bg-gray-100 dark:bg-zinc-800/50";
        case 1: return "bg-green-200 dark:bg-green-900";
        case 2: return "bg-green-300 dark:bg-green-700";
        case 3: return "bg-green-400 dark:bg-green-500";
        case 4: return "bg-green-500 dark:bg-green-400";
        default: return "bg-gray-100";
    }
};

export function ActivityHeatmap() {
    const [activityData, setActivityData] = useState<number[]>(Array(365).fill(0));

    useEffect(() => {
        const fetchActivity = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Date 365 days ago
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 364); // Include today = 365 days

            const { data } = await supabase
                .from('activity_logs')
                .select('activity_date, hours_spent')
                .eq('user_id', user.id)
                .gte('activity_date', startDate.toISOString().split('T')[0]);

            if (data) {
                // Initialize an array of 365 zeros
                const newData = Array(365).fill(0);

                // Map dates to index (0 is 364 days ago, 364 is today)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                data.forEach(log => {
                    const logDate = new Date(log.activity_date);
                    // Time diff in days
                    const diffTime = Math.abs(today.getTime() - logDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    // Convert days ago (diffDays) to array index
                    // 0 days ago (today) -> index 364
                    // 1 day ago -> index 363
                    const index = 364 - diffDays;

                    if (index >= 0 && index < 365) {
                        // Calculate intensity category based on hours (0-4 max)
                        const hours = parseFloat(log.hours_spent);
                        let level = 1;
                        if (hours >= 1) level = 2;
                        if (hours >= 3) level = 3;
                        if (hours >= 5) level = 4;
                        newData[index] = level;
                    }
                });

                setActivityData(newData);
            }
        };
        fetchActivity();
    }, []);

    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-4">
            <div className="min-w-[700px]">
                <div className="flex gap-1">
                    {/* Days labels logic would go here, simplified for now */}
                    <div className="grid grid-cols-[repeat(53,1fr)] gap-1 w-full">
                        {activityData.map((level, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.001 }}
                                className={cn(
                                    "w-3 h-3 rounded-[2px]",
                                    getLevelColor(level)
                                )}
                                title={`Activity Level: ${level}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(l => (
                            <div key={l} className={cn("w-3 h-3 rounded-[2px]", getLevelColor(l))} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}