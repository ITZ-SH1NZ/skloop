import React from "react";
import { motion } from "framer-motion";

// ─── EXISTING ENEMIES (with variant support) ──────────────────────────────────

export const SVGSynthDragon = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const bodyColor1 = isCorrupted ? "#a855f7" : "#ef4444";
    const bodyColor2 = isCorrupted ? "#4c1d95" : "#7f1d1d";
    const wingColor1 = isCorrupted ? "#7e22ce" : "#991b1b";
    const wingColor2 = isCorrupted ? "#2e1065" : "#450a0a";
    const eyeColor = isCorrupted ? "#c084fc" : "#fcd34d";
    const glowColor = isCorrupted ? "rgba(168,85,247,0.6)" : "rgba(220,38,38,0.6)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}
            animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="dragonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={bodyColor1} /><stop offset="100%" stopColor={bodyColor2} />
                </linearGradient>
                <linearGradient id="dragonWing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={wingColor1} /><stop offset="100%" stopColor={wingColor2} />
                </linearGradient>
            </defs>
            <motion.path d="M 100 80 Q 50 20 20 60 Q 50 100 100 100 Z" fill="url(#dragonWing)"
                animate={{ rotate: [0, -15, 0] }} style={{ originX: "100px", originY: "80px" }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }} />
            <motion.path d="M 100 80 Q 150 20 180 60 Q 150 100 100 100 Z" fill="url(#dragonWing)"
                animate={{ rotate: [0, 15, 0] }} style={{ originX: "100px", originY: "80px" }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }} />
            <path d="M 70 180 Q 100 80 130 180 Q 100 150 70 180 Z" fill="url(#dragonGrad)" />
            <circle cx="100" cy="70" r="30" fill="url(#dragonGrad)" />
            <motion.circle cx="90" cy="65" r="4" fill={eyeColor} animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="110" cy="65" r="4" fill={eyeColor} animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <path d="M 85 45 L 70 20 L 95 40 Z" fill={wingColor2} />
            <path d="M 115 45 L 130 20 L 105 40 Z" fill={wingColor2} />
            {isCorrupted && (<>
                <motion.line x1="60" y1="80" x2="80" y2="100" stroke="#c084fc" strokeWidth="2" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 1.8 }} />
                <motion.line x1="120" y1="60" x2="145" y2="75" stroke="#c084fc" strokeWidth="2" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.3 }} />
            </>)}
        </motion.svg>
    );
};

