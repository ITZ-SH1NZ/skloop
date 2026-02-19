"use client";

import { cn } from "@/lib/utils";

interface GroteskCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export default function GroteskCard({ children, className, hoverEffect = true, onClick }: GroteskCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "border-2 border-black bg-white p-6 relative transition-all duration-200 group",
                hoverEffect && "hover:bg-black hover:text-[#CCFF00] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
                className
            )}
        >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black transition-colors group-hover:bg-[#CCFF00]" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black transition-colors group-hover:bg-[#CCFF00]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-black transition-colors group-hover:bg-[#CCFF00]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-black transition-colors group-hover:bg-[#CCFF00]" />

            {children}
        </div>
    );
}
