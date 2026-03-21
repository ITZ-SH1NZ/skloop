"use client";

import { motion } from "framer-motion";

export const SlimePillBackground = ({ layoutId }: { layoutId: string }) => {
    return (
        <motion.div
            layoutId={layoutId}
            className="absolute inset-x-[-2px] inset-y-[-2px] -z-10"
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
        >
            <div className="absolute inset-0 bg-[#D4F268] rounded-full shadow-[0_5px_15px_rgba(212,242,104,0.5)]" />
            
            {/* Glossy top highlight */}
            <div className="absolute top-[2px] left-[10%] right-[10%] h-[30%] bg-white rounded-full opacity-50 mix-blend-screen pointer-events-none" />

            {/* Bottom Slime Drips */}
            <svg 
                className="absolute top-[80%] left-0 w-full h-[80%] pointer-events-none text-[#D4F268] overflow-visible" 
                preserveAspectRatio="none" 
                viewBox="0 0 100 20"
            >
                <path d="M 5,0 Q 15,15 25,0 Q 40,10 50,0 Q 65,15 75,0 Q 85,10 95,0 Z" fill="currentColor">
                    <animate attributeName="d" values="
                        M 5,0 Q 15,15 25,0 Q 40,10 50,0 Q 65,15 75,0 Q 85,10 95,0 Z;
                        M 5,0 Q 15,5 25,0 Q 40,20 50,0 Q 65,5 75,0 Q 85,20 95,0 Z;
                        M 5,0 Q 15,15 25,0 Q 40,10 50,0 Q 65,15 75,0 Q 85,10 95,0 Z
                    " dur="3s" repeatCount="indefinite" />
                </path>
                {/* Tiny separating droplets */}
                <circle cx="15" cy="15" r="1.5" fill="currentColor">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,10; 0,0" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1; 0; 1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="85" cy="12" r="1" fill="currentColor">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,15; 0,0" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1; 0; 1" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="45" cy="20" r="2" fill="currentColor">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,12; 0,0" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1; 0; 1" dur="3s" repeatCount="indefinite" />
                </circle>
            </svg>
        </motion.div>
    );
};
