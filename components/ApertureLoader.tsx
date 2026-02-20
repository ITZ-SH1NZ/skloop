"use client";

import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { useEffect, useState } from "react";

export default function ApertureLoader({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Prevent scrolling while loading
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        // Sequence timing
        const timer1 = setTimeout(() => setStep(1), 800);  // Reveal Logo
        const timer2 = setTimeout(() => setStep(2), 2000); // Expand Aperture
        const timer3 = setTimeout(() => onComplete(), 2800); // Finish

        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        }
    }, [onComplete]);

    return (
        <motion.div
            className="aperture-loader fixed inset-0 z-[99999] flex items-center justify-center bg-black text-white overflow-hidden touch-none"
            initial={{ opacity: 1 }}
            animate={step === 2 ? { opacity: 0, pointerEvents: "none" } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            {/* The Iris / Aperture Mask */}
            {/* We effectively scale a circular clip path or mask to reveal the content behind, 
                but for a "loader" we usually want to reveal the app underneath.
                So we can just animate the black overlay's clipPath. */}

            <motion.div
                className="absolute inset-0 bg-background z-10"
                initial={{ clipPath: "circle(0% at 50% 50%)" }}
                animate={
                    step === 2
                        ? { clipPath: "circle(150% at 50% 50%)" } // Expand to full screen
                        : { clipPath: "circle(0% at 50% 50%)" }
                }
                transition={{
                    duration: 1.5,
                    ease: [0.76, 0, 0.24, 1] // Custom ease for dramatic opening
                }}
            />

            {/* Central Logo Container (Visible on top of the black background initially) */}
            <motion.div
                className="relative z-20 flex flex-col items-center"
                animate={step === 2 ? { scale: 1.5, opacity: 0 } : {}}
                transition={{ duration: 0.5 }}
            >
                {/* Spinning Rings */}
                <motion.div
                    className="absolute -inset-8 border-[1px] border-white/20 rounded-full"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute -inset-16 border-[1px] border-white/10 rounded-full dashed-border"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    style={{ borderStyle: "dashed" }}
                />

                {/* Logo Reveal */}
                <div className="relative overflow-hidden">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Logo className="w-16 h-16 text-white" />
                    </motion.div>
                </div>

                <motion.div
                    className="mt-4 overflow-hidden h-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: step >= 1 ? 1 : 0 }}
                >
                    <motion.p
                        className="text-xs font-mono uppercase tracking-[0.3em] text-white/50"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                    >
                        Initializing
                    </motion.p>
                </motion.div>
            </motion.div>

            {/* Background for the loader itself (The "Shutter" blades could be simulated here if we wanted complex geometry, but simple expanding circle is 'Aperture-like' enough for minimal theme) */}
            <motion.div
                className="absolute inset-0 bg-[#0a0a0a]"
                animate={step === 2 ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            />

        </motion.div>
    );
}
