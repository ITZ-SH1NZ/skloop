"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Logo from "./Logo";

// To fix hydration errors, we generate random star data only on the client
interface StarData {
    id: number;
    width: number;
    height: number;
    top: number;
    left: number;
    opacity: number;
    delay: number;
}

export default function GamifiedLoader({ onComplete, preloadTasksRef }: { onComplete: () => void, preloadTasksRef?: React.MutableRefObject<Promise<any>[]> }) {
    const [step, setStep] = useState(0);
    const [stars, setStars] = useState<StarData[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Prevent scrolling while loading
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        // Generate stars on client to avoid hydration mismatch
        const generatedStars = [...Array(40)].map((_, i) => ({
            id: i,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            opacity: Math.random() * 0.5 + 0.1,
            delay: Math.random() * 0.2
        }));
        setStars(generatedStars);

        let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout, t4: NodeJS.Timeout, t5: NodeJS.Timeout, t6: NodeJS.Timeout;

        // Animation Sequence (Matching steps + progress bar)
        t1 = setTimeout(() => { setStep(1); setProgress(20); }, 600);  // Base + Fins drop in
        t2 = setTimeout(() => { setStep(2); setProgress(40); }, 1200); // Body drops in
        t3 = setTimeout(() => { setStep(3); setProgress(60); }, 1800); // Nose drops in
        t4 = setTimeout(() => { 
            setStep(4); 
            setProgress(80); 
            
            // Wait for preloaded tasks (if any) or proceed after a short delay
            const proceedToBlastoff = () => {
                t5 = setTimeout(() => { setStep(5); setProgress(100); }, 800); // BLAST OFF
                t6 = setTimeout(() => onComplete(), 1500);
            };

            if (preloadTasksRef && preloadTasksRef.current && preloadTasksRef.current.length > 0) {
                // Wait for all registered preloads, with a fallback timeout of 6 seconds to prevent infinite hang
                Promise.race([
                    Promise.allSettled(preloadTasksRef.current),
                    new Promise(resolve => setTimeout(resolve, 6000))
                ]).then(() => {
                    proceedToBlastoff();
                });
            } else {
                proceedToBlastoff();
            }

        }, 2600); // IGNITION (Shake)

        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
            clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
        };
    }, [onComplete, preloadTasksRef]);

    // Update text based on step to explicitly show changes
    let tipText = "Initiating launch sequence...";
    switch (step) {
        case 1: tipText = "Assembling thrusters..."; break;
        case 2: tipText = "Securing payload..."; break;
        case 3: tipText = "Pre-flight checks passed..."; break;
        case 4: tipText = "IGNITION!"; break;
        case 5: tipText = "LIFT OFF!"; break;
    }

    const SPRING_BOUNCE = { type: "spring" as const, stiffness: 400, damping: 15 };
    const SPRING_HEAVY = { type: "spring" as const, stiffness: 300, damping: 20, mass: 1.5 };
    const SPRING_SNAP = { type: "spring" as const, stiffness: 600, damping: 25 };

    return (
        <motion.div
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1A1A1A] text-[#FDFCF8] overflow-hidden touch-none"
            initial={{ opacity: 1 }}
            animate={step >= 5 ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeIn", delay: 0.3 }} // Fade out entire loader after blastoff
        >
            {/* Massive Flash / Wipe Transition effect on Blastoff */}
            <AnimatePresence>
                {step === 5 && (
                    <motion.div
                        className="absolute inset-0 bg-[#D4F268] z-[100] mix-blend-overlay pointer-events-none"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: [1, 5, 20] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeIn" }}
                    />
                )}
            </AnimatePresence>

            {/* Starry Night Sky Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {stars.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute bg-[#FDFCF8] rounded-full"
                        style={{
                            width: star.width,
                            height: star.height,
                            top: `${star.top}%`,
                            left: `${star.left}%`,
                            opacity: star.opacity
                        }}
                        animate={step >= 5 ? { y: [0, 1000] } : {}}
                        transition={step >= 5 ? { duration: 0.5, delay: star.delay, ease: "easeIn" } : {}}
                    />
                ))}
            </div>

            {/* Platform / Launchpad with Loading Progress */}
            <motion.div
                className="absolute bottom-0 w-full h-[25vh] bg-gradient-to-t from-black to-transparent flex flex-col items-center justify-end pb-8 z-0"
                animate={step >= 5 ? { y: 200, opacity: 0 } : { y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Loader Bar */}
                <div className="w-64 max-w-[80%] mb-12">
                    <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-2">
                        <span>Status</span>
                        <motion.span
                            className="text-[#D4F268]"
                            animate={progress === 100 ? { scale: [1, 1.2, 1], color: "#ffffff" } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            {progress}%
                        </motion.span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-[#D4F268] shadow-[0_0_10px_rgba(212,242,104,0.6)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                        />
                    </div>
                </div>

                <div className="w-64 h-4 bg-zinc-800 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] border-t border-zinc-700 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-30">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="w-2 h-[200%] bg-[#D4F268] skew-x-12" />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ---------------- THE ROCKET ---------------- */}
            <div className="relative z-10 w-full max-w-md h-[400px] flex flex-col items-center justify-end pb-[110px]">
                <motion.div
                    className="relative flex flex-col items-center"
                    animate={
                        step === 4 ? { x: [-3, 3, -3, 3, -2, 2, 0], y: [2, -2, 2, -2, 0, 0] } :
                            step >= 5 ? { y: -1500 } :
                                { x: 0, y: 0 }
                    }
                    transition={
                        step === 4 ? { duration: 0.3, repeat: Infinity, ease: "linear" } :
                            step >= 5 ? { type: "tween", ease: "easeIn", duration: 0.5 } :
                                {}
                    }
                >
                    {/* 3. NOSE CONE */}
                    <motion.div
                        className="relative z-30 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[60px] border-l-transparent border-r-transparent border-b-[#D4F268] drop-shadow-[0_0_20px_rgba(212,242,104,0.2)]"
                        initial={{ y: -500, opacity: 0 }}
                        animate={step >= 3 ? { y: 0, opacity: 1 } : { y: -500, opacity: 0 }}
                        transition={SPRING_BOUNCE}
                    >
                        {/* Metallic highlight on cone */}
                        <div className="absolute -left-[10px] top-[10px] w-2 h-10 bg-white/40 skew-x-[35deg]" />
                    </motion.div>

                    {/* 2. MAIN BODY (FUSELAGE) -> Black/Dark theme with Off-white parts */}
                    <motion.div
                        className="relative z-20 w-[80px] h-[140px] bg-[#111111] rounded-sm shadow-2xl border-x-4 border-zinc-800 flex flex-col items-center justify-center -mt-1"
                        initial={{ y: -500, opacity: 0 }}
                        animate={step >= 2 ? { y: 0, opacity: 1 } : { y: -500, opacity: 0 }}
                        transition={SPRING_HEAVY}
                    >
                        {/* Dynamic sheen */}
                        <div className="absolute left-1 w-2 h-full bg-white/5" />

                        {/* The Window / Skloop Logo */}
                        <motion.div
                            className="w-14 h-14 bg-[#FDFCF8] rounded-full border-4 border-[#D4F268] shadow-[0_0_15px_rgba(212,242,104,0.3)] flex items-center justify-center overflow-hidden z-10"
                            initial={{ scale: 0 }}
                            animate={step >= 2 ? { scale: 1 } : { scale: 0 }}
                            transition={{ delay: 0.2, ...SPRING_SNAP }} // slightly delayed pop
                        >
                            <Logo className="w-8 h-8 text-[#1A1A1A]" />
                        </motion.div>

                        {/* Skloop branding text vertically */}
                        <div className="absolute right-1 bottom-4 text-[8px] font-black text-zinc-600 tracking-widest origin-bottom-right -rotate-90">
                            SKLOOP
                        </div>
                    </motion.div>

                    {/* 1. BASE / FINS / THRUSTERS */}
                    <motion.div
                        className="relative z-10 w-[140px] flex flex-col items-center -mt-2"
                        initial={{ y: -500, opacity: 0 }}
                        animate={step >= 1 ? { y: 0, opacity: 1 } : { y: -500, opacity: 0 }}
                        transition={SPRING_BOUNCE}
                    >
                        {/* The Fins */}
                        <div className="flex justify-between w-full h-[45px]">
                            {/* Left Fin */}
                            <div className="w-[30px] h-full bg-[#FDFCF8] rounded-tl-full shadow-[inset_-4px_0_10px_rgba(0,0,0,0.2)] border-r border-zinc-300" />

                            {/* Central Engine Block */}
                            <div className="w-[80px] h-[35px] bg-[#1A1A1A] border-b-4 border-black rounded-b-2xl flex flex-col items-center justify-start z-10 shadow-inner overflow-hidden">
                                <div className="w-full h-2 bg-zinc-800 opacity-50" />
                                <div className="w-full flex justify-around mt-1 px-2">
                                    <div className="w-2 h-2 bg-zinc-700 rounded-full" />
                                    <div className="w-2 h-2 bg-zinc-700 rounded-full" />
                                </div>
                            </div>

                            {/* Right Fin */}
                            <div className="w-[30px] h-full bg-[#FDFCF8] rounded-tr-full shadow-[inset_4px_0_10px_rgba(0,0,0,0.2)] border-l border-zinc-300" />
                        </div>

                        {/* FLAMES --------------------- */}
                        <div className="relative mt-0 z-0">
                            <AnimatePresence>
                                {step >= 4 && (
                                    <motion.div
                                        className="flex flex-col items-center origin-top absolute top-0 -left-6"
                                        initial={{ scaleY: 0, opacity: 0 }}
                                        animate={
                                            step === 4
                                                ? { scaleY: [0.5, 1, 0.6, 1.2], opacity: 1 } // Igniting sputter
                                                : { scaleY: [3, 5, 4], opacity: 1 }          // Full blast
                                        }
                                        transition={
                                            step === 4
                                                ? { duration: 0.1, repeat: Infinity, repeatType: "mirror" }
                                                : { duration: 0.05, repeat: Infinity, repeatType: "mirror" }
                                        }
                                    >
                                        {/* Main Fire (Lime green tinted for Skloop theme) */}
                                        <div className="w-12 h-24 bg-gradient-to-b from-white via-[#D4F268] to-emerald-600 rounded-b-full blur-[3px] shadow-[0_0_50px_rgba(212,242,104,0.9)]" />
                                        {/* Core Fire */}
                                        <div className="w-6 h-12 bg-white rounded-b-full absolute top-0 blur-[1px]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </motion.div>

                {/* Assembling Sparks */}
                <AnimatePresence>
                    {(step === 1 || step === 2 || step === 3) && (
                        <motion.div
                            className="absolute z-50 text-[#D4F268] top-[150px]"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0, scale: 2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Sparkles size={50} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Typography / Loading Tip text */}
            <motion.div
                className="mt-6 font-black text-xs md:text-sm uppercase tracking-[0.3em] text-[#FDFCF8] z-50 px-4 text-center"
                animate={step >= 5 ? { opacity: 0 } : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {tipText}
            </motion.div>

        </motion.div>
    );
}
