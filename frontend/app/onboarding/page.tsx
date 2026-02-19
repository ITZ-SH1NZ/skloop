"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Sparkles, Users, Repeat, Zap, Palette, Code, Languages, Dumbbell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SmoothScroll from "@/components/SmoothScroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from "framer-motion";
import { wrap } from "@motionone/utils";
import { BackgroundController, FloatingGradients } from "@/components/onboarding/BackgroundController";
import MagneticButton from "@/components/MagneticButton";
import SpotlightCard from "@/components/SpotlightCard";
import Cursor from "@/components/Cursor";
import Logo from "@/components/Logo";

export default function OnboardingPage() {
    return (
        <SmoothScroll>
            <div className="min-h-[100dvh] text-foreground font-sans selection:bg-primary selection:text-black overflow-x-hidden relative cursor-none">
                <Cursor />
                <BackgroundController />
                <FloatingGradients />

                {/* Background Logo Watermark */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.03] z-0 blur-3xl">
                    <Logo className="w-full h-full text-foreground" />
                </div>

                <Navbar />
                <NoiseOverlay />

                <HeroSection />
                <SkillTicker />
                <HowItWorksSticky />
                <InteractiveSkillSwap />
                <CommunityCTA />
                <ContactSection />

                <Footer />
            </div>
        </SmoothScroll>
    );
}

// ✅ Character-by-character animation with human imperfections
function AnimatedText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
    const characters = text.split("");

    return (
        <h1 className={cn("overflow-hidden", className)}>
            {characters.map((char, i) => {
                // ✨ Human touch: add randomness for organic feel
                const randomDelay = delay + (i * 0.03) + (Math.random() * 0.02 - 0.01); // Slight random variation
                const randomY = Math.random() * 10 - 5; // Random y offset between -5 and 5
                const randomRotate = Math.random() * 2 - 1; // Tiny rotation wobble

                return (
                    <motion.span
                        key={i}
                        initial={{
                            opacity: 0,
                            y: 40 + randomY, // Imperfect starting position
                            rotateZ: randomRotate * 2 // Slight initial tilt
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            rotateZ: 0
                        }}
                        transition={{
                            duration: 0.5,
                            delay: randomDelay,
                            ease: [0.23, 1, 0.32, 1], // Custom easing for natural feel
                            // ✨ Slight overshoot for humanness
                            y: { type: "spring", stiffness: 200, damping: 15 },
                        }}
                        className="inline-block"
                        style={{ display: char === " " ? "inline" : "inline-block" }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                );
            })}
        </h1>
    );
}


function NoiseOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] mix-blend-overlay hidden md:block"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
    )
}

// ... existing code ...

