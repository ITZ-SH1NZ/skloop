"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Deterministic pseudo-random number generator
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const generateData = () => {
    const data = [];
    for (let i = 0; i < 365; i++) {
        // Use loop index as seed for consistency
        const level = seededRandom(i) > 0.7 ? Math.floor(seededRandom(i + 1000) * 4) + 1 : 0;
        data.push(level);
    }
    return data;
};

const activityData = generateData();

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
                                title={`Activity Level: ${level} (${i + 1} days ago)`}
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