export const SVGSlime = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const color1 = isCorrupted ? "#f43f5e" : "#34d399";
    const color2 = isCorrupted ? "#4c0519" : "#064e3b";
    const hlColor = isCorrupted ? "#fda4af" : "#a7f3d0";
    const glow = isCorrupted ? "rgba(244,63,94,0.5)" : "rgba(52,211,153,0.5)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 20px ${glow})` }}
            animate={{ scaleY: [1, 0.9, 1.1, 1], scaleX: [1, 1.1, 0.9, 1], y: [0, 10, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="slimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color1} /><stop offset="100%" stopColor={color2} />
                </linearGradient>
                <radialGradient id="slimeHighlight" cx="30%" cy="30%" r="50%">
                    <stop offset="0%" stopColor={hlColor} stopOpacity="0.8" /><stop offset="100%" stopColor={hlColor} stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d="M 100 50 C 180 50 180 150 150 150 C 100 150 50 150 50 150 C 20 150 20 50 100 50 Z" fill="url(#slimeGrad)" />
            <path d="M 100 50 C 180 50 180 150 150 150 C 100 150 50 150 50 150 C 20 150 20 50 100 50 Z" fill="url(#slimeHighlight)" />
            <circle cx="85" cy="100" r="8" fill={color2} />
            <circle cx="115" cy="100" r="8" fill={color2} />
            <path d="M 95 120 Q 100 130 105 120" stroke={color2} strokeWidth="3" strokeLinecap="round" fill="none" />
            <motion.circle cx="70" cy="120" r="5" fill={hlColor} opacity="0.6" animate={{ y: [0, -20, 0], opacity: [0.6, 0, 0.6] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.circle cx="130" cy="110" r="8" fill={hlColor} opacity="0.5" animate={{ y: [0, -30, 0], opacity: [0.5, 0, 0.5] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
        </motion.svg>
    );
};

export const SVGGarbageKing = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const bodyC1 = isCorrupted ? "#6b21a8" : "#ca8a04";
    const bodyC2 = isCorrupted ? "#1e0533" : "#422006";
    const glow = isCorrupted ? "rgba(139,92,246,0.5)" : "rgba(202,138,4,0.4)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 25px ${glow})` }}
            animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="kingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={bodyC1} /><stop offset="100%" stopColor={bodyC2} />
                </linearGradient>
                <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fef08a" /><stop offset="50%" stopColor="#eab308" /><stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
            </defs>
            <motion.path d="M 50 80 L 150 80 L 180 180 L 20 180 Z" fill="#7f1d1d"
                animate={{ d: ["M 50 80 L 150 80 L 180 180 L 20 180 Z", "M 50 80 L 150 80 L 170 190 L 30 190 Z", "M 50 80 L 150 80 L 180 180 L 20 180 Z"] }}
                transition={{ duration: 4, repeat: Infinity }} />
            <rect x="70" y="80" width="60" height="100" rx="10" fill="url(#kingGrad)" />
            <circle cx="100" cy="65" r="25" fill="url(#kingGrad)" />
            <path d="M 80 45 L 85 20 L 100 35 L 115 20 L 120 45 Z" fill="url(#crownGrad)" />
            <circle cx="90" cy="60" r="5" fill="#fef08a" />
            <circle cx="110" cy="60" r="5" fill="#fef08a" />
            <path d="M 85 75 L 115 75" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
            <motion.g animate={{ rotate: 360 }} style={{ originX: "100px", originY: "110px" }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                <circle cx="40" cy="110" r="6" fill="#60a5fa" />
                <circle cx="160" cy="110" r="6" fill="#f43f5e" />
            </motion.g>
        </motion.svg>
    );
};

export const SVGSyntaxTree = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#f97316" : "#3b82f6";
    const c2 = isCorrupted ? "#7c2d12" : "#1e3a8a";
    const nc = isCorrupted ? "#fb923c" : "#60a5fa";
    const glow = isCorrupted ? "rgba(249,115,22,0.6)" : "rgba(59,130,246,0.6)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 20px ${glow})` }}
            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            <path d="M 100 180 L 100 100" stroke="url(#treeGrad)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 100 120 L 50 60" stroke="url(#treeGrad)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 100 120 L 150 60" stroke="url(#treeGrad)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 50 60 L 30 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 50 60 L 70 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 150 60 L 130 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 150 60 L 170 20" stroke="url(#treeGrad)" strokeWidth="6" strokeLinecap="round" />
            {[[100, 180], [100, 100], [50, 60], [150, 60], [30, 20], [70, 20], [130, 20], [170, 20]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={i < 4 ? 8 : 6} fill={i < 4 ? nc : nc} opacity={i < 4 ? 1 : 0.75} />
            ))}
            <motion.text x="20" y="0" fill={nc} fontSize="12" fontFamily="monospace"
                animate={{ y: [0, 200], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>1</motion.text>
            <motion.text x="180" y="50" fill={nc} fontSize="12" fontFamily="monospace"
                animate={{ y: [50, 250], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>0</motion.text>
        </motion.svg>
    );
};

// ─── NEW ENEMIES ──────────────────────────────────────────────────────────────

export const SVGNullPointerGhost = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#818cf8" : "#a5b4fc";
    const c2 = isCorrupted ? "#1e1b4b" : "#312e81";
    const glow = isCorrupted ? "rgba(99,102,241,0.8)" : "rgba(165,180,252,0.5)";
    return (
        <motion.svg viewBox="0 0 200 220" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 24px ${glow})` }}
            animate={{ y: [0, -18, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c1} stopOpacity="0.95" />
                    <stop offset="70%" stopColor={c2} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={c2} stopOpacity="0" />
                </linearGradient>
                <radialGradient id="ghostShine" cx="35%" cy="25%" r="45%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.25" /><stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d="M 55 110 C 55 55 145 55 145 110 L 145 160 Q 130 175 115 160 Q 100 145 85 160 Q 70 175 55 160 Z" fill="url(#ghostGrad)" />
            <path d="M 55 110 C 55 55 145 55 145 110 L 145 160 Q 130 175 115 160 Q 100 145 85 160 Q 70 175 55 160 Z" fill="url(#ghostShine)" />
            <motion.ellipse cx="82" cy="105" rx="10" ry="12" fill="#0f0a2a"
                animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5 }} />
            <motion.ellipse cx="118" cy="105" rx="10" ry="12" fill="#0f0a2a"
                animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5 }} />
            <circle cx="82" cy="105" r="4" fill={c1} opacity="0.7" />
            <circle cx="118" cy="105" r="4" fill={c1} opacity="0.7" />
            <motion.text x="100" y="55" textAnchor="middle" fill={c1} fontSize="13"
                fontFamily="monospace" fontWeight="bold" opacity="0.7"
                animate={{ y: [55, 40, 55], opacity: [0.7, 0.2, 0.7] }} transition={{ duration: 4, repeat: Infinity }}>null</motion.text>
            {[30, 60, 100, 140, 170].map((x, i) => (
                <motion.circle key={i} cx={x} cy={180 + (i % 2) * 10} r={3 + i % 3}
                    fill={c1} opacity="0.3"
                    animate={{ y: [0, -40, 0], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }} />
            ))}
        </motion.svg>
    );
};

export const SVGMemoryLeakVampire = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const skinC = isCorrupted ? "#a78bfa" : "#fde8d8";
    const eyeC = isCorrupted ? "#c084fc" : "#dc2626";
    const glow = isCorrupted ? "rgba(139,92,246,0.5)" : "rgba(220,38,38,0.45)";
    return (
        <motion.svg viewBox="0 0 200 210" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 22px ${glow})` }}
            animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="vampCape" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isCorrupted ? "#1e1b4b" : "#1a0000"} /><stop offset="100%" stopColor="#000" />
                </linearGradient>
                <radialGradient id="orbGrad" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#bfdbfe" /><stop offset="60%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e3a8a" />
                </radialGradient>
            </defs>
            <motion.path d="M 50 90 Q 20 130 15 190 L 185 190 Q 180 130 150 90 Z" fill="url(#vampCape)"
                animate={{ d: ["M 50 90 Q 20 130 15 190 L 185 190 Q 180 130 150 90 Z", "M 50 90 Q 10 140 20 200 L 180 200 Q 190 140 150 90 Z", "M 50 90 Q 20 130 15 190 L 185 190 Q 180 130 150 90 Z"] }}
                transition={{ duration: 3, repeat: Infinity }} />
            <path d="M 75 90 Q 60 130 65 190 L 135 190 Q 140 130 125 90 Z" fill="#3b0000" opacity="0.6" />
            <rect x="75" y="90" width="50" height="90" rx="8" fill="#1a0000" />
            <ellipse cx="100" cy="72" rx="26" ry="28" fill={skinC} />
            <path d="M 74 60 Q 80 30 100 40 Q 120 30 126 60 Q 118 50 110 58 Q 100 45 90 58 Q 82 50 74 60 Z" fill="#111" />
            <motion.ellipse cx="88" cy="70" rx="7" ry="8" fill={eyeC}
                animate={{ scaleY: [1, 0.15, 1] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }} />
            <motion.ellipse cx="112" cy="70" rx="7" ry="8" fill={eyeC}
                animate={{ scaleY: [1, 0.15, 1] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }} />
            <path d="M 93 88 L 90 96 L 96 88" fill="white" />
            <path d="M 107 88 L 104 96 L 110 88" fill="white" />
            <motion.circle cx="148" cy="120" r="18" fill="url(#orbGrad)"
                animate={{ r: [18, 14, 18], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.text x="148" y="125" textAnchor="middle" fill="white" fontSize="7"
                fontFamily="monospace" fontWeight="bold"
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>MB</motion.text>
            <motion.path d="M 130 115 Q 120 108 112 100" fill="none" stroke="#93c5fd" strokeWidth="2.5"
                strokeLinecap="round" strokeDasharray="4 3"
                animate={{ strokeDashoffset: [0, -14] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} />
            {[0, 1, 2].map(i => (
                <motion.circle key={i} cx={148 + (i - 1) * 12} cy={102} r="3" fill="#60a5fa" opacity="0.7"
                    animate={{ y: [0, -35], opacity: [0.7, 0], x: [(i - 1) * 6, (i - 1) * 18] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }} />
            ))}
        </motion.svg>
    );
};

export const SVGInfiniteLoopSpiral = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#f43f5e" : "#06b6d4";
    const c2 = isCorrupted ? "#881337" : "#0e7490";
    const c3 = isCorrupted ? "#fda4af" : "#67e8f9";
    const glow = isCorrupted ? "rgba(244,63,94,0.6)" : "rgba(6,182,212,0.55)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 22px ${glow})` }}>
            <defs>
                <linearGradient id="spiralGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            <motion.g animate={{ rotate: 360 }} style={{ originX: "100px", originY: "100px" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <circle cx="100" cy="100" r="80" fill="none" stroke={c1} strokeWidth="3" strokeDasharray="18 10" opacity="0.7" />
            </motion.g>
            <motion.g animate={{ rotate: -360 }} style={{ originX: "100px", originY: "100px" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <circle cx="100" cy="100" r="58" fill="none" stroke={c1} strokeWidth="4" strokeDasharray="12 8" opacity="0.85" />
                <circle cx="100" cy="42" r="6" fill={c3} />
                <circle cx="158" cy="100" r="5" fill={c1} opacity="0.8" />
            </motion.g>
            <motion.g animate={{ rotate: 360 }} style={{ originX: "100px", originY: "100px" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                <circle cx="100" cy="100" r="36" fill="none" stroke={c3} strokeWidth="5" strokeDasharray="8 6" />
                <circle cx="100" cy="64" r="7" fill={c3} />
            </motion.g>
            <motion.circle cx="100" cy="100" r="16" fill="url(#spiralGrad)"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
            <motion.circle cx="100" cy="100" r="8" fill={c3}
                animate={{ scale: [1, 0.5, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
            <motion.text x="100" y="190" textAnchor="middle" fill={c1} fontSize="11"
                fontFamily="monospace" fontWeight="bold"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>while(true)</motion.text>
        </motion.svg>
    );
};

export const SVGStackOverflowTower = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#c084fc" : "#f59e0b";
    const c2 = isCorrupted ? "#4c1d95" : "#78350f";
    const glow = isCorrupted ? "rgba(192,132,252,0.5)" : "rgba(245,158,11,0.45)";
    const layers = [{ y: 155, w: 80, label: "fn()" }, { y: 128, w: 68, label: "fn()" }, { y: 101, w: 56, label: "fn()" }, { y: 74, w: 44, label: "fn()" }, { y: 47, w: 32, label: "fn()" }, { y: 20, w: 20, label: "?" }];
    return (
        <motion.svg viewBox="0 0 200 210" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 20px ${glow})` }}
            animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="towerGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={c2} /><stop offset="50%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            {layers.map((l, i) => (
                <motion.g key={i} animate={{ x: i % 2 === 0 ? [0, 1.5, 0] : [0, -1.5, 0] }}
                    transition={{ duration: 0.4 + i * 0.1, repeat: Infinity }}>
                    <rect x={100 - l.w / 2} y={l.y} width={l.w} height={22} rx="4"
                        fill="url(#towerGrad)" stroke={c1} strokeWidth="1" opacity={1 - i * 0.08} />
                    <text x="100" y={l.y + 15} textAnchor="middle" fill={c2}
                        fontSize="9" fontFamily="monospace" fontWeight="bold">{l.label}</text>
                </motion.g>
            ))}
            {[0, 1, 2, 3].map(i => (
                <motion.circle key={i} cx={60 + i * 26} cy={178} r="3" fill={c1}
                    animate={{ y: [0, -25 - i * 5], opacity: [1, 0], x: [(i - 1.5) * 8, (i - 1.5) * 20] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }} />
            ))}
            <motion.text x="100" y="200" textAnchor="middle" fill={c1} fontSize="9" fontFamily="monospace"
                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>Maximum call stack exceeded</motion.text>
        </motion.svg>
    );
};

export const SVGCORSShieldWall = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#f43f5e" : "#ef4444";
    const c3 = isCorrupted ? "#fda4af" : "#fca5a5";
    const glow = isCorrupted ? "rgba(244,63,94,0.65)" : "rgba(239,68,68,0.55)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 22px ${glow})` }}
            animate={{ scale: [1, 1.015, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <defs>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c1} stopOpacity="0.2" /><stop offset="100%" stopColor={isCorrupted ? "#4c0519" : "#450a0a"} stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="shieldBorder" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c3} /><stop offset="100%" stopColor={c1} />
                </linearGradient>
            </defs>
            <path d="M 100 15 L 165 45 L 165 105 Q 165 155 100 185 Q 35 155 35 105 L 35 45 Z"
                fill="url(#shieldGrad)" stroke="url(#shieldBorder)" strokeWidth="3" />
            <path d="M 100 35 L 148 58 L 148 105 Q 148 140 100 162 Q 52 140 52 105 L 52 58 Z"
                fill="none" stroke={c1} strokeWidth="1.5" opacity="0.5" />
            <text x="100" y="90" textAnchor="middle" fill={c3} fontSize="22" fontFamily="monospace" fontWeight="bold">CORS</text>
            <text x="100" y="115" textAnchor="middle" fill={c1} fontSize="11" fontFamily="monospace">403 Forbidden</text>
            {[0, 1, 2].map(i => (
                <motion.g key={i} animate={{ x: [-(30 + i * 20), -(55 + i * 20)], opacity: [1, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.4 }}>
                    <line x1={168 + i * 2} y1={70 + i * 20} x2={185 + i * 2} y2={70 + i * 20}
                        stroke={c1} strokeWidth="2.5" strokeLinecap="round" />
                    <path d={`M ${163 + i * 2} ${65 + i * 20} L ${168 + i * 2} ${70 + i * 20} L ${163 + i * 2} ${75 + i * 20}`}
                        fill="none" stroke={c1} strokeWidth="2.5" strokeLinecap="round" />
                </motion.g>
            ))}
            <motion.circle cx="100" cy="100" r="70" fill="none" stroke={c1} strokeWidth="1.5"
                animate={{ r: [70, 90], opacity: [0.4, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.svg>
    );
};

export const SVGTypeErrorMorph = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#10b981" : "#f97316";
    const c2 = isCorrupted ? "#064e3b" : "#7c2d12";
    const glow = isCorrupted ? "rgba(16,185,129,0.55)" : "rgba(249,115,22,0.55)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 22px ${glow})` }}>
            <defs>
                <linearGradient id="morphGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            <motion.path d="M 100 40 C 160 40 170 100 160 140 C 150 180 50 180 40 140 C 30 100 40 40 100 40 Z"
                fill="url(#morphGrad)"
                animate={{
                    d: [
                        "M 100 40 C 160 40 170 100 160 140 C 150 180 50 180 40 140 C 30 100 40 40 100 40 Z",
                        "M 100 30 L 170 80 L 150 165 L 50 165 L 30 80 Z",
                        "M 60 40 L 140 40 L 170 100 L 140 170 L 60 170 L 30 100 Z",
                        "M 100 40 C 160 40 170 100 160 140 C 150 180 50 180 40 140 C 30 100 40 40 100 40 Z",
                    ]
                }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx="80" cy="105" r="10" fill="#1a0a00"
                animate={{ cx: [80, 82, 78, 80] }} transition={{ duration: 3, repeat: Infinity }} />
            <motion.circle cx="120" cy="105" r="10" fill="#1a0a00"
                animate={{ cx: [120, 118, 122, 120] }} transition={{ duration: 3, repeat: Infinity }} />
            <circle cx="80" cy="105" r="4" fill={c1} opacity="0.7" />
            <circle cx="120" cy="105" r="4" fill={c1} opacity="0.7" />
            {["string", "number", "boolean", "any"].map((type, i) => (
                <motion.text key={i} x="100" y="170" textAnchor="middle" fill="#fff"
                    fontSize="10" fontFamily="monospace" fontWeight="bold"
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.75 }}>{`<${type}>`}</motion.text>
            ))}
        </motion.svg>
    );
};

export const SVGRaceConditionTwins = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1A = isCorrupted ? "#a855f7" : "#06b6d4";
    const c1B = isCorrupted ? "#ec4899" : "#f59e0b";
    const c2A = isCorrupted ? "#4c1d95" : "#0e7490";
    const c2B = isCorrupted ? "#831843" : "#92400e";
    const glow = isCorrupted ? "rgba(168,85,247,0.45)" : "rgba(6,182,212,0.45)";
    const TwinBody = ({ cx, color1, color2, delay }: { cx: number; color1: string; color2: string; delay: number }) => (
        <motion.g animate={{ x: [0, 4, -4, 0], y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }}>
            <circle cx={cx} cy={85} r={22} fill={color1} />
            <rect x={cx - 16} y={105} width={32} height={55} rx="8" fill={color2} />
            <circle cx={cx - 7} cy={82} r={4} fill="#fff" />
            <circle cx={cx + 7} cy={82} r={4} fill="#fff" />
            <circle cx={cx - 7} cy={82} r={2} fill="#000" />
            <circle cx={cx + 7} cy={82} r={2} fill="#000" />
        </motion.g>
    );
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 20px ${glow})` }}>
            <TwinBody cx={65} color1={c1A} color2={c2A} delay={0} />
            <TwinBody cx={135} color1={c1B} color2={c2B} delay={0.3} />
            <motion.text x="100" y="112" textAnchor="middle" fill="#fff" fontSize="18"
                fontFamily="monospace" fontWeight="900"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                style={{ originX: "100px", originY: "100px" }}
                transition={{ duration: 0.6, repeat: Infinity }}>VS</motion.text>
            {[0, 1, 2, 3].map(i => {
                const angle = (i / 4) * Math.PI * 2;
                return (
                    <motion.circle key={i} cx={100 + Math.cos(angle) * 8} cy={100 + Math.sin(angle) * 8} r="3" fill="#fff"
                        animate={{ cx: [100 + Math.cos(angle) * 8, 100 + Math.cos(angle) * 28], opacity: [1, 0] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }} />
                );
            })}
            <text x="100" y="188" textAnchor="middle" fill="#aaa" fontSize="8" fontFamily="monospace">RACE CONDITION DETECTED</text>
        </motion.svg>
    );
};

export const SVGRegexHydra = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#14b8a6" : "#8b5cf6";
    const c2 = isCorrupted ? "#134e4a" : "#2e1065";
    const c3 = isCorrupted ? "#5eead4" : "#c4b5fd";
    const glow = isCorrupted ? "rgba(20,184,166,0.55)" : "rgba(139,92,246,0.55)";
    const heads = [
        { neck: "M 100 130 Q 60 100 50 60", hx: 50, hy: 50, delay: 0 },
        { neck: "M 100 130 Q 100 90 100 55", hx: 100, hy: 45, delay: 0.4 },
        { neck: "M 100 130 Q 140 100 150 60", hx: 150, hy: 50, delay: 0.8 },
    ];
    return (
        <motion.svg viewBox="0 0 200 210" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 22px ${glow})` }}>
            <defs>
                <linearGradient id="hydraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            <ellipse cx="100" cy="155" rx="45" ry="40" fill="url(#hydraGrad)" />
            {heads.map((h, i) => (
                <motion.g key={i} animate={{ rotate: [-5, 5, -5] }}
                    style={{ originX: "100px", originY: "130px" }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: h.delay }}>
                    <path d={h.neck} stroke={c1} strokeWidth="16" strokeLinecap="round" fill="none" />
                    <path d={h.neck} stroke={c2} strokeWidth="10" strokeLinecap="round" fill="none" />
                    <ellipse cx={h.hx} cy={h.hy} rx="18" ry="15" fill="url(#hydraGrad)" />
                    <circle cx={h.hx - 6} cy={h.hy - 3} r="4" fill={c3} />
                    <circle cx={h.hx + 6} cy={h.hy - 3} r="4" fill={c3} />
                    <circle cx={h.hx - 6} cy={h.hy - 3} r="2" fill="#000" />
                    <circle cx={h.hx + 6} cy={h.hy - 3} r="2" fill="#000" />
                    <motion.text x={h.hx} y={h.hy + 25} textAnchor="middle" fill={c3} fontSize="7"
                        fontFamily="monospace"
                        animate={{ opacity: [0, 1, 0], y: [h.hy + 25, h.hy + 10] }}
                        transition={{ duration: 2, repeat: Infinity, delay: h.delay }}>
                        {["^.*$", "[a-z]+", "\\d{3}"][i]}
                    </motion.text>
                </motion.g>
            ))}
            <text x="100" y="205" textAnchor="middle" fill={c3} fontSize="8" fontFamily="monospace" opacity="0.7">/regex/gi</text>
        </motion.svg>
    );
};

// ─── NEW BOSS ENEMIES ─────────────────────────────────────────────────────────

export const SVGDOMCoreEntity = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#14b8a6" : "#22c55e"; // Teal vs Green
    const c2 = isCorrupted ? "#042f2e" : "#052e16";
    const glow = isCorrupted ? "rgba(20,184,166,0.6)" : "rgba(34,197,94,0.5)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 25px ${glow})` }}
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <defs>
                <linearGradient id="domGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            {[0, 1, 2, 3].map(i => (
                <motion.g key={i} style={{ originX: "100px", originY: "100px", rotate: i * 90 }}
                    animate={{ scale: [1, 1.1, 0.9, 1] }} transition={{ duration: 4, repeat: Infinity, delay: i }}>
                    <path d="M 100 20 L 140 60 L 100 100 L 60 60 Z" fill="none" stroke="url(#domGrad)" strokeWidth="4" />
                    <rect x="85" y="45" width="30" height="30" fill={c2} stroke={c1} strokeWidth="2" />
                    <text x="100" y="65" textAnchor="middle" fill={c1} fontSize="14" fontFamily="monospace" fontWeight="bold">&lt;&gt;</text>
                </motion.g>
            ))}
            <motion.circle cx="100" cy="100" r="25" fill={c2} stroke={c1} strokeWidth="3"
                animate={{ r: [25, 30, 25] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="100" cy="100" r="10" fill={c1}
                animate={{ scale: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        </motion.svg>
    );
};

export const SVGCascadeQueen = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#f43f5e" : "#ec4899"; // Rose vs Pink
    const c2 = isCorrupted ? "#a855f7" : "#8b5cf6"; // Purple vs Violet
    const glow = isCorrupted ? "rgba(244,63,94,0.6)" : "rgba(236,72,153,0.5)";
    return (
        <motion.svg viewBox="0 0 200 220" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 30px ${glow})` }}
            animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <defs>
                <linearGradient id="queenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            {[0, 1, 2].map((i) => (
                <motion.path key={i} d="M 50 160 L 100 40 L 150 160 Z"
                    fill="none" stroke={`hsl(${320 + i * 20}, 80%, 60%)`} strokeWidth="3" opacity={0.4}
                    animate={{ scale: [1 + i * 0.2, 1.2 + i * 0.2, 1 + i * 0.2], rotate: [0, i * 15, 0] }}
                    style={{ originX: "100px", originY: "120px" }}
                    transition={{ duration: 3 + i, repeat: Infinity }} />
            ))}
            <path d="M 60 150 Q 100 40 140 150 Q 100 180 60 150 Z" fill="url(#queenGrad)" />
            <path d="M 80 50 L 100 20 L 120 50 Z" fill="#fff" />
            <motion.circle cx="100" cy="90" r="6" fill="#000"
                animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} />
            <text x="100" y="140" textAnchor="middle" fill="#fff" fontSize="24" fontFamily="monospace" fontWeight="900">!important</text>
        </motion.svg>
    );
};

export const SVGEventLoopEngine = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#f59e0b" : "#eab308"; // Amber vs Yellow
    const c2 = isCorrupted ? "#78350f" : "#713f12";
    const glow = isCorrupted ? "rgba(245,158,11,0.6)" : "rgba(234,179,8,0.5)";
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 25px ${glow})` }}>
            <defs>
                <radialGradient id="engineCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </radialGradient>
            </defs>
            <motion.g animate={{ rotate: 360 }} style={{ originX: "100px", originY: "100px" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <circle key={i} cx={100 + Math.cos(i * Math.PI / 3) * 60} cy={100 + Math.sin(i * Math.PI / 3) * 60} r="15"
                        fill="none" stroke={c1} strokeWidth="3" opacity="0.6" />
                ))}
                <circle cx="100" cy="100" r="60" fill="none" stroke={c1} strokeWidth="1" strokeDasharray="5 5" />
            </motion.g>
            <motion.g animate={{ rotate: -360 }} style={{ originX: "100px", originY: "100px" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                <circle cx="100" cy="100" r="40" fill="none" stroke={c1} strokeWidth="4" strokeDasharray="15 10" />
            </motion.g>
            <circle cx="100" cy="100" r="25" fill="url(#engineCore)" />
            <motion.circle cx="100" cy="100" r="10" fill="#fff"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
            <text x="100" y="104" textAnchor="middle" fill="#000" fontSize="10" fontFamily="monospace" fontWeight="bold">tick</text>
        </motion.svg>
    );
};

