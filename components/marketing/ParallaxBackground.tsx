"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useLoading } from "../LoadingProvider";
import { useMediaQuery } from "@/hooks/use-media-query";

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    entrance: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring" as any, bounce: 0.4, duration: 1, delay: 0.8 }
    }
};

export default function ParallaxBackground() {
    const { isLoading } = useLoading();
    const isMobile = useMediaQuery("(max-width: 768px)");

    // 1. Mouse Position tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the mouse values with a spring
    const smoothOptions = { damping: 20, stiffness: 100, mass: 0.5 };
    const smoothMouseX = useSpring(mouseX, smoothOptions);
    const smoothMouseY = useSpring(mouseY, smoothOptions);

    const [isMounted, setIsMounted] = React.useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isMobile) return; 

        const handleMouseMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(nx);
            mouseY.set(ny);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY, isMobile]);

    // 2. Parallax Transforms
    const fgX = useTransform(smoothMouseX, [-1, 1], [-40, 40]);
    const fgY = useTransform(smoothMouseY, [-1, 1], [-40, 40]);
    const bgX = useTransform(smoothMouseX, [-1, 1], [20, -20]);
    const bgY = useTransform(smoothMouseY, [-1, 1], [20, -20]);
    const rotate1 = useTransform(smoothMouseX, [-1, 1], [-5, 15]);
    const rotate2 = useTransform(smoothMouseY, [-1, 1], [2, -10]);

    if (!isMounted || isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute inset-0 pointer-events-none overflow-hidden md:overflow-visible"
            style={{ zIndex: -10 }}
        >
            {!isMobile && (
                <>
                    <motion.div
                        initial="hidden"
                        animate="entrance"
                        variants={itemVariants}
                        style={{ x: fgX, y: fgY, rotate: rotate1, z: 0 }}
                        className="absolute top-1/4 left-1/4 w-32 h-32 bg-lime-300 rounded-[2rem] shadow-lg border-4 border-white flex items-center justify-center will-change-transform"
                    >
                        <div className="w-12 h-12 bg-white rounded-lg shadow-inner" />
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="entrance"
                        variants={itemVariants}
                        style={{ x: bgX, y: bgY, rotate: rotate2, z: 0 }}
                        className="absolute bottom-1/3 right-1/5 w-40 h-40 bg-zinc-900 rounded-[2rem] shadow-2xl flex items-center justify-center will-change-transform"
                    >
                        <div className="w-20 h-2 bg-lime-400 rounded-sm" />
                    </motion.div>
                </>
            )}

            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] border border-zinc-200 md:border-2 rounded-full flex items-center justify-center pointer-events-none opacity-20"
                style={{ transform: "translateZ(0) translate(-50%, -50%)" }}
            >
                <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] border border-zinc-200 md:border-2 rounded-full border-dashed" />
            </div>
        </motion.div>
    );
}
