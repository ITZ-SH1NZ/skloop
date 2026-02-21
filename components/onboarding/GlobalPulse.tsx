"use client";

import { motion } from "framer-motion";
import { Activity, Globe, Zap, Shield, Users } from "lucide-react";

const PULSE_EVENTS = [
    { id: 1, text: "USER_882 SYNCED: ARRAY_MANIPULATION (98% EFFICIENCY)" },
    { id: 2, text: "PROTOCOL_ALPHA: 12 NEW MENTORS INITIALIZED" },
    { id: 3, text: "GLOBAL_UPTIME: 99.999% // LATENCY_STABLE" },
    { id: 4, text: "USER_441 EARNED BADGE: [DISTRIBUTED_SENTINEL]" },
    { id: 5, text: "AI_LOOPY: ROADMAP_GEN_LOAD_BALANCED" },
    { id: 6, text: "PEER_NETWORK: 1.2k ACTIVE THREADS" },
    { id: 7, text: "SYSTEM: KERNEL_UPDATE_COMPLETE // V1.0.4" },
    { id: 8, text: "USER_102 LEVEL_CAP_REACHED: [WEB_ARCHITECT]" }
];

export const GlobalPulse = () => {
    return (
        <div className="w-full bg-zinc-900 border-y border-white/5 py-4 overflow-hidden relative group">
            <div className="flex whitespace-nowrap">
                {/* Loop twice for seamless scrolling */}
                <motion.div
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="flex items-center gap-12 px-6"
                >
                    {[...PULSE_EVENTS, ...PULSE_EVENTS].map((event, idx) => (
                        <div key={`${event.id}-${idx}`} className="flex items-center gap-4 group/item">
                            <EventIcon idx={idx} />
                            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 group-hover/item:text-primary transition-colors uppercase">
                                {event.text}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Gradient Mask for Fade Effect */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-900 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-900 to-transparent z-10" />
        </div>
    );
};

function EventIcon({ idx }: { idx: number }) {
    const icons = [
        <Activity size={12} className="text-primary" />,
        <Globe size={12} className="text-blue-400" />,
        <Zap size={12} className="text-amber-400" />,
        <Shield size={12} className="text-indigo-400" />,
        <Users size={12} className="text-emerald-400" />
    ];
    return icons[idx % icons.length];
}
