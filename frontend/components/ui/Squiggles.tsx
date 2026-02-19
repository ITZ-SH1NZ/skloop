"use client";

import { motion } from "framer-motion";

export const SquiggleUnderline = ({ className = "", color = "#D4F268" }: { className?: string; color?: string }) => (
    <svg
        width="200"
        height="20"
        viewBox="0 0 200 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <motion.path
            d="M2 15C30 5 50 25 80 15C110 5 130 25 160 15C180 8 195 12 198 10"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        />
    </svg>
);

export const SquiggleCircle = ({ className = "", color = "#FCA5A5" }: { className?: string; color?: string }) => (
    <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <motion.path
            d="M50 10C25 10 10 30 15 50C20 75 45 90 65 85C85 80 95 60 90 40C85 20 65 15 50 15"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
        />
    </svg>
);

export const SquiggleArrow = ({ className = "", color = "#60A5FA" }: { className?: string; color?: string }) => (
    <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <motion.path
            d="M10 40C20 30 25 25 40 10M40 10L25 10M40 10L40 25"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        />
    </svg>
);

export const Sparkle = ({ className = "", color = "#FCD34D" }: { className?: string; color?: string }) => (
    <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
    >
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </motion.svg>
);
