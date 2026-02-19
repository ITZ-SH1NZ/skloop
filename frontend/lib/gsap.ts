"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins
// Safe to call multiple times, GSAP handles it.
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);

    // Optional: Set default ease or configuration
    gsap.defaults({
        ease: "power2.out",
        duration: 1
    });
}

export { gsap, ScrollTrigger, useGSAP };
