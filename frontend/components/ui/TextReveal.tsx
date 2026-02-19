"use client";

import { motion, Variants } from "framer-motion";

export const TextReveal = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
    const letters = text.split("");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i + delay },
        }),
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            <div className="pb-1"> {/* Extra padding for descenders/underlines */}
                {letters.map((letter, index) => (
                    <motion.span variants={child} key={index} className="inline-block">
                        {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                ))}
            </div>
        </motion.div>
    );
};
