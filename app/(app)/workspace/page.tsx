"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Folder, MoreVertical, Plus, Users, Clock, ArrowRight, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

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
    const supabase = createClient();
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    const handleCreateProject = async () => {
        if (newProjectName.trim()) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Insert into projects
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .insert([{
                    title: newProjectName,
                    description: "New project created from dashboard",
                    status: newProjectStatus,
                    color: "bg-gray-50 text-gray-600 border-gray-200"
                }])
                .select()
                .single();

            if (projectError) {
                toast(`Failed to create project: ${projectError.message}`, "error");
                return;
            }

            // 2. Insert into project_members
            const { error: memberError } = await supabase
                .from('project_members')
                .insert([{
                    project_id: projectData.id,
                    user_id: user.id,
                    role: 'owner'
                }]);

            if (memberError) {
                toast(`Failed to set owner role: ${memberError.message}`, "error");
                return;
            }

            // Refresh project state
            setProjects([{ ...projectData, members: 1 }, ...projects]);
            toast(`"${newProjectName}" has been added to your workspace.`, "success");

            setIsModalOpen(false);
            setNewProjectName("");
            setNewProjectStatus("Planning");
        }
    };

    useEffect(() => {
        const fetchWorkspace = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch projects the user is a member of
                const { data, error } = await supabase
                    .from('project_members')
                    .select(`
                        project_id,
                        projects (
                            id,
                            title,
                            description,
                            status,
                            color,
                            created_at
                        )
                    `)
                    .eq('user_id', user.id);

                if (data && !error) {
                    // Normalize the nested query result
                    const normalizedProjects = data.map((item: any) => ({
                        ...item.projects,
                        members: 1, // Placeholder until a member count aggregation is performed
                        deadline: "7 days" // Local UI placeholder
                    }));
                    setProjects(normalizedProjects);
                }
            }
            setIsLoading(false);
        };
        fetchWorkspace();

        if (searchParams.get("action") === "new") {
            setIsModalOpen(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            router.replace(`/workspace${params.toString() ? `?${params.toString()}` : ""}`);
        }
    }, [supabase, router, searchParams]); return (
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
            {isLoading ? (
                <div className="py-24 flex justify-center w-full">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></div>
                </div>
            ) : (
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
                                onClick={() => router.push(`/workspace/${project.id}`)}
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
            )}

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
        </div>
    );
}
