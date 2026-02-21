"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ParallaxBackground() {
    // 1. Mouse Position tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the mouse values with a spring
    const smoothOptions = { damping: 20, stiffness: 100, mass: 0.5 };
    const smoothMouseX = useSpring(mouseX, smoothOptions);
    const smoothMouseY = useSpring(mouseY, smoothOptions);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse position to range [-1, 1]
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(nx);
            mouseY.set(ny);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    // 2. Parallax Transforms
    // Foreground (moves opposite to mouse, stronger effect)
    const fgX = useTransform(smoothMouseX, [-1, 1], [-40, 40]);
    const fgY = useTransform(smoothMouseY, [-1, 1], [-40, 40]);
    // Background (moves with mouse, weaker effect)
    const bgX = useTransform(smoothMouseX, [-1, 1], [20, -20]);
    const bgY = useTransform(smoothMouseY, [-1, 1], [20, -20]);
    // Rotations based on mouse
    const rotate1 = useTransform(smoothMouseX, [-1, 1], [-15, 35]);
    const rotate2 = useTransform(smoothMouseY, [-1, 1], [5, -25]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden md:overflow-visible">
            {/* The primary bouncing lime square */}
            <motion.div
                style={{ x: fgX, y: fgY, rotate: rotate1 }}
                className="absolute top-1/4 left-4 md:left-1/4 w-20 h-20 md:w-32 md:h-32 bg-lime-300 rounded-2xl md:rounded-[2rem] shadow-[0_10px_20px_-5px_rgba(212,242,104,0.4)] backdrop-blur-xl border-2 md:border-4 border-white flex items-center justify-center -z-10"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-full"
                />
            </motion.div>

            {/* The secondary black bouncing pill */}
            <motion.div
                style={{ x: bgX, y: bgY, rotate: rotate2 }}
                className="absolute bottom-1/3 right-4 md:right-1/5 w-24 h-24 md:w-40 md:h-40 bg-zinc-900 rounded-2xl md:rounded-[2rem] shadow-xl md:shadow-2xl flex items-center justify-center -z-10"
            >
                <div className="w-12 h-1.5 md:w-20 md:h-2 bg-lime-400 rounded-full" />
            </motion.div>

            {/* The large rotating target ring */}
            <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] border border-zinc-200 md:border-2 rounded-full flex items-center justify-center pointer-events-none -z-20 opacity-50"
            >
                <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] border border-zinc-200 md:border-2 rounded-full border-dashed" />
            </motion.div>
        </div>
    );
}
