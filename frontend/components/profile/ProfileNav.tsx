"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

interface ProfileNavProps {
    activeTab: string;
    onChange: (tab: string) => void;
}

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "stats", label: "Stats" },
    { id: "portfolio", label: "Portfolio" },
    { id: "timeline", label: "Timeline" },
];

export function ProfileNav({ activeTab, onChange }: ProfileNavProps) {
    const navRef = useAutoScroll<HTMLDivElement>({
        trigger: activeTab,
        offset: -120, // Negative offset to leave space for header
        behavior: "smooth",
        skipInitial: true
    });

    return (
        <div ref={navRef} className="flex justify-center">
            <div className="flex items-center p-1 bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                "relative px-6 py-2.5 text-sm font-bold transition-colors rounded-full z-10",
                                isActive ? "text-primary-foreground" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-profile-nav"
                                    className="absolute inset-0 bg-primary rounded-full -z-10 shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
