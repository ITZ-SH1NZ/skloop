"use client";

import { SWRConfig } from "swr";
import { ReactNode, useEffect, useState } from "react";

export function SWRProvider({ children }: { children: ReactNode }) {
    // Lazy initialize provider to ensure it's ready before children mount
    const [provider] = useState(() => {
        if (typeof window === 'undefined') return new Map();
        return new Map(JSON.parse(localStorage.getItem('skloop-swr-cache') || '[]'));
    });

    useEffect(() => {
        const handleBeforeUnload = () => {
            const appCache = JSON.stringify(Array.from(provider.entries()));
            localStorage.setItem('skloop-swr-cache', appCache);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [provider]);

    return (
        <SWRConfig
            value={{
                provider: () => provider,
                revalidateOnFocus: true,
                focusThrottleInterval: 300000, // only re-fetch on focus if 5 minutes have passed
                revalidateOnReconnect: true,
                keepPreviousData: true,
                dedupingInterval: 10000,
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
