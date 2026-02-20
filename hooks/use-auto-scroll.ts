"use client";

import { useEffect, useRef } from "react";

interface AutoScrollOptions {
    /**
     * The dependency that triggers the scroll when changed.
     */
    trigger?: unknown;
    /**
     * Vertical offset in pixels. Positive values scroll down, negative up.
     * Default: 0
     */
    offset?: number;
    /**
     * Scroll behavior.
     * Default: "smooth"
     */
    behavior?: ScrollBehavior;
    /**
     * If true, only scrolls if the element is NOT currently visible.
     * Default: false (To ensure reliability)
     */
    onlyIfHidden?: boolean;
    /**
     * Delay in ms before scrolling (useful for animations).
     * Default: 100
     */
    delay?: number;
    /**
     * If true, disables the scroll.
     */
    disabled?: boolean;
    /**
     * If true, prevents scrolling on the initial render/mount.
     * Default: false
     */
    skipInitial?: boolean;
    /**
     * The ID of the scroll container to target.
     * Default: "app-scroll-container"
     */
    containerId?: string;
}

/**
 * A smart hook to auto-scroll an element into view.
 * Targets the 'app-scroll-container' (or custom ID) explicitly for robust behavior.
 */
export function useAutoScroll<T extends HTMLElement>(options: AutoScrollOptions = {}) {
    const ref = useRef<T>(null);

    const {
        trigger,
        offset = 0,
        behavior = "smooth",
        onlyIfHidden = false,
        delay = 100,
        disabled = false,
        skipInitial = false,
        containerId = "app-scroll-container"
    } = options;

    const prevTrigger = useRef(trigger);
    const hasMounted = useRef(false);

    useEffect(() => {
        if (disabled) return;

        const handleScroll = () => {
            const element = ref.current;
            if (!element) return;

            // 1. Target the known container ID
            let container = document.getElementById(containerId);

            // Fallback to window if specific container not found
            if (!container) {
                const rect = element.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                window.scrollTo({
                    top: rect.top + scrollTop + offset,
                    behavior
                });
                return;
            }

            // 2. Geometry Calculation
            const elementRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // 3. Visibility Check (Optional)
            if (onlyIfHidden) {
                const elementTop = elementRect.top;
                const containerTop = containerRect.top;
                const containerBottom = containerTop + containerRect.height;

                // Check if the element's top edge (adj by offset) is visible
                const isVisible = (
                    elementTop + offset >= containerTop &&
                    elementTop + offset <= containerBottom
                );

                if (isVisible) return;
            }

            // 4. Perform Scroll
            // Relative position inside the scrollable container
            const relativeTop = elementRect.top - containerRect.top;
            const currentScrollTop = container.scrollTop;

            // Calculate target. We add `currentScrollTop` because `relativeTop` is just the viewport difference.
            const targetScrollTop = currentScrollTop + relativeTop + offset;

            container.scrollTo({
                top: targetScrollTop,
                behavior
            });
        };

        const hasTriggerChanged = trigger !== prevTrigger.current;
        prevTrigger.current = trigger;

        // CoreLogic:
        // 1. If trigger changed -> Always scroll
        // 2. If trigger didn't change (Mount or re-render) -> Scroll only if !skipInitial (and it's the first run)

        if (hasTriggerChanged) {
            // Delay for animations/re-renders
            setTimeout(handleScroll, delay);
            // Double check for lagging frames
            setTimeout(handleScroll, delay + 150);
        } else if (!hasMounted.current) {
            hasMounted.current = true;
            if (!skipInitial) {
                setTimeout(handleScroll, delay);
            }
        }

    }, [trigger, offset, behavior, onlyIfHidden, delay, disabled, skipInitial]);

    return ref;
}
