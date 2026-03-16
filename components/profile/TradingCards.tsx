"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShopItem } from "@/lib/shop-items";
import { HelpCircle } from "lucide-react";

interface TradingCardProps {
    item: ShopItem;
}

const RARITY_GLOW: Record<string, string> = {
    legendary: "shadow-[0_0_40px_rgba(251,191,36,0.4)]",
    epic: "shadow-[0_0_30px_rgba(139,92,246,0.35)]",
    rare: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    common: "shadow-[0_4px_20px_rgba(0,0,0,0.12)]",
};

const RARITY_BORDER: Record<string, string> = {
    legendary: "border-amber-400/60",
    epic: "border-purple-500/60",
    rare: "border-blue-400/60",
    common: "border-zinc-300/40",
};

export function TradingCard({ item }: TradingCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    // Safety check: Ensure Icon is a valid component (function or React component object)
    const RawIcon = item.icon;
    const Icon = (typeof RawIcon === 'function' || (RawIcon && typeof RawIcon === 'object' && ('$$typeof' in RawIcon || 'render' in RawIcon))) ? RawIcon : HelpCircle;

    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const spring = { damping: 22, stiffness: 160, mass: 0.5 };
    const xS = useSpring(x, spring);
    const yS = useSpring(y, spring);

    const rotateX = useTransform(yS, [0, 1], [14, -14]);
    const rotateY = useTransform(xS, [0, 1], [-14, 14]);
    const glareX = useTransform(xS, [0, 1], [0, 100]);
    const glareY = useTransform(yS, [0, 1], [0, 100]);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
    };

    const handleLeave = () => {
        setIsHovered(false);
        x.set(0.5);
        y.set(0.5);
    };

    const glowClass = RARITY_GLOW[item.rarity];
    const borderClass = RARITY_BORDER[item.rarity];

    return (
        <motion.div
            className="w-[220px] aspect-[2.5/3.5] relative select-none"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
            onMouseMove={handleMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleLeave}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
            <div className={`
                w-full h-full rounded-[1.25rem] relative overflow-hidden border
                ${borderClass} ${isHovered ? glowClass : "shadow-lg"}
                transition-shadow duration-500
            `}>
                {/* Card gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />

                {/* Diagonal texture overlay for legendary */}
                {item.rarity === "legendary" && (
                    <div
                        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
                        style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }}
                    />
                )}

                {/* Photo image (blended) */}
                {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-35 group-hover:opacity-55 transition-opacity"
                    />
                )}

                {/* Top: rarity badge */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                        {item.rarity}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                        {item.category}
                    </span>
                </div>

                {/* Center: icon */}
                <div
                    className="absolute inset-0 flex items-center justify-center z-10"
                    style={{ transform: "translateZ(24px)" }}
                >
                    <motion.div
                        animate={isHovered ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                        <Icon
                            size={60}
                            className="text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                            strokeWidth={1.25}
                        />
                    </motion.div>

                    {/* Glow orb behind the icon */}
                    <div
                        className="absolute w-20 h-20 rounded-full bg-white/40 blur-2xl pointer-events-none"
                        style={{ opacity: isHovered ? 0.55 : 0.2, transition: "opacity 0.4s" }}
                    />
                </div>

                {/* Bottom text panel */}
                <div
                    className="absolute inset-x-0 bottom-0 p-4 pt-8 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-20"
                    style={{ transform: "translateZ(14px)" }}
                >
                    <h3 className="text-white font-black text-sm leading-tight mb-1 tracking-tight">
                        {item.name}
                    </h3>
                    <p className="text-white/60 text-[10px] leading-snug line-clamp-2">
                        {item.description}
                    </p>
                </div>

                {/* Glare sweep */}
                <motion.div
                    className="absolute inset-0 z-30 pointer-events-none mix-blend-soft-light rounded-[1.25rem]"
                    style={{
                        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.7) 0%, transparent 55%)`,
                        opacity: isHovered ? 0.35 : 0,
                    }}
                />

                {/* Holographic sweep — legendary only */}
                {item.rarity === "legendary" && (
                    <motion.div
                        className="absolute inset-0 z-30 pointer-events-none mix-blend-color-dodge"
                        style={{
                            background: `linear-gradient(125deg, transparent 20%, rgba(255,215,0,0.5) 45%, rgba(255,255,255,0.65) 50%, rgba(255,215,0,0.5) 55%, transparent 80%)`,
                            opacity: isHovered ? 0.7 : 0,
                            transition: "opacity 0.3s",
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
}
