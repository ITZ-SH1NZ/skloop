"use client";

import { motion } from "framer-motion";

interface GroteskMarqueeProps {
    text: string;
    repeat?: number;
    duration?: number;
    className?: string;
    reversed?: boolean;
}

export default function GroteskMarquee({ text, repeat = 10, duration = 20, className = "", reversed = false }: GroteskMarqueeProps) {
    return (
        <div className={`overflow-hidden whitespace-nowrap flex select-none ${className}`}>
            <motion.div
                className="flex"
                animate={{ x: reversed ? ["-50%", "0%"] : ["0%", "-50%"] }}
                transition={{ ease: "linear", duration, repeat: Infinity }}
            >
                {Array.from({ length: repeat }).map((_, i) => (
                    <span key={i} className="mx-4 font-black tracking-tighter uppercase">
                        {text}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
