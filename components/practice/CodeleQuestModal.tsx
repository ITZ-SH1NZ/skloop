"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { soundManager } from "@/lib/sound";

interface CodeleQuestModalProps {
    isWin: boolean;
    solution: string;
    guessesUsed: number;
    xpEarned: number;
    coinsEarned: number;
    onDismiss: () => void;
}

// Matrix rain canvas for win screen
function MatrixRain({ color }: { color: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = "0123456789ABCDEF<>/{}[]()=+-*&|!?;:";
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array.from({ length: columns }, () => Math.random() * -100);

        const draw = () => {
            ctx.fillStyle = "rgba(5, 15, 5, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = color;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);
        return () => clearInterval(interval);
    }, [color]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" />;
}

// Letter tile flip reveal for the solution
function SolutionReveal({ solution }: { solution: string }) {
    return (
        <div className="flex gap-2 justify-center mt-4">
            {solution.split("").map((letter, i) => (
                <motion.div
                    key={i}
                    initial={{ rotateY: 0, backgroundColor: "#1a0a0a" }}
                    animate={{ rotateY: [0, 90, 0], backgroundColor: ["#1a0a0a", "#7f1d1d", "#b91c1c"] }}
                    transition={{ duration: 0.5, delay: i * 0.15, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black text-xl border-2 border-red-800"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {letter}
                </motion.div>
            ))}
        </div>
    );
}

export default function CodeleQuestModal({
    isWin,
    solution,
    guessesUsed,
    xpEarned,
    coinsEarned,
    onDismiss,
}: CodeleQuestModalProps) {
    const [mascotLanded, setMascotLanded] = useState(false);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: isWin ? 0.7 : 0.5 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 40, scale: 0.85 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 22 } },
    };

    useEffect(() => {
        if (isWin) {
            setTimeout(() => soundManager.playVictory(0.9), 600);
        } else {
            soundManager.playGameOver();
        }
    }, [isWin]);

    const bgColor = isWin ? "#050f05" : "#0f0505";
    const accentColor = isWin ? "#4ade80" : "#f87171";
    const accentDark = isWin ? "#166534" : "#991b1b";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-6 overflow-hidden"
            style={{ backgroundColor: bgColor }}
        >
            {/* Background effect */}
            {isWin ? (
                <MatrixRain color="#22c55e" />
            ) : (
                <>
                    {/* Red flash on game over */}
                    <motion.div
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.9 }}
                        className="absolute inset-0 bg-red-700 pointer-events-none"
                    />
                    {/* Vignette */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(180,0,0,0.4) 100%)" }}
                    />
                </>
            )}

            {/* Glow behind mascot */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-30"
                style={{ backgroundColor: accentColor }}
            />

            <motion.div
                animate={mascotLanded ? { x: [-12, 12, -8, 8, -4, 4, 0], y: [10, -10, 7, -7, 3, -3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative z-10 flex flex-col items-center max-w-md w-full text-center"
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center w-full"
                >
                    {/* Label */}
                    <motion.div variants={itemVariants} className="mb-4">
                        <div
                            className="text-[10px] uppercase tracking-[0.25em] font-black px-4 py-1.5 rounded-full border"
                            style={{ color: accentColor, borderColor: accentDark, backgroundColor: `${accentDark}33` }}
                        >
                            Daily Codele
                        </div>
                    </motion.div>

                    {/* Loopy mascot drops in */}
                    <div className="relative mb-6 flex justify-center">
                        <motion.div
                            initial={{ y: isWin ? -800 : 0, scale: isWin ? 2 : 1, rotate: isWin ? 20 : 0 }}
                            animate={{ y: 0, scale: 1, rotate: 0 }}
                            transition={
                                isWin
                                    ? { type: "tween", duration: 0.32, ease: "easeIn", delay: 0.1 }
                                    : { type: "spring", stiffness: 300, damping: 15 }
                            }
                            onAnimationComplete={() => setMascotLanded(true)}
                        >
                            <motion.div
                                animate={mascotLanded && isWin ? { y: [0, -12, 0] } : isWin ? {} : { x: [-5, 5, -5] }}
                                transition={
                                    mascotLanded && isWin
                                        ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                                        : { duration: 0.12, repeat: Infinity, ease: "linear" }
                                }
                            >
                                <LoopyMascot size={220} mood={isWin ? "celebrating" : "huddled"} isStatic={!isWin} />
                            </motion.div>
                        </motion.div>

                        {/* Dust puffs on landing (win only) */}
                        {mascotLanded && isWin && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0, opacity: 0.5, x: 0, y: 0 }}
                                        animate={{
                                            scale: [0, 2, 3.5],
                                            opacity: [0.5, 0],
                                            x: Math.cos((i * 60 * Math.PI) / 180) * 120,
                                            y: Math.sin((i * 60 * Math.PI) / 180) * 40 + 60,
                                        }}
                                        transition={{ duration: 0.65, ease: "easeOut" }}
                                        className="absolute w-12 h-6 rounded-full blur-md"
                                        style={{ backgroundColor: "#166534" }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-2"
                        style={{
                            color: accentColor,
                            textShadow: `0px 5px 0px ${accentDark}`,
                        }}
                    >
                        {isWin ? "Cracked It!" : "Word Lost"}
                    </motion.h1>

                    {/* Subtitle / stats */}
                    {isWin ? (
                        <motion.p variants={itemVariants} className="text-green-400/70 font-medium mb-6">
                            Solved in {guessesUsed} {guessesUsed === 1 ? "guess" : "guesses"}
                        </motion.p>
                    ) : (
                        <motion.div variants={itemVariants} className="mb-6">
                            <p className="text-red-400/70 font-medium mb-1">The word was:</p>
                            <SolutionReveal solution={solution} />
                        </motion.div>
                    )}

                    {/* XP / Coins */}
                    <motion.div variants={itemVariants} className="flex gap-4 mb-10 w-full justify-center">
                        <div
                            className="px-6 py-4 rounded-2xl border-2 flex flex-col items-center flex-1 max-w-[140px]"
                            style={{ backgroundColor: `${accentDark}33`, borderColor: accentDark }}
                        >
                            <span className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: `${accentColor}99` }}>
                                XP Earned
                            </span>
                            <span className="text-3xl font-black" style={{ color: accentColor }}>
                                +{xpEarned}
                            </span>
                        </div>
                        {coinsEarned > 0 && (
                            <div
                                className="px-6 py-4 rounded-2xl border-2 flex flex-col items-center flex-1 max-w-[140px]"
                                style={{ backgroundColor: "#78350f33", borderColor: "#92400e" }}
                            >
                                <span className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-1">Coins</span>
                                <span className="text-3xl font-black text-amber-400">+{coinsEarned}</span>
                            </div>
                        )}
                    </motion.div>

                    {/* CTA */}
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={onDismiss}
                        className="w-full font-black px-8 py-5 rounded-2xl text-lg tracking-widest uppercase shadow-2xl border-b-4 transition-none"
                        style={{
                            backgroundColor: accentColor,
                            color: isWin ? "#052e16" : "#450a0a",
                            borderColor: accentDark,
                            boxShadow: `0 0 40px ${accentColor}40`,
                        }}
                    >
                        {isWin ? "Keep the Streak!" : "Try Tomorrow"}
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
