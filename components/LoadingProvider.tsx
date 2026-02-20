"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ApertureLoader from "./ApertureLoader";
import { motion, AnimatePresence } from "framer-motion";

const LoadingContext = createContext({ isLoading: true });

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Handle Route Transitions (Mini Loader)
    useEffect(() => {
        setIsRouteLoading(true);
        const timer = setTimeout(() => setIsRouteLoading(false), 500); // Simulate minimal route transition
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return (
        <LoadingContext.Provider value={{ isLoading: isInitialLoad }}>
            <AnimatePresence mode="wait">
                {isInitialLoad && (
                    <ApertureLoader key="loader" onComplete={() => setIsInitialLoad(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRouteLoading && !isInitialLoad && (
                    <motion.div
                        key="route-loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-0 left-0 w-screen h-[100dvh] z-[9999] pointer-events-none flex items-center justify-center bg-white/20 backdrop-blur-[2px]"
                    >
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            {children}
        </LoadingContext.Provider>
    );
}
