"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";

const COURSES = [
    { title: "NEXT.JS 15 MASTERY", author: "LEE ROB", students: "12K" },
    { title: "RUST ARCHITECTURE", author: "PRIMEAGEN", students: "8.5K" },
    { title: "CSS ARTISTRY", author: "LYNN FISHER", students: "15K" },
    { title: "AI AGENTS 101", author: "HARRISON CHASE", students: "9K" },
    { title: "WEBGL SHADERS", author: "BRUNO SIMON", students: "22K" },
    { title: "SYSTEMS DESIGN", author: "ALEX XU", students: "18K" },
];

export default function TrendingGallery() {
    return (
        <div className="w-full overflow-hidden bg-black text-[#D4F268] py-3 border-y border-white/10 relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex gap-16 item-center font-black text-4xl tracking-tighter"
                    animate={{ x: [0, -1000] }}
                    transition={{ ease: "linear", duration: 20, repeat: Infinity }}
                >
                    {[...COURSES, ...COURSES, ...COURSES].map((course, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer hover:text-white transition-colors">
                            <span>{course.title}</span>
                            <span className="text-xs font-mono text-white/50 border border-white/20 px-1 rounded">
                                {course.author}
                            </span>
                            <ArrowUpRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
