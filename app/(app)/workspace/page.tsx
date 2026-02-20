"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Folder, MoreVertical, Plus, Users, Clock, ArrowRight, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const INITIAL_PROJECTS = [
    {
        id: 1,
        title: "Website Redesign",
        status: "In Progress",
        members: 4,
        deadline: "2 days",
        color: "bg-blue-50 text-blue-600 border-blue-100",
        description: "Complete overhaul of the corporate landing page with new branding guidelines.",
        tasks: ["Wireframing", "UI Mockups", "Frontend implementation", "Content migration"]
    },
    {
        id: 2,
        title: "Mobile App",
        status: "Review",
        members: 2,
        deadline: "1 week",
        color: "bg-purple-50 text-purple-600 border-purple-100",
        description: "React Native application for customer loyalty rewards and tracking.",
        tasks: ["API Integration", "Push Notifications", "User Profile screen"]
    },
    {
        id: 3,
        title: "Marketing Campaign",
        status: "Planning",
        members: 5,
        deadline: "3 weeks",
        color: "bg-green-50 text-green-600 border-green-100",
        description: "Social media and email outreach for the upcoming summer product launch.",
        tasks: ["Ad creative", "Email templates", "Influencer outreach"]
    },
    {
        id: 4,
        title: "Q3 Report",
        status: "In Progress",
        members: 3,
        deadline: "5 days",
        color: "bg-orange-50 text-orange-600 border-orange-100",
        description: "Summarizing financial and performance metrics for the third quarter.",
        tasks: ["Data gathering", "Chart generation", "Executive summary"]
    },
];

