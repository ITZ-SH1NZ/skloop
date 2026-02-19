"use client";

import React, { createContext, useContext, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

interface ScrollContextType {
    /**
     * Smooth scrolls to the top of the page.
     */
    scrollToTop: () => void;
    /**
     * Smooth scrolls to the bottom of the page.
     */
    scrollToBottom: () => void;
    /**
     * Scrolls a specific element into view by ID.
     */
    scrollToElement: (elementId: string, offset?: number) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Auto-scroll to top on route change
    useEffect(() => {
        const container = document.getElementById("app-scroll-container");
        if (container) {
            container.scrollTo({ top: 0, behavior: "instant" });
        } else {
            window.scrollTo({ top: 0, behavior: "instant" });
        }
    }, [pathname]);

    const scrollToTop = useCallback(() => {
        const container = document.getElementById("app-scroll-container");
        if (container) {
            container.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const scrollToBottom = useCallback(() => {
        const container = document.getElementById("app-scroll-container");
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
    }, []);

    const scrollToElement = useCallback((elementId: string, offset: number = 0) => {
        const element = document.getElementById(elementId);
        if (element) {
            // Check for our custom container first
            const container = document.getElementById("app-scroll-container");

            if (container) {
                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const relativeTop = elementRect.top - containerRect.top;
                const target = container.scrollTop + relativeTop + offset;
                container.scrollTo({ top: target, behavior: "smooth" });
            } else {
                const rect = element.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                window.scrollTo({
                    top: rect.top + scrollTop + offset,
                    behavior: "smooth"
                });
            }
        }
    }, []);

    return (
        <ScrollContext.Provider value={{ scrollToTop, scrollToBottom, scrollToElement }}>
            {children}
        </ScrollContext.Provider>
    );
}

export function useScroll() {
    const context = useContext(ScrollContext);
    if (context === undefined) {
        throw new Error("useScroll must be used within a ScrollProvider");
    }
    return context;
}
