"use client";

import React, { createContext, useContext, useCallback, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "@/lib/gsap";

interface AppScrollContextType {
    scrollToTop: () => void;
    scrollToBottom: () => void;
    scrollToElement: (elementId: string, offset?: number) => void;
    lenis: any;
}

const AppScrollContext = createContext<AppScrollContextType | undefined>(undefined);

export function AppScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const lenis = useLenis();

    // Debugging Lenis instance
    useEffect(() => {
        if (lenis) {
            console.log('Lenis instance captured in AppScrollProvider');
        } else {
            console.warn('Lenis instance MISSING in AppScrollProvider. Check ReactLenis nesting.');
        }
    }, [lenis]);

    // Sync GSAP with Lenis heartbeat
    useEffect(() => {
        if (!lenis) return;

        lenis.on('scroll', ScrollTrigger.update);

        // Immediate refresh when container mounts/height is available
        ScrollTrigger.refresh();

        return () => {
            lenis.off('scroll', ScrollTrigger.update);
        };
    }, [lenis]);

    // Refresh ScrollTrigger on route changes to handle height changes
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
            // Force a scroll to top on major route changes inside the app
            lenis?.scrollTo(0, { immediate: true });
        }, 300); // Slightly longer delay to allow page content to settle
        return () => clearTimeout(timer);
    }, [pathname, lenis]);

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

    const contextValue = useMemo(() => ({
        scrollToTop,
        scrollToBottom,
        scrollToElement,
        lenis
    }), [scrollToTop, scrollToBottom, scrollToElement, lenis]);

    return (
        <AppScrollContext.Provider value={contextValue}>
            {children}
        </AppScrollContext.Provider>
    );
}

export function useAppScroll() {
    const context = useContext(AppScrollContext);
    if (context === undefined) {
        throw new Error("useAppScroll must be used within an AppScrollProvider");
    }
    return context;
}
