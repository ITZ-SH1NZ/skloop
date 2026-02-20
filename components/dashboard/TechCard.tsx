"use client";

import { motion } from "framer-motion";
import { cn } from "@/components/ui/Button";

interface TechCardProps {
    children: React.ReactNode;
    className?: string;
    sysId?: string;
    statusIndicator?: boolean;
    active?: boolean;
    onClick?: () => void;
}

export default function TechCard({ children, className, sysId, statusIndicator = false, active = false, onClick }: TechCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
            onClick={onClick}
            className={cn(
                "relative p-8 rounded-[2rem] border transition-all duration-300 group cursor-pointer overflow-hidden",
                active
                    ? "bg-[#254133] border-[#2F5240] text-white"
                    : "bg-white border-[#E5E5E5] text-slate-800 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)]",
                className
            )}
        >
            {/* Background Pattern for Active Card */}
            {active && (
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
            )}

            {/* Header: SysID & Status */}
            {(sysId || statusIndicator) && (
                <div className="flex justify-between items-start mb-6">
                    {sysId && (
                        <div className={cn(
                            "text-[10px] font-mono tracking-wider px-2 py-1 rounded border uppercase",
                            active
                                ? "border-white/20 text-white/60"
                                : "border-green-600 text-green-700 font-bold"
                        )}>
                            {sysId}
                        </div>
                    )}
                    {statusIndicator && (
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            active ? "bg-[#4ADE80] animate-pulse" : "bg-slate-300"
                        )} />
                    )}
                </div>
            )}

            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>
        </motion.div>
    );
}
