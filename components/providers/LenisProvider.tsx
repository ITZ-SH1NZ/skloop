import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export function LenisProvider({ children }: { children: ReactNode }) {
    const lenisRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);

            // Sync Lenis with ScrollTrigger
            function update(time: number) {
                lenisRef.current?.lenis?.raf(time * 1000);
            }

            gsap.ticker.add(update);
            return () => gsap.ticker.remove(update);
        }
    }, []);

    return (
        <ReactLenis
            root
            ref={lenisRef}
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
