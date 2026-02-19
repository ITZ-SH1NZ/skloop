"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AvatarProps {
    src?: string;
    fallback: string;
    className?: string;
}

export function Avatar({ src, fallback, className }: AvatarProps) {
    return (
        <div
            className={cn(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface border border-white/10",
                className
            )}
        >
            {src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={src}
                    alt={fallback}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                    {fallback}
                </div>
            )}
        </div>
    );
}
