"use client";

import { useState } from "react";
import { Search, Filter, Star, Clock, MapPin, CheckCircle, ChevronRight, Briefcase, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data for Mentors
// TODO: Fetch mentors from backend
const MOCK_MENTORS: any[] = [];

export default function FindMentorPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredMentors = MOCK_MENTORS.filter(mentor => {
        const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkill = selectedSkill === "All" || mentor.skills.includes(selectedSkill);
        return matchesSearch && matchesSkill;
    });

    const allSkills = ["All"];

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto no-scrollbar">
            {/* Dark Header Section */}
            <div className="bg-zinc-900 px-6 py-10 md:px-10 md:py-14 relative overflow-hidden shrink-0">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4F268]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-[#D4F268] text-black text-xs font-black uppercase tracking-wider rounded-full">
                                    Explore Directory
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                                Find a <span className="text-[#D4F268]">Mentor</span>
                            </h1>
                            <p className="text-zinc-400 font-medium text-lg max-w-xl leading-relaxed">
                                Connect with world-class experts who can help you accelerate your career and master new skills.
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="mt-10 flex gap-3 max-w-2xl">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4F268] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, role, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-medium outline-none focus:ring-2 focus:ring-[#D4F268]/50 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className={`px-5 rounded-2xl border transition-all flex items-center gap-2 font-bold shrink-0 ${selectedSkill !== "All"
                                ? "bg-[#D4F268] text-black border-[#D4F268] shadow-[0_0_15px_rgba(212,242,104,0.3)]"
                                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                }`}
                        >
                            <Filter size={20} />
                            <span className="hidden md:inline">{selectedSkill === "All" ? "Filter" : selectedSkill}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-50"
                        />
                        {/* Modal */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", bounce: 0.4 }}
                                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col max-h-[85vh] relative"
                            >
                                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white z-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Filter by Skill</h3>
                                        <p className="text-zinc-400 font-medium text-sm">Find the perfect match for your goals</p>
                                    </div>
                                    <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-black transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto custom-scrollbar">
                                    <div className="flex flex-wrap gap-2.5">
                                        {allSkills.map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => {
                                                    setSelectedSkill(skill);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border-2 ${selectedSkill === skill
                                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg"
                                                    : "bg-white border-zinc-100 text-zinc-600 hover:border-[#D4F268] hover:bg-[#D4F268]/5"
                                                    }`}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
                                    <Button onClick={() => { setSelectedSkill("All"); setIsFilterOpen(false); }} variant="ghost" className="text-zinc-500 hover:text-zinc-900 font-bold">
                                        Clear Filters
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="px-6 py-8 md:px-10 pb-32">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredMentors.map((mentor, index) => (
                                <motion.div
                                    key={mentor.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-[#D4F268]/20 transition-all group flex flex-col h-full relative overflow-hidden"
                                >
                                    {/* Hover specific glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4F268]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="flex gap-4">
                                            <div className="relative">
                                                <Avatar
                                                    src={mentor.avatarUrl}
                                                    fallback={mentor.name.slice(0, 2).toUpperCase()}
                                                    className="w-16 h-16 rounded-2xl border-4 border-white shadow-sm"
                                                />
                                                {mentor.isVerified && (
                                                    <div className="absolute -bottom-1 -right-1 bg-black text-[#D4F268] p-1 rounded-full border-2 border-white">
                                                        <CheckCircle size={12} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-zinc-900 leading-tight group-hover:text-[#6a7d25] transition-colors">
                                                    {mentor.name}
                                                </h3>
                                                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wide mt-1">
                                                    {mentor.role} @ {mentor.company}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg px-2 py-1">
                                                <Star size={12} className="text-[#D4F268] fill-[#D4F268]" />
                                                <span className="text-xs font-bold text-white">{mentor.rating}</span>
                                            </div>
                                            <span className="text-[10px] font-medium text-zinc-400">{mentor.reviews} reviews</span>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-zinc-600 text-sm leading-relaxed mb-6 line-clamp-2 font-medium relative z-10">
                                        {mentor.bio}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6 mt-auto relative z-10">
                                        {mentor.skills.slice(0, 3).map((skill: string) => (
                                            <span key={skill} className="bg-zinc-50 text-zinc-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-zinc-100 uppercase tracking-wide">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="pt-6 border-t border-dashed border-zinc-100 flex items-center justify-between relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Rate</span>
                                            <div className="text-zinc-900 font-black text-lg">
                                                {mentor.hourlyRate === 0 ? "Free" : `$${mentor.hourlyRate}/hr`}
                                            </div>
                                        </div>
                                        <Button className="rounded-xl px-6 font-bold bg-zinc-900 hover:bg-[#D4F268] hover:text-black text-white transition-all shadow-lg shadow-zinc-900/10 hover:shadow-[#D4F268]/20">
                                            Book Session
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
