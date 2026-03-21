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

// ─── BACKGROUNDS ─────────────────────────────────────────────────────────────

export const EnvironmentSVGs: Record<string, React.ComponentType<{ tint?: string }>> = {
    forest_dusk: ({ tint = "#064e3b" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" /><stop offset="60%" stopColor={tint} /><stop offset="100%" stopColor="#011a10" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#forestSky)" />
            <path d="M 100 500 L 150 200 L 200 500 Z" fill="#042f2e" opacity="0.6" />
            <path d="M 300 500 L 400 150 L 500 500 Z" fill="#042f2e" opacity="0.4" />
            <path d="M 800 500 L 850 100 L 950 500 Z" fill="#042f2e" opacity="0.5" />
            <path d="M 0 500 L 50 100 L 100 500 Z" fill="#020617" opacity="0.9" />
            <path d="M 600 500 L 700 80 L 800 500 Z" fill="#020617" opacity="0.9" />
            <circle cx="200" cy="300" r="4" fill="#6ee7b7" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="800" cy="250" r="5" fill="#34d399" className="animate-ping" style={{ animationDuration: "4s" }} />
            <circle cx="500" cy="400" r="3" fill="#6ee7b7" className="animate-ping" style={{ animationDuration: "2s" }} />
        </svg>
    ),
    neon_cave: ({ tint = "#1e1b4b" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <rect width="100%" height="100%" fill={tint} />
            <path d="M 0 0 L 200 150 L 300 50 L 400 200 L 700 0 Z" fill="#312e81" opacity="0.7" />
            <path d="M 400 0 L 500 300 L 800 100 L 1000 200 L 1000 0 Z" fill="#2e1065" opacity="0.6" />
            <path d="M 0 500 L 150 300 L 300 500 Z" fill="#0f172a" />
            <path d="M 700 500 L 850 250 L 1000 500 Z" fill="#0f172a" />
            <path d="M 150 300 L 170 200 L 200 350 Z" fill="#c084fc" opacity="0.8" />
            <path d="M 850 250 L 870 150 L 900 300 Z" fill="#c084fc" opacity="0.8" />
        </svg>
    ),
    cyber_castle: ({ tint = "#450a0a" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tint} /><stop offset="100%" stopColor="#000000" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#cyberSky)" />
            <path d="M 0 500 L 400 300 L 600 300 L 1000 500 Z" fill="#7f1d1d" opacity="0.3" />
            <rect x="200" y="100" width="80" height="400" fill="#2a0000" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
            <rect x="720" y="100" width="80" height="400" fill="#2a0000" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
            <rect x="400" y="50" width="200" height="250" fill="#1a0000" stroke="#fca5a5" strokeWidth="3" />
            <circle cx="500" cy="150" r="40" fill="#000" stroke="#ef4444" strokeWidth="4" />
        </svg>
    ),
    void_abyss: ({ tint = "#000000" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="voidGrad" cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor={tint} stopOpacity="0.4" /><stop offset="100%" stopColor="#000" />
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#voidGrad)" />
            {[...Array(30)].map((_, i) => (
                <circle key={i} cx={Math.sin(i * 137.5) * 450 + 500} cy={Math.cos(i * 137.5) * 200 + 250}
                    r={1 + (i % 3)} fill="#ffffff" opacity={0.1 + (i % 4) * 0.06} />
            ))}
        </svg>
    ),
    memory_heap: ({ tint = "#1c1917" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="heapSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c0a09" /><stop offset="100%" stopColor={tint} />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#heapSky)" />
            {[50, 180, 310, 520, 680, 820].map((x, i) => (
                <g key={i}>{[0, 1, 2, 3, 4].map(j => (
                    <rect key={j} x={x + j * 2} y={350 - j * 28 + i * 8} width={80 - j * 4} height={24}
                        rx="3" fill={`hsl(${25 + i * 8}, 60%, ${15 + j * 4}%)`}
                        stroke={`hsl(${25 + i * 8}, 80%, 40%)`} strokeWidth="0.5" opacity="0.85" />
                ))}</g>
            ))}
            {[200, 400, 600, 750, 900].map((x, i) => (
                <rect key={i} x={x} y={150 + i * 30} width="30" height="12" rx="2"
                    fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 2" />
            ))}
            <line x1="0" y1="400" x2="1000" y2="400" stroke="#f59e0b" strokeWidth="0.5" opacity="0.2" />
        </svg>
    ),
    api_desert: ({ tint = "#1c1400" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="desertSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c0700" /><stop offset="60%" stopColor={tint} /><stop offset="100%" stopColor="#2d1b00" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#desertSky)" />
            <path d="M 0 400 Q 200 330 400 400 Q 600 330 800 400 Q 900 350 1000 400 L 1000 500 L 0 500 Z" fill="#3d2000" opacity="0.8" />
            <path d="M 0 430 Q 250 380 500 430 Q 750 380 1000 430 L 1000 500 L 0 500 Z" fill="#2d1500" opacity="0.9" />
            {[150, 400, 700, 920].map((x, i) => (
                <g key={i}>
                    <line x1={x} y1={330} x2={x} y2={395} stroke="#78350f" strokeWidth="3" />
                    <rect x={x - 35} y={295} width="70" height="35" rx="4" fill="#1c0a00" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x={x} y={317} textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace">{["404", "500", "401", "408"][i]}</text>
                </g>
            ))}
        </svg>
    ),
    dom_jungle: ({ tint = "#052e16" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="domSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#020a02" /><stop offset="100%" stopColor={tint} />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#domSky)" />
            {[0, 1, 2, 3, 4].map(i => (
                <rect key={i} x={80 + i * 60} y={60 + i * 40} width={840 - i * 120} height={380 - i * 80}
                    rx="6" fill="none" stroke={`hsl(${120 + i * 15}, 60%, ${20 + i * 5}%)`}
                    strokeWidth={2 - i * 0.3} opacity={0.5 - i * 0.05} strokeDasharray={i > 2 ? "6 3" : undefined} />
            ))}
            {[100, 250, 450, 650, 850].map((x, i) => (
                <path key={i} d={`M ${x} 0 Q ${x + 20} 80 ${x + 10} 160 Q ${x - 10} 240 ${x + 15} 340`}
                    fill="none" stroke="#16a34a" strokeWidth={1.5 + i % 2} opacity="0.35" strokeLinecap="round" />
            ))}
            {[180, 400, 700].map((x, i) => (
                <text key={i} x={x} y={120 + i * 80} fill="#22c55e" fontSize="18" fontFamily="monospace" opacity="0.3">&lt;div&gt;</text>
            ))}
        </svg>
    ),
    database_dungeon: ({ tint = "#0c0f1a" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="dbSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tint} /><stop offset="100%" stopColor="#05060f" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#dbSky)" />
            {[0, 1, 2, 3, 4, 5].map(i => (
                <line key={`v${i}`} x1={i * 200} y1={0} x2={i * 200} y2={500} stroke="#1e293b" strokeWidth="2" opacity="0.6" />
            ))}
            {[0, 1, 2, 3, 4].map(i => (
                <line key={`h${i}`} x1={0} y1={i * 125} x2={1000} y2={i * 125} stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
            ))}
            {[100, 300, 500, 700, 900].map((x, i) => (
                <g key={i}>
                    <rect x={x - 80} y={155} width="160" height="90" rx="2"
                        fill="#0f172a" stroke="#334155" strokeWidth="1" opacity="0.7" />
                    <text x={x} y={195} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">{["id: 0xDEAD", "null", "∞ rows", "JOIN??", "LOCK"][i]}</text>
                </g>
            ))}
            {[80, 920].map((x, i) => (
                <g key={i}>
                    <rect x={x - 4} y={60} width="8" height="30" rx="2" fill="#92400e" />
                    <ellipse cx={x} cy={55} rx="12" ry="16" fill="#f59e0b" opacity="0.3" />
                    <ellipse cx={x} cy={55} rx="6" ry="10" fill="#fbbf24" opacity="0.5" />
                </g>
            ))}
        </svg>
    ),
    event_loop_arena: ({ tint = "#0a0514" }) => (
        <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
                <radialGradient id="arenaGrad" cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor={tint} /><stop offset="100%" stopColor="#000" />
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#arenaGrad)" />
            {[220, 160, 100, 50].map((r, i) => (
                <ellipse key={i} cx="500" cy="280" rx={r * 2.2} ry={r}
                    fill="none" stroke="#7c3aed" strokeWidth={1.5 - i * 0.2}
                    opacity={0.15 + i * 0.08} strokeDasharray={i % 2 === 0 ? "8 4" : undefined} />
            ))}
            <ellipse cx="500" cy="290" rx="120" ry="50" fill="#4c1d95" opacity="0.2" />
            <rect x="30" y="80" width="90" height="340" rx="4" fill="#1a0a2e" stroke="#7c3aed" strokeWidth="1.5" opacity="0.6" />
            <text x="75" y="70" textAnchor="middle" fill="#a78bfa" fontSize="9" fontFamily="monospace">Call Stack</text>
            {["fn()", "cb()", "main()"].map((t, i) => (
                <rect key={i} x="40" y={380 - i * 45} width="70" height="38" rx="3" fill="#2e1065" stroke="#7c3aed" strokeWidth="1" opacity="0.8" />
            ))}
            <rect x="880" y="80" width="90" height="340" rx="4" fill="#1a0a2e" stroke="#7c3aed" strokeWidth="1.5" opacity="0.6" />
            <text x="925" y="70" textAnchor="middle" fill="#a78bfa" fontSize="9" fontFamily="monospace">Queue</text>
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
};