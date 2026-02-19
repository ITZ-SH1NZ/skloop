"use client";

import { motion } from "framer-motion";
import { Clock, Video, Star, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function MentorshipTab() {
    return (
        <div className="space-y-8">

            {/* Header Action */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-black text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-2">Mentorship Journey</h2>
                    <p className="text-gray-400 font-medium max-w-sm">Connect with experts or share your knowledge to earn XP and badges.</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <Button className="bg-[#D4F268] text-black font-bold rounded-xl hover:bg-[#c3e055]">Find a Mentor</Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl">Become a Mentor</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Sessions List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black text-xl px-2">Upcoming Sessions</h3>

                    <div className="space-y-4">
                        {/* TODO: Fetch upcoming sessions */}
                        {[].map((i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center group hover:scale-[1.01] transition-transform"
                            >
                                {/* Date Box */}
                                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[5rem] border border-gray-200/50">
                                    <span className="text-xs font-black text-red-500 uppercase tracking-widest">FEB</span>
                                    <span className="text-3xl font-black text-gray-900">1{7 + i}</span>
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-black text-lg text-foreground mb-1">Advanced Sales Techniques</h4>
                                    <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                                        with <span className="text-black">Dwight Schrute</span>
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full">Top Rated</span>
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                            <Clock size={14} /> 2:00 PM - 3:00 PM
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                            <Video size={14} /> Zoom Meeting
                                        </div>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                    <Button className="flex-1 sm:flex-none rounded-xl font-bold bg-primary text-black hover:bg-primary/90">
                                        Join
                                    </Button>
                                    <Button variant="ghost" size="icon" className="hidden sm:flex rounded-xl text-gray-400 hover:text-black">
                                        <MoreVertical size={18} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats / History */}
                <div className="space-y-6">
                    <h3 className="font-black text-xl px-2">Your Impact</h3>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Total Sessions</p>
                                <p className="text-3xl font-black">24</p>
                            </div>
                            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary-foreground">
                                <Video size={18} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Average Rating</p>
                                <p className="text-3xl font-black">4.9</p>
                            </div>
                            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <Star size={18} fill="currentColor" />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">Past Sessions</h4>
                            <div className="space-y-3">
                                {/* TODO: Fetch past sessions */}
                                {[].map(i => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-200" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold truncate">Intro to Paper</p>
                                            <p className="text-[10px] text-gray-400">Jan 1{i}</p>
                                        </div>
                                        <span className="text-xs font-bold text-green-500">Completed</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