// ✅ STABLE PATTERN: Framer Motion for simple entry animations (no ScrollTrigger needed)
function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // ✅ useLayoutEffect + gsap.context for ScrollTrigger animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // ✅ Responsive: only enable parallax on desktop
            ScrollTrigger.matchMedia({
                // Desktop
                "(min-width: 768px)": () => {
                    gsap.to(contentRef.current, {
                        yPercent: 30, // ✅ Reduced from 50 for stability
                        ease: "none",
                        scrollTrigger: {
                            id: "hero-parallax",
                            trigger: containerRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: 1, // ✅ Slight scrub value for smoothness
                            invalidateOnRefresh: true, // ✅ Recalculate on refresh
                        }
                    });
                },
                // Mobile: no parallax
                "(max-width: 767px)": () => {
                    // No animation on mobile
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative pt-32 pb-32 md:pt-48 md:pb-48 min-h-screen flex items-center justify-center overflow-hidden">
            {/* 3D Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="float-1 absolute top-[10%] right-[5%] w-48 h-48 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-primary to-[#add431] shadow-[0_40px_80px_rgba(212,242,104,0.3)] blur-3xl opacity-40 z-0 animate-pulse" />
                <div className="float-2 absolute bottom-[10%] left-[-5%] w-64 h-64 md:w-[30rem] md:h-[30rem] bg-gradient-to-tr from-blue-100 to-white rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.05)] z-0 rotate-12 opacity-60 backdrop-blur-3xl animate-pulse" />
                {/* Extra faded shape */}
                <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-orange-200/40 rounded-full blur-2xl opacity-50 mix-blend-multiply" />
            </div>

            <div ref={contentRef} className="container mx-auto px-4 relative z-10 text-center">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex justify-center w-full"
                    >
                        <Badge className="mb-8 bg-white/80 backdrop-blur-sm shadow-sm border-black/5 text-sm py-2 px-6 rounded-full">
                            <Sparkles size={14} className="mr-2 text-primary fill-primary" />
                            Reshaping the Knowledge Economy
                        </Badge>
                    </motion.div>

                    {/* ✅ Framer Motion instead of GSAP for simple text animations */}
                    <motion.div
                        className="mb-10 leading-[0.85]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                            className="text-7xl md:text-9xl font-black tracking-tighter will-change-transform"
                            style={{ transform: "translate3d(0,0,0)" }}
                        >
                            Exchange Skills.
                        </motion.h1>
                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                            className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-lime-500 to-green-600 pb-4 will-change-transform"
                            style={{ transform: "translate3d(0,0,0)" }}
                        >
                            Connect Minds.
                        </motion.h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-2xl md:text-3xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium"
                    >
                        The world's first decentralized skill exchange protocol.
                        <br className="hidden md:block" /> No money. Just pure knowledge transfer.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/login">
                            <MagneticButton>
                                <Button size="lg" className="h-20 px-12 rounded-full text-xl font-bold shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all bg-foreground text-background hover:bg-foreground/90">
                                    Start Your Loop
                                    <ArrowRight className="ml-3 h-6 w-6" />
                                </Button>
                            </MagneticButton>
                        </Link>
                        <Link href="/docs">
                            <MagneticButton strength={0.3}>
                                <Button variant="outline" size="lg" className="h-20 px-12 rounded-full text-xl font-bold border-2 hover:bg-black/5 bg-transparent">
                                    View Documentation
                                </Button>
                            </MagneticButton>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

// ✅ Velocity-Responsive Ticker


function SkillTicker() {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    /**
     * This is a magic wrapping for the length of the text - you
     * have to replace for wrapping that works for you or dynamically
     * calculate
     */
    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * 1.5 * (delta / 1000); // Base speed

        /**
         * This is what changes the direction of the scroll once we
         * switch scrolling directions.
         */
        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="flex whitespace-nowrap overflow-hidden py-8 border-y border-black/5 bg-white/50 backdrop-blur-sm">
            <motion.div className="flex gap-12 text-5xl font-black uppercase tracking-widest opacity-10 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 w-max" style={{ x }}>
                {Array(8).fill("Design • Code • Cook • Speak • Dance • Write • Build • ").map((text, i) => (
                    <span key={i}>{text}</span>
                ))}
            </motion.div>
        </div>
    );
}

const HOW_IT_WORKS_STEPS = [
    {
        number: "01",
        title: "List Your Skills",
        description: "Your expertise is your currency. Whether it's Quantum Physics or Sourdough Baking, someone wants to learn it.",
        icon: <Sparkles className="w-12 h-12 text-primary" />,
        color: "bg-blue-50"
    },
    {
        number: "02",
        title: "Find a Match",
        description: "Our AI matching engine pairs you with people who have the skills you need and need the skills you have.",
        icon: <Users className="w-12 h-12 text-blue-500" />,
        color: "bg-purple-50"
    },
    {
        number: "03",
        title: "Close the Loop",
        description: "Connect, schedule a session, and exchange knowledge. Build your reputation and unlock exclusive community perks.",
        icon: <Repeat className="w-12 h-12 text-green-500" />,
        color: "bg-green-50"
    }
];

// ✅ STABLE PINNING PATTERN
// ✅ Deep Scroll / Z-Axis Tunnel Animation
function HowItWorksSticky() {
    const containerRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const card3Ref = useRef<HTMLDivElement>(null);
    const beamRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state: cards positioned deep in Z space
            // Card 1 is closest, Card 3 is furthest
            gsap.set([card1Ref.current, card2Ref.current, card3Ref.current], {
                z: (i) => -1000 * i,
                opacity: (i) => i === 0 ? 1 : 0,
                scale: (i) => i === 0 ? 1 : 0.5,
                filter: (i) => i === 0 ? "blur(0px)" : "blur(10px)"
            });

            // Beam initial state: faint and stretching into depth
            gsap.set(beamRef.current, { scaleY: 0, opacity: 0 });

            // Particles initial state
            gsap.set(particlesRef.current, { opacity: 0, z: -500 });

            ScrollTrigger.matchMedia({
                "(min-width: 768px)": () => {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top top",
                            end: "+=300%", // Longer scroll distance for deep effect
                            pin: true,
                            scrub: 1, // ✅ Slight scrub value for smoothness
                            anticipatePin: 1,
                        }
                    });

                    // ENTER: Beam grows and particles fade in
                    tl.to(beamRef.current, { scaleY: 1, opacity: 1, duration: 0.5 }, 0);
                    tl.to(particlesRef.current, { opacity: 0.5, z: 0, duration: 2 }, 0);

                    // 1. Move Card 1 forward and fade out (fly past camera)
                    tl.to(card1Ref.current, { z: 500, opacity: 0, scale: 1.5, filter: "blur(20px)", duration: 1, ease: "none" }, 0);

                    // 2. Bring Card 2 from -1000 to 0 (focus)
                    tl.to(card2Ref.current, { z: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "none" }, 0);

                    // 3. Bring Card 3 from -2000 to -1000 (closer but still bg)
                    tl.to(card3Ref.current, { z: -1000, opacity: 0.5, scale: 0.8, filter: "blur(5px)", duration: 1, ease: "none" }, 0);

                    // Pause for reading Card 2
                    tl.to({}, { duration: 0.5 });

                    // 4. Move Card 2 forward and fade out
                    tl.to(card2Ref.current, { z: 500, opacity: 0, scale: 1.5, filter: "blur(20px)", duration: 1, ease: "none" }, ">");

                    // 5. Bring Card 3 from -1000 to 0 (focus)
                    tl.to(card3Ref.current, { z: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "none" }, "<");

                    // Accelerate particle stream as we go deeper
                    tl.to(particlesRef.current, { z: 500, duration: 2, ease: "none" }, 0);
                },
                "(max-width: 767px)": () => {
                    // Mobile: Simple vertical stack
                    // Ensure cards are visible and stacked normally
                    gsap.set([card1Ref.current, card2Ref.current, card3Ref.current], {
                        clearProps: "all" // Clear all GSAP sets to revert to CSS layout
                    });
                    // Hide heavy effects on mobile
                    gsap.set([beamRef.current, particlesRef.current], { display: "none" });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} id="how-it-works" className="relative z-20 min-h-screen md:h-screen md:overflow-hidden perspective-2000 py-24 md:py-0 scroll-mt-32">

            {/* 3D Scene Container */}
            <div className="h-full flex flex-col items-center justify-center relative transform-style-3d">

                {/* Connecting Beam (Z-Axis Line) - Desktop Only */}
                <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none transform-style-3d origin-center">
                    <div ref={beamRef} className="w-[2px] h-[200vh] bg-gradient-to-b from-transparent via-primary/50 to-transparent rotate-x-90 transform-origin-center blur-sm" />
                </div>

                {/* Data Stream Particles (CSS-based Starfield) - Desktop Only */}
                <div ref={particlesRef} className="absolute inset-0 hidden md:block transform-style-3d pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[300vh] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    {/* Fake Particle Layers using radial gradients for performance */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vh] bg-[radial-gradient(circle_at_center,_var(--color-primary)_1px,_transparent_1.5px)] bg-[length:40px_40px] opacity-20 transform-style-3d" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] bg-[radial-gradient(circle_at_center,_var(--color-primary)_1px,_transparent_2px)] bg-[length:90px_90px] opacity-10 transform-style-3d rotate-12" />
                </div>

                {/* Header: Relative on both mobile and desktop to prevent overlap */}
                <div className="relative text-center w-full z-0 px-4 mb-16 md:mb-12">
                    <Badge variant="outline" className="mb-4 text-gray-500 border-gray-200 backdrop-blur-sm">System Architecture</Badge>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">How Skloop Works</h2>
                    <p className="text-xl text-gray-500 hidden md:block">Scroll to explore the tunnel.</p>
                </div>

                {/* Cards Container */}
                <div className="relative w-full max-w-5xl flex flex-col md:block md:h-[60vh] px-4 gap-8 md:gap-0">
                    {/* Card 1 */}
                    <div ref={card1Ref} className="relative w-full md:absolute md:inset-0 z-30 transform-style-3d">
                        <HowItWorksCard step={HOW_IT_WORKS_STEPS[0]} />
                    </div>

                    {/* Card 2 */}
                    <div ref={card2Ref} className="relative w-full md:absolute md:inset-0 z-20 transform-style-3d">
                        <HowItWorksCard step={HOW_IT_WORKS_STEPS[1]} />
                    </div>

                    {/* Card 3 */}
                    <div ref={card3Ref} className="relative w-full md:absolute md:inset-0 z-10 transform-style-3d">
                        <HowItWorksCard step={HOW_IT_WORKS_STEPS[2]} />
                    </div>
                </div>
            </div>
        </section>
    );
}



