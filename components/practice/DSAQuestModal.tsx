"use client";

import { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { soundManager } from "@/lib/sound";
import confetti from "canvas-confetti";

interface DSAQuestModalProps {
    grade: string;
    score: number;
    totalQuestions: number;
    xpEarned: number;
    coinsEarned: number;
    onDismiss: () => void;
}

// Pulsing concentric rings + arc SVG lines radiating from center
function ElectricCircuit() {
    const rings = [120, 200, 280, 360];
    const arcs = Array.from({ length: 8 }, (_, i) => i);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {/* Concentric rings */}
            {rings.map((size, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-violet-500/20"
                    style={{ width: size, height: size }}
                    animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
            ))}

            {/* Electric arc SVG lines */}
            <svg className="absolute w-[500px] h-[500px] opacity-20" viewBox="0 0 500 500">
                {arcs.map((i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    const x2 = 250 + Math.cos(angle) * 230;
                    const y2 = 250 + Math.sin(angle) * 230;
                    return (
                        <motion.line
                            key={i}
                            x1="250" y1="250"
                            x2={x2} y2={y2}
                            stroke="#a78bfa"
                            strokeWidth="1"
                            strokeDasharray="6 4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                        />
                    );
                })}
            </svg>

            {/* Center glow */}
            <motion.div
                className="absolute w-32 h-32 rounded-full blur-[60px] bg-violet-500/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

const GRADE_CONFIG: Record<string, { color: string; shadow: string; label: string }> = {
    "S+": { color: "#e9d5ff", shadow: "#7c3aed", label: "Legendary" },
    "S":  { color: "#c4b5fd", shadow: "#6d28d9", label: "Master" },
    "A":  { color: "#a78bfa", shadow: "#5b21b6", label: "Expert" },
    "B":  { color: "#818cf8", shadow: "#4338ca", label: "Proficient" },
    "C":  { color: "#93c5fd", shadow: "#1d4ed8", label: "Learning" },
    "D":  { color: "#94a3b8", shadow: "#334155", label: "Keep Going" },
};

export default function DSAQuestModal({
    grade,
    score,
    totalQuestions,
    xpEarned,
    coinsEarned,
    onDismiss,
}: DSAQuestModalProps) {
    const [gradeVisible, setGradeVisible] = useState(false);
    const cfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG["D"];

    useEffect(() => {
        const timer = setTimeout(() => {
            setGradeVisible(true);
            soundManager.playVictory(0.85);

            // Purple confetti burst
            const fire = (particleRatio: number, opts: confetti.Options) => {
                confetti({
                    ...opts,
                    particleCount: Math.floor(150 * particleRatio),
                    colors: ["#7c3aed", "#a78bfa", "#c4b5fd", "#e9d5ff", "#4f46e5"],
                });
            };
            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2,  { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1,  { spread: 120, startVelocity: 45 });
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.5 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 35, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-6 overflow-hidden"
            style={{ backgroundColor: "#040412" }}
        >
            <ElectricCircuit />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex flex-col items-center max-w-md w-full text-center"
            >
                {/* Label */}
                <motion.div variants={itemVariants} className="mb-6">
                    <div className="text-[10px] uppercase tracking-[0.25em] font-black px-4 py-1.5 rounded-full border border-violet-700 bg-violet-900/30 text-violet-400">
                        DSA Rapid Fire
                    </div>
                </motion.div>

                {/* Loopy */}
                <motion.div
                    variants={itemVariants}
                    className="mb-4 relative"
                >
                    <motion.div
                        animate={{ y: [0, -14, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                    >
                        <LoopyMascot size={200} mood="celebrating" isStatic={false} />
                    </motion.div>

                    {/* Floating Zap icons */}
                    {["-top-4 -left-6", "-top-2 -right-8", "top-6 -left-10"].map((pos, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${pos} text-yellow-400`}
                            animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6], rotate: [0, 15, 0] }}
                            transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Grade slab */}
                <motion.div variants={itemVariants} className="mb-2">
                    <AnimatePresence>
                        {gradeVisible && (
                            <motion.div
                                initial={{ scale: 0, rotate: -15, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                                className="font-black leading-none tracking-tighter select-none"
                                style={{
                                    fontSize: "clamp(80px, 20vw, 120px)",
                                    color: cfg.color,
                                    textShadow: `0 0 40px ${cfg.shadow}, 0 6px 0px ${cfg.shadow}`,
                                }}
                            >
                                {grade}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <p className="text-violet-400/70 font-bold uppercase tracking-widest text-sm">{cfg.label}</p>
                </motion.div>

                {/* Score + XP row */}
                <motion.div variants={itemVariants} className="flex gap-4 mt-6 mb-8 w-full justify-center">
                    <div className="bg-violet-900/30 border border-violet-700/50 px-6 py-4 rounded-2xl flex flex-col items-center flex-1 max-w-[140px]">
                        <span className="text-xs font-bold text-violet-400/70 uppercase tracking-widest mb-1">Score</span>
                        <span className="text-3xl font-black text-violet-200">{score}/{totalQuestions}</span>
                    </div>
                    <div className="bg-violet-900/30 border border-violet-700/50 px-6 py-4 rounded-2xl flex flex-col items-center flex-1 max-w-[140px]">
                        <span className="text-xs font-bold text-violet-400/70 uppercase tracking-widest mb-1">XP Earned</span>
                        <span className="text-3xl font-black text-violet-200">+{xpEarned}</span>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onDismiss}
                    className="w-full font-black px-8 py-5 rounded-2xl text-lg tracking-widest uppercase border-b-4 border-violet-900"
                    style={{
                        backgroundColor: "#7c3aed",
                        color: "#f5f3ff",
                        boxShadow: "0 0 50px #7c3aed60",
                    }}
                >
                    Continue Training
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
