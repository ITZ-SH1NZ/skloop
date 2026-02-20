"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const PROFILE_TABS = [
    { id: "overview", label: "Overview" },
    { id: "mentorship", label: "Mentorship" },
    { id: "learning", label: "Learning" },
    { id: "marketplace", label: "Marketplace" },
    { id: "stats", label: "Stats" },
];

interface ProfileTabsProps {
    activeTab: string;
    onChange: (id: string) => void;
}

import { useAutoScroll } from "@/hooks/use-auto-scroll";

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
    const tabsRef = useAutoScroll<HTMLDivElement>({
        trigger: activeTab,
        offset: -120, // Negative offset to keep tabs visible under header
        behavior: "smooth",
        skipInitial: true
    });

    return (
        <div ref={tabsRef} className="sticky top-4 z-40 mx-auto w-full max-w-full px-4 sm:max-w-fit">
            <div className="flex items-center p-1.5 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-sm rounded-full overflow-x-auto no-scrollbar w-full sm:w-auto">
                {PROFILE_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                "relative px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap rounded-full z-10",
                                isActive ? "text-primary-foreground" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-profile-tab"
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
