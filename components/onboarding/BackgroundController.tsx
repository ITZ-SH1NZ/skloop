"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function BackgroundController() {
    // Single static background color for continuity
    return (
        <div
            className="fixed inset-0 -z-50 bg-[#FDFCF8]"
        />
    );
}

// Helper hook for mouse position
function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };
        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, []);

    return mousePosition;
}

export function FloatingGradients() {
    // The "Living Aura": Large, slow-moving colored blobs
    // Using simple CSS animation via Framer Motion for "organic" feel
    // Optimized with separate layers

    const [mounted, setMounted] = useState(false);
    const { x, y } = useMousePosition();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Dimensions for parallax calc
    const parallaxX = (val: number) => (typeof window !== 'undefined' ? (x - window.innerWidth / 2) * val : 0);
    const parallaxY = (val: number) => (typeof window !== 'undefined' ? (y - window.innerHeight / 2) * val : 0);

    return (
        <div className="fixed inset-0 -z-40 pointer-events-none overflow-hidden mix-blend-multiply">
            {/* Primary Lime Aura - Moves top-left to bottom-right */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.2, 0.9, 1],
                    // Add subtle mouse parallax
                    translateX: parallaxX(0.02),
                    translateY: parallaxY(0.02)
                }}
                transition={{
                    default: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "mirror"
                    },
                    translateX: { type: "spring", stiffness: 50, damping: 20 }, // Responsive parallax
                    translateY: { type: "spring", stiffness: 50, damping: 20 }
                }}
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/20 blur-[120px] will-change-transform"
                style={{
                    transform: "translate3d(0, 0, 0)" // Force hardware accel
                }}
            />

            {/* Soft Blue Aura - Moves bottom-right to top-left */}
            <motion.div
                animate={{
                    x: [0, -100, 50, 0],
                    y: [0, 100, -50, 0],
                    scale: [1, 1.1, 0.9, 1],
                    translateX: parallaxX(-0.03),
                    translateY: parallaxY(-0.03)
                }}
                transition={{
                    default: {
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "mirror"
                    },
                    translateX: { type: "spring", stiffness: 50, damping: 20 },
                    translateY: { type: "spring", stiffness: 50, damping: 20 }
                }}
                className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-300/20 blur-[140px] will-change-transform"
                style={{
                    transform: "translate3d(0, 0, 0)"
                }}
            />

            {/* Warm Pink/Orange Aura - Wanders in the middle */}
            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, 50, -50, 0],
                    translateX: parallaxX(0.01),
                    translateY: parallaxY(0.01)
                }}
                transition={{
                    default: {
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "mirror"
                    },
                    translateX: { type: "spring", stiffness: 50, damping: 20 },
                    translateY: { type: "spring", stiffness: 50, damping: 20 }
                }}
                className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-pink-300/15 blur-[100px] will-change-transform"
                style={{
                    transform: "translate3d(0, 0, 0)"
                }}
            />
        </div>
    )
}
