"use client";

import { useEffect, memo, useId } from "react";
import { motion, useAnimation } from "framer-motion";

export type LoopyMood = "happy" | "surprised" | "annoyed" | "thinking" | "celebrating" | "screaming" | "huddled" | "awakened" | "warrior";

// Defined at module scope so the object is stable across renders.
// Previously inside the component, causing Framer Motion to see "new" targets on every re-render.
const MOOD_CONFIGS: Record<LoopyMood, any> = {
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
            eyeR: 8, eyeY: 46, mouthD: "M40 60 Q50 50 60 60 L60 70 Q50 85 40 70 Z",
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
        },
        warrior: {
            colorTop: "#ffedd5",
            colorMid: "#f97316",
            colorBottom: "#9a3412",
            glow: "rgba(249, 115, 22, 0.5)",
            eyeR: 7.5,
            eyeY: 52,
            mouthD: "M43 71 Q50 68 57 71",
            shake: 0
        }
};

export const LoopyMascot = memo(({
    size = 80,
    mood = "happy",
    hasCrown = false,
    hasCape = false,
    hasSword = false,
    direction = "center",
    isStatic = false
}: {
    size?: number | string,
    mood?: LoopyMood,
    hasCrown?: boolean,
    hasCape?: boolean,
    hasSword?: boolean,
    direction?: "left" | "right" | "center",
    isStatic?: boolean
}) => {
    const config = MOOD_CONFIGS[mood] || MOOD_CONFIGS.happy;

    const rotation = direction === "left" ? -15 : direction === "right" ? 15 : 0;
    const eyeXOffset = direction === "left" ? -5 : direction === "right" ? 5 : 0;

    const idPrefix = useId().replace(/:/g, "");

    const blinkControls = useAnimation();

    useEffect(() => {
        if (!isStatic) return;
        let isMounted = true;
        const blinkLoop = async () => {
            while (isMounted) {
                await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));
                if (!isMounted) break;
                try {
                    await blinkControls.start({ scaleY: 0, transition: { duration: 0.1 } });
                    if (!isMounted) break;
                    await blinkControls.start({ scaleY: 1, transition: { duration: 0.1 } });
                } catch {
                    break;
                }
            }
        };
        blinkLoop();
        return () => { isMounted = false; };
    }, [isStatic, blinkControls]);

    const isWarrior = mood === "warrior";

    return (
        <motion.div
            style={{ width: size, height: size }}
            className="relative"
            animate={{
                x: (!isStatic && (mood === "annoyed" || mood === "screaming")) ? [0, -config.shake, config.shake, -config.shake, config.shake, 0] : 0,
                y: (!isStatic && mood === "thinking") ? [0, -6, 0]
                    : (!isStatic && mood === "celebrating") ? [0, -30, 0]
                    : (!isStatic && mood === "huddled") ? [0, 4, 0]
                    : (!isStatic && isWarrior) ? [0, -10, 0]
                    : 0,
                rotate: rotation,
                scaleX: (!isStatic && mood === "celebrating") ? [1, 1.25, 0.85, 1] 
                        : (!isStatic && mood === "huddled") ? [0.8, 0.83, 0.8] 
                        : mood === "huddled" ? 0.8 : 1,
                scaleY: (!isStatic && mood === "celebrating") ? [1, 0.75, 1.15, 1] 
                        : (!isStatic && mood === "huddled") ? [0.8, 0.77, 0.8] 
                        : mood === "huddled" ? 0.8 : 1
            }}
            transition={{
                x: { duration: 0.1, repeat: (!isStatic && (mood === "annoyed" || mood === "screaming")) ? Infinity : 0 },
                y: {
                    duration: mood === "celebrating" ? 0.5 : isWarrior ? 3 : 2.5,
                    repeat: !isStatic ? Infinity : 0,
                    ease: "easeInOut"
                },
                scaleX: { duration: mood === "celebrating" ? 0.5 : 2.5, repeat: !isStatic ? Infinity : 0, ease: "easeInOut" },
                scaleY: { duration: mood === "celebrating" ? 0.5 : 2.5, repeat: !isStatic ? Infinity : 0, ease: "easeInOut" },
                rotate: { type: "spring", stiffness: 260, damping: 20 }
            }}
        >
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id={`${idPrefix}-grad`} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <motion.stop offset="0%" animate={{ stopColor: config.colorTop }} transition={{ duration: 0.6 }} />
                        <motion.stop offset="60%" animate={{ stopColor: config.colorMid }} transition={{ duration: 0.6 }} />
                        <motion.stop offset="100%" animate={{ stopColor: config.colorBottom }} transition={{ duration: 0.6 }} />
                    </radialGradient>

                    <filter id={`${idPrefix}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="2" floodOpacity="0.3" />
                    </filter>

                    <linearGradient id={`${idPrefix}-sword-blade`} x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="40%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#f8fafc" />
                    </linearGradient>

                    <linearGradient id={`${idPrefix}-sword-edge`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
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

                {/* SWORD — rendered before body so body is layered on top for natural grip */}
                {hasSword && (
                    <motion.g
                        initial={{ opacity: 0, x: 8, rotate: 20 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.25 }}
                        style={{ transformOrigin: "78px 74px" }}
                    >
                        {/* Blade outer shadow */}
                        <path d="M81 79 L95 22" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" />
                        {/* Blade body */}
                        <path d="M80 78 L94 21" stroke={`url(#${idPrefix}-sword-blade)`} strokeWidth="4" strokeLinecap="round" />
                        {/* Blade edge shine */}
                        <path d="M79.5 76 L93.5 22" stroke={`url(#${idPrefix}-sword-edge)`} strokeWidth="1.5" strokeLinecap="round" />
                        {/* Blade tip gem/point */}
                        <circle cx="93.5" cy="21.5" r="1.8" fill="#f8fafc" opacity="0.8" />

                        {/* Crossguard shadow */}
                        <path d="M72 65 L97 57" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
                        {/* Crossguard main */}
                        <path d="M72 65 L97 57" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
                        {/* Crossguard highlight */}
                        <path d="M74 63 L95 56" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

                        {/* Grip shadow */}
                        <path d="M77 69 L81 82" stroke="#1c0a00" strokeWidth="6.5" strokeLinecap="round" />
                        {/* Grip leather */}
                        <path d="M77 69 L81 82" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                        {/* Grip wrapping */}
                        <path d="M77.2 71.5 L80.2 71" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M77.8 74.5 L80.8 74" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M78.4 77.5 L81.4 77" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />

                        {/* Pommel base */}
                        <circle cx="81" cy="83.5" r="5" fill="#451a03" />
                        {/* Pommel */}
                        <circle cx="81" cy="83.5" r="3.5" fill="#d97706" />
                        {/* Pommel shine */}
                        <circle cx="79.8" cy="82.2" r="1.2" fill="rgba(255,255,255,0.45)" />
                    </motion.g>
                )}

                {/* Body with breathing */}
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
                        d: { 
                            duration: (mood === "surprised" || mood === "screaming" || mood === "huddled") ? 0.3 : 3, 
                            repeat: (!isStatic && mood !== "surprised" && mood !== "screaming" && mood !== "huddled") ? Infinity : 0, 
                            repeatType: "mirror", ease: "easeInOut" 
                        },
                        stroke: { duration: 0.6 }
                    }}
                    strokeWidth="2"
                    filter={`url(#${idPrefix}-shadow)`}
                />

                {/* Surface shine */}
                <path d="M35 35 Q40 30 50 32" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

                {/* Liquid face group */}
                <motion.g
                    animate={isStatic
                        ? { y: 1 }
                        : (mood === "surprised" || mood === "screaming" || mood === "huddled")
                        ? { y: 1, scaleX: 1, scaleY: 1 }
                        : {
                            y: [0, 6, 0],
                            scaleX: [1, 1.08, 1],
                            scaleY: [1, 0.94, 1]
                        }
                    }
                    transition={{
                        duration: 2.5,
                        repeat: !isStatic ? Infinity : 0,
                        ease: "circOut",
                        delay: 0.1
                    }}
                    style={{ transformOrigin: "50% 60%" }}
                >
                    <motion.g animate={{ x: eyeXOffset }}>
                        <motion.g animate={isStatic ? blinkControls : {}} style={{ transformOrigin: `50% ${config.eyeY}px` }}>
                            <motion.circle
                                cx="38" animate={{ cy: config.eyeY, r: config.eyeR }}
                                fill="white" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            <motion.circle
                                cx="39" animate={{ cy: config.eyeY, r: config.eyeR / 2 }}
                                fill="#1a2e05" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            <motion.circle
                                cx="62" animate={{ cy: config.eyeY, r: config.eyeR }}
                                fill="white" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            <motion.circle
                                cx="61" animate={{ cy: config.eyeY, r: config.eyeR / 2 }}
                                fill="#1a2e05" transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        </motion.g>

                        <motion.g animate={{ opacity: (mood === "annoyed" || mood === "screaming" || mood === "huddled") ? 1 : 0 }} transition={{ duration: 0.3 }}>
                            <motion.path
                                animate={{ d: mood === "huddled" ? "M30 62 L46 64" : "M30 44 L46 48" }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round"
                            />
                            <motion.path
                                animate={{ d: mood === "huddled" ? "M70 62 L54 64" : "M70 44 L54 48" }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                stroke={config.colorBottom} strokeWidth="3" strokeLinecap="round"
                            />
                        </motion.g>

                        {/* Warrior brow — determined expression */}
                        <motion.g animate={{ opacity: isWarrior ? 1 : 0 }} transition={{ duration: 0.4 }}>
                            <path d="M31 46 L44 49" stroke={config.colorBottom} strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M56 49 L69 46" stroke={config.colorBottom} strokeWidth="2.5" strokeLinecap="round" />
                        </motion.g>
                    </motion.g>

                    <motion.path
                        animate={{ d: config.mouthD }}
                        stroke="#1a2e05" strokeWidth="2.5" strokeLinecap="round"
                        fill={mood === "screaming" ? "#7f1d1d" : "none"}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                </motion.g>

                {/* THE CROWN — improved */}
                {hasCrown && (
                    <motion.g
                        initial={{ y: -20, opacity: 0, scale: 0.7 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.4 }}
                        style={{ transformOrigin: "50px 18px" }}
                    >
                        {/* Crown band */}
                        <rect x="33" y="22" width="34" height="5" rx="1.5" fill="#b45309" />
                        {/* Crown body with spikes */}
                        <path d="M33 27 L37 10 L44 20 L50 8 L56 20 L63 10 L67 27 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" strokeLinejoin="round" />
                        {/* Crown inner shading */}
                        <path d="M37 27 L40 14 L44 22 L50 11 L56 22 L60 14 L63 27 Z" fill="#fde68a" opacity="0.5" />
                        {/* Center jewel */}
                        <circle cx="50" cy="14" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
                        <circle cx="49.2" cy="13.2" r="1.1" fill="rgba(255,255,255,0.55)" />
                        {/* Side jewels */}
                        <circle cx="40" cy="20" r="2" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="0.8" />
                        <circle cx="39.3" cy="19.3" r="0.7" fill="rgba(255,255,255,0.5)" />
                        <circle cx="60" cy="20" r="2" fill="#34d399" stroke="#065f46" strokeWidth="0.8" />
                        <circle cx="59.3" cy="19.3" r="0.7" fill="rgba(255,255,255,0.5)" />
                        {/* Crown highlight */}
                        <path d="M36 20 L39 11" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M45 15 L47 10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                    </motion.g>
                )}
            </svg>

            {/* Ambient glow */}
            <motion.div
                className="absolute inset-0 rounded-full blur-2xl -z-10"
                animate={{
                    background: config.glow,
                    scale: isStatic ? 1 : [1, 1.2, 1]
                }}
                transition={{
                    background: { duration: 0.6 },
                    scale: { duration: 3, repeat: !isStatic ? Infinity : 0 }
                }}
            />
        </motion.div>
    );
});

LoopyMascot.displayName = "LoopyMascot";
