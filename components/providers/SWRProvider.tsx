"use client";

import { SWRConfig } from "swr";
import { ReactNode, useEffect, useState } from "react";

export function SWRProvider({ children }: { children: ReactNode }) {
    const [provider, setProvider] = useState<Map<any, any> | null>(null);

    useEffect(() => {
        // Initialize from localStorage on mount
        const cache = new Map(JSON.parse(localStorage.getItem('skloop-swr-cache') || '[]'));
        setProvider(cache);

        // Save to localStorage when the window is unloaded
        const handleBeforeUnload = () => {
            const appCache = JSON.stringify(Array.from(cache.entries()));
            localStorage.setItem('skloop-swr-cache', appCache);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return (
        <SWRConfig
            value={{
                provider: provider ? () => provider : undefined,
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
                keepPreviousData: true,
                // Deduplicate identical requests within 5 seconds to avoid redundant fetches
                dedupingInterval: 5000,
                fetcher: async (resource: string, init?: RequestInit) => {
                    const res = await fetch(resource, init);
                    return res.json();
                }
            }}
        >
            {children}
        </SWRConfig>
    );
}
