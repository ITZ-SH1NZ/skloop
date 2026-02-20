"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type CardProps = HTMLMotionProps<"div">;

export function Card({ className, children, ...props }: CardProps) {
    return (
        <motion.div
            className={cn(
                "card-float p-6 hover:card-float-hover bg-surface rounded-[2rem]",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
