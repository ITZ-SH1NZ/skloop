"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

export function FramerCounter({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        const start = 0;
        const end = value;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            const current = start + (end - start) * ease;

            setDisplayValue(Math.floor(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, isInView]);

    return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}
