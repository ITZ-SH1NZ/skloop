"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import GamifiedLoader from "./GamifiedLoader";
import { motion, AnimatePresence } from "framer-motion";

const LoadingContext = createContext({ isLoading: true });

export const useLoading = () => useContext(LoadingContext);

// Prevent Suspense remounts from re-triggering the huge GamifiedLoader
let globalInitialLoadDone = false;

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isInitialLoad, setIsInitialLoad] = useState(!globalInitialLoadDone);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const pathname = usePathname();

    // Use a ref for prevPath so updates don't re-trigger or cancel the timeout.
    const lastPathname = useRef(pathname);

    useEffect(() => {
        if (!isInitialLoad) {
            globalInitialLoadDone = true;
        }
    }, [isInitialLoad]);

    // Only show mini-loader when the pathname actually changes.
    // Using a ref avoids the race where prevPath state updates re-triggered
    // this effect and prematurely cleared the 500ms timeout.
    useEffect(() => {
        if (pathname !== lastPathname.current) {
            lastPathname.current = pathname;
            setIsRouteLoading(true);
            const timer = setTimeout(() => setIsRouteLoading(false), 500);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    return (
        <LoadingContext.Provider value={{ isLoading: isInitialLoad }}>
            <AnimatePresence mode="wait">
                {isInitialLoad && (
                    <GamifiedLoader key="loader" onComplete={() => setIsInitialLoad(false)} />
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
