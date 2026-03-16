"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CurrencyCoin } from "./CurrencyCoin";
import { Sparkles } from "lucide-react";

interface Particle {
  id: number;
  type: "xp" | "coin";
  x: number;
  y: number;
}

export const RewardBurst = ({ 
  trigger, 
  onComplete,
  count = 12,
  origin = { x: 50, y: 50 } // percentage of viewport
}: { 
  trigger: boolean; 
  onComplete: () => void;
  count?: number;
  origin?: { x: number; y: number };
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      // 1. Fire Confetti
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x: origin.x / 100, y: origin.y / 100 },
        colors: ["#D4F268", "#A4C639", "#FFFFFF"],
        zIndex: 100,
      });

      // 2. Generate Flying Particles
      const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
        id: Date.now() + i,
        type: i % 2 === 0 ? "xp" : "coin",
        x: (origin.x / 100) * window.innerWidth,
        y: (origin.y / 100) * window.innerHeight,
      }));
      setParticles(newParticles);

      // Cleanup after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, origin, count, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[101]">
      <AnimatePresence>
        {particles.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y, 
              opacity: 1, 
              scale: 0 
            }}
            animate={{ 
              x: [p.x, p.x + (Math.random() - 0.5) * 200, 100], // Fly to left-ish (XP bar area)
              y: [p.y, p.y - 100 - Math.random() * 200, 20],   // Fly to top
              opacity: [1, 1, 0],
              scale: [0.5, i % 2 === 0 ? 1.2 : 0.8, 0.5],
              rotate: [0, Math.random() * 360, 0]
            }}
            transition={{ 
              duration: 1.2 + Math.random() * 0.5,
              ease: "easeOut",
            }}
            className="absolute"
          >
            {p.type === "coin" ? (
                <div className="w-6 h-6">
                    <CurrencyCoin size="sm" />
                </div>
            ) : (
              <div className="flex items-center justify-center bg-lime-400 text-black rounded-full p-1.5 shadow-lg border-2 border-white">
                <Sparkles size={12} className="fill-current" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
