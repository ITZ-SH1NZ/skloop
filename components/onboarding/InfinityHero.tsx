"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Cpu, Database, Network, Zap } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const InfinityHero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const loopRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const shapesRef = useRef<HTMLDivElement>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Initial Path Animation
            const path = pathRef.current;
            if (path) {
                const length = path.getTotalLength();
                gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

                const tl = gsap.timeline({
                    onComplete: () => setIsLoaded(true)
                });

                tl.to(path, {
                    strokeDashoffset: 0,
                    duration: 2.5,
                    ease: "power2.inOut"
                })
                    .to(loopRef.current, {
                        scale: 1.1,
                        duration: 1,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });

                // 2. Scroll-driven transition
                const scrollTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "+=125%",
                        pin: true,
                        scrub: 1,
                        anticipatePin: 1,
                    }
                });

                // Force a refresh after a small delay to ensure scroller calculations are correct
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 100);

                scrollTl
                    .to(loopRef.current, {
                        scale: 15,
                        opacity: 0,
                        duration: 2,
                        ease: "power2.in"
                    })
                    .to(shapesRef.current, {
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                    }, "-=1.5")
                    .to(contentRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out"
                    }, "-=1");
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center bg-[#FDFCF8] overflow-hidden">
            {/* The Infinity Loop Entrance */}
            <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                <svg
                    ref={loopRef}
                    width="400"
                    height="200"
                    viewBox="0 0 400 200"
                    fill="none"
                    className="w-[300px] md:w-[600px] drop-shadow-[0_0_30px_rgba(212,242,104,0.3)]"
                >
                    <path
                        ref={pathRef}
                        d="M100,100 C100,20 180,20 200,100 C220,180 300,180 300,100 C300,20 220,20 200,100 C180,180 100,180 100,100 Z"
                        stroke="#1A1A1A"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    <circle cx="200" cy="100" r="6" fill="#D4F268" className="animate-pulse" />
                </svg>
            </div>

            {/* Tactical Tech Shapes (Post-Loop State - Similar to Auth Pattern) */}
            <div ref={shapesRef} className="absolute inset-0 opacity-0 scale-90 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] rotate-12 opacity-10">
                    <Cpu size={300} className="text-zinc-900" />
                </div>
                <div className="absolute bottom-[5%] right-[2%] -rotate-6 opacity-10">
                    <Database size={400} className="text-zinc-900" />
                </div>
                <div className="absolute top-[20%] right-[10%] rotate-45 opacity-10">
                    <Network size={200} className="text-zinc-900" />
                </div>
                {/* Background Grid Accent */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />
            </div>

            {/* Main Content (Revealed by Infinity) */}
            <div ref={contentRef} className="relative z-10 opacity-0 transform translate-y-20 flex flex-col items-center text-center px-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 md:bg-zinc-900 border border-white/10 shadow-2xl mb-12"
                >
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2">
                        System Protocol 1.0 // Active
                    </span>
                </motion.div>

                <h1 className="text-[clamp(4rem,12vw,11rem)] font-black tracking-tighter leading-[0.8] mb-12 select-none text-zinc-900">
                    THE INFINITY <br />
                    <span className="text-primary italic">PROTOCOL.</span>
                </h1>

                <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl leading-relaxed mb-16 px-4">
                    Close the loop on your technical career.
                    Real-world tracks. Peer mentorship. Direct implementation.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 will-change-transform">
                    <Link href="/signup">
                        <button className="group relative px-8 md:px-12 py-4 md:py-6 bg-zinc-900 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]">
                            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <span className="relative flex items-center gap-3 group-hover:text-zinc-900 transition-colors">
                                ENTER THE LOOP <ArrowRight size={20} className="md:w-6 md:h-6" />
                            </span>
                        </button>
                    </Link>

                    <Link href="/manifesto">
                        <button className="px-8 md:px-12 py-4 md:py-6 bg-transparent text-zinc-900 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl border-4 border-zinc-100 transition-all hover:border-primary hover:bg-white/50 backdrop-blur-sm">
                            READ MANIFESTO
                        </button>
                    </Link>
                </div>

                {/* Status Bar Mockup */}
                <div className="mt-20 flex items-center gap-12 opacity-20 text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Local_Sync: OK
                    </div>
                    <div>Latency: 2ms</div>
                    <div className="hidden md:block">Buffer_Ratio: 1.2</div>
                </div>
            </div>
        </section>
    );
};
