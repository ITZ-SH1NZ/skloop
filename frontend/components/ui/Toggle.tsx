"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export function Toggle({ checked, onCheckedChange, disabled, className }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={cn(
                "w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D4F268]",
                checked ? "bg-[#D4F268]" : "bg-zinc-700",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md"
                initial={false}
                animate={{
                    x: checked ? 20 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
            />
        </button>
    );
}
