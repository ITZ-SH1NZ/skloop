import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const FeatureLevels = dynamic(() => import("@/components/marketing/FeatureLevels"));
const ExpandedSections = dynamic(() => import("@/components/marketing/ExpandedSections"));
const MarketingNavbar = dynamic(() => import("@/components/marketing/MarketingNavbar"));

import MarketingFooter from "@/components/marketing/MarketingFooter";
import { MasterScrollProvider } from "@/components/providers/MasterScrollProvider";
import HomeHero from "@/components/marketing/HomeHero";
import PurposeSection from "@/components/marketing/PurposeSection";

export default function Home() {
    return (
        <MasterScrollProvider>
            <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#D4F268] selection:text-black font-sans relative overflow-x-hidden">

                {/* GLOBAL BACKGROUND: 3D Grid Floor (from AuthVisuals) */}
                <div className="fixed inset-0 pointer-events-none z-0 perspective-[1000px]">
                    <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-60 will-change-transform"
                        style={{ transform: "rotateX(60deg) scale(2) translateY(-10%) translateZ(0)" }}
                    />
                </div>

                <MarketingNavbar />

                <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
                    <HomeHero />

                    <PurposeSection />

                    <Suspense fallback={<div className="min-h-screen" />}>
                        {/* THE MAP / FEATURE LEVELS */}
                        <FeatureLevels />
                    </Suspense>

                    <Suspense fallback={<div className="min-h-screen" />}>
                        {/* EXPANDED CONTENT (Character Select, Leaderboard, Final Boss) */}
                        <ExpandedSections />
                    </Suspense>
                </main>
                <MarketingFooter />
            </div>
        </MasterScrollProvider>
    );
}
