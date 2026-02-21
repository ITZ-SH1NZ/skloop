"use client";

import { ActivityHeatmap } from "../charts/ActivityHeatmap";
import { DSARadar } from "../charts/DSARadar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";

export function StatsModule() {
    const { user } = useUser();
    const [courses, setCourses] = useState<{ name: string, progress: number, color: string }[]>([
        { name: "No courses started", progress: 0, color: "bg-gray-300" }
    ]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            const supabase = createClient();

            if (user) {
                const { data, error } = await supabase
                    .from('user_courses')
                    .select('completed_lessons, courses(title, total_lessons)')
                    .eq('user_id', user.id)
                    .order('last_accessed', { ascending: false })
                    .limit(3);

                if (data && !error && data.length > 0) {
                    const colors = ["bg-blue-500", "bg-purple-500", "bg-orange-500"];
                    const formattedCourses = data.map((uc: any, index: number) => {
                        const total = uc.courses.total_lessons || 1; // Prevent div by 0
                        const progress = Math.round((uc.completed_lessons / total) * 100);
                        return {
                            name: uc.courses.title,
                            progress: progress > 100 ? 100 : progress, // clamp
                            color: colors[index % colors.length]
                        };
                    });
                    setCourses(formattedCourses);
                }
            }
            setIsLoading(false);
        };
        fetchCourses();
    }, [user]);
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Skill Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DSA Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-4">Internal DSA Performance</h3>
                    <div className="h-[300px]">
                        <DSARadar />
                    </div>
                </div>

                {/* Module Progress */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="font-bold">Course Progression</h3>
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        courses.map((course, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{course.name}</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${course.progress}%` }}
                                        className={`h-full rounded-full ${course.color}`}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="pt-4">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Learning Activity</h2>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <ActivityHeatmap />
                </div>
            </div>
        </div>
    );
}
