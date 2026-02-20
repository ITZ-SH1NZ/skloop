"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export type ButtonProps = HTMLMotionProps<"button"> & {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        const variants = {
            primary: "btn-float bg-primary text-primary-foreground glow-primary",
            secondary: "btn-float bg-secondary text-secondary-foreground",
            ghost: "btn-float bg-transparent text-foreground hover:bg-black/5",
            outline: "btn-float bg-transparent border border-input text-foreground hover:bg-muted",
        };

        const sizes = {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4",
            lg: "h-12 px-6 text-lg",
            icon: "h-10 w-10 p-0",
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button, cn };
