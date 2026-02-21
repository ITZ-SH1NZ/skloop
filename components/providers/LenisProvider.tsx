"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export function LenisProvider({ children }: { children: ReactNode }) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.1,
                duration: 1.2,
                smoothWheel: true,
                syncTouch: true, // Native-feeling touch drag
                touchMultiplier: 2, // Smoothness boost for finger drag
            }}
        >
            {children}
        </ReactLenis>
    );
}
