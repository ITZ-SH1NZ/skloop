"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileShell } from "@/components/profile/ProfileShell";
import { GamifiedHeader } from "@/components/profile/GamifiedHeader";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { OverviewModule } from "@/components/profile/modules/OverviewModule";
import { StatsModule } from "@/components/profile/modules/StatsModule";
import { PortfolioModule } from "@/components/profile/modules/PortfolioModule";
import { Timeline } from "@/components/profile/Timeline";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <ProfileShell>
            <GamifiedHeader />

            <div className="space-y-8">
                <ProfileNav activeTab={activeTab} onChange={setActiveTab} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[400px]"
                    >
                        {activeTab === "overview" && <OverviewModule />}
                        {activeTab === "stats" && <StatsModule />}
                        {activeTab === "portfolio" && <PortfolioModule />}
                        {activeTab === "timeline" && <Timeline />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </ProfileShell>
    );
}
