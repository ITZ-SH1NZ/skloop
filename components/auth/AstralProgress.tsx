"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface AstralProgressProps {
    step: number; // Current step (1-4)
    totalSteps: number;
}

export default function AstralProgress({ step, totalSteps }: AstralProgressProps) {
    // Calculate percentage based on step
    const progress = (step / totalSteps) * 100;

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />

            {/* Orbital Rings - The Constellation */}
            <motion.div
                className="absolute inset-0 border border-white/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute inset-4 border border-white/5 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* The Core Orb - Container */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(255,255,255,0.1)]">

                {/* Liquid Fill */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-lime-400 to-white"
                    initial={{ height: "0%" }}
                    animate={{ height: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    {/* Liquid Surface Wave Simulation */}
                    <div className="absolute top-0 left-0 w-[200%] h-4 bg-white/30 skew-y-3 animate-wave" style={{ transformOrigin: "bottom" }} />
                </motion.div>

                {/* Inner shine */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_20px_rgba(255,255,255,0.2)] pointer-events-none" />

                {/* Step Counter */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="text-2xl font-black text-white drop-shadow-md mix-blend-overlay">
                        {step}/{totalSteps}
                    </span>
                </div>
            </div>

            {/* Connection Nodes (Planets) */}
            {[...Array(totalSteps)].map((_, i) => {
                const angle = (i / totalSteps) * 360 - 90; // Start at top
                const radius = 100; // Distance from center
                const isActive = i + 1 <= step;

                return (
                    <motion.div
                        key={i}
                        className={`absolute w-4 h-4 rounded-full border-2 transition-colors duration-500 ${isActive ? "bg-primary border-white shadow-[0_0_10px_var(--color-primary)]" : "bg-black border-white/20"
                            }`}
                        style={{
                            transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`
                        }}
                    >
                        {/* Connecting Line to Core */}
                        <div
                            className={`absolute top-1/2 left-1/2 w-[100px] h-[1px] origin-left -z-10 transition-colors duration-500 ${isActive ? "bg-primary/50" : "bg-white/5"
                                }`}
                            style={{
                                transform: `translate(-50%, -50%) rotate(${angle + 180}deg) translate(20px)`, // Reverse angle to point to center
                                width: '80px' // Adjust length visually
                            }}
                        />
                    </motion.div>
                )
            })}
        </div>
    );
}
