"use client";

import { motion } from "framer-motion";
import {
    LayoutGrid,
    Trophy,
    User,
    Settings,
    Terminal,
    LineChart
} from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { useState } from "react";

const APPS = [
    { id: 1, icon: LayoutGrid, label: "Home" },
    { id: 2, icon: Terminal, label: "Game" },
    { id: 3, icon: LineChart, label: "Stats" },
    { id: 4, icon: Trophy, label: "Awards" },
    { id: 5, icon: User, label: "Profile" },
    { id: 6, icon: Settings, label: "Settings" },
];

export default function GlassDock({ onAppClick }: { onAppClick: (app: string) => void }) {
    const mouseX = 0; // In a real implementation with framer-motion useMotionValue, simplification for now

    return (
        <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-end gap-2 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                {APPS.map((app) => (
                    <MagneticButton key={app.id} strength={0.2} className="group relative">
                        <button
                            onClick={() => onAppClick(app.label)}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110 active:scale-95"
                        >
                            <app.icon className="text-white w-6 h-6" />
                        </button>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {app.label}
                        </span>
                        {/* Active Dot indicator mock */}
                        {app.label === "Home" && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50" />
                        )}
                    </MagneticButton>
                ))}
            </div>
        </div>
    );
}
