"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function ProgressThread() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
            <svg className="w-full h-full" preserveAspectRatio="none">
                <motion.path
                    d="M 150 200 Q 150 600, 150 1200 T 150 2000" // Simple vertical line for now, can be complex bezier
                    fill="none"
                    stroke="#D4F268"
                    strokeWidth="4"
                    strokeDasharray="0 1"
                    style={{
                        pathLength: pathLength,
                        // Connect the dots visually aligned with the card left padding
                        opacity: 0.5
                    }}
                />
            </svg>
        </div>
    );
}
