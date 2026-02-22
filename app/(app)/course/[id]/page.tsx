"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import FocusTrackHeader from "@/components/course/FocusTrackHeader";
import FocusModule from "@/components/course/FocusModule";
import StickyContinueButton from "@/components/course/StickyContinueButton";
import { createClient } from "@/utils/supabase/client";

interface Lesson {
    id: string;
    title: string;
    order_index: number;
    isCompleted: boolean;
    type: "article";
    duration: string;
    isLocked: boolean;
}

interface Module {
    id: number;
    title: string;
    description: string;
    lessons: Lesson[];
    status: "locked" | "in-progress" | "completed";
}

interface CourseData {
    title: string;
    progress: number;
    totalModules: number;
    completedModules: number;
    currentLesson: { title: string };
}

export default function CoursePage() {
    const params = useParams();
    const courseId = params.id as string;

    const [trackData, setTrackData] = useState<CourseData | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModuleId, setActiveModuleId] = useState<number>(0);

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            const supabase = createClient();

            // Get current user for progress tracking
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch course by slug
            const { data: course } = await supabase
                .from("courses")
                .select("id, title, total_lessons")
                .eq("slug", courseId)
                .single();

            if (!course) {
                setIsLoading(false);
                return;
            }

            // Fetch lessons for this course
            const { data: lessons } = await supabase
                .from("lessons")
                .select("id, title, order_index, content")
                .eq("course_id", course.id)
                .order("order_index", { ascending: true });

            // Fetch user progress on lessons
            let completedLessonIds = new Set<string>();
            if (user && lessons) {
                const { data: progress } = await supabase
                    .from("user_lesson_progress")
                    .select("lesson_id")
                    .eq("user_id", user.id)
                    .in("lesson_id", lessons.map((l) => l.id));

                if (progress) {
                    completedLessonIds = new Set(progress.map((p) => p.lesson_id));
                }
            }

            const lessonList = lessons ?? [];
            const completedCount = lessonList.filter((l) => completedLessonIds.has(l.id)).length;
            const progress = lessonList.length > 0
                ? Math.round((completedCount / lessonList.length) * 100)
                : 0;

            // Group lessons into modules of ~4
            const LESSONS_PER_MODULE = 4;
            const builtModules: Module[] = [];
            for (let i = 0; i < lessonList.length; i += LESSONS_PER_MODULE) {
                const chunk = lessonList.slice(i, i + LESSONS_PER_MODULE);
                const moduleNum = Math.floor(i / LESSONS_PER_MODULE) + 1;
                const moduleLessons: Lesson[] = chunk.map((l, idx) => ({
                    id: l.id,
                    title: l.title,
                    order_index: l.order_index,
                    isCompleted: completedLessonIds.has(l.id),
                    type: "article",
                    duration: "10 min",
                    isLocked: false,
                }));

                const allDone = moduleLessons.every((l) => l.isCompleted);
                const anyDone = moduleLessons.some((l) => l.isCompleted);

                builtModules.push({
                    id: moduleNum,
                    title: `Module ${moduleNum}`,
                    description: chunk[0]?.content || `Continue your learning journey in this module.`,
                    lessons: moduleLessons,
                    status: allDone ? "completed" : anyDone ? "in-progress" : "in-progress",
                });
            }

            // Find first in-progress module to expand by default
            const firstActive = builtModules.find((m) => m.status === "in-progress");
            setActiveModuleId(firstActive?.id ?? builtModules[0]?.id ?? 0);

            setTrackData({
                title: course.title,
                progress,
                totalModules: builtModules.length,
                completedModules: builtModules.filter((m) => m.status === "completed").length,
                currentLesson: {
                    title: lessonList.find((l) => !completedLessonIds.has(l.id))?.title ?? "Start Learning",
                },
            });
            setModules(builtModules);
            setIsLoading(false);
        };

        fetchCourse();
    }, [courseId]);

    const handleModuleClick = (id: number) => {
        setActiveModuleId((prev) => (prev === id ? 0 : id));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!trackData) {
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
            {/* Background Ambient Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.04] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
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
            </div>

            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <FocusTrackHeader
                    title={trackData.title}
                    progress={trackData.progress}
                    totalModules={trackData.totalModules}
                    completedModules={trackData.completedModules}
                />

                <motion.div layout={typeof window !== "undefined" && window.innerWidth >= 768} className="space-y-4">
                    <AnimatePresence initial={false}>
                        {modules.map((module) => (
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
                lessonTitle={trackData.currentLesson.title}
                onClick={() => console.log("Resume lesson")}
            />
        </div>
    );
}
