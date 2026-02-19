"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";
import LessonItem, { LessonProps } from "./LessonItem";
import { Check, Lock } from "lucide-react";

interface KineticModuleProps {
    moduleNumber: number;
    title: string;
    description: string;
    lessons: LessonProps[];
    status: "locked" | "in-progress" | "completed";
    index: number;
    totalModules: number;
}

export default function KineticModule({ moduleNumber, title, description, lessons, status, index, totalModules }: KineticModuleProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "start start"]
    });

    // Parallax logic for card content
    const yParallax = useTransform(scrollYProgress, [0, 1], [50, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 1]);

    const isLocked = status === "locked";
    const isCompleted = status === "completed";

    // Dynamic stacking offset
    // The top-spacing ensures cards stack with a bit of the previous card visible
    const topOffset = 120 + (index * 60);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div
            ref={cardRef}
            className="sticky mb-12 md:mb-24 last:mb-48"
            style={{
                top: `${topOffset}px`,
                zIndex: index,
                // Adjust height to allow next card to overlap correctly in flow
                minHeight: '60vh'
            }}
        >
            <motion.div
                style={{ scale: isLocked ? 1 : scale, opacity: isLocked ? 0.6 : opacity }}
                className={`
                    relative overflow-hidden rounded-[2.5rem] border backdrop-blur-sm transition-shadow duration-500
                    ${isLocked
                        ? "bg-zinc-100/80 border-zinc-200"
                        : "bg-white/90 border-white/40 shadow-2xl shadow-zinc-200/50 hover:shadow-zinc-300/60"
                    }
                `}
            >
                {/* Decorative Number Background */}
                <div className="absolute -right-4 -top-10 text-[15rem] font-black text-zinc-900/[0.03] select-none pointer-events-none leading-none">
                    {String(moduleNumber).padStart(2, '0')}
                </div>

                <div className="p-8 md:p-12 relative z-10 grid md:grid-cols-[1fr_1.5fr] gap-8 md:gap-16">
                    {/* Left Column: Info */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border
                                    ${isCompleted ? "bg-emerald-100 text-emerald-600 border-emerald-200" : isLocked ? "bg-zinc-200 text-zinc-400 border-zinc-300" : "bg-black text-lime-400 border-black"}
                                `}>
                                    {isCompleted ? <Check size={20} /> : isLocked ? <Lock size={20} /> : moduleNumber}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                    Module {String(moduleNumber).padStart(2, '0')}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-4 leading-tight">
                                {title}
                            </h2>
                            <p className="text-zinc-500 text-lg leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Lessons */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView={!isLocked ? "visible" : undefined}
                        viewport={{ once: true }}
                        className={`space-y-2 ${isLocked ? "opacity-50 blur-[2px] pointer-events-none select-none" : ""}`}
                    >
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-100 pb-2">
                            Curriculum
                        </div>
                        {lessons.map((lesson) => (
                            <motion.div key={lesson.id} variants={itemVariants}>
                                <LessonItem {...lesson} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Status Bar */}
                {!isLocked && (
                    <div className="h-1.5 w-full bg-zinc-100 absolute bottom-0 left-0">
                        <motion.div
                            className={`h-full ${isCompleted ? "bg-emerald-500" : "bg-lime-500"}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: isCompleted ? "100%" : "35%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}
