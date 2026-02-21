"use client";

import React, { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface MasterScrollContextType {
    scrollToTop: () => void;
    scrollToBottom: () => void;
    scrollToElement: (elementId: string, offset?: number) => void;
    lenis: any;
}

const MasterScrollContext = createContext<MasterScrollContextType | undefined>(undefined);

export function MasterScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [lenis, setLenis] = React.useState<any>(null);

    // Sync GSAP with Lenis heartbeat
    useEffect(() => {
        if (!lenis) return;

        // Update ScrollTrigger on Lenis scroll
        lenis.on('scroll', ScrollTrigger.update);

        // Manual RAF loop via GSAP ticker for perfect sync
        const update = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(update);
            lenis.off('scroll', ScrollTrigger.update);
        };
    }, [lenis]);

    // Refresh ScrollTrigger on route changes to account for height shifts
    useEffect(() => {
        // Give the page a moment to render/settle before refreshing
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);
        return () => clearTimeout(timer);
    }, [pathname]);

    const scrollToTop = useCallback(() => {
        lenis?.scrollTo(0, { lerp: 0.1 });
    }, [lenis]);

    const scrollToBottom = useCallback(() => {
        lenis?.scrollTo("bottom", { lerp: 0.1 });
    }, [lenis]);

    const scrollToElement = useCallback((elementId: string, offset: number = 0) => {
        const target = elementId.startsWith("#") ? elementId : `#${elementId}`;
        lenis?.scrollTo(target, {
            offset,
            lerp: 0.1,
            duration: 1.5
        });
    }, [lenis]);

    return (
        <ReactLenis
            root
            autoRaf={false}
            options={{
                lerp: 0.1,
                duration: 1.2,
                smoothWheel: true,
                syncTouch: true,
                touchMultiplier: 1.5,
            }}
            ref={(s: any) => {
                if (s?.lenis && !lenis) {
                    setLenis(s.lenis);
                }
            }}
        >
            <MasterScrollContext.Provider value={{
                scrollToTop,
                scrollToBottom,
                scrollToElement,
                lenis
            }}>
                {children}
            </MasterScrollContext.Provider>
        </ReactLenis>
    );
}

export function useMasterScroll() {
    const context = useContext(MasterScrollContext);
    if (context === undefined) {
        throw new Error("useMasterScroll must be used within a MasterScrollProvider");
    }
    return context;
}
