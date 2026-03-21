import React from "react";
import { motion } from "framer-motion";

export const SVGSynthDragon = () => (
    <motion.svg 
        viewBox="0 0 200 200" 
        className="w-full h-full filter drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]"
        animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
        <defs>
            <linearGradient id="dragonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="dragonWing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
        </defs>
        
        {/* Left Wing (Animated) */}
        <motion.path 
            d="M 100 80 Q 50 20 20 60 Q 50 100 100 100 Z" 
            fill="url(#dragonWing)" 
            animate={{ rotate: [0, -15, 0] }}
            style={{ originX: "100px", originY: "80px" }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Right Wing (Animated) */}
        <motion.path 
            d="M 100 80 Q 150 20 180 60 Q 150 100 100 100 Z" 
            fill="url(#dragonWing)" 
            animate={{ rotate: [0, 15, 0] }}
            style={{ originX: "100px", originY: "80px" }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Body */}
        <path d="M 70 180 Q 100 80 130 180 Q 100 150 70 180 Z" fill="url(#dragonGrad)" />
        <circle cx="100" cy="70" r="30" fill="url(#dragonGrad)" />
        
        {/* Eyes (Glowing) */}
        <motion.circle cx="90" cy="65" r="4" fill="#fcd34d" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="110" cy="65" r="4" fill="#fcd34d" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        
        {/* Horns */}
        <path d="M 85 45 L 70 20 L 95 40 Z" fill="#450a0a" />
        <path d="M 115 45 L 130 20 L 105 40 Z" fill="#450a0a" />
    </motion.svg>
);

export const SVGSlime = () => (
    <motion.svg 
        viewBox="0 0 200 200" 
        className="w-full h-full filter drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]"
        animate={{ scaleY: [1, 0.9, 1.1, 1], scaleX: [1, 1.1, 0.9, 1], y: [0, 10, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
        <defs>
            <linearGradient id="slimeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
            <radialGradient id="slimeHighlight" cx="30%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0" />
            </radialGradient>
        </defs>
        
        <path d="M 100 50 C 180 50 180 150 150 150 C 100 150 50 150 50 150 C 20 150 20 50 100 50 Z" fill="url(#slimeGrad)" />
        <path d="M 100 50 C 180 50 180 150 150 150 C 100 150 50 150 50 150 C 20 150 20 50 100 50 Z" fill="url(#slimeHighlight)" />
        
        <circle cx="85" cy="100" r="8" fill="#022c22" />
        <circle cx="115" cy="100" r="8" fill="#022c22" />
        <path d="M 95 120 Q 100 130 105 120" stroke="#022c22" strokeWidth="3" strokeLinecap="round" fill="none" />
        
        {/* Floating internal bubbles */}
        <motion.circle cx="70" cy="120" r="5" fill="#a7f3d0" opacity="0.6" animate={{ y: [0, -20, 0], opacity: [0.6, 0, 0.6] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="130" cy="110" r="8" fill="#a7f3d0" opacity="0.5" animate={{ y: [0, -30, 0], opacity: [0.5, 0, 0.5] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
    </motion.svg>
);

export const SVGGarbageKing = () => (
    <motion.svg 
        viewBox="0 0 200 200" 
        className="w-full h-full filter drop-shadow-[0_0_25px_rgba(202,138,4,0.4)]"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
        <defs>
            <linearGradient id="kingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#422006" />
            </linearGradient>
            <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
        </defs>
        
        {/* Cape */}
        <motion.path 
            d="M 50 80 L 150 80 L 180 180 L 20 180 Z" 
            fill="#7f1d1d" 
            animate={{ d: ["M 50 80 L 150 80 L 180 180 L 20 180 Z", "M 50 80 L 150 80 L 170 190 L 30 190 Z", "M 50 80 L 150 80 L 180 180 L 20 180 Z"] }}
            transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Body */}
        <rect x="70" y="80" width="60" height="100" rx="10" fill="url(#kingGrad)" />
        
        {/* Head */}
        <circle cx="100" cy="65" r="25" fill="url(#kingGrad)" />
        
        {/* Crown */}
        <path d="M 80 45 L 85 20 L 100 35 L 115 20 L 120 45 Z" fill="url(#crownGrad)" />
        
        <circle cx="90" cy="60" r="5" fill="#fef08a" />
        <circle cx="110" cy="60" r="5" fill="#fef08a" />
        <path d="M 85 75 L 115 75" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
        
        {/* Glowing Data Orbs revolving */}
        <motion.g animate={{ rotate: 360 }} style={{ originX: "100px", originY: "110px" }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
            <circle cx="40" cy="110" r="6" fill="#60a5fa" className="filter drop-shadow-[0_0_5px_#60a5fa]" />
            <circle cx="160" cy="110" r="6" fill="#f43f5e" className="filter drop-shadow-[0_0_5px_#f43f5e]" />
        </motion.g>
    </motion.svg>
);

export const SVGSyntaxTree = () => (
    <motion.svg 
        viewBox="0 0 200 200" 
        className="w-full h-full filter drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
        <defs>
            <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
        </defs>
        
        <path d="M 100 180 L 100 100" stroke="url(#treeGrad)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 100 120 L 50 60" stroke="url(#treeGrad)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 100 120 L 150 60" stroke="url(#treeGrad)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 50 60 L 30 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 50 60 L 70 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 150 60 L 130 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 150 60 L 170 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
        
        {/* Glowing Nodes */}
        <circle cx="100" cy="180" r="8" fill="#60a5fa" />
        <circle cx="100" cy="100" r="8" fill="#60a5fa" />
        <circle cx="50" cy="60" r="8" fill="#60a5fa" />
        <circle cx="150" cy="60" r="8" fill="#60a5fa" />
        <circle cx="30" cy="20" r="6" fill="#93c5fd" />
        <circle cx="70" cy="20" r="6" fill="#93c5fd" />
        <circle cx="130" cy="20" r="6" fill="#93c5fd" />
        <circle cx="170" cy="20" r="6" fill="#93c5fd" />

        {/* Binary particles falling */}
        <motion.text x="20" y="0" fill="#93c5fd" fontSize="12" className="font-mono" animate={{ y: [0, 200], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>1</motion.text>
        <motion.text x="180" y="50" fill="#93c5fd" fontSize="12" className="font-mono" animate={{ y: [50, 250], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>0</motion.text>
    </motion.svg>
);
