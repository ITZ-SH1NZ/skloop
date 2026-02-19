"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LevelRingProps {
    level: number;
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
    className?: string; // Container class
    colorClass?: string; // Ring color class (e.g., text-blue-500)
    badgeColorClass?: string; // Explicit badge background class
}

export function LevelRing({
    level,
    progress,
    size = 120,
    strokeWidth = 8,
    children,
    className,
    colorClass = "text-primary",
    badgeColorClass
}: LevelRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            {/* SVG Ring */}
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90 absolute inset-0"
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-gray-800"
                />

                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className={colorClass}
                />
            </svg>

            {/* Level Badge (Bottom Center) */}
            <div className={cn(
                "absolute -bottom-2 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full border-2 border-background z-10 shadow-sm",
                badgeColorClass || colorClass.replace("text-", "bg-") // Use explicit class if provided, else fallback
            )}>
                Lvl {level}
            </div>

            {/* Content (Avatar) */}
            <div
                className="overflow-hidden rounded-full border-4 border-background"
                style={{ width: size - strokeWidth * 3, height: size - strokeWidth * 3 }}
            >
                {children}
            </div>
        </div>
    );
}
