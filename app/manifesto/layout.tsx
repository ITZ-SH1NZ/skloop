import { Metadata } from "next";
import React from "react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import { MasterScrollProvider } from "@/components/providers/MasterScrollProvider";

export const metadata: Metadata = {
    title: "Our Manifesto",
    description: "The philosophy behind Skloop: Bridging the motivation gap in learning to code."
};

export default function ManifestoLayout({ children }: { children: React.ReactNode }) {
    return (
        <MasterScrollProvider>
            <div className="h-screen h-[100dvh] w-screen bg-[#f8f9fa] text-zinc-900 font-sans selection:bg-lime-300 selection:text-black overflow-hidden flex flex-col relative">
                
                {/* Background Grid - More subtle and deeper */}
                <div className="fixed inset-0 pointer-events-none z-0 perspective-[1500px] opacity-20">
                    <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
                        style={{ transform: "rotateX(45deg) scale(2) translateY(-20%)" }}
                    />
                </div>

                <MarketingNavbar />

                <main className="flex-1 relative z-10 overflow-hidden">
                    {children}
                </main>
            </div>
        </MasterScrollProvider>
    );
}
