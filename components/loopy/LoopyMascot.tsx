"use client";

import { useState, useEffect, useMemo, memo, useId } from "react";
import { motion, useAnimation } from "framer-motion";

export type LoopyMood = "happy" | "surprised" | "annoyed" | "thinking" | "celebrating" | "screaming" | "huddled" | "awakened";

export const LoopyMascot = memo(({ 
    size = 80, 
    mood = "happy", 
    hasCrown = false, 
    hasCape = false,
    direction = "center",
    isStatic = false
}: { 
    size?: number, 
    mood?: LoopyMood,
    hasCrown?: boolean,
    hasCape?: boolean,
    direction?: "left" | "right" | "center",
    isStatic?: boolean
}) => {
    // Mood-based configurations
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
            colorTop: "#f7fee7", colorMid: "#bef264", colorBottom: "#4d7c0f",
            glow: "rgba(163, 230, 53, 0.5)",
            eyeR: 8, eyeY: 50, mouthD: "M40 70 Q50 85 60 70",
            shake: 5
        },
        screaming: {
            colorTop: "#ef4444", colorMid: "#b91c1c", colorBottom: "#7f1d1d",
            glow: "rgba(239, 68, 68, 0.5)",
            eyeR: 10, eyeY: 50, mouthD: "M40 75 Q50 95 60 75 L60 85 Q50 100 40 85 Z",
            shake: 8
        },
        huddled: {
            colorTop: "#cbd5e1", colorMid: "#94a3b8", colorBottom: "#475569",
            glow: "rgba(148, 163, 184, 0.1)",
            eyeR: 3, eyeY: 65, mouthD: "M45 80 Q50 80 55 80",
            shake: 1
        },
        awakened: {
            colorTop: "#bae6fd", colorMid: "#38bdf8", colorBottom: "#0369a1",
            glow: "rgba(56, 189, 248, 0.4)",
            eyeR: 9, eyeY: 55, mouthD: "M46 72 Q50 78 54 72",
            shake: 0
        }
    };

    const config = moodConfigs[mood] || moodConfigs.happy;

    const rotation = direction === "left" ? -15 : direction === "right" ? 15 : 0;
    const eyeXOffset = direction === "left" ? -5 : direction === "right" ? 5 : 0;

    const idPrefix = useId().replace(/:/g, "");

    // Blinking logic
    const blinkControls = useAnimation();
    
    useEffect(() => {
        if (!isStatic) return;

        const blinkLoop = async () => {
            while (true) {
                await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));
                await blinkControls.start({ scaleY: 0, transition: { duration: 0.1 } });
                await blinkControls.start({ scaleY: 1, transition: { duration: 0.1 } });
            }
        };

        blinkLoop();
    }, [isStatic, blinkControls]);

    return (
        <motion.div 
            style={{ width: size, height: size }}
            className="relative"
            animate={{ 
                x: (!isStatic && (mood === "annoyed" || mood === "screaming" || mood === "huddled")) ? [0, -config.shake, config.shake, -config.shake, config.shake, 0] : 0,
                y: (!isStatic && mood === "thinking") ? [0, -4, 0] : (!isStatic && mood === "celebrating") ? [0, -20, 0] : (!isStatic && mood === "huddled") ? [0, 5, 0] : 0,
                rotate: rotation,
                scale: (!isStatic && mood === "celebrating") ? [1, 1.1, 0.9, 1] : mood === "huddled" ? 0.8 : 1
            }}
            transition={{ 
                x: { duration: 0.1, repeat: (!isStatic && (mood === "annoyed" || mood === "screaming" || mood === "huddled")) ? Infinity : 0 },
                y: { 
                    duration: mood === "celebrating" ? 0.6 : 2, 
                    repeat: !isStatic ? Infinity : 0, 
                    ease: "easeInOut" 
                },
                rotate: { type: "spring", stiffness: 200, damping: 15 }
            }}
        >
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id={`${idPrefix}-grad`} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <motion.stop offset="0%" animate={{ stopColor: config.colorTop }} />
                        <motion.stop offset="60%" animate={{ stopColor: config.colorMid }} />
                        <motion.stop offset="100%" animate={{ stopColor: config.colorBottom }} />
                    </radialGradient>
                    
                    <filter id={`${idPrefix}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="2" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* THE CAPE */}
                {hasCape && (
                    <motion.path 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, d: mood === "celebrating" 
                            ? "M20 60 L0 110 L100 110 L80 60 Q50 50 20 60" 
                            : "M25 65 L10 115 L90 115 L75 65 Q50 55 25 65" 
                        }}
                        fill="#ef4444"
                        stroke="#991b1b"
                        strokeWidth="2"
                    />
                )}

                {/* Body with breathing loop */}
                <motion.path 
                    animate={{ 
                        d: (mood === "surprised" || mood === "screaming")
                            ? "M50 15 C75 15 90 35 90 60 C90 85 75 90 50 90 C25 90 10 85 10 60 C10 35 25 15 50 15Z" 
                            : mood === "huddled"
                            ? "M50 40 C70 40 80 50 80 75 C80 90 70 95 50 95 C30 95 20 90 20 75 C20 50 30 40 50 40Z"
                            : isStatic 
                            ? "M50 20 C70 20 85 35 85 60 C85 80 70 85 50 85 C30 85 15 80 15 60 C15 35 30 20 50 20Z"
                            : [
                                "M50 20 C70 20 85 35 85 60 C85 80 70 85 50 85 C30 85 15 80 15 60 C15 35 30 20 50 20Z", 
                                "M50 22 C72 22 87 37 87 62 C87 82 72 87 50 87 C28 87 13 82 13 62 C13 37 28 22 50 22Z"
                              ],
                        fill: `url(#${idPrefix}-grad)`,
                        stroke: config.colorBottom
                    }}
                    transition={{ 
                        d: { duration: 3, repeat: !isStatic ? Infinity : 0, repeatType: "mirror", ease: "easeInOut" },
                        stroke: { duration: 0.5 }
                    }}
                    strokeWidth="2"
                    filter={`url(#${idPrefix}-shadow)`}
                />

                {/* Surface Shine */}
                <path d="M35 35 Q40 30 50 32" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

                {/* The "Liquid" Face Group - Synchronized with body breathing */}
                <motion.g
                    animate={isStatic
                        ? { y: 1 }
                        : (mood === "surprised" || mood === "screaming" || mood === "huddled") 
                        ? { y: 1, scaleX: 1, scaleY: 1 } 
                        : { 
                            y: [0, 2, 0], 
                            scaleX: [1, 1.05, 1],
                            scaleY: [1, 0.98, 1]
                        }
                    }
                    transition={{ duration: 3, repeat: !isStatic ? Infinity : 0, ease: "easeInOut" }}
                    style={{ transformOrigin: "50% 60%" }}
                >
                    {/* Eyes */}
                    <motion.g animate={{ x: eyeXOffset }}>
                        {/* Eyes with Blinking */}
                        <motion.g animate={isStatic ? blinkControls : {}} style={{ transformOrigin: `50% ${config.eyeY}px` }}>
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
                        </motion.g>

                        {/* Lids */}
                        <motion.g animate={{ opacity: (mood === "annoyed" || mood === "screaming" || mood === "huddled") ? 1 : 0 }} transition={{ duration: 0.3 }}>
                            <path 
                                d={mood === "huddled" ? "M30 62 L46 64" : "M30 48 L46 52"} 
                                stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round" 
                            />
                            <path 
                                d={mood === "huddled" ? "M70 62 L54 64" : "M70 48 L54 52"} 
                                stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round" 
                            />
                        </motion.g>
                    </motion.g>

                    {/* Mouth */}
                    <motion.path 
                        animate={{ d: config.mouthD }} 
                        stroke="#1a2e05" strokeWidth="2.5" strokeLinecap="round" 
                        fill={mood === "screaming" ? "#7f1d1d" : "none"}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                </motion.g>

                {/* THE CROWN */}
                {hasCrown && (
                    <motion.g 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", delay: 0.5 }}
                    >
                        <path d="M35 25 L40 10 L50 20 L60 10 L65 25 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
                        <circle cx="50" cy="18" r="2" fill="#ef4444" />
                    </motion.g>
                )}
            </svg>
            
            {/* Ambient Glow */}
            <motion.div 
                className="absolute inset-0 rounded-full blur-2xl -z-10"
                animate={{ 
                    background: config.glow,
                    scale: isStatic ? 1 : [1, 1.2, 1] 
                }}
                transition={{ 
                    background: { duration: 0.5 },
                    scale: { duration: 3, repeat: !isStatic ? Infinity : 0 }
                }}
            />
        </motion.div>
    );
});
