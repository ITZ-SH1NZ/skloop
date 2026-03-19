"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { soundManager } from "@/lib/sound";

interface LessonCompleteProps {
    xpEarned: number;
    isPerfect: boolean;
    streak?: number;
    onContinue: () => void;
    topicTitle: string;
}

export default function LessonComplete({ xpEarned, isPerfect, streak = 0, onContinue, topicTitle }: LessonCompleteProps) {
    const [hasLanded, setHasLanded] = useState(false);

    const fireConfetti = () => {
        const duration = 2500;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 8,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#D4F268', '#4d7c0f', '#000000', '#ffffff', '#eab308']
            });
            confetti({
                particleCount: 8,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#D4F268', '#4d7c0f', '#000000', '#ffffff', '#eab308']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.6 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#FDFCF8] flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Spinning Sunburst Background */}
            <motion.div 
                className="absolute w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] bg-[conic-gradient(from_0deg,#FDFCF8_0deg_15deg,#F4F4F5_15deg_30deg)] opacity-40 rounded-full pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            <motion.div 
                animate={hasLanded ? { 
                    x: [-15, 15, -10, 10, -5, 5, 0], 
                    y: [15, -15, 10, -10, 5, -5, 0] 
                } : {}}
                transition={{ duration: 0.4 }}
                className="relative z-10 flex flex-col items-center max-w-lg w-full text-center"
            >
                {/* Dust Cloud on impact */}
                {hasLanded && (
                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 pointer-events-none z-0">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0.6, x: 0, y: 0 }}
                                animate={{ 
                                    scale: [0, 2, 4],
                                    opacity: [0.6, 0],
                                    x: Math.cos(i * 45 * Math.PI / 180) * 150,
                                    y: Math.sin(i * 45 * Math.PI / 180) * 50 + 80
                                }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="absolute w-16 h-8 bg-zinc-300 rounded-full blur-md"
                            />
                        ))}
                    </div>
                )}

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center w-full"
                >
                    <motion.div variants={itemVariants} className="mb-2">
                        <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-zinc-400 bg-white px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm mt-8">
                            {topicTitle}
                        </div>
                    </motion.div>

                    <div className="relative mt-4 mb-8 md:mb-10 w-full flex justify-center z-20">
                        <motion.div 
                            initial={{ y: -1000, scale: 2.5, rotate: 15 }}
                            animate={{ y: 0, scale: 1, rotate: 0 }}
                            transition={{ type: "tween", duration: 0.35, ease: "easeIn", delay: 0.1 }}
                            onAnimationComplete={() => {
                                setHasLanded(true);
                                fireConfetti();
                                soundManager.playRocketLaunch(0.8);
                                setTimeout(() => soundManager.playVictory(1.0), 200);
                            }}
                        >
                            <motion.div 
                                animate={hasLanded ? { y: [0, -15, 0] } : {}} 
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <LoopyMascot size={260} mood="celebrating" isStatic={false} hasCrown={isPerfect} />
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.h1 
                        variants={itemVariants} 
                        className={`text-5xl md:text-6xl lg:text-7xl font-black mb-8 uppercase tracking-tight ${isPerfect ? 'text-yellow-400' : 'text-[#D4F268]'}`}
                        style={{ textShadow: "0px 6px 0px #1a2e05" }}
                    >
                        {isPerfect ? "Perfect!" : "Lesson\nComplete!"}
                    </motion.h1>

                    <motion.div variants={itemVariants} className="flex flex-row items-center gap-4 md:gap-6 mb-12 w-full justify-center">
                        <div className="bg-white px-6 md:px-8 py-4 md:py-5 rounded-3xl border-2 border-zinc-100 shadow-xl flex flex-col items-center flex-1 max-w-[160px]">
                            <span className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">XP Earned</span>
                            <span className="text-3xl md:text-4xl font-black text-[#4d7c0f]">+{xpEarned}</span>
                        </div>

                        {isPerfect && (
                            <div className="bg-yellow-50 px-6 md:px-8 py-4 md:py-5 rounded-3xl border-2 border-yellow-200 shadow-xl shadow-yellow-500/20 flex flex-col items-center flex-1 max-w-[160px] transform rotate-3">
                                <span className="text-xs md:text-sm font-bold text-yellow-600 uppercase tracking-widest mb-1">Flawless</span>
                                <span className="text-3xl md:text-4xl font-black text-yellow-500">+{Math.floor(xpEarned * 0.5)}</span>
                            </div>
                        )}
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onContinue}
                        className="w-full bg-[#4d7c0f] text-white font-black px-8 py-5 md:py-6 rounded-3xl text-lg md:text-xl tracking-widest uppercase shadow-2xl shadow-[#4d7c0f]/30 hover:brightness-110 active:transition-none active:translate-y-1 active:shadow-none border-b-4 border-[#3f6212]"
                    >
                        Continue Journey
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
}
