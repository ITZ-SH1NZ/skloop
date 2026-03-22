"use client";

import { motion } from "framer-motion";

interface XPLevelRingProps {
    level: number;
    xp: number;
    size?: "sm" | "md" | "lg";
    className?: string;
    showLevelInside?: boolean;
}

const XP_PER_LEVEL = 500;

export function XPLevelRing({ level = 1, xp = 0, size = "md", className, showLevelInside = true }: XPLevelRingProps) {
    const nextLevelXp = (level || 1) * 500;
    const progress = Math.min((xp || 0) / nextLevelXp, 1);
    
    // Dimensions based on size to match CurrencyCoin
    const dims = {
        sm: { width: 28, height: 28, stroke: 2.5, r: 11, cx: 14, cy: 14, fontSize: "text-[10px]" },
        md: { width: 56, height: 56, stroke: 4.5, r: 23, cx: 28, cy: 28, fontSize: "text-xl" },
        lg: { width: 120, height: 120, stroke: 8, r: 52, cx: 60, cy: 60, fontSize: "text-4xl" }
    }[size];

    const circumference = 2 * Math.PI * dims.r;
    const offset = circumference - (progress * circumference);

    return (
        <div 
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: dims.width, height: dims.height }}
        >
            <svg
                width={dims.width}
                height={dims.height}
                viewBox={`0 0 ${dims.width} ${dims.height}`}
                className="transform -rotate-90 relative z-10"
            >
                <defs>
                    <linearGradient id="xpRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D4F268" />
                        <stop offset="100%" stopColor="#8FBF2F" />
                    </linearGradient>
                    <filter id="xpGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                
                {/* Background Ring - slightly thicker for a "track" feel */}
                <circle
                    cx={dims.cx}
                    cy={dims.cy}
                    r={dims.r}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth={dims.stroke + 1}
                />
                
                {/* Progress Ring */}
                <motion.circle
                    cx={dims.cx}
                    cy={dims.cy}
                    r={dims.r}
                    fill="none"
                    stroke="url(#xpRingGrad)"
                    strokeWidth={dims.stroke}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, type: "spring", stiffness: 50, damping: 15 }}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px rgba(212, 242, 104, 0.5))" }}
                />
            </svg>
            
            {/* Level Number Inside */}
            {showLevelInside && (
                <div className={`absolute inset-0 flex items-center justify-center font-black text-white ${dims.fontSize} z-20`}>
                    {level}
                </div>
            )}
            
            {/* Subtle Outer Glow behind the ring */}
            <div 
                className="absolute inset-0 rounded-full opacity-10 blur-md bg-[#D4F268] z-0"
                style={{ 
                    width: dims.width,
                    height: dims.height
                }} 
            />
        </div>
    );
}
