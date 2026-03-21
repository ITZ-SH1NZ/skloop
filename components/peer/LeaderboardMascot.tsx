"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export const LeaderboardMascot = memo(({ 
    isFirstPlace = false,
    tabChangeTrigger = 0
}: { 
    isFirstPlace?: boolean;
    tabChangeTrigger?: number;
}) => {
    return (
        <motion.div
            key={tabChangeTrigger}
            initial={{ scale: 0.5, y: -20, rotate: -15 }}
            animate={{ 
                scale: isFirstPlace ? 1.2 : 1, 
                y: [0, -15, 0], 
                rotate: 0 
            }}
            transition={{ 
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                scale: { type: "spring", bounce: 0.6 },
                rotate: { type: "spring", bounce: 0.5 }
            }}
            className={`absolute z-40 pointer-events-none drop-shadow-[0_0_20px_rgba(212,242,104,0.6)] ${isFirstPlace ? "-top-16 -right-8 w-24 h-24" : "-top-10 -right-6 w-16 h-16"}`}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                 <path d="M 50,20 C 30,20 15,40 18,65 C 20,85 35,90 50,90 C 65,90 80,85 82,65 C 85,40 70,20 50,20 Z" />
                 {/* Sunglasses for #1 */}
                 {isFirstPlace ? (
                     <g transform="translate(0, -2)">
                        <path d="M 23,43 Q 35,40 45,43 L 45,50 Q 35,55 25,50 Z" fill="#09090b" />
                        <path d="M 55,43 Q 65,40 77,43 L 75,50 Q 65,55 55,50 Z" fill="#09090b" />
                        <line x1="45" y1="46" x2="55" y2="46" stroke="#09090b" strokeWidth="2.5" />
                        <line x1="23" y1="43" x2="15" y2="40" stroke="#09090b" strokeWidth="2.5" />
                        <line x1="77" y1="43" x2="85" y2="40" stroke="#09090b" strokeWidth="2.5" />
                     </g>
                 ) : (
                     <>
                        <circle cx="35" cy="45" r="4.5" fill="#09090b" />
                        <circle cx="65" cy="45" r="4.5" fill="#09090b" />
                     </>
                 )}
                 {/* Smile */}
                 <path d="M 40,58 Q 50,68 60,58" stroke="#09090b" strokeWidth="3" fill="none" strokeLinecap="round" />
                 {/* Highlight */}
                 <ellipse cx="30" cy="35" rx="5" ry="3" fill="white" opacity="0.6" transform="rotate(-20 30 35)" />
            </svg>
        </motion.div>
    );
});
LeaderboardMascot.displayName = "LeaderboardMascot";
