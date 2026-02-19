"use client";

import { motion } from "framer-motion";
import { Award, Code2, Zap, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

// TODO: Fetch timeline from backend
const TIMELINE_DATA: any[] = [];

export function Timeline() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="relative">
                {/* Center Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

                <div className="space-y-12">
                    {TIMELINE_DATA.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={cn(
                                "relative flex flex-col md:flex-row gap-8 items-center",
                                i % 2 === 0 ? "md:flex-row-reverse" : ""
                            )}
                        >
                            {/* Content Side */}
                            <div className="flex-1 w-full pl-16 md:pl-0">
                                <div className={cn(
                                    "bg-white p-6 rounded-2xl border shadow-sm transition-shadow hover:shadow-md relative",
                                    item.border
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", item.color)}>{item.subtitle}</p>
                                        </div>
                                        <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.year}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">{item.desc}</p>

                                    {/* Arrow connecting to center */}
                                    <div className={cn(
                                        "hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b border-l rotate-45",
                                        i % 2 === 0 ? "-left-2 border-gray-200" : "-right-2 border-t border-r border-b-0 border-l-0 border-gray-200"
                                    )} />
                                </div>
                            </div>

                            {/* Center Icon */}
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-gray-50 shadow-sm z-10">
                                <item.icon className={cn("w-5 h-5", item.color)} />
                            </div>

                            {/* Empty Side (Spacer) */}
                            <div className="flex-1 hidden md:block" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
