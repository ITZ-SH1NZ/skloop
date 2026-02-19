"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CurrencyCoinProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    onClick?: () => void;
}

export function CurrencyCoin({ size = "lg", className, onClick }: CurrencyCoinProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [isGlowing, setIsGlowing] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const handleClick = () => {
        if (onClick) onClick();

        // Trigger Animations
        setIsSpinning(true);
        setIsGlowing(true);

        setTimeout(() => setIsSpinning(false), 700);
        setTimeout(() => setIsGlowing(false), 800);
    };

    const sizeClass = size === "sm" ? "coin-sm" : size === "md" ? "coin-md" : "";

    return (
        <div
            className={cn("coin-wrapper relative", sizeClass, className)}
            onClick={handleClick}
        >
            <svg
                ref={svgRef}
                className={cn("coin", isSpinning && "spin", isGlowing && "glow")}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <radialGradient id="mainGrad" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#F3FFB0" />
                        <stop offset="60%" stopColor="#CBE86B" />
                        <stop offset="100%" stopColor="#8FBF2F" />
                    </radialGradient>

                    <linearGradient id="rimGrad">
                        <stop offset="0%" stopColor="#E6FF9E" />
                        <stop offset="100%" stopColor="#79B91D" />
                    </linearGradient>

                    <clipPath id="clip">
                        <circle cx="50" cy="50" r="42" />
                    </clipPath>
                </defs>

                {/* Rim */}
                <circle cx="50" cy="50" r="48" fill="url(#rimGrad)" />

                {/* Ridges */}
                <g stroke="#8FBF2F" strokeWidth="1">
                    <circle cx="50" cy="50" r="46" fill="none" />
                    <circle cx="50" cy="50" r="44" fill="none" />
                </g>

                {/* Inner coin */}
                <circle cx="50" cy="50" r="42" fill="url(#mainGrad)" />

                {/* Infinity Symbol (Custom for Skloop?) */}
                <path
                    d="M 28 50
                       C 28 38, 44 38, 50 50
                       C 56 62, 72 62, 72 50
                       C 72 38, 56 38, 50 50
                       C 44 62, 28 62, 28 50"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="9"
                    strokeLinecap="round"
                />

                {/* Shine */}
                <g clipPath="url(#clip)">
                    <rect className="shine" x="-120" y="0" width="40" height="100" fill="white" opacity="0.18" />
                </g>
            </svg>
        </div>
    );
}