function HowItWorksCard({ step }: { step: typeof HOW_IT_WORKS_STEPS[0] }) {
    return (
        <SpotlightCard className={cn("w-full min-h-[400px] md:h-full rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center", step.color)}>
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-white/60 backdrop-blur-sm h-full w-full">
                {/* Number: Adjusted position to prevent overlap */}
                <span className="text-8xl font-black text-black/5 absolute top-2 right-4 md:left-6 md:right-auto md:top-4 select-none pointer-events-none">
                    {step.number}
                </span>

                {/* Icon Container: Added mt-8 to ensure clearance on mobile if needed */}
                <div className="inline-block p-4 rounded-2xl bg-white shadow-sm mb-6 w-fit border border-black/5 relative z-10 mt-8 md:mt-0">
                    {step.icon}
                </div>

                <h3 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">{step.title}</h3>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium relative z-10">
                    {step.description}
                </p>
            </div>

            <div className="flex-1 h-full w-full min-h-[300px] relative overflow-hidden bg-white/40 flex items-center justify-center p-8">
                {step.number === "01" && (
                    <div className="space-y-4 w-3/4 scale-110">
                        <div className="h-4 bg-gray-200/50 rounded-full w-1/2" />
                        <div className="h-32 bg-white rounded-xl w-full shadow-lg p-4">
                            <div className="h-full w-full bg-blue-50/50 rounded-lg animate-pulse" />
                        </div>
                    </div>
                )}
                {step.number === "02" && (
                    <div className="relative scale-110">
                        <div className="w-40 h-40 rounded-full bg-white shadow-xl flex items-center justify-center">
                            <Zap className="w-16 h-16 text-primary fill-current" />
                        </div>
                        <div className="text-xs absolute -right-4 -bottom-4 bg-black text-white px-3 py-1 rounded-full font-bold shadow-lg">
                            Match Found!
                        </div>
                    </div>
                )}
                {step.number === "03" && (
                    <div className="scale-110 relative">
                        <div className="w-48 h-48 border-[12px] border-green-500 rounded-full border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Repeat className="w-16 h-16 text-green-600" />
                        </div>
                    </div>
                )}
            </div>
        </SpotlightCard>
    );
}

