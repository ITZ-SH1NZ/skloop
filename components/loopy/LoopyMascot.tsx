"use client";

import { motion } from "framer-motion";
import { memo } from "react";

export type LoopyMood = "happy" | "surprised" | "annoyed" | "thinking" | "celebrating";

export const LoopyMascot = memo(({ size = 80, mood = "happy" }: { size?: number, mood?: LoopyMood }) => {
    // Mood-based configurations for interpolation
    const moodConfigs: Record<LoopyMood, any> = {
        happy: { 
            colorTop: "#d9f99d", colorMid: "#a3e635", colorBottom: "#4d7c0f", 
            glow: "rgba(163, 230, 53, 0.3)",
            eyeR: 7, eyeY: 55, mouthD: "M44 70 Q50 75 56 70",
            shake: 0
        },
        surprised: { 
            colorTop: "#fef08a", colorMid: "#facc15", colorBottom: "#a16207", 
            glow: "rgba(250, 204, 21, 0.3)",
            eyeR: 9, eyeY: 55, mouthD: "M46 72 Q50 78 54 72",
            shake: 0
        },
        annoyed: { 
            colorTop: "#fecaca", colorMid: "#f87171", colorBottom: "#991b1b", 
            glow: "rgba(248, 113, 113, 0.4)",
            eyeR: 6, eyeY: 53, mouthD: "M44 74 Q50 72 56 74",
            shake: 2
        },
        thinking: {
            colorTop: "#e0f2fe", colorMid: "#7dd3fc", colorBottom: "#075985",
            glow: "rgba(125, 211, 252, 0.3)",
            eyeR: 5, eyeY: 57, mouthD: "M45 72 Q50 72 55 72",
            shake: 0
        },
        celebrating: {
            colorTop: "#fde68a", colorMid: "#f59e0b", colorBottom: "#78350f",
            glow: "rgba(245, 158, 11, 0.4)",
            eyeR: 8, eyeY: 50, mouthD: "M40 70 Q50 85 60 70",
            shake: 5
        }
    };

    const config = moodConfigs[mood] || moodConfigs.happy;

    return (
        <motion.div 
            style={{ width: size, height: size }}
            className="relative"
            animate={{ 
                x: mood === "annoyed" ? [0, -1, 1, -1, 1, 0] : 0,
                y: mood === "thinking" ? [0, -4, 0] : 0
            }}
            transition={{ 
                x: { duration: 0.1, repeat: mood === "annoyed" ? Infinity : 0 },
                y: { duration: 2, repeat: mood === "thinking" ? Infinity : 0, ease: "easeInOut" }
            }}
        >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="loopyDynamicGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <motion.stop offset="0%" animate={{ stopColor: config.colorTop }} />
                        <motion.stop offset="60%" animate={{ stopColor: config.colorMid }} />
                        <motion.stop offset="100%" animate={{ stopColor: config.colorBottom }} />
                    </radialGradient>
                </defs>

                {/* Body with breathing loop */}
                <motion.path 
                    animate={{ 
                        d: mood === "surprised" 
                            ? "M50 15 C75 15 90 35 90 60 C90 85 75 90 50 90 C25 90 10 85 10 60 C10 35 25 15 50 15Z" 
                            : [
                                "M50 20 C70 20 85 35 85 60 C85 80 70 85 50 85 C30 85 15 80 15 60 C15 35 30 20 50 20Z", 
                                "M50 22 C72 22 87 37 87 62 C87 82 72 87 50 87 C28 87 13 82 13 62 C13 37 28 22 50 22Z"
                              ],
                        fill: "url(#loopyDynamicGrad)",
                        stroke: config.colorBottom
                    }}
                    transition={{ 
                        d: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                        stroke: { duration: 0.5 }
                    }}
                    strokeWidth="1.5"
                />

                {/* Surface Shine */}
                <path d="M35 35 Q40 30 50 32" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

                {/* Eyes */}
                <motion.g animate={{ y: mood === "annoyed" ? -2 : 0 }}>
                    {/* Left Eye */}
                    <motion.circle 
                        cx="38" animate={{ cy: config.eyeY, r: config.eyeR }} 
                        fill="white" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <motion.circle 
                        cx="39" animate={{ cy: config.eyeY, r: config.eyeR / 2 }} 
                        fill="#1a2e05" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    
                    {/* Right Eye */}
                    <motion.circle 
                        cx="62" animate={{ cy: config.eyeY, r: config.eyeR }} 
                        fill="white" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <motion.circle 
                        cx="61" animate={{ cy: config.eyeY, r: config.eyeR / 2 }} 
                        fill="#1a2e05" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />

                    {/* Annoyed Lids */}
                    <motion.g animate={{ opacity: mood === "annoyed" ? 1 : 0 }} transition={{ duration: 0.3 }}>
                        <path d="M30 48 L46 52" stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round" />
                        <path d="M70 48 L54 52" stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round" />
                    </motion.g>
                </motion.g>

                {/* Mouth */}
                <motion.path 
                    animate={{ d: config.mouthD }} 
                    stroke="#1a2e05" strokeWidth="2.5" strokeLinecap="round" 
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
            </svg>
            
            {/* Ambient Glow */}
            <motion.div 
                className="absolute inset-0 rounded-full blur-2xl -z-10"
                animate={{ 
                    background: config.glow,
                    scale: [1, 1.2, 1] 
                }}
                transition={{ 
                    background: { duration: 0.5 },
                    scale: { duration: 3, repeat: Infinity }
                }}
            />
        </motion.div>
    );
});
