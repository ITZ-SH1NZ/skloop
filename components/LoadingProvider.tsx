"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import GamifiedLoader from "./GamifiedLoader";
import { AnimatePresence } from "framer-motion";

interface LoadingContextType {
    isLoading: boolean;
    registerPreloadTasks: (tasks: Promise<any>[]) => void;
}

const LoadingContext = createContext<LoadingContextType>({ 
    isLoading: true,
    registerPreloadTasks: () => {}
});

export const useLoading = () => useContext(LoadingContext);

// Prevent Suspense remounts from re-triggering the huge GamifiedLoader
let globalInitialLoadDone = false;

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isInitialLoad, setIsInitialLoad] = useState(!globalInitialLoadDone);
    const preloadTasksRef = useRef<Promise<any>[]>([]);

    useEffect(() => {
        if (!isInitialLoad) {
            globalInitialLoadDone = true;
        }
    }, [isInitialLoad]);

    const registerPreloadTasks = useCallback((tasks: Promise<any>[]) => {
        preloadTasksRef.current = [...preloadTasksRef.current, ...tasks];
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading: isInitialLoad, registerPreloadTasks }}>
            <AnimatePresence mode="wait">
                {isInitialLoad && (
                    <GamifiedLoader 
                        key="loader" 
                        onComplete={() => setIsInitialLoad(false)} 
                        preloadTasksRef={preloadTasksRef}
                    />
                )}
            </AnimatePresence>
            {children}
        </LoadingContext.Provider>
    );
}