export default function WorkspacePage() {
    const [projects, setProjects] = useState(INITIAL_PROJECTS);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectStatus, setNewProjectStatus] = useState("Planning");

    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const searchQuery = searchParams.get("q")?.toLowerCase();

    const filteredProjects = searchQuery
        ? projects.filter(p => p.title.toLowerCase().includes(searchQuery))
        : projects;

    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            const newProject = {
                id: Date.now(),
                title: newProjectName,
                status: newProjectStatus,
                members: 1,
                deadline: "7 days",
                color: "bg-gray-50 text-gray-600 border-gray-200",
                description: "New project created from dashboard",
                tasks: ["Initial setup", "Team briefing"]
            };
            setProjects([newProject, ...projects]);
            toast(`"${newProjectName}" has been added to your workspace.`, "success");

            setIsModalOpen(false);
            setNewProjectName("");
            setNewProjectStatus("Planning");
        }
    };

    useEffect(() => {
        if (searchParams.get("action") === "new") {
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            router.replace(`/workspace${params.toString() ? `?${params.toString()}` : ""}`);
        }
    }, []); // Run once on mount



    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-wrap items-center justify-between mb-6 md:mb-12 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl xl:text-5xl font-black mb-2 tracking-tight">Workspace</h1>
                    <p className="text-gray-500 font-bold text-lg">
                        {filteredProjects.length} Active {filteredProjects.length === 1 ? "Project" : "Projects"}
                    </p>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-white rounded-full p-1 border border-gray-100 flex items-center shadow-sm h-12 md:h-14 relative isolate">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn("h-10 w-10 md:h-12 md:w-12 rounded-full transition-all flex items-center justify-center relative z-10", viewMode === "grid" ? "text-white" : "text-gray-400 hover:text-black")}
                        >
                            <LayoutGrid size={18} />
                            {viewMode === "grid" && (
                                <motion.div
                                    layoutId="activeViewMode"
                                    className="absolute inset-0 bg-black rounded-full shadow-lg -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn("h-10 w-10 md:h-12 md:w-12 rounded-full transition-all flex items-center justify-center relative z-10", viewMode === "list" ? "text-white" : "text-gray-400 hover:text-black")}
                        >
                            <List size={18} />
                            {viewMode === "list" && (
                                <motion.div
                                    layoutId="activeViewMode"
                                    className="absolute inset-0 bg-black rounded-full shadow-lg -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-black rounded-full px-6 md:px-8 h-12 md:h-14 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-sm md:text-base flex items-center"
                    >
                        <Plus size={20} className="mr-2" />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Project List/Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn("gap-6 xl:gap-8", viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col")}
                >
                    {filteredProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03, duration: 0.2, ease: "easeOut" }}
                            style={{ backfaceVisibility: "hidden" }}
                            className={cn(
                                "bg-white shadow-sm hover:shadow-md transition-all border border-gray-100 group relative cursor-pointer will-change-transform",
                                viewMode === "grid"
                                    ? "rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[280px]"
                                    : "rounded-[2rem] p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6"
                            )}
                            onClick={() => {
                                setSelectedProject(project);
                                setIsDetailModalOpen(true);
                            }}
                        >
                            <div className={cn("flex items-start", viewMode === "grid" ? "justify-between mb-6 w-full" : "gap-4 md:gap-6 items-center w-full md:w-auto")}>
                                <div className={`h-14 w-14 rounded-2xl ${project.color} border flex items-center justify-center shadow-sm shrink-0`}>
                                    <Folder size={24} />
                                </div>

                                {viewMode === "list" && (
                                    <div className="flex-1 md:min-w-[200px]">
                                        <h3 className="font-bold text-lg md:text-xl mb-1 group-hover:text-primary transition-colors leading-tight line-clamp-1">{project.title}</h3>
                                        <p className="text-xs font-bold text-gray-400">Last updated: 2 hours ago</p>
                                    </div>
                                )}

                                <div className={cn("px-3 py-1 rounded-full bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-100 shrink-0 ml-auto md:ml-0", viewMode === "list" && "order-first md:order-last")}>
                                    {project.status}
                                </div>
                            </div>

                            {viewMode === "grid" && (
                                <div>
                                    <h3 className="font-bold text-2xl mb-2 group-hover:text-primary transition-colors leading-tight">{project.title}</h3>
                                    <p className="text-xs font-bold text-gray-400">Last updated: 2 hours ago</p>
                                </div>
                            )}

                            <div className={cn("flex items-center justify-between", viewMode === "grid" ? "pt-8 mt-auto border-t border-gray-50 bg-white w-full" : "gap-4 md:gap-8 w-full md:w-auto mt-2 md:mt-0")}>
                                <div className="flex -space-x-3 hover:space-x-1 transition-all">
                                    {[...Array(project.members)].map((_, i) => (
                                        <div key={i} className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm relative z-0 hover:z-10 transition-all">
                                            U{i + 1}
                                        </div>
                                    ))}
                                    <div className="h-10 w-10 rounded-full bg-black text-white border-2 border-white flex items-center justify-center shadow-sm z-10">
                                        <Plus size={14} />
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors ml-auto md:ml-0">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Card (Inline - Grid Only) */}
                    {viewMode === "grid" && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 }}
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all gap-4 min-h-[280px] group"
                        >
                            <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                <Plus size={32} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="font-bold text-lg">Create New Project</span>
                        </motion.button>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Create Project Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Project"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleCreateProject} className="rounded-xl font-bold bg-black text-white" disabled={!newProjectName.trim()}>Create Project</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Project Name</label>
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="e.g. Website Redesign"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                        <select
                            value={newProjectStatus}
                            onChange={(e) => setNewProjectStatus(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium appearance-none"
                        >
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Project Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={selectedProject?.title || "Project Details"}
                footer={
                    <div className="flex justify-between items-center w-full">
                        <div className="flex -space-x-3">
                            {[...Array(selectedProject?.members || 1)].map((_, i) => (
                                <div key={i} className="h-10 w-10 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                                    U{i + 1}
                                </div>
                            ))}
                        </div>
                        <Button onClick={() => setIsDetailModalOpen(false)} className="rounded-xl font-bold bg-black text-white px-8">Close</Button>
                    </div>
                }
            >
                {selectedProject && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", selectedProject.color)}>
                                {selectedProject.status}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                <Clock size={14} />
                                {selectedProject.deadline} remaining
                            </div>
                        </div>

                        <div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-gray-300 mb-2">Description</h4>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                {selectedProject.description || "No description provided for this project."}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-gray-300 mb-3">Key Milestones</h4>
                            <div className="space-y-3">
                                {(selectedProject.tasks || ["General Review", "Team Sync"]).map((task: string, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100/50 group hover:border-primary/20 transition-all">
                                        <div className="h-6 w-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                            {i === 0 ? <Users size={12} className="text-gray-400 group-hover:text-black" /> : <div className="h-1 w-1 rounded-full bg-gray-300" />}
                                        </div>
                                        <span className="font-bold text-sm text-gray-700">{task}</span>
                                        <span className="ml-auto text-[10px] font-bold text-gray-300">TODO</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-black rounded-[2rem] text-white flex items-center justify-between shadow-2xl overflow-hidden relative group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <h5 className="font-black text-xs uppercase tracking-widest mb-1 text-primary">Active Sprint</h5>
                                <p className="font-bold opacity-80">Phase 2: Execution</p>
                            </div>
                            <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