export const SVGAsyncHydra = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#10b981" : "#0284c7"; // Emerald vs Sky
    const c2 = isCorrupted ? "#064e3b" : "#0c4a6e";
    const glow = isCorrupted ? "rgba(16,185,129,0.6)" : "rgba(2,132,199,0.5)";
    
    // 3 heads representing Pending, Fulfilled, Rejected
    const heads = [
        { cx: 50, cy: 60, r: -20, delay: 0, text: "resolve", color: "#34d399" },
        { cx: 100, cy: 40, r: 0, delay: 0.5, text: "pending", color: "#94a3b8" },
        { cx: 150, cy: 60, r: 20, delay: 1, text: "reject", color: "#f87171" }
    ];

    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 25px ${glow})` }}>
            <defs>
                <linearGradient id="hydraBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
            </defs>
            <path d="M 50 170 Q 100 120 150 170 Q 100 190 50 170 Z" fill="url(#hydraBody)" />
            {heads.map((h, i) => (
                <motion.g key={i} animate={{ y: [0, -15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: h.delay }}>
                    <path d={`M 100 150 Q ${100 + h.r * 2} 100 ${h.cx} ${h.cy + 15}`} fill="none" stroke={c2} strokeWidth="12" strokeLinecap="round" />
                    <circle cx={h.cx} cy={h.cy} r="22" fill={h.color} />
                    <circle cx={h.cx - 7} cy={h.cy - 5} r="3" fill="#000" />
                    <circle cx={h.cx + 7} cy={h.cy - 5} r="3" fill="#000" />
                    <text x={h.cx} y={h.cy + 10} textAnchor="middle" fill="#000" fontSize="8" fontFamily="monospace" fontWeight="bold">{h.text}</text>
                </motion.g>
            ))}
        </motion.svg>
    );
};

export const SVGComplexityEngine = ({ variant = "normal" }: { variant?: string }) => {
    const isCorrupted = variant === "corrupted";
    const c1 = isCorrupted ? "#ef4444" : "#64748b"; // Red vs Slate
    const c2 = isCorrupted ? "#7f1d1d" : "#0f172a";
    const glow = isCorrupted ? "rgba(239,68,68,0.7)" : "rgba(100,116,139,0.5)";
    
    return (
        <motion.svg viewBox="0 0 200 200" className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 30px ${glow})` }}>
            <motion.rect x="50" y="50" width="100" height="100" fill={c2} stroke={c1} strokeWidth="4" rx="10"
                animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ originX: "100px", originY: "100px" }} />
            
            <motion.rect x="65" y="65" width="70" height="70" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 4"
                animate={{ rotate: [0, -90, -180, -270, -360] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ originX: "100px", originY: "100px" }} />

            <circle cx="100" cy="100" r="20" fill={c1} />
            <motion.text x="100" y="105" textAnchor="middle" fill="#fff" fontSize="16" fontFamily="monospace" fontWeight="bold"
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>O(n²)</motion.text>
            
            {[0, 1, 2, 3].map(i => (
                <motion.line key={i} x1="100" y1="100" x2={100 + Math.cos(i * Math.PI / 2) * 80} y2={100 + Math.sin(i * Math.PI / 2) * 80}
                    stroke={c1} strokeWidth="2" opacity="0.5"
                    animate={{ strokeDasharray: ["0 100", "100 0"] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }} />
            ))}
        </motion.svg>
    );
};