// ✅ Precision Skill Cycler Implementation
function InteractiveSkillSwap() {
    const [isSpinning, setIsSpinning] = useState(false);
    const [match, setMatch] = useState({ teach: "Design", learn: "Code" });

    const SKILLS_LIST = ["Design", "Code", "Cook", "Speak", "Write", "Dance", "Build", "Paint"];

    const handleSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);

        // Simulate network/matching delay
        setTimeout(() => {
            // 1. Pick a random 'Teach' skill that is DIFFERENT from the current one (no consecutive repeats)
            let newTeach = match.teach;
            while (newTeach === match.teach) {
                newTeach = SKILLS_LIST[Math.floor(Math.random() * SKILLS_LIST.length)];
            }

            // 2. Pick a random 'Learn' skill that is DIFFERENT from the new 'Teach' skill (no self-matching)
            // AND different from the current 'Learn' skill (no consecutive repeats)
            let newLearn = match.learn;
            // Filter out the teaching skill so we never pick it
            const availableLearnSkills = SKILLS_LIST.filter(skill => skill !== newTeach);

            while (newLearn === match.learn || newLearn === newTeach) {
                newLearn = availableLearnSkills[Math.floor(Math.random() * availableLearnSkills.length)];
            }

            setMatch({ teach: newTeach, learn: newLearn });
            setIsSpinning(false);
        }, 1500);
    };

    return (
        <section className="py-24 md:py-32 text-foreground relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Noise & Gradient */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 md:mb-16"
                >
                    <Badge variant="outline" className="border-black/10 text-black mb-6 px-4 py-1.5 backdrop-blur-md">
                        {/* Custom Pulse SVG */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-yellow-500">
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Live Matching Engine
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Find Your Loop.</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Spin the engine to see how the protocol matches supply and demand in real-time.
                    </p>
                </motion.div>

                {/* The Cycler Machine */}
                <div className="max-w-4xl mx-auto bg-white/40 border border-white/50 rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10 flex flex-row items-center justify-between gap-2 md:gap-8 bg-white/50 rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-6 border border-white/20 shadow-inner">

                        {/* Column 1: I Can Teach */}
                        <div className="flex-1 w-full relative h-[120px] md:h-64 bg-white/60 rounded-3xl border border-white/40 overflow-hidden flex flex-col items-center justify-center shadow-sm">
                            <span className="absolute top-3 md:top-4 text-[10px] md:text-xs font-bold tracking-widest text-gray-500 uppercase">I Can Teach</span>
                            <SkillTumbler
                                value={match.teach}
                                isSpinning={isSpinning}
                                direction={1}
                                skills={SKILLS_LIST}
                            />
                        </div>

                        {/* Center: Interaction */}
                        <div className="relative z-20 shrink-0">
                            <button
                                onClick={handleSpin}
                                disabled={isSpinning}
                                className="w-12 h-12 md:w-24 md:h-24 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group/btn"
                            >
                                <Repeat
                                    size={24}
                                    className={cn(
                                        "md:w-8 md:h-8 transition-transform duration-700 ease-in-out",
                                        isSpinning ? "rotate-180" : "group-hover/btn:rotate-180"
                                    )}
                                />
                            </button>
                        </div>

                        {/* Column 2: I Want To Learn */}
                        <div className="flex-1 w-full relative h-[120px] md:h-64 bg-white/60 rounded-3xl border border-white/40 overflow-hidden flex flex-col items-center justify-center shadow-sm">
                            <span className="absolute top-3 md:top-4 text-[10px] md:text-xs font-bold tracking-widest text-gray-500 uppercase">I Need To Learn</span>
                            <SkillTumbler
                                value={match.learn}
                                isSpinning={isSpinning}
                                direction={-1}
                                skills={SKILLS_LIST}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        Matching Nodes: 8,421
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Latency: 12ms
                    </div>
                </div>
            </div>
        </section>
    )
}

