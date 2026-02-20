"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "./ui/Button";

export default function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(0, 255, 0, 0.15)" // Default to 'Primary' green tint
}: {
    children: React.ReactNode,
    className?: string,
    spotlightColor?: string
}) {
    // Mouse position relative to card
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // 3D Tilt Logic
    const rotateX = useTransform(mouseY, [0, 600], [-5, 5]); // Map mouseY to X rotation (up/down)
    const rotateY = useTransform(mouseX, [0, 600], [5, -5]); // Map mouseX to Y rotation (left/right) - inverted for natural feel

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        // Set mouse position relative to card
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            className={cn(
                "group relative border border-black/5 bg-white overflow-hidden rounded-xl",
                className
            )}
            onMouseMove={handleMouseMove}
            style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
                rotateX,
                rotateY,
            }}
            whileHover={{ scale: 1.02 }} // Slight lift
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-10"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          650px circle at ${mouseX}px ${mouseY}px,
                          ${spotlightColor},
                          transparent 80%
                        )
                      `,
                }}
            />
            <div className="relative h-full transform-style-3d">{children}</div>
        </motion.div>
    );
}
