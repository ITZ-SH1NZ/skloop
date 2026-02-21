import { ReactLenis } from "lenis/react";
import { ReactNode, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function LenisProvider({ children }: { children: ReactNode }) {
    const lenisRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const lenis = lenisRef.current?.lenis;
            if (!lenis) return;

            // Synchronize Lenis with GSAP ScrollTrigger
            lenis.on('scroll', ScrollTrigger.update);

            // Use GSAP ticker to drive Lenis for perfect sync
            const update = (time: number) => {
                lenis.raf(time * 1000);
            };

            gsap.ticker.add(update);

            // Disable lag smoothing to prevent jumpiness
            gsap.ticker.lagSmoothing(0);

            return () => {
                gsap.ticker.remove(update);
                lenis.off('scroll', ScrollTrigger.update);
            };
        }
    }, []);

    return (
        <ReactLenis
            root
            ref={lenisRef}
            autoRaf={false}
            options={{
                lerp: 0.1,
                duration: 1.2,
                smoothWheel: true,
                syncTouch: true,
                touchMultiplier: 1.5,
            }}
        >
            {children}
        </ReactLenis>
    );
}
