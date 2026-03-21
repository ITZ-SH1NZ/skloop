"use client";

import { memo } from "react";
import { TopSlimeBorder } from "./TopSlimeBorder";

export const SlimeWaterfall = memo(() => {
    return (
        <div 
            className="absolute inset-x-0 top-0 h-[400px] z-0 pointer-events-none opacity-30 mix-blend-screen overflow-visible" 
            style={{ transform: "scaleY(3)", transformOrigin: "top" }}
        >
            <TopSlimeBorder />
        </div>
    );
});
SlimeWaterfall.displayName = "SlimeWaterfall";
