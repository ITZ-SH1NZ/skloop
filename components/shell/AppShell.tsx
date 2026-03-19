"use client";

import { Sidebar } from "./Sidebar";
import { useState, useRef, useEffect } from "react";
import { AppScrollProvider } from "@/components/providers/AppScrollProvider";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLoading } from "@/components/LoadingProvider";

import { NotificationListener } from "../notifications/NotificationListener";

// Pages that need fixed full-height layout (no scroll)
const FULL_HEIGHT_ROUTES = ["/peer/chat", "/messages"];

// PERF 6: Inner component that pauses/resumes Lenis for full-height routes
// instead of unmounting/remounting the Lenis instance on every navigation.
function LenisController({ isFullHeight }: { isFullHeight: boolean }) {
    const lenis = useLenis();
    useEffect(() => {
        if (!lenis) return;
        if (isFullHeight) {
            lenis.stop();
        } else {
            lenis.start();
        }
    }, [lenis, isFullHeight]);
    return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { isLoading } = useLoading();
    const isFullHeight = FULL_HEIGHT_ROUTES.some(r => pathname.startsWith(r));
    // PERF 5: Skip the enter animation after the initial load to prevent nav flash
    const hasLoadedRef = useRef(false);
    if (!isLoading) hasLoadedRef.current = true;

    return (
        <div className="flex h-[100dvh] bg-background p-0 md:p-4 gap-4 overflow-hidden items-stretch">
            <NotificationListener />
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <main className="flex-1 md:card-float overflow-hidden relative flex flex-col h-full md:min-h-[90vh]">
                <motion.div
                    key={pathname}
                    initial={hasLoadedRef.current ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 h-full overflow-hidden flex flex-col pt-[calc(4rem+env(safe-area-inset-top))] md:pt-0"
                >
                    {/* PERF 6: ReactLenis always rendered — LenisController pauses it for full-height pages */}
                    <ReactLenis
                        root={false}
                        autoRaf={true}
                        options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, syncTouch: true }}
                        className="flex-1 overflow-y-auto no-scrollbar h-full"
                    >
                        <LenisController isFullHeight={isFullHeight} />
                        <AppScrollProvider>
                            {isFullHeight ? (
                                <div className="flex flex-col flex-1 h-full overflow-hidden">
                                    {children}
                                </div>
                            ) : (
                                children
                            )}
                        </AppScrollProvider>
                    </ReactLenis>
                </motion.div>
            </main>
        </div>
    );
}
