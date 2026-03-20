"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false, // Prevent aggressive refetching on window focus
                revalidateOnReconnect: true,
                keepPreviousData: true, // Keep stale data while revalidating for smooth transitions
                fetcher: async (resource: string, init?: RequestInit) => {
                    // Fallback fetcher for general URL usage, though we'll use custom fetchers for Supabase
                    const res = await fetch(resource, init);
                    return res.json();
                }
            }}
        >
            {children}
        </SWRConfig>
    );
}
