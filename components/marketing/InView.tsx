"use client";

import React from "react";
import { motion } from "framer-motion";

interface InViewProps {
    children: React.ReactNode;
    margin?: string;
    triggerOnce?: boolean;
}

export default function InView({ children, margin = "-100px", triggerOnce = true }: InViewProps) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            whileInView={{ opacity: [0, 1], y: [20, 0] }}
            viewport={{ once: triggerOnce, margin }}
            className="w-full"
        >
            {/* The actual content only renders when this outer motion.div is in view */}
            {/* We use CSS-based opacity for the container while InView manages the React tree rendering if needed, 
                but for simplicity and Framer Motion compatibility, we'll let Framer Motion handle the mounting state. 
            */}
            {children}
        </motion.div>
    );
}
