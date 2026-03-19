"use client";

import { useEffect } from "react";
import { useLoading } from "@/components/LoadingProvider";

export function AppPreloader() {
    const { registerPreloadTasks } = useLoading();

    useEffect(() => {
        // Fire essential imports in the background.
        // Heavy assets (Monaco, React Flow) are preloaded in their specific pages, not here.
        const preloadTasks: Promise<any>[] = [
            // 1. Preload GSAP & Motion (Animation Engines) — used on dashboard immediately
            import('gsap').catch(e => console.warn("GSAP preload failed", e)),
            import('framer-motion').catch(e => console.warn("Framer Motion preload failed", e)),

            // 2. Serverless Cold Start Wakes & Data Warmup
            fetch('/api/user/stats').catch(() => {}),
            
            // 3. Pre-import components used on key pages
            import('@/lib/swr-fetchers').then(mod => mod),
            import('@/components/mentorship/SessionVideoCard').catch(() => {}),
            import('@/components/profile/UserProfileModal').catch(() => {}),
        ];

        // Register tasks with the global loader
        if (registerPreloadTasks) {
            registerPreloadTasks(preloadTasks);
        }

    }, [registerPreloadTasks]);

    return null; // This is a logic-only component
}
