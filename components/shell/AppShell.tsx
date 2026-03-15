"use client";

import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AppScrollProvider } from "@/components/providers/AppScrollProvider";
import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLoading } from "@/components/LoadingProvider";

// Pages that need fixed full-height layout (no scroll) rather than Lenis scroll
const FULL_HEIGHT_ROUTES = ["/peer/chat", "/messages"];

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { isLoading } = useLoading();
    const isFullHeight = FULL_HEIGHT_ROUTES.some(r => pathname.startsWith(r));

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isLoading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="flex h-[100dvh] bg-background p-0 md:p-4 gap-4 overflow-hidden items-stretch"
        >
            {/* Mobile Header (Hidden on Desktop) */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-top))] bg-surface/80 backdrop-blur-md z-30 flex items-center px-4 border-b border-border/50 justify-between pt-[env(safe-area-inset-top)]">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl" onClick={() => setMobileOpen(true)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.svg" alt="Skloop" className="w-8 h-8" />
                    </Button>
                    <span className="font-bold text-lg">Skloop</span>
                </div>
            </header>

            {/* Sidebar - Pure Native Scroll (Independent of Content Lenis) */}
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Main Content Area */}
            <main className={`flex-1 md:card-float overflow-hidden relative flex flex-col ${isFullHeight
                    ? 'h-full pt-[calc(4rem+env(safe-area-inset-top))] md:pt-0'
                    : 'h-full md:min-h-[90vh] pt-[calc(4rem+env(safe-area-inset-top))] md:pt-0'
                }`}>
                {isFullHeight ? (
                    // Chat and full-height pages: no Lenis scroll, just a flex container
                    <AppScrollProvider>
                        <div className="flex flex-col flex-1 h-full overflow-hidden">
                            {children}
                        </div>
                    </AppScrollProvider>
                ) : (
                    // All other pages: Lenis smooth scroll
                    <ReactLenis
                        root={false}
                        autoRaf={true}
                        options={{
                            lerp: 0.1,
                            duration: 1.2,
                            smoothWheel: true,
                            syncTouch: true,
                            touchMultiplier: 1.5,
                        }}
                        id="app-scroll-container"
                        className="flex-1 overflow-y-auto pb-0 h-full scroll-smooth outline-none no-scrollbar"
                    >
                        <AppScrollProvider>
                            {children}
                        </AppScrollProvider>
                    </ReactLenis>
                )}
            </main>
        </motion.div>
    );
}
