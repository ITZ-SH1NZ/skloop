"use client";

import { useLayoutEffect, createContext, useContext, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useLayoutEffect(() => {
        const lenisInstance = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 2,
        });

        setLenis(lenisInstance);

        // Synchronize Lenis with GSAP ScrollTrigger
        lenisInstance.on('scroll', ScrollTrigger.update);

        // Use GSAP ticker to drive Lenis for perfect sync
        gsap.ticker.add((time) => {
            lenisInstance.raf(time * 1000);
        });

        // Disable lag smoothing to prevent jumpiness during heavy load
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenisInstance.destroy();
            setLenis(null);
            gsap.ticker.remove((time) => {
                lenisInstance.raf(time * 1000);
            });
        };
    }, []);

    return (
        <LenisContext.Provider value={lenis}>
            {children}
        </LenisContext.Provider>
    );
}