function SkillTumbler({ value, isSpinning, direction, skills }: { value: string, isSpinning: boolean, direction: number, skills: string[] }) {
    // Blur effect based on spin state
    const blurAmount = isSpinning ? "blur(4px)" : "blur(0px)";
    const opacity = isSpinning ? 0.5 : 1;
    const scale = isSpinning ? 0.9 : 1;

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout">
                {isSpinning ? (
                    // Spinning State (Looping list)
                    <motion.div
                        key="spinning"
                        initial={{ y: direction * 50 }}
                        animate={{ y: direction * -50 }}
                        transition={{
                            repeat: Infinity,
                            duration: 0.1,
                            ease: "linear"
                        }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-40 blur-sm will-change-transform"
                        style={{ transform: "translate3d(0,0,0)" }}
                    >
                        {skills.map((skill, i) => (
                            <span key={i} className="text-xl md:text-5xl font-black text-black/20">{skill}</span>
                        ))}
                    </motion.div>
                ) : (
                    // Static State (Locked Value)
                    <motion.div
                        key={value}
                        initial={{ y: direction * 50, opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            mass: 1.2
                        }}
                        className="text-xl md:text-6xl font-black text-foreground will-change-transform"
                        style={{ transform: "translate3d(0,0,0)" }}
                    >
                        {value}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanline / Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/5 -translate-y-1/2" />
        </div>
    )
}

function CommunityCTA() {
    return (
        <section id="community" className="py-32 relative overflow-hidden">
            {/* Background shapes */}
            <div className="absolute top-[10%] right-[5%] w-[30rem] h-[30rem] bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-[10%] left-[5%] w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none mix-blend-multiply" />

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto bg-white/40 backdrop-blur-2xl border border-white/50 p-12 md:p-24 rounded-[3rem] shadow-2xl relative overflow-hidden"
                >
                    {/* Inner Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/50 via-transparent to-white/10 pointer-events-none" />

                    <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-foreground relative z-10">
                        Join the Community.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-lime-600">
                            Start Together.
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed relative z-10">
                        Connect with thousands of learners and experts worldwide. Your loop starts here.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
                        {[
                            { title: "Global Network", desc: "Connect with peers from over 80 countries." },
                            { title: "Verified Skills", desc: "Earn badges that prove your expertise on-chain." },
                            { title: "Free Forever", desc: "Knowledge should be accessible. No hidden fees." }
                        ].map((item, i) => (
                            <SpotlightCard key={i} className="bg-white/50 border border-white/40 shadow-sm backdrop-blur-md">
                                <div className="p-6">
                                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                                    <p className="text-gray-600 text-sm">{item.desc}</p>
                                </div>
                            </SpotlightCard>
                        ))}
                    </div>

                    <Link href="/signup" className="relative z-10 block">
                        <Button size="lg" className="h-20 px-16 rounded-full text-xl font-bold bg-foreground text-background hover:bg-black/80 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full md:w-auto">
                            Join Skloop Now
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

function ContactSection() {
    return (
        <section id="contact" className="py-24 relative z-10 border-t border-black/5 bg-white/30 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* Left: Text & Socials */}
                    <div className="text-left">
                        <Badge variant="outline" className="border-black/10 text-black mb-6 px-4 py-1.5 backdrop-blur-md">
                            Get in Touch
                        </Badge>
                        <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Got a Question?</h3>
                        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                            We'd love to hear from you. Whether you have a question about features, pricing, or just want to say hi, our team is ready to answer all your questions.
                        </p>

                        <div className="space-y-6">
                            <a href="mailto:hello@skloop.com" className="flex items-center gap-4 text-lg font-medium text-gray-600 hover:text-black transition-colors group p-4 rounded-xl hover:bg-white/50 border border-transparent hover:border-black/5">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary flex items-center justify-center transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </div>
                                hello@skloop.com
                            </a>
                            <a href="#" className="flex items-center gap-4 text-lg font-medium text-gray-600 hover:text-black transition-colors group p-4 rounded-xl hover:bg-white/50 border border-transparent hover:border-black/5">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-400 flex items-center justify-center transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                                </div>
                                Twitter
                            </a>
                            <a href="#" className="flex items-center gap-4 text-lg font-medium text-gray-600 hover:text-black transition-colors group p-4 rounded-xl hover:bg-white/50 border border-transparent hover:border-black/5">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-purple-400 flex items-center justify-center transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" /></svg>
                                </div>
                                DiscordCommunity
                            </a>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 shadow-xl">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
                                    <input type="text" placeholder="John" className="w-full bg-white/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-gray-400" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
                                    <input type="text" placeholder="Doe" className="w-full bg-white/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <input type="email" placeholder="john@example.com" className="w-full bg-white/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-gray-400" />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                <textarea placeholder="Tell us what you need..." rows={4} className="w-full bg-white/50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium placeholder:text-gray-400 resize-none" />
                            </div>

                            <Button className="w-full h-14 rounded-xl text-lg font-bold bg-black text-white hover:bg-black/80 shadow-lg">
                                Send Message
                            </Button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    )
}

// Skill swap data
const SKILLS = [
    {
        id: "design",
        label: "Design",
        icon: <Palette className="w-6 h-6" />,
        color: "bg-pink-100",
        borderColor: "border-pink-500"
    },
    {
        id: "code",
        label: "Code",
        icon: <Code className="w-6 h-6" />,
        color: "bg-blue-100",
        borderColor: "border-blue-500"
    },
    {
        id: "language",
        label: "Language",
        icon: <Languages className="w-6 h-6" />,
        color: "bg-green-100",
        borderColor: "border-green-500"
    },
    {
        id: "fitness",
        label: "Fitness",
        icon: <Dumbbell className="w-6 h-6" />,
        color: "bg-orange-100",
        borderColor: "border-orange-500"
    }
];
