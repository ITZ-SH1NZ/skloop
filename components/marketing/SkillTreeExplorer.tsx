"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Database, Code, Server, Flame, GitBranch } from "lucide-react";

export default function SkillTreeExplorer() {
    const constraintsRef = useRef(null);

    return (
        <section className="relative w-full max-w-6xl mx-auto px-2 md:px-6 mb-20 overflow-hidden">
            <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase">Unearth The Skill Tree</h2>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-black text-white rounded-full border-2 border-lime-400">
                    <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                    <span className="font-bold text-sm tracking-widest uppercase">Click & Drag to Explore</span>
                </div>
            </div>

            {/* Viewport for panning */}
            <div
                ref={constraintsRef}
                className="w-full h-[400px] md:h-[600px] bg-zinc-950 border-4 md:border-8 border-black rounded-[2rem] shadow-[12px_12px_0_0_#000] overflow-hidden relative"
                style={{ cursor: "grab" }}
                onMouseDown={(e) => (e.currentTarget.style.cursor = "grabbing")}
                onMouseUp={(e) => (e.currentTarget.style.cursor = "grab")}
                onMouseLeave={(e) => (e.currentTarget.style.cursor = "grab")}
            >
                {/* 
                  The draggable canvas inside. 
                  It's larger than the viewport so we can drag it around.
                */}
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.2}
                    className="absolute top-1/2 left-1/2 w-[1200px] h-[1000px] -translate-x-1/2 -translate-y-1/2"
                >
                    {/* Background Grid Texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

                    {/* SVG Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <g stroke="#3f3f46" strokeWidth="4" strokeDasharray="8 8" fill="none">
                            {/* Core to branches */}
                            <path d="M 600,400 L 400,600" />
                            <path d="M 600,400 L 800,600" />
                            <path d="M 600,400 L 600,200" />

                            {/* Sub branches */}
                            <path d="M 400,600 L 250,700" />
                            <path d="M 400,600 L 500,800" />
                            <path d="M 800,600 L 950,700" />
                        </g>

                        {/* Active/Glowing Paths */}
                        <g stroke="#a3e635" strokeWidth="4" fill="none" className="drop-shadow-[0_0_8px_#a3e635]">
                            <path d="M 600,400 L 400,600" />
                            <path d="M 400,600 L 500,800" />
                        </g>
                    </svg>


                    {/* SKILL NODES */}

                    {/* The Core Node */}
                    <SkillNode
                        x={600} y={400}
                        icon={<Code className="w-8 h-8 text-black" />}
                        title="Web Dev Fundamentals"
                        status="unlocked"
                    />

                    {/* The Frontend Branch */}
                    <SkillNode
                        x={400} y={600}
                        icon={<Flame className="w-8 h-8 text-black" />}
                        title="React.js Mastery"
                        status="unlocked"
                    />
                    <SkillNode
                        x={250} y={700}
                        icon={<Code className="w-8 h-8 text-zinc-500" />}
                        title="Framer Motion"
                        status="locked"
                    />
                    <SkillNode
                        x={500} y={800}
                        icon={<Server className="w-8 h-8 text-black" />}
                        title="Next.js Fullstack"
                        status="unlocked"
                    />

                    {/* The Backend Branch */}
                    <SkillNode
                        x={800} y={600}
                        icon={<Database className="w-8 h-8 text-zinc-500" />}
                        title="Database Architecture"
                        status="locked"
                    />
                    <SkillNode
                        x={950} y={700}
                        icon={<Server className="w-8 h-8 text-zinc-500" />}
                        title="System Design"
                        status="locked"
                    />

                    {/* The Tools Branch */}
                    <SkillNode
                        x={600} y={200}
                        icon={<GitBranch className="w-8 h-8 text-zinc-500" />}
                        title="Version Control"
                        status="locked"
                    />

                </motion.div>
            </div>
        </section>
    );
}

function SkillNode({ x, y, icon, title, status }: { x: number, y: number, icon: React.ReactNode, title: string, status: "locked" | "unlocked" }) {
    const isUnlocked = status === "unlocked";

    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
            style={{ left: x, top: y }}
        >
            <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_#000] rotate-45 transition-transform group-hover:scale-110 ${isUnlocked ? 'bg-lime-400' : 'bg-zinc-800'}`}>
                {/* Un-rotate the icon container */}
                <div className="-rotate-45">
                    {icon}
                </div>

                {/* Glowing ring if unlocked */}
                {isUnlocked && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-lime-400 animate-ping -z-10" />
                )}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 bg-black text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border-2 border-zinc-700 pointer-events-none text-center">
                <span className={`block text-xs uppercase mb-1 ${isUnlocked ? 'text-lime-400' : 'text-zinc-500'}`}>
                    {isUnlocked ? "Unlocked" : "Locked Node"}
                </span>
                {title}
            </div>
        </div>
    );
}
