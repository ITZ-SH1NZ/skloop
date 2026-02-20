"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import FocusTrackHeader from "@/components/course/FocusTrackHeader";
import FocusModule from "@/components/course/FocusModule";
import StickyContinueButton from "@/components/course/StickyContinueButton";

// --- MOCK DATA: Web Fundamentals ---
// TODO: Fetch course data from backend
const WEB_TRACK_DATA: any = null;
const WEB_MODULES: any[] = [];
const DSA_TRACK_DATA: any = null;
const DSA_MODULES: any[] = [];

export default function CoursePage() {
    const params = useParams();
    const courseId = params.id as string;

    const isDSA = courseId === 'dsa';

    // Select Data based on ID
    const TRACK_DATA = isDSA ? DSA_TRACK_DATA : WEB_TRACK_DATA;
    const MODULES = isDSA ? DSA_MODULES : WEB_MODULES;

    // Default to the first in-progress module
    const [activeModuleId, setActiveModuleId] = useState<number>(isDSA ? 1 : 2);

    const handleModuleClick = (id: number) => {
        if (activeModuleId === id) {
            setActiveModuleId(0); // 0 means none active
        } else {
            setActiveModuleId(id);
        }
    };

    if (!TRACK_DATA) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Course Unavailable</h2>
                    <p className="text-zinc-500">This course content is not currently available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-zinc-900 pb-32 relative overflow-hidden">
            {/* Background Ambient Layers (Glassmorphism + Texture) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.04] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Floating Glassmorphism Blobs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.4, scale: 1, x: [0, 20, 0], y: [0, -20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-lime-200/30 blur-[120px] mix-blend-multiply"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.3, scale: 1, x: [0, -30, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-200/50 blur-[100px] mix-blend-multiply"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3, y: [0, -40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[20%] w-[700px] h-[700px] rounded-full bg-lime-100/20 blur-[120px] mix-blend-multiply"
                />
            </div>

            <div className="max-w-3xl mx-auto px-6 relative z-10">

                <FocusTrackHeader
                    title={TRACK_DATA.title}
                    progress={TRACK_DATA.progress}
                    totalModules={TRACK_DATA.totalModules}
                    completedModules={TRACK_DATA.completedModules}
                />

                <motion.div layout={typeof window !== 'undefined' && window.innerWidth >= 768} className="space-y-4">
                    <AnimatePresence initial={false}>
                        {MODULES.map((module) => (
                            <FocusModule
                                key={module.id}
                                moduleNumber={module.id}
                                title={module.title}
                                description={module.description}
                                lessons={module.lessons}
                                status={module.status}
                                isActive={activeModuleId === module.id}
                                onClick={() => handleModuleClick(module.id)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            <StickyContinueButton
                lessonTitle={TRACK_DATA.currentLesson.title}
                onClick={() => console.log("Resume lesson")}
            />
        </div>
    );
}
