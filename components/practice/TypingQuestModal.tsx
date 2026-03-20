"use client";

import { useEffect, useRef, useState } from "react";
import { motion, Variants, animate } from "framer-motion";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { soundManager } from "@/lib/sound";
import confetti from "canvas-confetti";

interface TypingQuestModalProps {
    wpm: number;
    accuracy: number;
    xpEarned: number;
    coinsEarned: number;
    onDismiss: () => void;
}

// Flying keyboard char rain
function CharRain() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]<>/=+;:".split("");
    const particles = Array.from({ length: 28 }, (_, i) => ({
        id: i,
        char: chars[Math.floor(Math.random() * chars.length)],
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        duration: 1.8 + Math.random() * 1.5,
        size: Math.random() > 0.6 ? "text-xl" : "text-sm",
        opacity: 0.12 + Math.random() * 0.18,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.span
                    key={p.id}
                    className={`absolute font-mono font-black text-lime-400 select-none ${p.size}`}
                    style={{ left: p.left, top: "-10%", opacity: p.opacity }}
                    animate={{ y: ["0vh", "110vh"] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
                >
                    {p.char}
                </motion.span>
            ))}

            {/* Speed lines from center */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                {Array.from({ length: 12 }, (_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    return (
                        <motion.line
                            key={i}
                            x1="400" y1="300"
                            x2={400 + Math.cos(angle) * 600}
                            y2={300 + Math.sin(angle) * 600}
                            stroke="#84cc16"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: [0, 1], opacity: [0, 0.8, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.07, ease: "easeOut" }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}

// Animated count-up number
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const controls = animate(0, target, {
            duration: 1.4,
            ease: "easeOut",
            delay: 0.6,
            onUpdate(value) {
                setDisplay(Math.round(value));
            },
        });
        return () => controls.stop();
    }, [target]);

    return (
        <span ref={ref}>
            {display}{suffix}
        </span>
    );
}

function getWpmLabel(wpm: number) {
    if (wpm >= 120) return "Lightning Fast";
    if (wpm >= 80) return "Blazing";
    if (wpm >= 60) return "Smooth";
    if (wpm >= 40) return "Steady";
    return "Warming Up";
}

export default function TypingQuestModal({
    wpm,
    accuracy,
    xpEarned,
    coinsEarned,
    onDismiss,
}: TypingQuestModalProps) {
    const [mascotBouncing, setMascotBouncing] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => {
            soundManager.playVictory(0.85);
            setMascotBouncing(true);
        }, 400);

        const t2 = setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 90,
                angle: 60,
                origin: { x: 0, y: 0.6 },
                colors: ["#d9f99d", "#84cc16", "#facc15", "#a3e635", "#f0fdf4"],
            });
            confetti({
                particleCount: 80,
                spread: 90,
                angle: 120,
                origin: { x: 1, y: 0.6 },
                colors: ["#d9f99d", "#84cc16", "#facc15", "#a3e635", "#f0fdf4"],
            });
        }, 500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.13, delayChildren: 0.55 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 40, scale: 0.85 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 290, damping: 22 } },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-6 overflow-hidden"
            style={{ backgroundColor: "#080a03" }}
        >
            <CharRain />

            {/* Glow blob */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] bg-lime-500/15 pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex flex-col items-center max-w-md w-full text-center"
            >
                {/* Label */}
                <motion.div variants={itemVariants} className="mb-4">
                    <div className="text-[10px] uppercase tracking-[0.25em] font-black px-4 py-1.5 rounded-full border border-lime-800 bg-lime-900/30 text-lime-400">
                        Syntax Speed Run
                    </div>
                </motion.div>

                {/* Mascot */}
                <motion.div variants={itemVariants} className="mb-2 relative">
                    <motion.div
                        animate={mascotBouncing ? { y: [0, -18, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <LoopyMascot size={210} mood="celebrating" isStatic={false} />
                    </motion.div>

                    {/* Speed trail lines behind mascot */}
                    {mascotBouncing && (
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none">
                            {[60, 40, 25].map((w, i) => (
                                <motion.div
                                    key={i}
                                    className="h-0.5 rounded-full bg-lime-400"
                                    style={{ width: w }}
                                    animate={{ opacity: [0.6, 0.1, 0.6], x: [-4, 4, -4] }}
                                    transition={{ duration: 0.6 + i * 0.2, repeat: Infinity, delay: i * 0.1 }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* WPM big number */}
                <motion.div variants={itemVariants} className="mb-1">
                    <div
                        className="font-black leading-none"
                        style={{
                            fontSize: "clamp(72px, 18vw, 110px)",
                            color: "#d9f99d",
                            textShadow: "0 0 40px #84cc1680, 0 5px 0px #365314",
                        }}
                    >
                        <CountUp target={wpm} />
                    </div>
                    <div className="text-lime-400/60 font-bold uppercase tracking-widest text-sm -mt-1">WPM</div>
                </motion.div>

                {/* WPM label */}
                <motion.p variants={itemVariants} className="text-lime-300/60 font-bold text-sm uppercase tracking-widest mb-6">
                    {getWpmLabel(wpm)}
                </motion.p>

                {/* Stats row */}
                <motion.div variants={itemVariants} className="flex gap-4 mb-8 w-full justify-center">
                    <div className="bg-lime-900/25 border border-lime-800/50 px-5 py-4 rounded-2xl flex flex-col items-center flex-1 max-w-[140px]">
                        <span className="text-xs font-bold text-lime-500/70 uppercase tracking-widest mb-1">Accuracy</span>
                        <span className="text-2xl font-black text-lime-200">
                            <CountUp target={accuracy} suffix="%" />
                        </span>
                    </div>
                    <div className="bg-lime-900/25 border border-lime-800/50 px-5 py-4 rounded-2xl flex flex-col items-center flex-1 max-w-[140px]">
                        <span className="text-xs font-bold text-lime-500/70 uppercase tracking-widest mb-1">XP Earned</span>
                        <span className="text-2xl font-black text-lime-200">+{xpEarned}</span>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onDismiss}
                    className="w-full font-black px-8 py-5 rounded-2xl text-lg tracking-widest uppercase border-b-4 border-lime-900"
                    style={{
                        backgroundColor: "#84cc16",
                        color: "#1a2e05",
                        boxShadow: "0 0 50px #84cc1650",
                    }}
                >
                    Race Again!
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
