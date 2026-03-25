"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Folder, MoreVertical, Plus, Globe, Clock, LayoutGrid, List, Code2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import useSWR from "swr";
import { useUser } from "@/context/UserContext";
import { getUserProjects, createProject, FreeCodeProject } from "@/lib/freecode-helpers";

// Custom fetcher for SWR
const fetchProjects = async ([_, userId]: [string, string]) => {
    const supabase = createClient();
    return await getUserProjects(supabase, userId);
};

export default function FreeCodeGalleryPage() {
    const { user } = useUser();
    const currentUserId = user?.id || null;
    const supabase = createClient();
    const [filterType, setFilterType] = useState<"all" | "react" | "nextjs" | "vanilla">("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectTemplate, setNewProjectTemplate] = useState<"react" | "vanilla" | "nextjs">("react");
    const [isCreating, setIsCreating] = useState(false);

    const { data: projects = [], isLoading, mutate } = useSWR(
        currentUserId ? ['freecodeProjects', currentUserId] : null,
        fetchProjects as any
    );

    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const searchQuery = searchParams.get("q")?.toLowerCase();

    const filteredProjects = projects.filter((p: FreeCodeProject) => {
        const matchesSearch = searchQuery ? p.name.toLowerCase().includes(searchQuery) : true;
        const matchesFilter = filterType === "all" ? true : p.template === filterType;
        return matchesSearch && matchesFilter;
    });

    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !currentUserId) return;

        setIsCreating(true);
        try {
            const project = await createProject(
                supabase,
                currentUserId,
                newProjectName,
                "",
                newProjectTemplate
            );

            toast(`"${newProjectName}" created successfully!`, "success");

            // Navigate immediately to the IDE
            router.push(`/freecode/${project.id}`);
        } catch (error: any) {
            toast(`Failed to create project: ${error.message}`, "error");
            setIsCreating(false);
        }
    };

    const openNewSandboxModal = () => {
        const defaultTemplate = filterType === "all" ? "vanilla" : filterType as "react" | "vanilla" | "nextjs";
        setNewProjectTemplate(defaultTemplate);
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-7xl mx-auto min-h-screen bg-[#FDFCF8]">
            <div className="flex flex-wrap items-center justify-between mb-6 md:mb-12 gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-black mb-2 tracking-tight flex items-center gap-2 sm:gap-3">
                        <Code2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-lime-500 shrink-0" />
                        <span className="truncate">FreeCode Sandbox</span>
                    </h1>
                    <p className="text-gray-500 font-bold text-sm sm:text-base md:text-lg">
                        {filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"}
                    </p>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-white rounded-full p-1 border border-zinc-200 flex items-center shadow-sm h-12 md:h-14 relative isolate overflow-hidden">
                        {(["all", "react", "nextjs", "vanilla"] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={cn(
                                    "px-4 md:px-6 h-10 md:h-12 rounded-full transition-all flex items-center justify-center relative z-10 font-bold text-sm capitalize",
                                    filterType === type ? "text-black" : "text-zinc-400 hover:text-black"
                                )}
                            >
                                {type}
                                {filterType === type && (
                                    <motion.div
                                        layoutId="activeFilterType"
                                        className="absolute inset-0 bg-lime-400 rounded-full shadow-md -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    <Button
                        onClick={openNewSandboxModal}
                        className="bg-primary text-black rounded-full px-5 sm:px-6 md:px-8 h-10 sm:h-12 md:h-14 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-xs sm:text-sm md:text-base flex items-center whitespace-nowrap"
                    >
                        <Plus size={18} className="mr-1 sm:mr-2 sm:w-5 sm:h-5" />
                        New
                    </Button>
                </div>
            </div>

            {/* Project List/Grid */}
            {isLoading ? (
                <div className="py-24 flex justify-center w-full">
                    <div className="w-12 h-12 rounded-full border-4 border-lime-100 border-t-lime-500 animate-spin"></div>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={filterType}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn("gap-6 xl:gap-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4")}
                    >
                        {/* Create New Card */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 }}
                            onClick={openNewSandboxModal}
                            className="rounded-3xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:text-black hover:border-black hover:bg-black/5 transition-all gap-4 min-h-[220px] group"
                        >
                            <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary group-hover:text-black group-hover:shadow-md transition-all">
                                <Plus size={28} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="font-bold text-lg">New Sandbox</span>
                        </motion.button>

                        {filteredProjects.map((project: FreeCodeProject, i: number) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (i + 1) * 0.03, duration: 0.2, ease: "easeOut" }}
                                style={{ backfaceVisibility: "hidden" }}
                                className={cn(
                                    "bg-white shadow-sm hover:shadow-xl transition-all border border-zinc-200 group relative cursor-pointer will-change-transform rounded-3xl p-6 flex flex-col justify-between min-h-[220px]"
                                )}
                                onClick={() => router.push(`/freecode/${project.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4 w-full">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-100 text-black border border-zinc-200 flex items-center justify-center shadow-sm shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors">
                                        <Code2 size={24} />
                                    </div>

                                    {project.is_published && (
                                        <div className="px-2.5 py-1 rounded-full bg-green-50 text-[10px] font-bold text-green-600 uppercase tracking-wider border border-green-100 shrink-0 ml-auto flex items-center gap-1">
                                            <Globe size={12} />
                                            Published
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl mb-2 group-hover:text-black transition-colors leading-tight line-clamp-2">{project.name}</h3>
                                    <div className="flex items-center text-xs font-medium text-zinc-400 gap-1.5">
                                        <Clock size={12} />
                                        <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 mt-auto border-t border-gray-50 bg-white w-full">
                                    <div className="px-2.5 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-600 border border-zinc-200 capitalize">
                                        {project.template}
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-900 transition-colors p-1" onClick={(e) => { e.stopPropagation(); /* future context menu */ }}>
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Sandbox"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold flex-1 md:flex-none">Cancel</Button>
                        <Button
                            onClick={handleCreateProject}
                            className="rounded-xl font-bold bg-primary hover:bg-lime-500 text-black flex-1 md:flex-none"
                            disabled={!newProjectName.trim() || isCreating}
                        >
                            {isCreating ? "Creating..." : "Create Project"}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Name</label>
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="e.g. My Awesome App"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-100 border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all font-medium text-black"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Template</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setNewProjectTemplate("react")}
                                className={cn(
                                    "p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2",
                                    newProjectTemplate === "react" ? "border-black bg-zinc-100 text-black shadow-inner" : "border-zinc-200 hover:border-black bg-white"
                                )}
                            >
                                <span className="font-bold text-sm">React</span>
                            </button>
                            <button
                                onClick={() => setNewProjectTemplate("nextjs")}
                                className={cn(
                                    "p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2",
                                    newProjectTemplate === "nextjs" ? "border-black bg-zinc-100 text-black shadow-inner" : "border-zinc-200 hover:border-black bg-white"
                                )}
                            >
                                <span className="font-bold text-sm">Next.js</span>
                            </button>
                            <button
                                onClick={() => setNewProjectTemplate("vanilla")}
                                className={cn(
                                    "p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2",
                                    newProjectTemplate === "vanilla" ? "border-black bg-zinc-100 text-black shadow-inner" : "border-zinc-200 hover:border-black bg-white"
                                )}
                            >
                                <span className="font-bold text-sm">Vanilla</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
