"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ChestGraphicProps {
    isOpen: boolean;
    rarity: 'common' | 'rare' | 'legendary';
    className?: string;
    icon?: React.ReactNode;
}

export function ChestGraphic({ isOpen, rarity, className = "", icon }: ChestGraphicProps) {
    const color = rarity === 'common' 
        ? 'bg-zinc-800' 
        : rarity === 'rare' 
            ? 'bg-lime-500' 
            : 'bg-orange-500';
            
    const borderColor = rarity === 'common' 
        ? 'border-zinc-700' 
        : rarity === 'rare' 
            ? 'border-lime-400' 
            : 'border-orange-400';
            
    const glow = rarity === 'common' 
        ? 'shadow-[0_0_30px_rgba(161,161,170,0.5)]' 
        : rarity === 'rare' 
            ? 'shadow-[0_0_40px_rgba(212,242,104,0.8)]' 
            : 'shadow-[0_0_50px_rgba(249,115,22,0.8)]';

    return (
        <div className={`relative flex flex-col items-center justify-end group perspective-[1000px] ${className}`}>
             {/* The Reward Particle (Pops out when open) */}
             <AnimatePresence>
                {isOpen && icon && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: -80, scale: 1.2 }}
                        exit={{ opacity: 0, y: 0, scale: 0.8 }}
                        transition={{ type: "spring", bounce: 0.6 }}
                        className="absolute z-20 flex flex-col items-center mb-10"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-8 -z-10"
                            >
                                <Sparkles className="w-full h-full text-yellow-400/50" />
                            </motion.div>
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                                {icon}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The 3D Chest Assembly */}
            <div className="relative w-40 h-32 md:w-48 md:h-40 pointer-events-none z-10">
                {/* Chest Base */}
                <motion.div
                    animate={isOpen ? { scaleY: 0.95 } : { scaleY: 1 }}
                    className={`absolute bottom-0 w-full h-3/4 ${color} border-4 border-black rounded-b-xl shadow-[8px_8px_0_0_#000] z-10 transform origin-bottom`}
                >
                    <div className="absolute top-0 bottom-0 left-4 w-2 bg-black/20" />
                    <div className="absolute top-0 bottom-0 right-4 w-2 bg-black/20" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-6 bg-black rounded-t-full rounded-b border border-white/20" />
                </motion.div>

                {/* Chest Lid (Rotates open) */}
                <motion.div
                    initial={false}
                    animate={isOpen ? { rotateX: -60, y: -10 } : { rotateX: 0, y: 0 }}
                    transition={{ type: "spring", bounce: 0.5, stiffness: 200 }}
                    style={{ transformOrigin: "bottom" }}
                    className={`absolute top-0 w-full h-1/2 ${color} border-4 border-black rounded-t-3xl shadow-[0_-4px_0_inset_rgba(0,0,0,0.2)] z-20 ${isOpen ? glow : ''}`}
                >
                    <div className="absolute top-0 bottom-0 left-4 w-2 bg-black/20" />
                    <div className="absolute top-0 bottom-0 right-4 w-2 bg-black/20" />
                </motion.div>

                {/* Internal Glow when open */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute bottom-0 w-full h-3/4 bg-yellow-400/50 blur-xl z-0`}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