// ─── BACKGROUNDS ─────────────────────────────────────────────────────────────

export const EnvironmentSVGs: Record<string, React.ComponentType<{ tint?: string }>> = {
    corrupted_blank: ({ tint = "#ffffff" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <rect width="100%" height="100%" fill="#ffffff" />
            <motion.rect width="100%" height="100%" fill="url(#glitchNoise)" opacity="0.1" />
            <path d="M 0 0 L 1000 500 M 1000 0 L 0 500" stroke="#000" strokeWidth="0.5" opacity="0.1" />
            {/* Random text artifacts */}
            {[...Array(20)].map((_, i) => (
                <motion.text key={i} x={Math.random() * 900} y={Math.random() * 450} fill="#000" fontSize="12" fontFamily="monospace" opacity="0.2"
                    animate={{ opacity: [0.1, 0.4, 0.1], x: [Math.random() * 900, Math.random() * 900] }} transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 2 }}>
                    {["undefined", "NaN", "[object Object]", "null"][Math.floor(Math.random() * 4)]}
                </motion.text>
            ))}
            {/* Infinite div simulation */}
            <motion.rect x="0" y="200" height="100" fill="#000" opacity="0.05"
                animate={{ width: ["0%", "200%"] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
            <rect width="100%" height="100%" fill="url(#vignetteBlack)" />
            <defs>
                <radialGradient id="vignetteBlack" cx="50%" cy="50%" r="70%">
                    <stop offset="30%" stopColor="transparent" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
                </radialGradient>
            </defs>
        </svg>
    ),
    markup_ruins: ({ tint = "#042f2e" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="markupBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#020617" /><stop offset="100%" stopColor={tint} />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#markupBg)" />
            {/* Collapsed wireframes */}
            {[0, 1, 2, 3, 4].map(i => (
                <rect key={i} x={Math.random() * 800} y={Math.random() * 300 + 100} width={Math.random() * 300 + 100} height={Math.random() * 100 + 50}
                    fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"
                    transform={`rotate(${Math.random() * 30 - 15} ${Math.random() * 800} ${Math.random() * 300 + 100})`} />
            ))}
            {/* Orphan tags falling */}
            {[...Array(15)].map((_, i) => (
                <motion.text key={i} x={Math.random() * 900 + 50} y="-50" fill="#34d399" fontSize="24" fontFamily="monospace" opacity="0.4"
                    animate={{ y: [0, 600], rotate: [0, 360] }} transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}>
                    {["</div>", "</span>", "</a>", "<br>"][Math.floor(Math.random() * 4)]}
                </motion.text>
            ))}
            <path d="M 0 400 L 200 350 L 400 450 L 600 300 L 800 400 L 1000 350 L 1000 500 L 0 500 Z" fill="#022c22" opacity="0.8" />
        </svg>
    ),
    style_chaos: ({ tint = "#3b0764" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <rect width="100%" height="100%" fill="#0a0a0a" />
            <defs>
                <linearGradient id="neonPink" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            {/* Conflicting Z-index overlapping blocks */}
            <motion.rect x="100" y="100" width="300" height="200" fill="url(#neonPink)" opacity="0.2" stroke="#ec4899" strokeWidth="2"
                animate={{ x: [100, 120, 100], y: [100, 80, 100] }} transition={{ duration: 4, repeat: Infinity }} />
            <motion.rect x="250" y="150" width="300" height="200" fill="#8b5cf6" opacity="0.2" stroke="#a855f7" strokeWidth="2"
                animate={{ x: [250, 230, 250], y: [150, 170, 150] }} transition={{ duration: 5, repeat: Infinity }} />
            <motion.rect x="500" y="50" width="400" height="300" fill="#3b0764" opacity="0.4" stroke="#d946ef" strokeWidth="2"
                animate={{ opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
            
            {/* Overflowing text */}
            <text x="50" y="450" fill="#ec4899" fontSize="60" fontFamily="sans-serif" fontWeight="900" opacity="0.1" letterSpacing="-5">
                OVERFLOW-X: VISIBLE
            </text>
            <text x="600" y="80" fill="#8b5cf6" fontSize="40" fontFamily="sans-serif" fontWeight="900" opacity="0.15">
                Z-INDEX: 999999
            </text>
        </svg>
    ),
    logic_core: ({ tint = "#1e1b4b" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <rect width="100%" height="100%" fill="#020617" />
            {/* Spiral of infinite loops */}
            <g transform="translate(500, 250)">
                {[...Array(20)].map((_, i) => (
                    <motion.circle key={i} cx="0" cy="0" r={i * 25} fill="none" stroke="#6366f1" strokeWidth={0.5 + i * 0.1} opacity={1 - (i * 0.04)}
                        strokeDasharray={`${5 + i * 2} ${10 + i}`}
                        animate={{ rotate: 360 }} transition={{ duration: 20 + i * 2, repeat: Infinity, ease: "linear" }} />
                ))}
            </g>
            {/* Execution lines */}
            <path d="M 0 250 Q 250 100 500 250 T 1000 250" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.3" />
            <path d="M 0 250 Q 250 400 500 250 T 1000 250" fill="none" stroke="#4f46e5" strokeWidth="2" opacity="0.3" />
            {/* Bits flowing */}
            {[...Array(10)].map((_, i) => (
                <motion.circle key={i} cx={Math.random() * 1000} cy={Math.random() * 500} r="2" fill="#c7d2fe"
                    animate={{ scale: [1, 2, 1], opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1 + Math.random() * 2, repeat: Infinity }} />
            ))}
        </svg>
    ),
    async_wasteland: ({ tint = "#292524" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="desertBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c0a09" /><stop offset="60%" stopColor="#1c1917" /><stop offset="100%" stopColor="#44403c" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#desertBg)" />
            {/* Dead promises (tombstones) */}
            {[100, 300, 550, 800].map((x, i) => (
                <g key={i} transform={`translate(${x}, ${350 + (i % 2) * 40})`}>
                    <rect x="-30" y="-50" width="60" height="50" rx="5" fill="#292524" stroke="#57534e" strokeWidth="1" />
                    <text x="0" y="-30" textAnchor="middle" fill="#78716c" fontSize="10" fontFamily="monospace">Pending</text>
                    <text x="0" y="-15" textAnchor="middle" fill="#a8a29e" fontSize="14" fontFamily="monospace">∞ms</text>
                </g>
            ))}
            {/* Ground landscape */}
            <path d="M 0 400 Q 200 350 500 420 T 1000 400 L 1000 500 L 0 500 Z" fill="#1c1917" />
            {/* Abandoned connections */}
            <path d="M 150 500 C 150 200 350 100 850 500" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="10 10" opacity="0.3" />
            <circle cx="850" cy="500" r="4" fill="#ef4444" />
        </svg>
    ),
    algorithm_vault: ({ tint = "#0f172a" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <rect width="100%" height="100%" fill="#020617" />
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
                <radialGradient id="vaultGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* The Architect's central eye/core */}
            <rect width="100%" height="100%" fill="url(#vaultGlow)" />
            <motion.path d="M 400 250 L 500 150 L 600 250 L 500 350 Z" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6"
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 4, repeat: Infinity }} />
            <motion.path d="M 450 250 L 500 200 L 550 250 L 500 300 Z" fill="none" stroke="#60a5fa" strokeWidth="1"
                animate={{ rotate: 180 }} style={{ originX: "500px", originY: "250px" }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
            {/* Logic gates/nodes */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const x = 500 + Math.cos(angle) * 200;
                const y = 250 + Math.sin(angle) * 150;
                return (
                    <g key={i}>
                        <line x1="500" y1="250" x2={x} y2={y} stroke="#1e293b" strokeWidth="2" />
                        <motion.circle cx={x} cy={y} r="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1"
                            animate={{ fill: ["#0f172a", "#3b82f6", "#0f172a"] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }} />
                    </g>
                );
            })}
        </svg>
    ),
};

// ─── ASSET MAPS ───────────────────────────────────────────────────────────────

export const EnemyComponentMap: Record<string, React.ComponentType<{ variant?: string }>> = {
    slime: SVGSlime,
    dragon: SVGSynthDragon,
    tree: SVGSyntaxTree,
    king: SVGGarbageKing,
    ghost: SVGNullPointerGhost,
    vampire: SVGMemoryLeakVampire,
    spiral: SVGInfiniteLoopSpiral,
    tower: SVGStackOverflowTower,
    shield: SVGCORSShieldWall,
    morph: SVGTypeErrorMorph,
    twins: SVGRaceConditionTwins,
    hydra: SVGRegexHydra,
    dom_core_entity: SVGDOMCoreEntity,
    cascade_queen: SVGCascadeQueen,
    event_loop_engine: SVGEventLoopEngine,
    async_hydra: SVGAsyncHydra,
    complexity_engine: SVGComplexityEngine,
};