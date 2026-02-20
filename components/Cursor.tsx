"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Cursor() {
    const [isHovering, setIsHovering] = useState(false);
    const [isText, setIsText] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Motion values for raw mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics for movement
    // adjusted mass for lighter feel
    const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Detect interactive elements
            const isInteractive = target.closest(
                "a, button, [role='button'], .cursor-pointer"
            );
            setIsHovering(!!isInteractive);

            // Detect text elements - separate state for different cursor shape
            const isTextElement = target.closest(
                "p, span, h1, h2, h3, h4, h5, h6, input, textarea, select, label"
            );
            // Only set isText if NOT hovering an interactive element (buttons take precedence)
            setIsText(!!isTextElement && !isInteractive);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.documentElement.addEventListener("mouseleave", handleMouseLeave);
        document.documentElement.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
            document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [mouseX, mouseY, isVisible]); // Added isVisible dependency to satisfy linter if needed, though rarely strictly required for these listeners

    // Don't render until we have first movement to avoid 0,0 jump
    if (!isVisible) return null;

    return (
        <motion.div
            className={cn(
                "fixed top-0 left-0 z-[9999] pointer-events-none",
                isText ? "rounded-[1px]" : "rounded-full", // Vertical bar for text
                "bg-white mix-blend-difference"
            )}
            style={{
                x: cursorX,
                y: cursorY,
                translateX: "-50%",
                translateY: "-50%",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: isVisible ? (isClicking ? 0.8 : 1) : 0, // Click feedback
                opacity: isVisible ? 1 : 0,
                // Dimensions:
                // Hovering (Button): 80x80 circle
                // Text: 2x24 vertical bar
                // Default: 12x12 dot
                width: isHovering ? 80 : (isText ? 4 : 12),
                height: isHovering ? 80 : (isText ? 24 : 12),
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 28,
                // Faster transition for click
                scale: { duration: 0.1 }
            }}
        />
    );
}
