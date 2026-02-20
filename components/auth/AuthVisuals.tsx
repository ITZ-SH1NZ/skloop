"use client";

import { motion } from "framer-motion";

export function AuthVisuals() {
    return (
        <div className="relative w-full h-full bg-[#f8f9fa] overflow-hidden flex items-center justify-center border-r border-zinc-200">
            {/* The Grid Floor */}
            <div className="absolute inset-0 perspective-[1000px]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-60"
                    style={{ transform: "rotateX(60deg) scale(2) translateY(-20%)" }}
                />
            </div>

            {/* Floating Primitives (Nintendo/Playstation Shape Vibe) */}
            <motion.div
                animate={{
                    y: [-20, 20, -20],
                    rotate: [0, 10, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-32 h-32 bg-lime-300 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(212,242,104,0.4)] backdrop-blur-xl border-4 border-white transform rotate-12 flex items-center justify-center"
            >
                <div className="w-12 h-12 bg-white rounded-full" />
            </motion.div>

            <motion.div
                animate={{
                    y: [20, -20, 20],
                    rotate: [0, -10, 0],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-zinc-900 rounded-[2rem] shadow-2xl transform -rotate-6 flex items-center justify-center z-0"
            >
                <div className="w-20 h-2 bg-lime-400 rounded-full" />
            </motion.div>

            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-zinc-200 rounded-full flex items-center justify-center"
            >
                <div className="w-48 h-48 border-2 border-zinc-200 rounded-full border-dashed animate-spin-slow" />
            </motion.div>

            {/* Main Title Overlay */}
            <div className="relative z-10 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="inline-block px-6 py-2 rounded-full bg-white text-black text-sm font-black uppercase tracking-widest shadow-lg border border-zinc-100"
                >
                    Ready to level up?
                </motion.div>

                <div className="relative">
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                        className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 tracking-tighter select-none"
                    >
                        SKLOOP
                    </motion.h1>
                    {/* Shadow Layer for Depth */}
                    <h1 className="absolute top-1 left-1 text-8xl md:text-9xl font-black text-zinc-100 tracking-tighter select-none -z-10 blur-[1px]">
                        SKLOOP
                    </h1>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-zinc-700 font-semibold tracking-wide text-lg max-w-md mx-auto relative z-20"
                >
                    Learn. Teach. Level up.
                </motion.p>
            </div>
        </div>
    );
}
