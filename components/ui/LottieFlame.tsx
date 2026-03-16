"use client";

import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";

interface LottieFlameProps {
    className?: string;
    size?: number;
}

export function LottieFlame({ className, size = 24 }: LottieFlameProps) {
    return (
        <div 
            className={`flex items-center justify-center ${className}`} 
            style={{ width: size, height: size }}
        >
            <DotLottiePlayer
                src="/fire-streak.lottie"
                autoplay
                loop
                speed={1.2}
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
}
