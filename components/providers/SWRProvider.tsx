"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig
            value={{
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
