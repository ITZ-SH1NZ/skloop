"use client";

import { Sidebar } from "./Sidebar";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useMasterScroll } from "@/components/providers/MasterScrollProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { setWrapper } = useMasterScroll();

    useEffect(() => {
        if (scrollContainerRef.current) {
            setWrapper(scrollContainerRef.current);
        }
        return () => setWrapper(null);
    }, [setWrapper]);

    return (
        <div className="flex h-[100dvh] bg-background p-0 md:p-4 gap-4 overflow-hidden items-start">
            {/* Mobile Header (Hidden on Desktop) */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-top))] bg-surface/80 backdrop-blur-md z-30 flex items-center px-4 border-b border-border/50 justify-between pt-[env(safe-area-inset-top)]">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl" onClick={() => setMobileOpen(true)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.svg" alt="Skloop" className="w-8 h-8" />
                    </Button>
                    <span className="font-bold text-lg">Skloop</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Placeholder for top actions like notifications */}
                </div>
            </header>

            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Main Content Area - Soft Pop Card */}
            <main className="flex-1 md:card-float overflow-hidden relative flex flex-col h-full md:min-h-[90vh] pt-[calc(4rem+env(safe-area-inset-top))] md:pt-0">
                <div
                    id="app-scroll-container"
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto pb-0"
                >
                    {children}
                </div>
            </main>

        </div>
    );
}
