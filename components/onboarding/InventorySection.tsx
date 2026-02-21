"use client";

import { motion } from "framer-motion";
import {
    Award,
    Zap,
    Shield,
    Cpu,
    Database,
    Network,
    Sparkles,
    CheckCircle2,
    MousePointer2,
    Palette
} from "lucide-react";

const ARTIFACTS = [
    { name: "Logic Seal", icon: <Shield />, type: "Badge", tier: "Legendary", color: "text-amber-500", shadow: "shadow-amber-500/20" },
    { name: "Kernel Overdrive", icon: <Zap />, type: "Theme", tier: "Elite", color: "text-primary", shadow: "shadow-primary/20" },
    { name: "System Pointer", icon: <MousePointer2 />, type: "Cursor", tier: "Rare", color: "text-blue-500", shadow: "shadow-blue-500/20" },
    { name: "DB_SENTINEL", icon: <Database />, type: "Badge", tier: "Elite", color: "text-indigo-500", shadow: "shadow-indigo-500/20" },
    { name: "NEURAL_LINK", icon: <Network />, type: "Customization", tier: "Rare", color: "text-emerald-500", shadow: "shadow-emerald-500/20" },
    { name: "ARCHITECT_HUD", icon: <Palette />, type: "Theme", tier: "Legendary", color: "text-rose-500", shadow: "shadow-rose-500/20" },
];

export const InventorySection = () => {
    return (
        <section className="py-60 px-8 bg-white border-y border-zinc-100 relative overflow-hidden">
            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full mb-8">
                        <Award size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 italic">Artifact Inventory</span>
                    </div>
                    <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black tracking-tighter mb-12 leading-none">
                        TECHNICAL <br />
                        <span className="text-zinc-400 italic">ARTIFACTS.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Mastery is rewarded with physicality. Unlock rare technical badges, custom cursors, and system-wide themes as you progress through the protocol.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {ARTIFACTS.map((item, idx) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="flex flex-col items-center group"
                        >
                            <div className={`w-full aspect-square bg-[#FDFCF8] rounded-[2.5rem] border-4 border-zinc-100 flex items-center justify-center mb-6 relative transition-all group-hover:border-zinc-900 group-hover:shadow-2xl ${item.shadow}`}>
                                <div className={`text-5xl transition-transform group-hover:scale-125 ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-white">
                                    <CheckCircle2 size={14} className="text-primary" />
                                </div>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">{item.type}</div>
                            <div className="font-black text-sm tracking-tight text-zinc-900 mb-1">{item.name}</div>
                            <div className={`text-[8px] font-mono font-bold tracking-widest uppercase ${item.tier === 'Legendary' ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {item.tier}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Theme Customization Preview (Compact HUD) */}
                <div className="mt-40 p-12 bg-zinc-900 rounded-[4rem] border-8 border-zinc-800 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-dot-pattern opacity-10" />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                        <div className="md:col-span-2">
                            <h4 className="text-3xl font-black tracking-tighter text-white mb-6">Total Customization Logic.</h4>
                            <p className="text-zinc-400 font-medium leading-relaxed max-w-lg">
                                Your IDE, your dashboard, and your roadmap—everything is themeable. Select from high-contrast 'Sentinel' modes or minimalist 'Architect' palettes.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary border-4 border-white shadow-xl rotate-3" />
                            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-4 border-white shadow-xl -rotate-6" />
                            <div className="w-16 h-16 rounded-2xl bg-blue-500 border-4 border-white shadow-xl rotate-12" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
