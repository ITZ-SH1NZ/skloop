"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function CountUp({
    to,
    from = 0,
    duration = 2,
    className = "",
}: {
    to: number;
    from?: number;
    duration?: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(from);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
        duration: duration * 1000,
    });

    useEffect(() => {
        if (isInView) {
            motionValue.set(to);
        }
    }, [isInView, motionValue, to]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US").format(
                    Math.floor(latest)
                );
            }
        });

        return () => springValue.clearListeners();
    }, [springValue]);

    return <span ref={ref} className={className} />;
}
