"use client";

import { motion } from "framer-motion";
import { Play, CheckCircle2, Lock, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LearningTab() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Course Card - Large */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div>
                            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                In Progress
                            </div>
                            <h2 className="text-3xl font-black mb-2">Management 101</h2>
                            <p className="text-indigo-100 font-medium max-w-lg mb-6">
                                Master the art of managing people, paper, and conflicts in the modern workplace.
                            </p>

                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex-1 h-3 w-48 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#D4F268] w-[75%]" />
                                </div>
                                <span className="font-bold text-sm">75% Complete</span>
                            </div>
                        </div>

                        <Button className="h-16 w-16 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-110 transition-all shadow-xl flex items-center justify-center shrink-0">
                            <Play size={24} fill="currentColor" className="ml-1" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black text-xl px-2">Your Courses</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CourseCard
                            title="Public Speaking"
                            progress={40}
                            color="bg-orange-500"
                        />
                        <CourseCard
                            title="Sales Tactics"
                            progress={100}
                            completed
                            color="bg-emerald-500"
                        />
                        <CourseCard
                            title="Conflict Resolution"
                            progress={0}
                            locked
                            color="bg-gray-400"
                        />
                        <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer min-h-[180px]">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                                <span className="text-2xl font-light">+</span>
                            </div>
                            <p className="font-bold text-gray-500">Explore New Courses</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-black text-xl px-2">Certificates</h3>
                    <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 hover:bg-gray-50 rounded-3xl transition-colors flex items-center gap-4 cursor-pointer group">
                                <div className="h-12 w-12 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Certified Salesman</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Issued Jan 2026</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CourseCardProps {
    title: string;
    progress: number;
    color: string;
    completed?: boolean;
    locked?: boolean;
}

function CourseCard({ title, progress, color, completed, locked }: CourseCardProps) {
    return (
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative group overflow-hidden hover:shadow-md transition-all">
            <div className={`h-24 w-24 rounded-full ${color} absolute -top-12 -right-12 opacity-20 group-hover:scale-150 transition-transform duration-500`} />

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center text-white font-bold`}>
                    {title[0]}
                </div>
                {completed ? (
                    <div className="text-emerald-500"><CheckCircle2 size={20} /></div>
                ) : locked ? (
                    <div className="text-gray-300"><Lock size={20} /></div>
                ) : (
                    <div className="text-xs font-black text-gray-400">{progress}%</div>
                )}
            </div>

            <h4 className="font-black text-lg mb-4 relative z-10">{title}</h4>

            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-black'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
