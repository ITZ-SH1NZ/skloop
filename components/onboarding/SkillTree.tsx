"use client";

import { motion } from "framer-motion";
import { Trees, Network, Braces, Code2, Database, Layout, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";

const NODES = [
    { id: "root", label: "Fundamental Logic", x: 200, y: 50, icon: <Sparkles size={16} /> },
    { id: "web", label: "Web Core", x: 100, y: 150, icon: <Layout size={16} />, parent: "root" },
    { id: "dsa", label: "Logic Core (DSA)", x: 300, y: 150, icon: <Braces size={16} />, parent: "root" },
    { id: "front", label: "Architecture", x: 50, y: 250, icon: <Code2 size={16} />, parent: "web" },
    { id: "back", label: "Systems", x: 150, y: 250, icon: <Database size={16} />, parent: "web" },
    { id: "sort", label: "Sorting Logic", x: 250, y: 250, icon: <Network size={16} />, parent: "dsa" },
    { id: "trees", label: "Data Mastery", x: 350, y: 250, icon: <Trees size={16} />, parent: "dsa" },
    { id: "final", label: "Protocol Architect", x: 200, y: 350, icon: <Trophy size={16} />, parent: ["front", "back", "sort", "trees"] }
];

export const SkillTree = () => {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <section className="py-60 bg-zinc-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-10" />

            <div className="container mx-auto px-8 relative z-10 flex flex-col items-center">
                <div className="text-center max-w-4xl mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8">
                        <Network size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 italic">Mastery Graph // V1.0</span>
                    </div>
                    <h2 className="text-[clamp(3.5rem,8.5vw,9rem)] font-black tracking-tighter mb-8 leading-none">
                        THE TECHNICAL <br />
                        <span className="text-primary italic italic">TREE.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto">
                        Your roadmap isn't a list—it's a path through technical logic. Unlock nodes, earn badges, and close the loop.
                    </p>
                </div>

                <div className="relative w-full max-w-4xl aspect-[4/5] md:aspect-[4/3] bg-zinc-900/50 rounded-[4rem] border-4 border-white/5 backdrop-blur-3xl p-12 overflow-hidden shadow-edge">
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                        {/* Connection Lines */}
                        {NODES.map((node) => {
                            if (!node.parent) return null;
                            const parents = Array.isArray(node.parent) ? node.parent : [node.parent];
                            return parents.map((parentId) => {
                                const parent = NODES.find(n => n.id === parentId);
                                if (!parent) return null;
                                return (
                                    <motion.line
                                        key={`${parentId}-${node.id}`}
                                        x1={parent.x}
                                        y1={parent.y}
                                        x2={node.x}
                                        y2={node.y}
                                        stroke={hovered === node.id || hovered === parentId ? "#D4F268" : "rgba(255,255,255,0.1)"}
                                        strokeWidth={hovered === node.id || hovered === parentId ? "3" : "1.5"}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5 }}
                                    />
                                );
                            });
                        })}

                        {/* Skill Nodes */}
                        {NODES.map((node) => (
                            <motion.g
                                key={node.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
                                onMouseEnter={() => setHovered(node.id)}
                                onMouseLeave={() => setHovered(null)}
                                className="cursor-pointer group"
                            >
                                <motion.circle
                                    cx={node.x}
                                    cy={node.y}
                                    r="18"
                                    fill={hovered === node.id ? "#D4F268" : "#1A1A1A"}
                                    stroke={hovered === node.id ? "#D4F268" : "rgba(255,255,255,0.2)"}
                                    strokeWidth="4"
                                    animate={{
                                        scale: hovered === node.id ? 1.2 : 1,
                                        boxShadow: hovered === node.id ? "0 0 20px rgba(212,242,104,0.5)" : "none"
                                    }}
                                />
                                <foreignObject x={node.x - 10} y={node.y - 10} width="20" height="20">
                                    <div className={`w-full h-full flex items-center justify-center ${hovered === node.id ? 'text-zinc-900' : 'text-primary'}`}>
                                        {node.icon}
                                    </div>
                                </foreignObject>

                                {/* Label Tooltip */}
                                <motion.text
                                    x={node.x}
                                    y={node.y + 35}
                                    textAnchor="middle"
                                    className={`text-[8px] font-black uppercase tracking-widest ${hovered === node.id ? 'fill-primary' : 'fill-zinc-500'}`}
                                >
                                    {node.label}
                                </motion.text>
                            </motion.g>
                        ))}
                    </svg>

                    {/* Right-Side Data Detail HUD */}
                    <div className="absolute top-10 right-10 flex flex-col items-end gap-1 opacity-20 pointer-events-none">
                        <div className="text-[8px] font-black uppercase tracking-[0.4em]">PATHWAY_001_ACTIVE</div>
                        <div className="h-[2px] w-24 bg-primary" />
                        <div className="text-[8px] font-mono tracking-tighter">NODE_SYNC: OK</div>
                    </div>
                </div>

                <div className="mt-20 flex gap-8 items-center text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Mastery Nodes
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-white/20" />
                        Locked Protocols
                    </div>
                </div>
            </div>
        </section>
    );
};
