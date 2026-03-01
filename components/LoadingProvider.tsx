"use client";

import { createContext, useContext, useEffect, useState } from "react";
import GamifiedLoader from "./GamifiedLoader";
import { AnimatePresence } from "framer-motion";

const LoadingContext = createContext({ isLoading: true });

export const useLoading = () => useContext(LoadingContext);

// Prevent Suspense remounts from re-triggering the huge GamifiedLoader
let globalInitialLoadDone = false;

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isInitialLoad, setIsInitialLoad] = useState(!globalInitialLoadDone);

    useEffect(() => {
        if (!isInitialLoad) {
            globalInitialLoadDone = true;
        }
    }, [isInitialLoad]);

    return (
        <LoadingContext.Provider value={{ isLoading: isInitialLoad }}>
            <AnimatePresence mode="wait">
                {isInitialLoad && (
                    <GamifiedLoader key="loader" onComplete={() => setIsInitialLoad(false)} />
                )}
            </AnimatePresence>
            {children}
        </LoadingContext.Provider>
    );
}
