"use client";

import { motion } from "framer-motion";

interface AnimatedFlameProps {
    className?: string;
    size?: number;
}

export function AnimatedFlame({ className, size = 20 }: AnimatedFlameProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: (size * 1.3) }}>
            {/* Outer Glow */}
            <motion.div
                animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 bg-orange-400 blur-[8px] rounded-full"
            />
            
            <svg
                viewBox="0 0 100 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10"
            >
                {/* Outer Flame */}
                <motion.path
                    d="M 50 120 C 20 120 10 90 10 60 C 10 30 50 0 50 0 C 50 0 90 30 90 60 C 90 90 80 120 50 120 Z"
                    fill="url(#outerFlameGradient)"
                    animate={{
                        d: [
                            "M 50 120 C 20 120 10 90 10 60 C 10 30 50 0 50 0 C 50 0 90 30 90 60 C 90 90 80 120 50 120 Z",
                            "M 50 125 C 15 125 5 100 5 70 C 5 40 50 10 50 10 C 50 10 95 40 95 70 C 95 100 85 125 50 125 Z",
                            "M 50 120 C 20 120 10 90 10 60 C 10 30 50 0 50 0 C 50 0 90 30 90 60 C 90 90 80 120 50 120 Z"
                        ]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Inner Flame */}
                <motion.path
                    d="M 50 110 C 30 110 20 90 20 70 C 20 50 50 30 50 30 C 50 30 80 50 80 70 C 80 90 70 110 50 110 Z"
                    fill="url(#innerFlameGradient)"
                    animate={{
                        scale: [1, 1.1, 1],
                        y: [0, -5, 0],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{ originX: "50%", originY: "100%" }}
                />

                <defs>
                    <linearGradient id="outerFlameGradient" x1="50" y1="120" x2="50" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FB923C" />
                        <stop offset="60%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="innerFlameGradient" x1="50" y1="110" x2="50" y2="30" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FDE68A" />
                        <stop offset="100%" stopColor="#FACC15" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
