"use client";

import { ActivityHeatmap } from "../charts/ActivityHeatmap";
import { DSARadar } from "../charts/DSARadar"; // Reusing existing
import { motion } from "framer-motion";

export function StatsModule() {
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
                    {[
                        { name: "Web Development Bootcamp", progress: 75, color: "bg-blue-500" },
                        { name: "Data Structures & Algos", progress: 40, color: "bg-purple-500" },
                        { name: "System Design", progress: 10, color: "bg-orange-500" }
                    ].map((course) => (
                        <div key={course.name} className="space-y-2">
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
                    ))}
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
