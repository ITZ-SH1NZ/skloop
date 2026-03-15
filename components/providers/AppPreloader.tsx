"use client";

import { useEffect } from "react";
import { useLoading } from "@/components/LoadingProvider";

export function AppPreloader() {
    const { registerPreloadTasks } = useLoading();

    useEffect(() => {
        // Fire all heavy imports in the background. We don't await them here, 
        // we just hand the promises to the GamifiedLoader to wait for them.
        
        const preloadTasks = [
            // 1. Preload Monaco Editor (Heavy Client-Side Engine)
            import('@monaco-editor/react').then(mod => {
                // Initialize the loader if possible, or just let it cache the chunk
                if (mod.loader && mod.loader.init) {
                    return mod.loader.init();
                }
                return mod;
            }).catch(e => console.warn("Monaco preload failed", e)),

            // 2. Preload React Flow (Used in Tracks)
            import('@xyflow/react').catch(e => console.warn("React Flow preload failed", e)),

            // 3. Preload GSAP & Motion (Animation Engines)
            import('gsap').catch(e => console.warn("GSAP preload failed", e)),
            import('framer-motion').catch(e => console.warn("Framer Motion preload failed", e)),

            // 4. Preload Particles (Dashboard/Visuals)
            import('@tsparticles/react').catch(e => console.warn("Particles preload failed", e)),
            import('canvas-confetti').catch(e => console.warn("Confetti preload failed", e)),

            // 5. Serverless Cold Start Wakes & Data Warmup
            // We fire these but don't block the UI if they take too long
            // (GamifiedLoader will wait up to 6s for these anyway)
            fetch('/api/user/stats').catch(() => {}),
            
            // Warm up specific mentorship and shop actions if they are slow
            import('@/lib/swr-fetchers').then(mod => {
                // We can't easily call them without IDs, but just importing the module warms it up
                return mod;
            }),

            // Pre-import components used in those pages
            import('@/components/mentorship/SessionVideoCard').catch(() => {}),
            import('@/components/profile/UserProfileModal').catch(() => {}),
        ];

        // Register tasks with the global loader so it holds the "Blast Off"
        if (registerPreloadTasks) {
            registerPreloadTasks(preloadTasks);
        }

    }, [registerPreloadTasks]);

    return null; // This is a logic-only component
}
