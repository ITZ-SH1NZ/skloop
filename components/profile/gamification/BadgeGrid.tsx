"use client";

import { motion } from "framer-motion";
import { Trophy, Bug, Zap, Code, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const BADGES = [
    { id: 1, name: "Bug Hunter", icon: Bug, color: "text-red-500", bg: "bg-red-50 border-red-100" },
    { id: 2, name: "Speed Demon", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-100" },
    { id: 3, name: "Code Warrior", icon: Code, color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
    { id: 4, name: "Guardian", icon: Shield, color: "text-green-500", bg: "bg-green-50 border-green-100" },
    { id: 5, name: "Royalty", icon: Crown, color: "text-purple-500", bg: "bg-purple-50 border-purple-100" },
    { id: 6, name: "Champion", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50 border-amber-100" },
];

export function BadgeGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BADGES.map((badge, i) => (
                <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-transform hover:scale-105 cursor-pointer",
                        badge.bg
                    )}
                >
                    <div className={cn("p-2 rounded-full bg-white shadow-sm mb-2")}>
                        <badge.icon className={cn("w-6 h-6", badge.color)} />
                    </div>
                    <span className="font-bold text-xs text-center">{badge.name}</span>
                </motion.div>
            ))}
        </div>
    );
}
